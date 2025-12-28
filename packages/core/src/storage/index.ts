/**
 * Storage providers (S3, FTP, Local)
 */

export interface StorageConfig {
  type: 's3' | 'ftp' | 'sftp' | 'local';
  // S3
  bucket?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  endpoint?: string;
  // FTP/SFTP
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  remotePath?: string;
  // Local
  localPath?: string;
}

export interface StorageResult {
  success: boolean;
  url?: string;
  size?: number;
  error?: string;
}

export abstract class StorageProvider {
  abstract upload(filePath: string, remotePath: string): Promise<StorageResult>;
  abstract download(remotePath: string, localPath: string): Promise<StorageResult>;
  abstract delete(remotePath: string): Promise<StorageResult>;
  abstract list(prefix?: string): Promise<string[]>;
}
