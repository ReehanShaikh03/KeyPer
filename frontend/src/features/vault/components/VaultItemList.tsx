import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, AlertCircle, ChevronDown } from 'lucide-react';
import type { DecryptedVaultEntry } from '../types/vault.types';

interface VaultItemListProps {
  entries: DecryptedVaultEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onAddNew: () => void;
}

const EASE_CUSTOM = [0.16, 1, 0.3, 1] as const;

export const VaultItemList: React.FC<VaultItemListProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onAddNew,
}) => {
  return (
    <div className="w-80 bg-[#0F1115] border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Top Search & Actions */}
      <div className="p-3 border-b border-slate-800/60 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-400" />
          <input
            type="text"
            placeholder="Search sites, usernames, URLs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181B22] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
            aria-label="Search sites, usernames, URLs"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#181B22] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-slate-700 transition-colors"
              aria-label="Sort vault entries"
            >
              <option value="Recently used">Recently used</option>
              <option value="Title A-Z">Title A-Z</option>
              <option value="Date Modified">Date Modified</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onAddNew}
            className="bg-[#6366F1] hover:bg-[#5254E0] text-white px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md shadow-indigo-900/20 transition-all cursor-pointer"
            aria-label="Add new item"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </motion.button>
        </div>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 px-4"
          >
            <p className="text-xs text-slate-500">No vault items found</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {entries.map((entry, index) => {
              const isSelected = selectedEntryId === entry.id;
              const initials = entry.title.substring(0, 2).toUpperCase();
              const hasAlert = entry.decryptedData.hasAlert;

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.03, ease: EASE_CUSTOM }}
                  onClick={() => onSelectEntry(entry.id)}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  className={`relative p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-150 ${isSelected
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
                      className="w-9 h-9 rounded-lg bg-[#2A2E3B] text-slate-300 flex items-center justify-center font-semibold text-xs shrink-0 border border-slate-700/40 shadow-xs"
                    >
                      {initials}
                    </motion.div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm text-slate-100 truncate">
                          {entry.title}
                        </span>
                        {hasAlert && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          </motion.div>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                        ••••••••••••
                      </div>
                    </div>
                  </div>

                  <span className="relative z-10 text-[11px] text-slate-500 shrink-0 ml-2">
                    {entry.lastUsed || '4d ago'}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
