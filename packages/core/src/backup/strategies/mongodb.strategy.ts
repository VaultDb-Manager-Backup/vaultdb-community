import { MongoClient, Db, Collection, Document } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { BackupStrategy, BackupConfig, BackupResult } from '../index';

export interface MongoBackupOptions {
  chunkSize?: number; // Documents per chunk (default: 1000)
  largeCollectionThreshold?: number; // Threshold to consider collection large (default: 10000)
}

export interface CollectionStats {
  name: string;
  rows: number;
  size: number;
  chunked: boolean;
  chunks?: number;
}

export interface MongoBackupResult extends BackupResult {
  collections?: CollectionStats[];
  totalDocuments?: number;
  totalCollections?: number;
}

export class MongoBackupStrategy extends BackupStrategy {
  private options: MongoBackupOptions;

  constructor(options: MongoBackupOptions = {}) {
    super();
    this.options = {
      chunkSize: options.chunkSize || 1000,
      largeCollectionThreshold: options.largeCollectionThreshold || 10000,
    };
  }

  async execute(config: BackupConfig): Promise<MongoBackupResult> {
    const startTime = Date.now();
    let client: MongoClient | null = null;

    try {
      // Use provided connection string or build one
      const connectionString = config.database.connectionString || this.buildConnectionString(config);

      console.log(`Connecting to MongoDB: ${connectionString.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

      // Connect to MongoDB with options for Atlas compatibility
      client = new MongoClient(connectionString, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
      });
      await client.connect();

      const db = client.db(config.database.database);

      // Get all collections
      const collections = await db.listCollections().toArray();

      // Create output directory
      const outputDir = path.dirname(config.outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Backup each collection
      const collectionStats: CollectionStats[] = [];
      let totalDocuments = 0;
      let totalSize = 0;

      for (const collInfo of collections) {
        const collection = db.collection(collInfo.name);
        const stats = await this.backupCollection(
          collection,
          collInfo.name,
          config.outputPath,
          config.compress,
        );
        collectionStats.push(stats);
        totalDocuments += stats.rows;
        totalSize += stats.size;
      }

      // Create metadata file
      const metadata = {
        database: config.database.database,
        exportDate: new Date().toISOString(),
        collections: collectionStats,
        totalDocuments,
        totalSize,
        version: '1.0',
      };

      const metadataPath = config.outputPath.replace(/\.[^/.]+$/, '') + '_metadata.json';
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      const duration = Date.now() - startTime;

      return {
        success: true,
        filePath: config.outputPath,
        size: totalSize,
        duration,
        collections: collectionStats,
        totalDocuments,
        totalCollections: collections.length,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
      };
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  private buildConnectionString(config: BackupConfig): string {
    const { host, port, username, password, database } = config.database;

    let connectionString = 'mongodb://';
    if (username) {
      connectionString += encodeURIComponent(username);
      if (password) {
        connectionString += ':' + encodeURIComponent(password);
      }
      connectionString += '@';
    }
    connectionString += `${host}:${port}/${database}?authSource=admin`;

    return connectionString;
  }

  private async backupCollection(
    collection: Collection<Document>,
    collectionName: string,
    outputPath: string,
    compress?: boolean,
  ): Promise<CollectionStats> {
    // Get collection count
    const count = await collection.countDocuments();
    const isLargeCollection = count > this.options.largeCollectionThreshold!;

    // Prepare output file path
    const baseDir = path.dirname(outputPath);
    const collectionDir = path.join(baseDir, 'collections');
    if (!fs.existsSync(collectionDir)) {
      fs.mkdirSync(collectionDir, { recursive: true });
    }

    let totalSize = 0;
    let chunksWritten = 0;

    if (isLargeCollection) {
      // Use chunking for large collections
      totalSize = await this.backupCollectionChunked(
        collection,
        collectionName,
        collectionDir,
        count,
        compress,
      );
      chunksWritten = Math.ceil(count / this.options.chunkSize!);
    } else {
      // Export entire collection at once
      totalSize = await this.backupCollectionFull(
        collection,
        collectionName,
        collectionDir,
        compress,
      );
    }

    return {
      name: collectionName,
      rows: count,
      size: totalSize,
      chunked: isLargeCollection,
      chunks: isLargeCollection ? chunksWritten : undefined,
    };
  }

  private async backupCollectionFull(
    collection: Collection<Document>,
    collectionName: string,
    outputDir: string,
    compress?: boolean,
  ): Promise<number> {
    const documents = await collection.find().toArray();
    const jsonData = JSON.stringify(documents, null, 0);

    const extension = compress ? '.json.gz' : '.json';
    const filePath = path.join(outputDir, `${collectionName}${extension}`);

    if (compress) {
      await this.writeCompressed(filePath, jsonData);
    } else {
      fs.writeFileSync(filePath, jsonData);
    }

    return Buffer.byteLength(jsonData, 'utf8');
  }

  private async backupCollectionChunked(
    collection: Collection<Document>,
    collectionName: string,
    outputDir: string,
    totalCount: number,
    compress?: boolean,
  ): Promise<number> {
    const chunkSize = this.options.chunkSize!;
    const totalChunks = Math.ceil(totalCount / chunkSize);
    let totalSize = 0;

    // Create collection subdirectory for chunks
    const collectionChunkDir = path.join(outputDir, collectionName);
    if (!fs.existsSync(collectionChunkDir)) {
      fs.mkdirSync(collectionChunkDir, { recursive: true });
    }

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const skip = chunkIndex * chunkSize;

      // Fetch chunk of documents
      const documents = await collection
        .find()
        .skip(skip)
        .limit(chunkSize)
        .toArray();

      const jsonData = JSON.stringify(documents, null, 0);

      const extension = compress ? '.json.gz' : '.json';
      const chunkFileName = `chunk_${String(chunkIndex).padStart(5, '0')}${extension}`;
      const filePath = path.join(collectionChunkDir, chunkFileName);

      if (compress) {
        await this.writeCompressed(filePath, jsonData);
      } else {
        fs.writeFileSync(filePath, jsonData);
      }

      totalSize += Buffer.byteLength(jsonData, 'utf8');

      // Log progress for large collections
      if ((chunkIndex + 1) % 10 === 0 || chunkIndex === totalChunks - 1) {
        console.log(`  [${collectionName}] Exported chunk ${chunkIndex + 1}/${totalChunks}`);
      }
    }

    // Write chunk manifest
    const manifest = {
      collection: collectionName,
      totalDocuments: totalCount,
      chunkSize,
      totalChunks,
      compressed: compress || false,
    };

    fs.writeFileSync(
      path.join(collectionChunkDir, '_manifest.json'),
      JSON.stringify(manifest, null, 2),
    );

    return totalSize;
  }

  private async writeCompressed(filePath: string, data: string): Promise<void> {
    const readStream = Readable.from([data]);
    const gzip = createGzip();
    const writeStream = fs.createWriteStream(filePath);

    await pipeline(readStream, gzip, writeStream);
  }
}
