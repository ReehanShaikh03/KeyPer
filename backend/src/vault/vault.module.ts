import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport'; // <-- 1. Import PassportModule
import { VaultEntry } from './vault-entry.entity.js';
import { VaultService } from './vault.service.js';
import { VaultController } from './vault.controller.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
    imports: [TypeOrmModule.forFeature([VaultEntry]), PassportModule.register({ defaultStrategy: 'jwt' }), AuditModule], // <-- 2. Register here
    controllers: [VaultController],
    providers: [VaultService],
    exports: [VaultService],
})
export class VaultModule { }