import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { EmailModule } from './email/email.module.js';
import { VaultModule } from './vault/vault.module.js';
import { AuditModule } from './audit/audit.module.js';
import { SecurityModule } from './security/security.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'short',
          ttl: 1000,   // 1 second window
          limit: 3,    // Max 3 requests per second
        },
        {
          name: 'medium',
          ttl: 10000,  // 10 seconds window
          limit: 20,   // Max 20 requests per 10 seconds
        },
        {
          name: 'long',
          ttl: 60000,  // 1 minute window
          limit: 100,  // Max 100 requests per minute
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        ssl: { rejectUnauthorized: false },
      }),
    }),
    AuthModule,
    EmailModule,
    VaultModule,
    AuditModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }