import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditAction, AuditLog } from './audit-log.entity.js';

export interface CreateAuditRecord {
    userId: string;
    action: AuditAction;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, any> | null;
}

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditRepository: Repository<AuditLog>,
    ) { }

    async record(params: CreateAuditRecord): Promise<AuditLog> {
        const entry = this.auditRepository.create({
            userId: params.userId,
            action: params.action,
            ipAddress: params.ipAddress ?? null,
            userAgent: params.userAgent ? params.userAgent.substring(0, 255) : null,
            metadata: params.metadata ?? null,
        });
        return this.auditRepository.save(entry);
    }

    async getLogsForUser(
        userId: string,
        page = 1,
        limit = 20,
        action?: AuditAction,
    ): Promise<{ data: AuditLog[]; total: number; page: number; lastPage: number }> {
        const query = this.auditRepository
            .createQueryBuilder('audit')
            .where('audit.userId = :userId', { userId })
            .orderBy('audit.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (action) {
            query.andWhere('audit.action = :action', { action });
        }

        const [data, total] = await query.getManyAndCount();

        return {
            data,
            total,
            page,
            lastPage: Math.ceil(total / limit) || 1,
        };
    }
}