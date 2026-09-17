import {
    Controller,
    Get,
    Query,
    UseGuards,
    Req,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import * as express from 'express';
import { AuditService } from './audit.service.js';
import { AuditAction } from './audit-log.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    async getLogs(
        @Req() req: express.Request,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query('action') action?: AuditAction,
    ) {
        const user = req.user as { id: string };
        const safeLimit = Math.min(Math.max(limit, 1), 100);
        return this.auditService.getLogsForUser(user.id, page, safeLimit, action);
    }
}