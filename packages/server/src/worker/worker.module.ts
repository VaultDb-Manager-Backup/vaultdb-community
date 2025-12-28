import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { BackupProcessor } from './processors/backup.processor';
import { Backup, BackupSchema } from '../api/schemas/backup.schema';
import { BackupSettings, BackupSettingsSchema } from '../api/schemas/backup-settings.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/vaultdb'),
    MongooseModule.forFeature([
      { name: Backup.name, schema: BackupSchema },
      { name: BackupSettings.name, schema: BackupSettingsSchema },
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    BullModule.registerQueue(
      { name: 'backup' },
      { name: 'restore' },
    ),
  ],
  providers: [BackupProcessor],
})
export class WorkerModule {}
