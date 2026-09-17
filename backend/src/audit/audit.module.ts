import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuditLog } from './audit-log.entity.js';
import { AuditService } from './audit.service.js';
import { AuditController } from './audit.controller.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([AuditLog]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
    controllers: [AuditController],
    providers: [AuditService],
    exports: [AuditService],
})
export class AuditModule { }