import { useState, useEffect, useCallback, useMemo } from 'react';
import { vaultApi } from '../services/vaultApi';
import { useVaultCrypto } from './useVaultCrypto';
import type { DecryptedVaultEntry, VaultItemData, CreateVaultEntryDto } from '../types/vault.types';

export function useVault() {
  const { isUnlocked, unlockVault, lockVault, encryptData, decryptData, calculateStrength } =
    useVaultCrypto();

  const [customFolders, setCustomFolders] = useState<string[]>(['All items']);
  const [entries, setEntries] = useState<DecryptedVaultEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>('All items');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Recently used');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<DecryptedVaultEntry | null>(null);

  const addFolder = useCallback(async (folderName: string) => {
    const trimmed = folderName.trim();
    if (!trimmed) return;
    setCustomFolders((prev) => {
      if (prev.some((f) => f.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [...prev, trimmed];
    });
    try {
      await vaultApi.createFolder(trimmed);
    } catch (err) {
      console.warn('Failed to persist folder to DB:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    vaultApi.getFolders().then((fetchedFolders) => {
      if (isMounted && fetchedFolders && fetchedFolders.length > 0) {
        setCustomFolders(fetchedFolders);
      }
    });

    vaultApi.getAll().then(async (rawEntries) => {
      if (!isMounted) return;
      const decryptedList: DecryptedVaultEntry[] = await Promise.all(
        rawEntries.map(async (raw) => {
          let decryptedData: VaultItemData = {};
          try {
            decryptedData = await decryptData(raw.iv, raw.ciphertext);
          } catch {
            decryptedData = { username: 'Vault Entry' };
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
    const counts: Record<string, number> = {};
    customFolders.forEach((f) => {
      counts[f] = 0;
    });
    counts['All items'] = entries.length;
    entries.forEach((entry) => {
      if (counts[entry.category] !== undefined) {
        counts[entry.category] += 1;
      } else {
        counts[entry.category] = 1;
      }
    });
    return counts;
  }, [customFolders, entries]);

  // Filtered entries list based on folder and search query and sorted by sortBy selection
  const filteredEntries = useMemo(() => {
    const list = entries.filter((entry) => {
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

    return [...list].sort((a, b) => {
      if (sortBy === 'Title A-Z') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'Date Modified') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else {
        // 'Recently used' (default)
        const timeA = new Date(a.updatedAt || a.createdAt).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt).getTime();
        return timeB - timeA;
      }
    });
  }, [entries, activeFolder, searchQuery, sortBy]);

  const selectedEntry = useMemo(() => {
    if (!filteredEntries.length) return null;
    const found = filteredEntries.find((e) => e.id === selectedEntryId);
    return found || filteredEntries[0];
  }, [selectedEntryId, filteredEntries]);

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
            decryptedData = { username: 'Vault Entry' };
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

    if (category && category !== 'All items') {
      addFolder(category);
    }

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

  // Move Entry to a different folder (Drag & Drop or Quick Move)
  const moveEntryToFolder = useCallback(async (entryId: string, targetCategory: string) => {
    if (!entryId || !targetCategory) return;

    if (targetCategory !== 'All items') {
      addFolder(targetCategory);
    }

    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? { ...e, category: targetCategory, updatedAt: new Date().toISOString() }
          : e
      )
    );
    try {
      await vaultApi.update(entryId, { category: targetCategory });
    } catch (err) {
      console.warn('Failed to update entry category in API:', err);
    }
  }, [addFolder]);

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
    folders: customFolders,
    addFolder,
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
    moveEntryToFolder,
    deleteEntry,
    calculateStrength,
    reloadVault,
  };
}

