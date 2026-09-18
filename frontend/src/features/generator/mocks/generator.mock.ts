import type { GeneratorPresetDto } from '../types/generator.types';

export const mockDelay = (minMs = 300, maxMs = 600): Promise<void> => {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const MOCK_GENERATOR_PRESETS: GeneratorPresetDto[] = [
  {
    id: 'preset-high-security',
    name: 'High-Security Vault Default',
    isDefault: true,
    options: {
      mode: 'password',
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeAmbiguous: true,
    },
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'preset-memorable-passphrase',
    name: 'Memorable Diceware Passphrase',
    isDefault: false,
    options: {
      mode: 'passphrase',
      length: 4,
      uppercase: false,
      lowercase: true,
      numbers: true,
      symbols: false,
      excludeAmbiguous: true,
      wordCount: 4,
      separator: '-',
      capitalizeWords: true,
      includeNumberInPassphrase: true,
    },
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'preset-pin-code',
    name: 'Secure 6-Digit PIN',
    isDefault: false,
    options: {
      mode: 'pin',
      length: 6,
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
      excludeAmbiguous: false,
    },
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];
