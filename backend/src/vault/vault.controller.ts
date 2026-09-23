import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
} from '@nestjs/common';
import * as express from 'express';
import { VaultService } from './vault.service.js';
import { CreateVaultEntryDto } from './dto/create-vault-entry.dto.js';
import { UpdateVaultEntryDto } from './dto/update-vault-entry.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AuditService } from '../audit/audit.service.js';
import { AuditAction } from '../audit/audit-log.entity.js';
@UseGuards(JwtAuthGuard)
@Controller('vault')
export class VaultController {
    constructor(private readonly vaultService: VaultService,
        private readonly auditService: AuditService) { }

    // Example usage in create():
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Req() req: express.Request, @Body() dto: CreateVaultEntryDto) {
        const user = req.user as { id: string };
        const result = await this.vaultService.create(user.id, dto);

        await this.auditService.record({
            userId: user.id,
            action: AuditAction.VAULT_CREATE,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            metadata: { entryId: result.id, title: result.title },
        });

        return result;
    }

    @Get()
    findAll(@Req() req: express.Request) {
        const user = req.user as { id: string };
        return this.vaultService.findAll(user.id);
    }

    @Get('folders')
    getFolders(@Req() req: express.Request) {
        const user = req.user as { id: string };
        return this.vaultService.getFolders(user.id);
    }

    @Post('folders')
    @HttpCode(HttpStatus.CREATED)
    createFolder(@Req() req: express.Request, @Body('name') name: string) {
        const user = req.user as { id: string };
        return this.vaultService.createFolder(user.id, name);
    }

    @Get(':id')
    findOne(
        @Req() req: express.Request,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        const user = req.user as { id: string };
        return this.vaultService.findOne(user.id, id);
    }
    // backend/src/vault/vault.controller.ts

    @Put(':id')
    async update(
        @Req() req: express.Request,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateVaultEntryDto,
    ) {
        const user = req.user as { id: string };
        const updatedEntry = await this.vaultService.update(user.id, id, dto);

        await this.auditService.record({
            userId: user.id,
            action: AuditAction.VAULT_UPDATE,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            metadata: { entryId: id, updatedTitle: updatedEntry.title },
        });

        return updatedEntry;
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(
        @Req() req: express.Request,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        const user = req.user as { id: string };
        const result = await this.vaultService.remove(user.id, id);

        await this.auditService.record({
            userId: user.id,
            action: AuditAction.VAULT_DELETE,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            metadata: { entryId: id },
        });

        return result;
    }

}