import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaultEntry } from './vault-entry.entity.js';
import { CreateVaultEntryDto } from './dto/create-vault-entry.dto.js';
import { UpdateVaultEntryDto } from './dto/update-vault-entry.dto.js';

@Injectable()
export class VaultService {
    constructor(
        @InjectRepository(VaultEntry)
        private readonly vaultRepository: Repository<VaultEntry>,
    ) { }

    // 1. Create a new encrypted vault entry
    async create(userId: string, dto: CreateVaultEntryDto): Promise<VaultEntry> {
        const entry = this.vaultRepository.create({
            ...dto,
            userId,
        });
        return this.vaultRepository.save(entry);
    }

    // 2. Fetch all entries belonging to the authenticated user
    async findAll(userId: string): Promise<VaultEntry[]> {
        return this.vaultRepository.find({
            where: { userId },
            order: { updatedAt: 'DESC' },
        });
    }

    // 3. Find a single entry (guarantees tenant isolation)
    async findOne(userId: string, id: string): Promise<VaultEntry> {
        const entry = await this.vaultRepository.findOne({
            where: { id, userId },
        });
        if (!entry) {
            throw new NotFoundException('Vault entry not found');
        }
        return entry;
    }

    // 4. Update an entry
    async update(userId: string, id: string, dto: UpdateVaultEntryDto): Promise<VaultEntry> {
        const entry = await this.findOne(userId, id);
        Object.assign(entry, dto);
        return this.vaultRepository.save(entry);
    }

    // 5. Delete an entry
    async remove(userId: string, id: string): Promise<{ message: string }> {
        const entry = await this.findOne(userId, id);
        await this.vaultRepository.remove(entry);
        return { message: 'Vault entry deleted successfully' };
    }
}