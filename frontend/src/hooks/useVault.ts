import { useState, useEffect, useCallback } from 'react';
import { VaultApi, type VaultRecordResponse } from '../services/vaultApi.service.js';
import {
    encryptVaultEntry,
    decryptVaultEntry,
    type DecryptedVaultData,
} from '../services/crypto.service.js';

export interface DecryptedVaultEntry extends DecryptedVaultData {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export function useVault(encryptionKey: CryptoKey | null) {
    const [entries, setEntries] = useState<DecryptedVaultEntry[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Fetch from server and decrypt locally
    const fetchAndDecryptVault = useCallback(async () => {
        if (!encryptionKey) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const encryptedRows: VaultRecordResponse[] = await VaultApi.getAll();

            const decryptedRows = await Promise.all(
                encryptedRows.map(async (row) => {
                    try {
                        const clearData = await decryptVaultEntry(row.ciphertext, row.iv, encryptionKey);
                        return {
                            ...clearData,
                            id: row.id,
                            createdAt: row.createdAt,
                            updatedAt: row.updatedAt,
                        };
                    } catch {
                        console.error(`Failed to decrypt record ID: ${row.id}`);
                        return null;
                    }
                })
            );

            // Filter out records that failed integrity check or decryption
            setEntries(decryptedRows.filter((item): item is DecryptedVaultEntry => item !== null));
        } catch (err: any) {
            setError(err.message || 'Failed to fetch vault entries');
        } finally {
            setIsLoading(false);
        }
    }, [encryptionKey]);

    useEffect(() => {
        fetchAndDecryptVault();
    }, [fetchAndDecryptVault]);

    // 2. Encrypt locally and push new entry to server
    const addEntry = async (data: DecryptedVaultData) => {
        if (!encryptionKey) throw new Error('Encryption key not loaded in memory.');

        const encrypted = await encryptVaultEntry(data, encryptionKey);
        const createdRecord = await VaultApi.create(encrypted);

        const newDecryptedEntry: DecryptedVaultEntry = {
            ...data,
            id: createdRecord.id,
            createdAt: createdRecord.createdAt,
            updatedAt: createdRecord.updatedAt,
        };

        setEntries((prev) => [newDecryptedEntry, ...prev]);
        return newDecryptedEntry;
    };

    // 3. Encrypt locally and update existing entry on server
    const updateEntry = async (id: string, data: DecryptedVaultData) => {
        if (!encryptionKey) throw new Error('Encryption key not loaded in memory.');

        const encrypted = await encryptVaultEntry(data, encryptionKey);
        const updatedRecord = await VaultApi.update(id, encrypted);

        setEntries((prev) =>
            prev.map((entry) =>
                entry.id === id
                    ? {
                        ...data,
                        id,
                        createdAt: entry.createdAt,
                        updatedAt: updatedRecord.updatedAt,
                    }
                    : entry
            )
        );
    };

    // 4. Delete entry on server and remove from state
    const deleteEntry = async (id: string) => {
        await VaultApi.delete(id);
        setEntries((prev) => prev.filter((item) => item.id !== id));
    };

    return {
        entries,
        isLoading,
        error,
        refresh: fetchAndDecryptVault,
        addEntry,
        updateEntry,
        deleteEntry,
    };
}