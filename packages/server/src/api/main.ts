import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable cookie parser
  app.use(cookieParser());

  // Static files path configuration
  // Docker prod: /app/public (copied)
  // Docker dev: /app/packages/server/public (mounted)
  // Local dev: relative to compiled file
  const isDocker = process.env.MONGODB_URI?.includes('mongo:') || false;
  const isDev = process.env.NODE_ENV === 'development';

  let publicPath: string;
  if (isDocker && isDev) {
    publicPath = join(process.cwd(), 'packages', 'server', 'public');
  } else if (isDocker) {
    publicPath = join(process.cwd(), 'public');
  } else {
    publicPath = join(__dirname, '..', '..', '..', 'public');
  }

  app.useStaticAssets(publicPath);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`VaultDB running on http://localhost:${port}`);
}

bootstrap();
