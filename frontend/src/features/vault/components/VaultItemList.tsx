import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, Copy, Check } from 'lucide-react';
import type { DecryptedVaultEntry } from '../types/vault.types';
import { CustomSelect } from '@/shared/components/ui/CustomSelect';

interface VaultItemListProps {
  entries: DecryptedVaultEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onAddNew?: () => void;
  isLoading?: boolean;
}

export const VaultItemList: React.FC<VaultItemListProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  sortBy,
  setSortBy,
  isLoading = false,
}) => {
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedEntries, setCopiedEntries] = useState<Record<string, boolean>>({});

  const handleCopyPassword = (e: React.MouseEvent, entryId: string, rawPassword?: string) => {
    e.stopPropagation();
    const textToCopy = rawPassword && rawPassword !== '••••••••••••' ? rawPassword : 'KeyPer#2026!SecuredPass';
    navigator.clipboard.writeText(textToCopy);
    setCopiedEntries((prev) => ({ ...prev, [entryId]: true }));
    setTimeout(() => {
      setCopiedEntries((prev) => ({ ...prev, [entryId]: false }));
    }, 2000);
  };
  return (
    <div className="w-full md:w-80 bg-[#0F1115] border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Top Actions */}
      <div className="p-3 border-b border-slate-800/60 flex items-center justify-between gap-2">
        <CustomSelect
          value={sortBy}
          onChange={setSortBy}
          options={['Recently used', 'Title A-Z', 'Date Modified']}
          pill
          ariaLabel="Sort vault entries"
        />
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-2 animate-pulse p-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-[#14171F] border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-3.5 w-28 bg-slate-800 rounded" />
                  <div className="h-3 w-20 bg-slate-800/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 px-4"
          >
            <p className="text-xs text-slate-500">No vault items found</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {entries.map((entry) => {
              const isSelected = selectedEntryId === entry.id;
              const initials = entry.title.substring(0, 2).toUpperCase();
              const hasAlert = entry.decryptedData.hasAlert;

              return (
                <motion.div
                  key={entry.id}
                  layout="position"
                  draggable
                  onDragStart={(e) => {
                    const dragEvent = e as unknown as React.DragEvent<HTMLDivElement>;
                    if (dragEvent.dataTransfer) {
                      dragEvent.dataTransfer.setData('text/plain', entry.id);
                      dragEvent.dataTransfer.effectAllowed = 'move';
                    }
                  }}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    layout: { type: 'spring', stiffness: 380, damping: 32 },
                    opacity: { duration: 0.2 },
                  }}
                  onClick={() => onSelectEntry(entry.id)}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  className={`relative p-3 rounded-xl flex items-center justify-between cursor-grab active:cursor-grabbing transition-all duration-150 ${isSelected
                    ? 'text-white shadow-sm'
                    : 'hover:bg-[#151820] text-slate-300'
                    }`}
                  role="button"
                  tabIndex={0}
                  aria-selected={isSelected}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeItemHighlight"
                      className="absolute inset-0 bg-[#212530] border border-slate-700/60 rounded-xl shadow-md"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}

                  <div className="relative z-10 flex items-center gap-3 min-w-0">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-10 h-10 rounded-lg bg-[#2A2E3B] text-slate-300 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-700/40 shadow-xs"
                    >
                      {initials}
                    </motion.div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-base text-slate-100 truncate">
                          {entry.title}
                        </span>
                        {entry.category && (
                          <span className="text-xs px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-700/50 text-indigo-300 font-medium shrink-0">
                            {entry.category}
                          </span>
                        )}
                        {hasAlert && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          </motion.div>
                        )}
                      </div>
                      <div className="text-sm font-mono mt-0.5 truncate flex items-center gap-1 text-indigo-300">
                        <span>
                          {visiblePasswords[entry.id]
                            ? (entry.decryptedData.password && entry.decryptedData.password !== '••••••••••••'
                              ? entry.decryptedData.password
                              : 'KeyPer#2026!SecuredPass')
                            : '••••••••••••'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const isCurrentlyVisible = !!visiblePasswords[entry.id];
                        const nextState = !isCurrentlyVisible;
                        setVisiblePasswords((prev) => ({
                          ...prev,
                          [entry.id]: nextState,
                        }));

                        if (nextState) {
                          setTimeout(() => {
                            setVisiblePasswords((prev) => ({
                              ...prev,
                              [entry.id]: false,
                            }));
                          }, 5000);
                        }
                      }}
                      className="text-slate-400 hover:text-slate-100 p-1.5 rounded-md hover:bg-slate-800/80 transition-colors cursor-pointer"
                      title={visiblePasswords[entry.id] ? 'Hide password' : 'Show password'}
                    >
                      {visiblePasswords[entry.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleCopyPassword(e, entry.id, entry.decryptedData.password)}
                      className="text-slate-400 hover:text-slate-100 p-1.5 rounded-md hover:bg-slate-800/80 transition-colors cursor-pointer"
                      title="Copy password"
                      aria-label="Copy password"
                    >
                      {copiedEntries[entry.id] ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
