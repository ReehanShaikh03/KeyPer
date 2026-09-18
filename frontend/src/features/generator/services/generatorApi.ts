import { apiClient } from '@/shared/services/apiClient';
import type {
  GeneratorPresetDto,
  CreateGeneratorPresetDto,
  UpdateGeneratorPresetDto,
  GeneratorAuditLogDto,
} from '../types/generator.types';
import { MOCK_GENERATOR_PRESETS, mockDelay } from '../mocks/generator.mock';

const isMock = import.meta.env.VITE_USE_MOCK === 'true' || true; // Default to mock fallback when backend unavailable

class GeneratorApiService {
  private memoryPresets: GeneratorPresetDto[] = [...MOCK_GENERATOR_PRESETS];

  async getPresets(): Promise<GeneratorPresetDto[]> {
    if (isMock) {
      await mockDelay(300, 500);
      return [...this.memoryPresets];
    }
    return apiClient.get<GeneratorPresetDto[]>('/generator/presets');
  }

  async createPreset(dto: CreateGeneratorPresetDto): Promise<GeneratorPresetDto> {
    if (isMock) {
      await mockDelay(350, 550);
      const newPreset: GeneratorPresetDto = {
        id: `preset-${Date.now()}`,
        name: dto.name,
        isDefault: dto.isDefault || false,
        options: dto.options,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (dto.isDefault) {
        this.memoryPresets = this.memoryPresets.map((p) => ({ ...p, isDefault: false }));
      }
      this.memoryPresets.push(newPreset);
      return newPreset;
    }
    return apiClient.post<GeneratorPresetDto>('/generator/presets', dto);
  }

  async updatePreset(id: string, dto: UpdateGeneratorPresetDto): Promise<GeneratorPresetDto> {
    if (isMock) {
      await mockDelay(300, 500);
      const index = this.memoryPresets.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Preset not found');

      if (dto.isDefault) {
        this.memoryPresets = this.memoryPresets.map((p) => ({ ...p, isDefault: false }));
      }

      const updated: GeneratorPresetDto = {
        ...this.memoryPresets[index],
        name: dto.name ?? this.memoryPresets[index].name,
        isDefault: dto.isDefault ?? this.memoryPresets[index].isDefault,
        options: dto.options
          ? { ...this.memoryPresets[index].options, ...dto.options }
          : this.memoryPresets[index].options,
        updatedAt: new Date().toISOString(),
      };
      this.memoryPresets[index] = updated;
      return updated;
    }
    return apiClient.put<GeneratorPresetDto>(`/generator/presets/${id}`, dto);
  }

  async deletePreset(id: string): Promise<void> {
    if (isMock) {
      await mockDelay(300, 450);
      this.memoryPresets = this.memoryPresets.filter((p) => p.id !== id);
      return;
    }
    return apiClient.delete<void>(`/generator/presets/${id}`);
  }

  /**
   * Send Zero-Knowledge audit event hash to NestJS backend for security metrics
   */
  async logTelemetry(log: GeneratorAuditLogDto): Promise<void> {
    if (isMock) {
      // Mock silent log receipt
      return;
    }
    return apiClient.post<void>('/generator/telemetry', log);
  }
}

export const generatorApi = new GeneratorApiService();
