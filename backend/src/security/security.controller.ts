import {
    Controller,
    Get,
    Param,
    UseGuards,
    Req,
} from '@nestjs/common';
import * as express from 'express';
import { SecurityService } from './security.service.js';
import { CheckBreachPrefixDto } from './dto/security-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('security')
export class SecurityController {
    constructor(private readonly securityService: SecurityService) { }

    @Get('overview')
    getOverview(@Req() req: express.Request) {
        const user = req.user as { id: string };
        return this.securityService.getOverview(user.id);
    }

    @Get('breach-check/:prefix')
    async checkBreach(@Param() params: CheckBreachPrefixDto) {
        const rawData = await this.securityService.checkPwnedPrefix(params.prefix);
        return {
            prefix: params.prefix.toUpperCase(),
            hashSuffixes: rawData.split('\r\n').filter(Boolean),
        };
    }
}