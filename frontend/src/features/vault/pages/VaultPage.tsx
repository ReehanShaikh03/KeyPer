import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  Key,
  Sliders,
  FileText,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { useVault } from '../hooks/useVault';
import { VaultSidebar } from '../components/VaultSidebar';
import { VaultItemList } from '../components/VaultItemList';
import { VaultDetail } from '../components/VaultDetail';
import { AddEditEntryModal } from '../components/AddEditEntryModal';
import { MasterPasswordModal } from '../components/MasterPasswordModal';

export const VaultPage: React.FC = () => {
  const {
    isUnlocked,
    unlockVault,
    lockVault,
    entries,
    selectedEntry,
    setSelectedEntryId,
    activeFolder,
    setActiveFolder,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    folderCounts,
    isModalOpen,
    setIsModalOpen,
    editingEntry,
    setEditingEntry,
    saveEntry,
    deleteEntry,
    calculateStrength,
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
    <div className="h-screen w-screen bg-[#0F1115] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="h-14 bg-[#14171F] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-white tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center text-white shadow-md shadow-indigo-900/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-base">KeyPer</span>
          </div>
          <span className="text-slate-600 text-xs font-mono">/</span>
          <span className="text-xs text-slate-400 font-medium">Vault</span>
        </div>

        <div className="flex items-center gap-3">
          {isUnlocked ? (
            <button
              onClick={lockVault}
              className="bg-emerald-950/40 border border-emerald-600/40 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-emerald-900/40 transition-colors cursor-pointer"
              title="Click to lock vault"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlocked</span>
            </button>
          ) : (
            <button
              onClick={() => unlockVault('default_master_password')}
              className="bg-rose-950/40 border border-rose-600/40 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-rose-900/40 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Locked</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Far Left Navigation Rail */}
        <aside className="w-48 bg-[#0F1115] border-r border-slate-800/80 p-3 flex flex-col justify-between shrink-0">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${isActive
                      ? 'bg-[#1F232D] text-white shadow-xs border border-slate-700/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#151820]'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{nav.name}</span>
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

        {/* Folders Column */}
        <VaultSidebar
          activeFolder={activeFolder}
          setActiveFolder={setActiveFolder}
          folderCounts={folderCounts}
        />

        {/* Middle Item List Column */}
        <VaultItemList
          entries={entries}
          selectedEntryId={selectedEntry?.id || null}
          onSelectEntry={(id) => setSelectedEntryId(id)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onAddNew={handleAddNew}
        />

        {/* Right Detail Pane */}
        <VaultDetail
          entry={selectedEntry}
          onEdit={(entry) => handleEdit(entry)}
          onDelete={deleteEntry}
          calculateStrength={calculateStrength}
        />
      </div>

      {/* Modals */}
      <MasterPasswordModal
        isOpen={!isUnlocked}
        onUnlock={async (pw) => unlockVault(pw)}
      />

      <AddEditEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveEntry}
        editingEntry={editingEntry}
        calculateStrength={calculateStrength}
      />
    </div>
  );
};
