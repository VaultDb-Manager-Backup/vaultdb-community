import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { EdgeModule } from './edge/edge.module';
import { DashboardController } from './controllers/dashboard.controller';
import { SettingsController } from './controllers/settings.controller';
import { BackupsController } from './controllers/backups.controller';
import { HealthController } from './controllers/health.controller';
import { AuthController } from './controllers/auth.controller';
import { BackupSettings, BackupSettingsSchema } from './schemas/backup-settings.schema';
import { Backup, BackupSchema } from './schemas/backup.schema';
import { SettingsService } from './services/settings.service';
import { BackupsService } from './services/backups.service';
import { BasicAuthGuard } from './guards/basic-auth.guard';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/vaultdb'),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    BullModule.registerQueue({ name: 'backup' }),
    MongooseModule.forFeature([
      { name: BackupSettings.name, schema: BackupSettingsSchema },
      { name: Backup.name, schema: BackupSchema },
    ]),
    EdgeModule,
  ],
  controllers: [
    DashboardController,
    SettingsController,
    BackupsController,
    HealthController,
    AuthController,
  ],
  providers: [
    SettingsService,
    BackupsService,
    {
      provide: APP_GUARD,
      useClass: BasicAuthGuard,
    },
  ],
})
export class AppModule {}
