import React from 'react';
import { motion } from 'framer-motion';
import { Folder, Inbox, Briefcase, User, Landmark, Share2 } from 'lucide-react';

interface VaultSidebarProps {
  activeFolder: string;
  setActiveFolder: (folder: string) => void;
  folderCounts: Record<string, number>;
}

const FOLDERS = [
  { name: 'All items', icon: Inbox },
  { name: 'Work', icon: Briefcase },
  { name: 'Personal', icon: User },
  { name: 'Finance', icon: Landmark },
  { name: 'Social', icon: Share2 },
];

const EASE_CUSTOM = [0.16, 1, 0.3, 1] as const;

export const VaultSidebar: React.FC<VaultSidebarProps> = ({
  activeFolder,
  setActiveFolder,
  folderCounts,
}) => {
  return (
    <aside className="w-64 bg-[#14171F] border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 select-none">
      <div>
        <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-3 px-3">
          Folders
        </div>

        <nav className="space-y-1 relative" aria-label="Vault Folders Navigation">
          {FOLDERS.map((folder, index) => {
            const Icon = folder.icon || Folder;
            const count = folderCounts[folder.name] ?? 0;
            const isActive = activeFolder === folder.name;

            return (
              <motion.button
                key={folder.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04, ease: EASE_CUSTOM }}
                onClick={() => setActiveFolder(folder.name)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A1D27]/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFolderBackground"
                    className="absolute inset-0 bg-[#252834] rounded-xl border border-slate-700/50 shadow-sm"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors duration-200 ${
                      isActive ? 'text-indigo-400' : 'text-slate-500'
                    }`}
                  />
                  <span>{folder.name}</span>
                </div>
                <span
                  className={`relative z-10 text-xs px-2 py-0.5 rounded-full transition-colors ${
                    isActive ? 'bg-[#313547] text-slate-200 font-semibold' : 'text-slate-500'
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
