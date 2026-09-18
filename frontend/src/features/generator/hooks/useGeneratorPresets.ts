import { useState, useEffect, useCallback } from 'react';
import type { GeneratorPresetDto, GeneratorOptions } from '../types/generator.types';
import { generatorApi } from '../services/generatorApi';

export function useGeneratorPresets() {
  const [presets, setPresets] = useState<GeneratorPresetDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPresets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await generatorApi.getPresets();
      setPresets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load generator presets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const savePreset = async (name: string, options: GeneratorOptions, isDefault = false) => {
    try {
      const created = await generatorApi.createPreset({
        name,
        options,
        isDefault,
      });
      await fetchPresets();
      return created;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to save preset');
    }
  };

  const deletePreset = async (id: string) => {
    try {
      await generatorApi.deletePreset(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete preset');
    }
  };

  return {
    presets,
    isLoading,
    error,
    refreshPresets: fetchPresets,
    savePreset,
    deletePreset,
  };
}
