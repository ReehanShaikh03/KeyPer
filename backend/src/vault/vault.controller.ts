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

@UseGuards(JwtAuthGuard)
@Controller('vault')
export class VaultController {
    constructor(private readonly vaultService: VaultService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Req() req: express.Request, @Body() dto: CreateVaultEntryDto) {
        const user = req.user as { id: string };
        return this.vaultService.create(user.id, dto);
    }

    @Get()
    findAll(@Req() req: express.Request) {
        const user = req.user as { id: string };
        return this.vaultService.findAll(user.id);
    }

    @Get(':id')
    findOne(
        @Req() req: express.Request,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        const user = req.user as { id: string };
        return this.vaultService.findOne(user.id, id);
    }

    @Put(':id')
    update(
        @Req() req: express.Request,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateVaultEntryDto,
    ) {
        const user = req.user as { id: string };
        return this.vaultService.update(user.id, id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    remove(
        @Req() req: express.Request,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        const user = req.user as { id: string };
        return this.vaultService.remove(user.id, id);
    }
}