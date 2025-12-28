/**
 * Backup strategies and interfaces
 */

export interface BackupResult {
  success: boolean;
  filePath?: string;
  size?: number;
  duration?: number;
  error?: string;
  collections?: Array<{ name: string; rows: number; size: number; chunked?: boolean; chunks?: number }>;
  totalDocuments?: number;
  totalCollections?: number;
  tables?: Array<{ name: string; rows: number; size: number }>;
  totalRows?: number;
  totalTables?: number;
}

export interface BackupConfig {
  database: {
    type: 'mysql' | 'postgresql' | 'mongodb';
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    connectionString?: string;
  };
  outputPath: string;
  compress?: boolean;
  encrypt?: boolean;
  chunkSize?: number;
  largeCollectionThreshold?: number;
}

export abstract class BackupStrategy {
  abstract execute(config: BackupConfig): Promise<BackupResult>;
}

// Export strategies
export * from './strategies/mongodb.strategy';
export * from './strategies/mysql.strategy';
