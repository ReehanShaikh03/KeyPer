import { apiClient } from '@/shared/services/apiClient';
import type {
  VaultEntryResponseDto,
  CreateVaultEntryDto,
  UpdateVaultEntryDto,
} from '../types/vault.types';
import { MOCK_VAULT_ENTRIES, simulateDelay } from '../mocks/vault.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true; // Default to true in standalone preview mode

let memoryMockEntries = [...MOCK_VAULT_ENTRIES];

export const vaultApi = {
  async getAll(): Promise<VaultEntryResponseDto[]> {
    if (USE_MOCK) {
      await simulateDelay(350);
      return [...memoryMockEntries];
    }
    return apiClient.get<VaultEntryResponseDto[]>('/vault');
  },

  async getOne(id: string): Promise<VaultEntryResponseDto> {
    if (USE_MOCK) {
      await simulateDelay(250);
      const entry = memoryMockEntries.find((e) => e.id === id);
      if (!entry) throw new Error('Vault entry not found');
      return entry;
    }
    return apiClient.get<VaultEntryResponseDto>(`/vault/${id}`);
  },

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
    return apiClient.post<VaultEntryResponseDto>('/vault', dto);
  },

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
    return apiClient.put<VaultEntryResponseDto>(`/vault/${id}`, dto);
  },

  async delete(id: string): Promise<{ success: boolean }> {
    if (USE_MOCK) {
      await simulateDelay(300);
      memoryMockEntries = memoryMockEntries.filter((e) => e.id !== id);
      return { success: true };
    }
    return apiClient.delete<{ success: boolean }>(`/vault/${id}`);
  },
};
