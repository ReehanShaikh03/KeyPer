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

  // 2. Strict CORS Configuration
  const allowedOrigins = [
    'http://localhost:5173',
    'https://key-per-flax.vercel.app', // ✅ Removed trailing slash
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow server-to-server, curl, Postman, or requests without Origin headers
      if (!origin) {
        return callback(null, true);
      }

      // Allow exact match or Vercel preview deployment subdomains
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/key-per-flax.*\.vercel\.app$/.test(origin);

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
    optionsSuccessStatus: 204, // Clean preflight resolution
  });

  // 3. Payload size caps to prevent memory exhaustion attacks
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. Strict Validation & Stripping of Unexpected Properties
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Strips properties not declared in DTO
      forbidNonWhitelisted: true, // Rejects requests with rogue payload keys
      transform: true,            // Auto-casts incoming data to DTO types
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`KeyPer Backend hardened and running on port ${port}`);
}
bootstrap();