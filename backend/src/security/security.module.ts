import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { VaultEntry } from '../vault/vault-entry.entity.js';
import { AuditLog } from '../audit/audit-log.entity.js';
import { SecurityService } from './security.service.js';
import { SecurityController } from './security.controller.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([VaultEntry, AuditLog]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
    controllers: [SecurityController],
    providers: [SecurityService],
    exports: [SecurityService],
})
export class SecurityModule { }