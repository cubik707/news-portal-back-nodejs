import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });

  const uploadDir = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.resolve(__dirname, '..', 'uploads');
  app.useStaticAssets(uploadDir, { prefix: '/uploads' });

  app.useLogger(app.get(Logger));

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(8080);
}

void bootstrap();
