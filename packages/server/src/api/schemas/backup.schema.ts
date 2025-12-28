import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BackupDocument = Backup & Document;

@Schema({ timestamps: true, collection: 'backups' })
export class Backup {
  @Prop({ type: Types.ObjectId, ref: 'BackupSettings', required: true })
  settings_id: Types.ObjectId;

  @Prop({ required: true })
  settings_name: string;

  @Prop({ enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' })
  status: string;

  @Prop()
  file_path: string;

  @Prop()
  file_size: number;

  @Prop()
  storage_url: string;

  @Prop()
  duration_ms: number;

  @Prop()
  error_message: string;

  @Prop({ type: Date })
  started_at: Date;

  @Prop({ type: Date })
  completed_at: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;
}

export const BackupSchema = SchemaFactory.createForClass(Backup);
