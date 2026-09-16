// Backend DTOs & Domain Models for KeyPer Vault Module

export type VaultCategory = 'All items' | 'Work' | 'Personal' | 'Finance' | 'Social' | string;

export interface EncryptedVaultPayload {
  iv: string;         // Base64 encoded 96-bit initialization vector
  ciphertext: string; // Base64 encoded AES-256-GCM payload
  category: string;   // Unencrypted server-side category
  title?: string;     // Unencrypted site title label for listing
}

export interface VaultEntryResponseDto {
  id: string;
  userId: string;
  iv: string;
  ciphertext: string;
  category: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVaultEntryDto {
  iv: string;
  ciphertext: string;
  category?: string;
  title?: string;
}

export interface UpdateVaultEntryDto {
  iv?: string;
  ciphertext?: string;
  category?: string;
  title?: string;
}

// Client-side Decrypted Vault Entry Model
export interface VaultItemData {
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  icon?: string;
  hasAlert?: boolean;
}

export interface DecryptedVaultEntry {
  id: string;
  userId: string;
  title: string;
  category: string;
  iv: string;
  ciphertext: string;
  decryptedData: VaultItemData;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  isUnlocked: boolean;
}

export interface StrengthAnalysis {
  score: number; // 0 to 100
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
}
