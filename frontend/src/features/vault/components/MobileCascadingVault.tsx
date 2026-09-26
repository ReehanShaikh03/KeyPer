import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Inbox, ChevronDown, Check, ArrowLeft, Layers } from 'lucide-react';
import type { DecryptedVaultEntry, StrengthAnalysis } from '../types/vault.types';
import { VaultSidebar } from './VaultSidebar';
import { VaultItemList } from './VaultItemList';
import { VaultDetail } from './VaultDetail';

interface MobileCascadingVaultProps {
  folders: string[];
  activeFolder: string;
  setActiveFolder: (folder: string) => void;
  addFolder: (folderName: string) => void;
  moveEntryToFolder: (entryId: string, targetCategory: string) => void;
  folderCounts: Record<string, number>;
  entries: DecryptedVaultEntry[];
  selectedEntry: DecryptedVaultEntry | null;
  setSelectedEntryId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onAddNew: () => void;
  onEdit: (entry: DecryptedVaultEntry) => void;
  onDelete: (id: string) => void;
  calculateStrength: (password?: string) => StrengthAnalysis;
  isLoading: boolean;
}

type MobileStep = 'folders' | 'items' | 'detail';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export const MobileCascadingVault: React.FC<MobileCascadingVaultProps> = ({
  folders,
  activeFolder,
  setActiveFolder,
  addFolder,
  moveEntryToFolder,
  folderCounts,
  entries,
  selectedEntry,
  setSelectedEntryId,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onAddNew,
  onEdit,
  onDelete,
  calculateStrength,
  isLoading,
}) => {
  const [step, setStep] = useState<MobileStep>('items');
  const [direction, setDirection] = useState<number>(1);
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);

  // Navigate forward to a folder's item list
  const handleSelectFolder = (folderName: string) => {
    setActiveFolder(folderName);
    setIsFolderDropdownOpen(false);
    if (step !== 'items') {
      setDirection(1);
      setStep('items');
    }
  };

  // Navigate forward to password detail
  const handleSelectItem = (id: string) => {
    setSelectedEntryId(id);
    setDirection(1);
    setStep('detail');
  };

  // Navigate backward in 3-step hierarchy (detail -> items -> folders)
  const handleGoBack = () => {
    setDirection(-1);
    if (step === 'detail') {
      setStep('items');
    } else if (step === 'items') {
      setStep('folders');
    }
  };

  const activeFolderCount = folderCounts[activeFolder] ?? entries.length;

  return (
    <div className="flex-1 flex w-full h-full overflow-hidden relative">
      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (md:flex) - Normal 3 column side-by-side view             */}
      {/* ========================================================================= */}
      <div className="hidden md:flex flex-1 w-full h-full overflow-hidden">
        <VaultSidebar
          folders={folders}
          activeFolder={activeFolder}
          setActiveFolder={setActiveFolder}
          onAddFolder={addFolder}
          onMoveEntryToFolder={moveEntryToFolder}
          folderCounts={folderCounts}
        />
        <VaultItemList
          entries={entries}
          selectedEntryId={selectedEntry?.id || null}
          onSelectEntry={(id) => setSelectedEntryId(id)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onAddNew={onAddNew}
          isLoading={isLoading}
        />
        <VaultDetail
          entry={selectedEntry}
          onEdit={onEdit}
          onDelete={onDelete}
          calculateStrength={calculateStrength}
        />
      </div>

      {/* ========================================================================= */}
      {/* MOBILE REDESIGNED LAYOUT (md:hidden) - 3-Step Directional Slide Flow       */}
      {/* ========================================================================= */}
      <div className="flex md:hidden flex-1 w-full h-full flex-col overflow-hidden bg-[#0A0C13] relative">
        {/* --- TOP MOBILE HEADER BAR --- */}
        <div className="bg-[#12141F] border-b border-slate-800/90 px-3 py-2 flex items-center justify-between z-30 shrink-0">
          {/* Left Back Button (when on items or detail step) */}
          {step !== 'folders' ? (
            <button
              onClick={handleGoBack}
              className="bg-[#181B28] hover:bg-[#1E2234] border border-slate-700/60 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
              <span>{step === 'detail' ? 'Passwords' : 'Folders'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-wide">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Vault Folders</span>
            </div>
          )}

          {/* Right Compact Folder Selector Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsFolderDropdownOpen((prev) => !prev)}
              className="bg-[#181B28] hover:bg-[#1E2234] border border-slate-700/60 text-white rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer shadow-sm max-w-[190px]"
            >
              <div className="flex items-center gap-1.5 truncate">
                {activeFolder === 'All items' ? (
                  <Inbox className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                )}
                <span className="truncate">{activeFolder}</span>
                <span className="text-[10px] bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 px-1.5 py-0.2 rounded font-mono shrink-0">
                  {activeFolderCount}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                  isFolderDropdownOpen ? 'rotate-180 text-indigo-400' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* --- FIXED OVERLAY DROPDOWN MENU (Z-INDEX 100 TO ELIMINATE ALL OVERLAPS) --- */}
        <AnimatePresence>
          {isFolderDropdownOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFolderDropdownOpen(false)}
                className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs"
              />

              {/* Fixed Dropdown Menu Box */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="fixed left-3 right-3 top-14 z-[100] bg-[#161926] border border-slate-700/90 rounded-2xl shadow-2xl p-2.5 max-h-80 overflow-y-auto custom-scrollbar"
              >
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5 mb-1">
                  Select Folder
                </div>
                <div className="space-y-1">
                  {folders.map((fName) => {
                    const isActive = activeFolder === fName;
                    const count = folderCounts[fName] ?? 0;
                    const Icon = fName === 'All items' ? Inbox : Folder;

                    return (
                      <button
                        key={fName}
                        onClick={() => handleSelectFolder(fName)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600/30 text-white border border-indigo-500/60 shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-[#212536]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={`w-4 h-4 ${
                              isActive ? 'text-indigo-400' : 'text-slate-500'
                            }`}
                          />
                          <span className="truncate">{fName}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-400 font-mono bg-[#11131C] px-2 py-0.5 rounded-full">
                            {count}
                          </span>
                          {isActive && <Check className="w-4 h-4 text-indigo-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- MAIN SLIDING CONTENT AREA --- */}
        <div className="flex-1 w-full h-full overflow-hidden relative">
          <AnimatePresence custom={direction} mode="wait">
            {step === 'folders' && (
              <motion.div
                key="stepFolders"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full absolute inset-0"
              >
                <VaultSidebar
                  folders={folders}
                  activeFolder={activeFolder}
                  setActiveFolder={handleSelectFolder}
                  onAddFolder={addFolder}
                  onMoveEntryToFolder={moveEntryToFolder}
                  folderCounts={folderCounts}
                />
              </motion.div>
            )}

            {step === 'items' && (
              <motion.div
                key="stepItems"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full absolute inset-0"
              >
                <VaultItemList
                  entries={entries}
                  selectedEntryId={selectedEntry?.id || null}
                  onSelectEntry={handleSelectItem}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  onAddNew={onAddNew}
                  isLoading={isLoading}
                />
              </motion.div>
            )}

            {step === 'detail' && (
              <motion.div
                key="stepDetail"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full absolute inset-0"
              >
                <VaultDetail
                  entry={selectedEntry}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  calculateStrength={calculateStrength}
                  onBack={handleGoBack}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
