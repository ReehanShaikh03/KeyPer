import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import * as express from 'express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. HTTP Security Headers
  app.use(helmet());

  // 2. Allowed origins list
  const allowedOrigins = [
    'http://localhost:5173',
    'https://key-per-flax.vercel.app',
    process.env.FRONTEND_URL, // Optional: add Render env var if configured
  ].filter(Boolean) as string[];

  // 3. Strict CORS Configuration
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow non-browser agents (cURL, Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Match exact origins OR any Vercel preview/branch deploy for KeyPer
      // Matches both 'key-per-flax-*.vercel.app' and 'key-per-git-*.vercel.app'
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/key-per(-[a-z0-9-]+)?\.vercel\.app$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`Blocked request from disallowed origin: ${origin}`);
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 204,
  });

  // 4. Payload size caps
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 5. Strict Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`KeyPer Backend running on port ${port}`);
}
bootstrap();