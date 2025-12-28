/**
 * Restore strategies and interfaces
 */

export interface RestoreResult {
  success: boolean;
  duration?: number;
  error?: string;
}

export interface RestoreConfig {
  database: {
    type: 'mysql' | 'postgresql' | 'mongodb';
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  backupPath: string;
  decompress?: boolean;
  decrypt?: boolean;
}

export abstract class RestoreStrategy {
  abstract execute(config: RestoreConfig): Promise<RestoreResult>;
}
