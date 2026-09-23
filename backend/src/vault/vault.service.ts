import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaultEntry } from './vault-entry.entity.js';
import { VaultFolder } from './vault-folder.entity.js';
import { CreateVaultEntryDto } from './dto/create-vault-entry.dto.js';
import { UpdateVaultEntryDto } from './dto/update-vault-entry.dto.js';

@Injectable()
export class VaultService {
    constructor(
        @InjectRepository(VaultEntry)
        private readonly vaultRepository: Repository<VaultEntry>,
        @InjectRepository(VaultFolder)
        private readonly folderRepository: Repository<VaultFolder>,
    ) { }

    // Helper to ensure category folder is registered
    private async ensureFolder(userId: string, categoryName?: string) {
        if (!categoryName) return;
        const trimmed = categoryName.trim();
        if (!trimmed || trimmed === 'All items') return;
        try {
            await this.createFolder(userId, trimmed);
        } catch {
            // Ignore duplicate folder creation errors
        }
    }

    // 1. Create a new encrypted vault entry
    async create(userId: string, dto: CreateVaultEntryDto): Promise<VaultEntry> {
        if (dto.category) {
            await this.ensureFolder(userId, dto.category);
        }
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
        if (dto.category) {
            await this.ensureFolder(userId, dto.category);
        }
        Object.assign(entry, dto);
        return this.vaultRepository.save(entry);
    }

    // 5. Delete an entry
    async remove(userId: string, id: string): Promise<{ message: string }> {
        const entry = await this.findOne(userId, id);
        await this.vaultRepository.remove(entry);
        return { message: 'Vault entry deleted successfully' };
    }

    // 6. Custom Folders Persistence
    async getFolders(userId: string): Promise<string[]> {
        const folders = await this.folderRepository.find({
            where: { userId },
            order: { createdAt: 'ASC' },
        });
        const folderNames = folders.map((f) => f.name);

        // Fetch distinct categories directly from vault entries
        const entries = await this.vaultRepository.find({
            where: { userId },
            select: { category: true },
        });
        const entryCategories = entries
            .map((e) => e.category)
            .filter((c): c is string => Boolean(c && c !== 'All items'));

        const combined = Array.from(new Set(['All items', ...folderNames, ...entryCategories]));
        return combined;
    }

    async createFolder(userId: string, name: string): Promise<{ id: string; name: string }> {
        const trimmed = name.trim();
        if (!trimmed) throw new Error('Folder name cannot be empty');
        const existing = await this.folderRepository.findOne({
            where: { userId, name: trimmed },
        });
        if (existing) {
            return { id: existing.id, name: existing.name };
        }
        const newFolder = this.folderRepository.create({ userId, name: trimmed });
        const saved = await this.folderRepository.save(newFolder);
        return { id: saved.id, name: saved.name };
    }
}