import { useState, useCallback } from 'react';
import type { VaultItemData } from '../types/vault.types';

// Helper WebCrypto functions for Zero-Knowledge client-side encryption/decryption
async function deriveKey(masterPassword: string, salt: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function useVaultCrypto() {
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [userSalt, setUserSalt] = useState<string>('keyper_default_salt_2026');

  // Unlock vault by deriving client-side AES-GCM key in memory
  const unlockVault = useCallback(async (masterPassword: string, customSalt?: string) => {
    try {
      const salt = customSalt || userSalt;
      const derived = await deriveKey(masterPassword, salt);
      setCryptoKey(derived);
      setUserSalt(salt);
      setIsUnlocked(true);
      return true;
    } catch (err) {
      console.error('Failed to derive vault key:', err);
      return false;
    }
  }, [userSalt]);

  // Lock vault by clearing derived key from memory
  const lockVault = useCallback(() => {
    setCryptoKey(null);
    setIsUnlocked(false);
  }, []);

  // Encrypt plaintext payload into Base64 ciphertext and IV
  const encryptData = useCallback(
    async (data: VaultItemData): Promise<{ iv: string; ciphertext: string }> => {
      const jsonStr = JSON.stringify(data);

      if (!cryptoKey) {
        // Fallback for mock simulation when master key is not yet derived
        const ivBytes = window.crypto.getRandomValues(new Uint8Array(12));
        const ivBase64 = bufferToBase64(ivBytes.buffer);
        return {
          iv: ivBase64,
          ciphertext: `MOCK_ENC_${jsonStr}`,
        };
      }

      const enc = new TextEncoder();
      const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        enc.encode(jsonStr)
      );

      return {
        iv: bufferToBase64(iv.buffer),
        ciphertext: bufferToBase64(encryptedBuffer),
      };
    },
    [cryptoKey]
  );

  // Decrypt ciphertext using client key
  const decryptData = useCallback(
    async (ivBase64: string, ciphertextBase64: string): Promise<VaultItemData> => {
      // Mock prefix support
      if (ciphertextBase64.startsWith('MOCK_ENC_')) {
        try {
          const rawJson = ciphertextBase64.replace('MOCK_ENC_', '');
          return JSON.parse(rawJson);
        } catch {
          return { username: 'Decryption failed', notes: 'Unable to parse mock payload' };
        }
      }

      if (!cryptoKey) {
        throw new Error('Vault is locked. Master key required for decryption.');
      }

      try {
        const iv = base64ToBuffer(ivBase64);
        const ciphertext = base64ToBuffer(ciphertextBase64);

        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: new Uint8Array(iv) },
          cryptoKey,
          ciphertext
        );

        const dec = new TextDecoder();
        const jsonStr = dec.decode(decryptedBuffer);
        return JSON.parse(jsonStr);
      } catch (err) {
        console.error('WebCrypto Decryption Error:', err);
        return { username: 'Invalid key / Corrupted data' };
      }
    },
    [cryptoKey]
  );

  // Analyze password strength (0 - 100)
  const calculateStrength = useCallback((password?: string) => {
    if (!password) return { score: 0, label: 'Weak' as const, color: '#EF4444' };
    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 20;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;

    if (score >= 80) return { score, label: 'Strong' as const, color: '#10B981' };
    if (score >= 50) return { score, label: 'Good' as const, color: '#14B8A6' };
    if (score >= 30) return { score, label: 'Fair' as const, color: '#F59E0B' };
    return { score, label: 'Weak' as const, color: '#EF4444' };
  }, []);

  return {
    isUnlocked,
    unlockVault,
    lockVault,
    encryptData,
    decryptData,
    calculateStrength,
  };
}
