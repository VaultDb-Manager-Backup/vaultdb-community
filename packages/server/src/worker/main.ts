import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);

  console.log('VaultDB Worker started');

  // Keep the worker running
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down...');
    await app.close();
    process.exit(0);
  });
}

bootstrap();
