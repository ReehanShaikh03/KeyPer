import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaultEntry } from '../vault/vault-entry.entity.js';
import { AuditLog } from '../audit/audit-log.entity.js';

export interface SecurityOverview {
    totalVaultEntries: number;
    categories: Record<string, number>;
    lastUpdatedEntry: Date | null;
    recentSecurityEvents: number;
}

@Injectable()
export class SecurityService {
    private readonly logger = new Logger(SecurityService.name);

    constructor(
        @InjectRepository(VaultEntry)
        private readonly vaultRepository: Repository<VaultEntry>,
        @InjectRepository(AuditLog)
        private readonly auditRepository: Repository<AuditLog>,
    ) { }

    async getOverview(userId: string): Promise<SecurityOverview> {
        const totalVaultEntries = await this.vaultRepository.count({
            where: { userId },
        });

        const categoryRows = await this.vaultRepository
            .createQueryBuilder('entry')
            .select('entry.category', 'category')
            .addSelect('COUNT(*)', 'count')
            .where('entry.userId = :userId', { userId })
            .groupBy('entry.category')
            .getRawMany<{ category: string; count: string }>();

        const categories: Record<string, number> = {};
        for (const row of categoryRows) {
            categories[row.category || 'General'] = parseInt(row.count, 10);
        }

        const latest = await this.vaultRepository.findOne({
            where: { userId },
            order: { updatedAt: 'DESC' },
        });

        const recentSecurityEvents = await this.auditRepository.count({
            where: { userId },
        });

        return {
            totalVaultEntries,
            categories,
            lastUpdatedEntry: latest ? latest.updatedAt : null,
            recentSecurityEvents,
        };
    }

    // k-Anonymity HIBP Relay
    async checkPwnedPrefix(prefix: string): Promise<string> {
        const formattedPrefix = prefix.trim().toUpperCase();
        try {
            const response = await fetch(
                `https://api.pwnedpasswords.com/range/${formattedPrefix}`,
                {
                    headers: {
                        'User-Agent': 'KeyPer-Password-Manager',
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`HIBP API responded with status ${response.status}`);
            }

            return await response.text();
        } catch (error) {
            this.logger.error('Failed to query HIBP k-Anonymity API', error);
            throw new InternalServerErrorException(
                'Could not execute breach analysis relay',
            );
        }
    }
}