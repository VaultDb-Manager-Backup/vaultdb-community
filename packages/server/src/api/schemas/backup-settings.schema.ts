import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BackupSettingsDocument = BackupSettings & Document;

@Schema({ timestamps: true, collection: 'backup_settings' })
export class BackupSettings {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['mysql', 'postgresql', 'mongodb'] })
  database_type: string;

  @Prop({ default: '' })
  connection_string: string;

  @Prop({ default: '' })
  host: string;

  @Prop({ default: 0 })
  port: number;

  @Prop({ default: '' })
  username: string;

  @Prop({ default: '' })
  password: string;

  @Prop({ default: '' })
  database: string;

  @Prop({ enum: ['s3', 'ftp', 'sftp', 'local'], default: 'local' })
  storage_type: string;

  @Prop({ type: Object, default: {} })
  storage_config: Record<string, unknown>;

  @Prop({ default: false })
  compress: boolean;

  @Prop({ default: false })
  encrypt: boolean;

  @Prop({ default: '' })
  cron_schedule: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: 7 })
  retention_days: number;
}

export const BackupSettingsSchema = SchemaFactory.createForClass(BackupSettings);
