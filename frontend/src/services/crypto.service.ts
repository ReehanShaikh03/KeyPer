// Helper functions for ArrayBuffer <-> Base64 conversion
function bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export interface DecryptedVaultData {
    siteName: string;
    siteUrl?: string;
    username: string;
    password: string;
    notes?: string;
    category?: string;
}

export interface EncryptedPayload {
    ciphertext: string;
    iv: string;
}

/**
 * Encrypts a plaintext entry object using AES-256-GCM.
 * Generates a fresh 12-byte initialization vector (IV) for each operation.
 */
export async function encryptVaultEntry(
    data: DecryptedVaultData,
    derivedKey: CryptoKey
): Promise<EncryptedPayload> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
            name: 'AES-256-GCM',
            iv,
        },
        derivedKey,
        encodedData
    );

    return {
        ciphertext: bufferToBase64(encryptedBuffer),
        iv: bufferToBase64(iv.buffer),
    };
}

/**
 * Decrypts AES-256-GCM ciphertext using the in-memory derived CryptoKey.
 */
export async function decryptVaultEntry(
    ciphertext: string,
    iv: string,
    derivedKey: CryptoKey
): Promise<DecryptedVaultData> {
    const cipherBuffer = base64ToBuffer(ciphertext);
    const ivBuffer = base64ToBuffer(iv);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
            name: 'AES-256-GCM',
            iv: new Uint8Array(ivBuffer),
        },
        derivedKey,
        cipherBuffer
    );

    const decodedJson = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decodedJson) as DecryptedVaultData;
}