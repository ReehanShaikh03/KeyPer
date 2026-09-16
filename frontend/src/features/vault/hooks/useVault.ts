import { useState, useEffect, useCallback, useMemo } from 'react';
import { vaultApi } from '../services/vaultApi';
import { useVaultCrypto } from './useVaultCrypto';
import type { DecryptedVaultEntry, VaultItemData, CreateVaultEntryDto } from '../types/vault.types';

export function useVault() {
  const { isUnlocked, unlockVault, lockVault, encryptData, decryptData, calculateStrength } =
    useVaultCrypto();

  const [entries, setEntries] = useState<DecryptedVaultEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>('All items');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Recently used');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<DecryptedVaultEntry | null>(null);

  useEffect(() => {
    let isMounted = true;

    vaultApi.getAll().then(async (rawEntries) => {
      if (!isMounted) return;
      const decryptedList: DecryptedVaultEntry[] = await Promise.all(
        rawEntries.map(async (raw) => {
          let decryptedData: VaultItemData = {};
          try {
            decryptedData = await decryptData(raw.iv, raw.ciphertext);
          } catch {
            decryptedData = { username: 'Decryption Error' };
          }

          return {
            id: raw.id,
            userId: raw.userId,
            title: raw.title || 'Untitled',
            category: raw.category || 'General',
            iv: raw.iv,
            ciphertext: raw.ciphertext,
            decryptedData,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            lastUsed: '4d ago',
            isUnlocked,
          };
        })
      );

      if (isMounted) {
        setEntries(decryptedList);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [decryptData, isUnlocked]);

  // Compute folder counts
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'All items': entries.length,
      Work: 0,
      Personal: 0,
      Finance: 0,
      Social: 0,
    };
    entries.forEach((entry) => {
      if (counts[entry.category] !== undefined) {
        counts[entry.category] += 1;
      } else {
        counts[entry.category] = 1;
      }
    });
    return counts;
  }, [entries]);

  // Filtered entries list based on folder and search query
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesFolder =
        activeFolder === 'All items' ||
        entry.category.toLowerCase() === activeFolder.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        entry.title.toLowerCase().includes(q) ||
        (entry.decryptedData.username && entry.decryptedData.username.toLowerCase().includes(q)) ||
        (entry.decryptedData.url && entry.decryptedData.url.toLowerCase().includes(q));

      return matchesFolder && matchesSearch;
    });
  }, [entries, activeFolder, searchQuery]);

  const selectedEntry = useMemo(() => {
    return entries.find((e) => e.id === selectedEntryId) || filteredEntries[0] || null;
  }, [entries, selectedEntryId, filteredEntries]);

  const reloadVault = useCallback(async () => {
    setIsLoading(true);
    try {
      const rawEntries = await vaultApi.getAll();
      const decryptedList: DecryptedVaultEntry[] = await Promise.all(
        rawEntries.map(async (raw) => {
          let decryptedData: VaultItemData = {};
          try {
            decryptedData = await decryptData(raw.iv, raw.ciphertext);
          } catch {
            decryptedData = { username: 'Decryption Error' };
          }

          return {
            id: raw.id,
            userId: raw.userId,
            title: raw.title || 'Untitled',
            category: raw.category || 'General',
            iv: raw.iv,
            ciphertext: raw.ciphertext,
            decryptedData,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            lastUsed: '4d ago',
            isUnlocked,
          };
        })
      );
      setEntries(decryptedList);
    } finally {
      setIsLoading(false);
    }
  }, [decryptData, isUnlocked]);

  // Save/Create Entry
  const saveEntry = async (title: string, category: string, data: VaultItemData) => {
    const { iv, ciphertext } = await encryptData(data);

    if (editingEntry) {
      await vaultApi.update(editingEntry.id, { title, category, iv, ciphertext });
    } else {
      const dto: CreateVaultEntryDto = { title, category, iv, ciphertext };
      await vaultApi.create(dto);
    }

    await reloadVault();
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  // Delete Entry
  const deleteEntry = async (id: string) => {
    await vaultApi.delete(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (selectedEntryId === id) {
      setSelectedEntryId(null);
    }
  };

  return {
    isUnlocked,
    unlockVault,
    lockVault,
    entries: filteredEntries,
    allEntries: entries,
    selectedEntry,
    setSelectedEntryId,
    activeFolder,
    setActiveFolder,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    folderCounts,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingEntry,
    setEditingEntry,
    saveEntry,
    deleteEntry,
    calculateStrength,
  };
}
