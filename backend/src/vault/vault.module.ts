import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport'; // <-- 1. Import PassportModule
import { VaultEntry } from './vault-entry.entity.js';
import { VaultFolder } from './vault-folder.entity.js';
import { VaultService } from './vault.service.js';
import { VaultController } from './vault.controller.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
    imports: [TypeOrmModule.forFeature([VaultEntry, VaultFolder]), PassportModule.register({ defaultStrategy: 'jwt' }), AuditModule],
    controllers: [VaultController],
    providers: [VaultService],
    exports: [VaultService],
})
export class VaultModule { }