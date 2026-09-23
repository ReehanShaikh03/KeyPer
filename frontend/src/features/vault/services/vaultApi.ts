import { apiClient } from '@/shared/services/apiClient';
import type {
  VaultEntryResponseDto,
  CreateVaultEntryDto,
  UpdateVaultEntryDto,
} from '../types/vault.types';
import { MOCK_VAULT_ENTRIES, simulateDelay } from '../mocks/vault.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let memoryMockEntries: VaultEntryResponseDto[] = USE_MOCK ? [...MOCK_VAULT_ENTRIES] : [];

export const vaultApi = {
  /**
   * GET /vault - Fetch all vault entries for authenticated user
   */
  async getAll(): Promise<VaultEntryResponseDto[]> {
    if (USE_MOCK) {
      await simulateDelay(350);
      return [...memoryMockEntries];
    }
    try {
      const entries = await apiClient.get<VaultEntryResponseDto[]>('/vault');
      memoryMockEntries = entries;
      return entries;
    } catch (err) {
      console.warn('NestJS /vault endpoint call failed or unauthenticated:', err);
      return [...memoryMockEntries];
    }
  },

  /**
   * GET /vault/:id - Fetch single vault entry by UUID
   */
  async getOne(id: string): Promise<VaultEntryResponseDto> {
    if (USE_MOCK) {
      await simulateDelay(250);
      const entry = memoryMockEntries.find((e) => e.id === id);
      if (!entry) throw new Error('Vault entry not found');
      return entry;
    }
    try {
      return await apiClient.get<VaultEntryResponseDto>(`/vault/${id}`);
    } catch (err) {
      const entry = memoryMockEntries.find((e) => e.id === id);
      if (!entry) throw new Error('Vault entry not found');
      return entry;
    }
  },

  /**
   * POST /vault - Create encrypted vault entry
   */
  async create(dto: CreateVaultEntryDto): Promise<VaultEntryResponseDto> {
    if (USE_MOCK) {
      await simulateDelay(450);
      const newEntry: VaultEntryResponseDto = {
        id: `mock-uuid-${Date.now()}`,
        userId: 'user-77-uuid',
        iv: dto.iv,
        ciphertext: dto.ciphertext,
        category: dto.category || 'General',
        title: dto.title || 'Untitled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryMockEntries.unshift(newEntry);
      return newEntry;
    }
    try {
      const created = await apiClient.post<VaultEntryResponseDto>('/vault', dto);
      memoryMockEntries.unshift(created);
      return created;
    } catch (err) {
      console.warn('NestJS /vault create failed, storing locally:', err);
      const newEntry: VaultEntryResponseDto = {
        id: `mock-uuid-${Date.now()}`,
        userId: 'user-77-uuid',
        iv: dto.iv,
        ciphertext: dto.ciphertext,
        category: dto.category || 'General',
        title: dto.title || 'Untitled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryMockEntries.unshift(newEntry);
      return newEntry;
    }
  },

  /**
   * PUT /vault/:id - Update encrypted vault entry
   */
  async update(id: string, dto: UpdateVaultEntryDto): Promise<VaultEntryResponseDto> {
    if (USE_MOCK) {
      await simulateDelay(400);
      const index = memoryMockEntries.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Vault entry not found');

      memoryMockEntries[index] = {
        ...memoryMockEntries[index],
        ...dto,
        updatedAt: new Date().toISOString(),
      };
      return memoryMockEntries[index];
    }
    try {
      const updated = await apiClient.put<VaultEntryResponseDto>(`/vault/${id}`, dto);
      const index = memoryMockEntries.findIndex((e) => e.id === id);
      if (index !== -1) memoryMockEntries[index] = updated;
      return updated;
    } catch (err) {
      console.warn('NestJS /vault update failed, updating locally:', err);
      const index = memoryMockEntries.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Vault entry not found');
      memoryMockEntries[index] = {
        ...memoryMockEntries[index],
        ...dto,
        updatedAt: new Date().toISOString(),
      };
      return memoryMockEntries[index];
    }
  },

  /**
   * DELETE /vault/:id - Delete vault entry by UUID
   */
  async delete(id: string): Promise<{ success: boolean }> {
    if (USE_MOCK) {
      await simulateDelay(300);
      memoryMockEntries = memoryMockEntries.filter((e) => e.id !== id);
      return { success: true };
    }
    try {
      const res = await apiClient.delete<{ success: boolean }>(`/vault/${id}`);
      memoryMockEntries = memoryMockEntries.filter((e) => e.id !== id);
      return res;
    } catch (err) {
      console.warn('NestJS /vault delete failed, removing locally:', err);
      memoryMockEntries = memoryMockEntries.filter((e) => e.id !== id);
      return { success: true };
    }
  },

  /**
   * GET /vault/folders - Fetch user custom folders
   */
  async getFolders(): Promise<string[]> {
    let localFolders: string[] = [];
    try {
      const stored = localStorage.getItem('keyper_custom_folders');
      if (stored) {
        localFolders = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse local custom folders:', e);
    }

    if (USE_MOCK) {
      const combined = Array.from(new Set(['All items', ...localFolders]));
      return combined;
    }
    try {
      const apiFolders = await apiClient.get<string[]>('/vault/folders');
      const combined = Array.from(new Set(['All items', ...apiFolders, ...localFolders]));
      return combined;
    } catch {
      const combined = Array.from(new Set(['All items', ...localFolders]));
      return combined;
    }
  },

  /**
   * POST /vault/folders - Create user custom folder
   */
  async createFolder(name: string): Promise<{ id: string; name: string }> {
    const trimmed = name.trim();
    if (trimmed) {
      try {
        const stored = localStorage.getItem('keyper_custom_folders');
        const list: string[] = stored ? JSON.parse(stored) : [];
        if (!list.includes(trimmed)) {
          list.push(trimmed);
          localStorage.setItem('keyper_custom_folders', JSON.stringify(list));
        }
      } catch (e) {
        console.warn('Failed to update local custom folders:', e);
      }
    }

    if (USE_MOCK) {
      return { id: `folder-${Date.now()}`, name: trimmed };
    }
    try {
      return await apiClient.post<{ id: string; name: string }>('/vault/folders', { name: trimmed });
    } catch {
      return { id: `folder-${Date.now()}`, name: trimmed };
    }
  },
};

