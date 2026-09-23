import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Inbox, Plus, Check, X } from 'lucide-react';

interface VaultSidebarProps {
  folders: string[];
  activeFolder: string;
  setActiveFolder: (folder: string) => void;
  onAddFolder: (folderName: string) => void;
  onMoveEntryToFolder?: (entryId: string, targetCategory: string) => void;
  folderCounts: Record<string, number>;
}

const EASE_CUSTOM = [0.16, 1, 0.3, 1] as const;

export const VaultSidebar: React.FC<VaultSidebarProps> = ({
  folders,
  activeFolder,
  setActiveFolder,
  onAddFolder,
  onMoveEntryToFolder,
  folderCounts,
}) => {
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [draggedOverFolder, setDraggedOverFolder] = useState<string | null>(null);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setActiveFolder(newFolderName.trim());
      setNewFolderName('');
      setIsAddingFolder(false);
    }
  };

  return (
    <aside className="w-64 bg-[#14171F] border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 select-none">
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 tracking-wider uppercase mb-3 px-3">
          <span>Folders</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAddingFolder((prev) => !prev)}
            className="text-slate-400 hover:text-indigo-400 p-1 rounded-md hover:bg-[#1A1D27] transition-colors cursor-pointer"
            title="Add new folder"
            aria-label="Add new folder"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        <AnimatePresence>
          {isAddingFolder && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateFolder}
              className="px-2 mb-3 flex items-center gap-1"
            >
              <input
                type="text"
                autoFocus
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-[#1A1D27] border border-indigo-500/60 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="text-emerald-400 hover:text-emerald-300 p-1 cursor-pointer"
                title="Save Folder"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingFolder(false);
                  setNewFolderName('');
                }}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <nav className="space-y-1 relative" aria-label="Vault Folders Navigation">
          {folders.map((folderName, index) => {
            const Icon = folderName === 'All items' ? Inbox : Folder;
            const count = folderCounts[folderName] ?? 0;
            const isActive = activeFolder === folderName;
            const isDraggedOver = draggedOverFolder === folderName;

            return (
              <motion.button
                key={folderName}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04, ease: EASE_CUSTOM }}
                onClick={() => setActiveFolder(folderName)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (draggedOverFolder !== folderName) {
                    setDraggedOverFolder(folderName);
                  }
                }}
                onDragLeave={() => {
                  setDraggedOverFolder((prev) => (prev === folderName ? null : prev));
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDraggedOverFolder(null);
                  const entryId = e.dataTransfer.getData('text/plain');
                  if (entryId && onMoveEntryToFolder) {
                    // Moving to 'All items' doesn't alter folder if specified, but if custom folder, moves to it.
                    onMoveEntryToFolder(entryId, folderName === 'All items' ? 'General' : folderName);
                  }
                }}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isDraggedOver
                    ? 'bg-indigo-600/30 border-2 border-indigo-500 text-white scale-[1.02] shadow-lg shadow-indigo-900/40'
                    : isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A1D27]/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && !isDraggedOver && (
                  <motion.div
                    layoutId="activeFolderBackground"
                    className="absolute inset-0 bg-[#252834] rounded-xl border border-slate-700/50 shadow-sm"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors duration-200 ${
                      isDraggedOver
                        ? 'text-indigo-300 animate-pulse'
                        : isActive
                        ? 'text-indigo-400'
                        : 'text-slate-500'
                    }`}
                  />
                  <span>{folderName}</span>
                </div>
                <span
                  className={`relative z-10 text-xs px-2 py-0.5 rounded-full transition-colors ${
                    isDraggedOver
                      ? 'bg-indigo-500 text-white font-bold'
                      : isActive
                      ? 'bg-[#313547] text-slate-200 font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs text-slate-500 px-3 py-1">
          <span>Zero-Knowledge Engine</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>
    </aside>
  );
};
