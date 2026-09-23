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
  private memoryPresets: GeneratorPresetDto[] = this.loadInitialPresets();

  private loadInitialPresets(): GeneratorPresetDto[] {
    try {
      const stored = localStorage.getItem('keyper_generator_presets');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse local generator presets:', e);
    }
    return [...MOCK_GENERATOR_PRESETS];
  }

  private savePresetsToLocal(presets: GeneratorPresetDto[]) {
    try {
      localStorage.setItem('keyper_generator_presets', JSON.stringify(presets));
    } catch (e) {
      console.warn('Failed to save generator presets to localStorage:', e);
    }
  }

  async getPresets(): Promise<GeneratorPresetDto[]> {
    if (isMock) {
      await mockDelay(200, 300);
      return [...this.memoryPresets];
    }
    try {
      const presets = await apiClient.get<GeneratorPresetDto[]>('/generator/presets');
      this.memoryPresets = presets;
      this.savePresetsToLocal(presets);
      return presets;
    } catch {
      return [...this.memoryPresets];
    }
  }

  async createPreset(dto: CreateGeneratorPresetDto): Promise<GeneratorPresetDto> {
    if (isMock) {
      await mockDelay(250, 400);
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
      this.savePresetsToLocal(this.memoryPresets);
      return newPreset;
    }
    const created = await apiClient.post<GeneratorPresetDto>('/generator/presets', dto);
    this.memoryPresets.push(created);
    this.savePresetsToLocal(this.memoryPresets);
    return created;
  }

  async updatePreset(id: string, dto: UpdateGeneratorPresetDto): Promise<GeneratorPresetDto> {
    if (isMock) {
      await mockDelay(250, 400);
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
      this.savePresetsToLocal(this.memoryPresets);
      return updated;
    }
    const updated = await apiClient.put<GeneratorPresetDto>(`/generator/presets/${id}`, dto);
    await this.getPresets();
    return updated;
  }

  async deletePreset(id: string): Promise<void> {
    if (isMock) {
      await mockDelay(200, 350);
      this.memoryPresets = this.memoryPresets.filter((p) => p.id !== id);
      this.savePresetsToLocal(this.memoryPresets);
      return;
    }
    await apiClient.delete<void>(`/generator/presets/${id}`);
    this.memoryPresets = this.memoryPresets.filter((p) => p.id !== id);
    this.savePresetsToLocal(this.memoryPresets);
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
