/**
 * TypeScript Contracts and Backend DTOs for KeyPer Generator Module
 * Aligned with NestJS Generator Module endpoints and Zero-Knowledge security principles.
 */

export type GeneratorMode = 'password' | 'passphrase' | 'pin';

export interface GeneratorOptions {
  mode: GeneratorMode;
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  separator?: string;
  wordCount?: number;
  capitalizeWords?: boolean;
  includeNumberInPassphrase?: boolean;
}

export type PasswordStrengthLevel = 'weak' | 'moderate' | 'strong' | 'very-strong';

export interface PasswordStrengthResult {
  score: number; // 0 to 4 score scale
  label: string; // "Weak", "Moderate", "Strong", "Very Strong"
  entropyBits: number; // Bits of entropy
  crackTimeDisplay: string; // e.g., "1.2 trillion years", "3 days"
  level: PasswordStrengthLevel;
  color: string; // CSS color string (e.g. hex/tailwind class)
  feedback: string[];
}

/**
 * NestJS Generator Preset DTOs (Zero-Knowledge: Presets store parameters/preferences only, NEVER passwords)
 */
export interface GeneratorPresetDto {
  id: string;
  name: string;
  isDefault: boolean;
  options: GeneratorOptions;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGeneratorPresetDto {
  name: string;
  isDefault?: boolean;
  options: GeneratorOptions;
}

export interface UpdateGeneratorPresetDto {
  name?: string;
  isDefault?: boolean;
  options?: Partial<GeneratorOptions>;
}

/**
 * Transient in-memory generated history item (Zero-Knowledge: NEVER persisted to local storage or API)
 */
export interface GeneratorHistoryItem {
  id: string;
  passwordText: string;
  mode: GeneratorMode;
  timestamp: string;
  strength: PasswordStrengthResult;
}

/**
 * Anonymized Zero-Knowledge Telemetry Hash DTO for NestJS Audit Log backend
 */
export interface GeneratorAuditLogDto {
  action: 'GENERATED_PASSWORD' | 'SAVED_PRESET' | 'COPIED_TO_CLIPBOARD';
  mode: GeneratorMode;
  length: number;
  entropyBits: number;
  timestamp: string;
}
