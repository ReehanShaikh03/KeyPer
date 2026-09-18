import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Key,
  Sliders,
  FileText,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { usePasswordGenerator } from '../hooks/usePasswordGenerator';
import { useGeneratorPresets } from '../hooks/useGeneratorPresets';
import { GeneratorHeader } from '../components/GeneratorHeader';
import { GeneratorCard } from '../components/GeneratorCard';
import { GeneratorPresetModal } from '../components/GeneratorPresetModal';
import { GeneratorHistoryPanel } from '../components/GeneratorHistoryPanel';

export const GeneratorPage: React.FC = () => {
  const {
    password,
    strength,
    options,
    updateOptions,
    generatePassword,
    copyToClipboard,
    copied,
    history,
    clearHistory,
  } = usePasswordGenerator();

  const {
    presets,
    savePreset,
    deletePreset,
  } = useGeneratorPresets();

  const [activeTab, setActiveTab] = useState('Generator');
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#0F1115] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Navbar Header */}
      <GeneratorHeader
        onOpenPresets={() => setIsPresetModalOpen(true)}
        onToggleHistory={() => setShowHistoryPanel(!showHistoryPanel)}
        showHistory={showHistoryPanel}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Far Left Navigation Rail matching KeyPer App layout */}
        <aside className="w-52 bg-[#0F1115] border-r border-slate-800/80 p-3 flex flex-col justify-between shrink-0">
          <nav className="space-y-1.5" aria-label="Main Navigation">
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
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
            <button className="w-full flex items-center gap-3 px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-[#151820] rounded-xl transition-colors cursor-pointer">
              <Sun className="w-4 h-4 text-slate-500" />
              <span>Light mode</span>
            </button>
          </div>
        </aside>

        {/* Central Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className="flex-1 max-w-2xl w-full">
            <GeneratorCard
              password={password}
              strength={strength}
              options={options}
              onChangeOptions={updateOptions}
              onGenerate={generatePassword}
              onCopy={() => copyToClipboard()}
              copied={copied}
              onOpenSavePreset={() => setIsPresetModalOpen(true)}
            />
          </div>

          {/* Optional Transient Session History Side Panel */}
          {showHistoryPanel && (
            <div className="w-full lg:w-80 shrink-0">
              <GeneratorHistoryPanel
                history={history}
                onCopy={(text) => copyToClipboard(text)}
                onClearHistory={clearHistory}
              />
            </div>
          )}
        </main>
      </div>

      {/* Preset Management Dialog Modal */}
      <GeneratorPresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        options={options}
        presets={presets}
        onSavePreset={(name, isDefault) => savePreset(name, options, isDefault)}
        onApplyPreset={(presetOptions) => updateOptions(presetOptions)}
        onDeletePreset={(id) => deletePreset(id)}
      />
    </div>
  );
};
