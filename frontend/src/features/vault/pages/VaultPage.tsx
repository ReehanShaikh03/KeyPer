import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Key,
  Sliders,
  FileText,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { useVault } from '../hooks/useVault';
// import { VaultSidebar } from '../components/VaultSidebar';
// import { VaultItemList } from '../components/VaultItemList';
// import { VaultDetail } from '../components/VaultDetail';
import { AddEditEntryModal } from '../components/AddEditEntryModal';
import { MasterPasswordModal } from '../components/MasterPasswordModal';
import { BottomMobileNav } from '../components/BottomMobileNav';
import { MobileCascadingVault } from '../components/MobileCascadingVault';
import { SecurityPage } from '@/features/security/pages/SecurityPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { GeneratorPage } from '@/features/generator/pages/GeneratorPage';
import { AuditPage } from '@/features/audit/pages/AuditPage';

interface VaultPageProps {
  onLogout?: () => void;
}

export const VaultPage: React.FC<VaultPageProps> = ({ onLogout }) => {
  const {
    isUnlocked,
    unlockVault,
    lockVault,
    entries,
    selectedEntry,
    setSelectedEntryId,
    folders,
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
  } = useVault();

  const [activeTab, setActiveTab] = useState('Vault');

  const handleAddNew = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleEdit = (entry: typeof selectedEntry) => {
    if (!entry) return;
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  return (
    <div className="h-screen w-full max-w-full bg-[#0F1115] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="h-14 bg-[#14171F] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-white tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center text-white shadow-md shadow-indigo-900/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-base">KeyPer</span>
          </div>
        </div>

      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative pb-16 md:pb-0">
        {/* Far Left Navigation Rail (Desktop) */}
        <aside className="hidden md:flex w-48 bg-[#0F1115] border-r border-slate-800/80 p-3 flex-col justify-between shrink-0">
          <nav className="space-y-1" aria-label="Main Navigation">
            {[
              { name: 'Vault', icon: Shield },
              { name: 'Generator', icon: Key },
              { name: 'Security', icon: ShieldCheck },
              { name: 'Settings', icon: Sliders },
              { name: 'Audit log', icon: FileText },
            ].map((nav) => {
              const Icon = nav.icon;
              const isActive = activeTab === nav.name;
              return (
                <button
                  key={nav.name}
                  onClick={() => setActiveTab(nav.name)}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151820]'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavSectionHighlight"
                      className="absolute inset-0 bg-[#1F232D] border border-slate-700/60 rounded-xl shadow-xs"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="relative z-10">{nav.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-800/60">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-[#151820] rounded-xl transition-colors cursor-pointer">
              <Sun className="w-4 h-4 text-slate-500" />
              <span>Light mode</span>
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <div className="flex-1 flex overflow-hidden w-full h-full">
          {activeTab === 'Security' ? (
            <SecurityPage
              onNavigateToVault={(entryId) => {
                setSelectedEntryId(entryId);
                const matching = entries.find((e) => e.id === entryId);
                if (matching) {
                  setEditingEntry(matching);
                  setIsModalOpen(true);
                }
                setActiveTab('Vault');
              }}
            />
          ) : activeTab === 'Settings' ? (
            <SettingsPage onLogout={onLogout} />
          ) : activeTab === 'Generator' ? (
            <GeneratorPage />
          ) : activeTab === 'Audit log' ? (
            <AuditPage />
          ) : (
            <MobileCascadingVault
              folders={folders}
              activeFolder={activeFolder}
              setActiveFolder={setActiveFolder}
              addFolder={addFolder}
              moveEntryToFolder={moveEntryToFolder}
              folderCounts={folderCounts}
              entries={entries}
              selectedEntry={selectedEntry}
              setSelectedEntryId={setSelectedEntryId}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onAddNew={handleAddNew}
              onEdit={handleEdit}
              onDelete={deleteEntry}
              calculateStrength={calculateStrength}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Bottom Floating Mobile Nav Rail */}
      <BottomMobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddNew={handleAddNew}
        onLockVault={lockVault}
        onLogout={onLogout}
      />

      {/* Modals */}
      <MasterPasswordModal
        isOpen={!isUnlocked}
        onUnlock={async (pw) => {
          const ok = await unlockVault(pw);
          if (ok) {
            await reloadVault();
          }
          return ok;
        }}
      />

      <AddEditEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveEntry}
        editingEntry={editingEntry}
        calculateStrength={calculateStrength}
        folders={folders}
        activeFolder={activeFolder}
      />
    </div>
  );
};
