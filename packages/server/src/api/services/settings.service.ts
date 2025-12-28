import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Model } from 'mongoose';
import { Queue } from 'bull';
import { BackupSettings, BackupSettingsDocument } from '../schemas/backup-settings.schema';

export interface CreateSettingsDto {
  name: string;
  database_type: 'mysql' | 'postgresql' | 'mongodb';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  storage_type?: 's3' | 'ftp' | 'sftp' | 'local';
  storage_config?: Record<string, unknown>;
  compress?: boolean;
  encrypt?: boolean;
  cron_schedule?: string;
  retention_days?: number;
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(BackupSettings.name)
    private settingsModel: Model<BackupSettingsDocument>,
    @InjectQueue('backup') private backupQueue: Queue,
  ) {}

  async findAll(): Promise<BackupSettingsDocument[]> {
    return this.settingsModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<BackupSettingsDocument | null> {
    return this.settingsModel.findById(id).exec();
  }

  async create(dto: CreateSettingsDto): Promise<BackupSettingsDocument> {
    const settings = new this.settingsModel({
      ...dto,
      enabled: true,
    });
    return settings.save();
  }

  async update(id: string, dto: Partial<CreateSettingsDto>): Promise<BackupSettingsDocument | null> {
    return this.settingsModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.settingsModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async executeBackup(id: string): Promise<{ jobId: string }> {
    const settings = await this.findById(id);
    if (!settings) {
      throw new Error('Settings not found');
    }

    const job = await this.backupQueue.add('execute-backup', {
      settingsId: id,
      database: {
        type: settings.database_type,
        host: settings.host,
        port: settings.port,
        username: settings.username,
        password: settings.password,
        database: settings.database,
        connectionString: settings.connection_string,
      },
      storage: {
        type: settings.storage_type,
        config: settings.storage_config,
      },
      options: {
        compress: settings.compress,
        encrypt: settings.encrypt,
      },
    });

    return { jobId: String(job.id) };
  }
}
