import React, { useState } from 'react';

import { usePasswordGenerator } from '../hooks/usePasswordGenerator';
import { useGeneratorPresets } from '../hooks/useGeneratorPresets';
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

  // const [activeTab, setActiveTab] = useState('Generator');
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [showHistoryPanel] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#0F1115] text-slate-100 flex flex-col font-sans overflow-hidden select-none">

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Far Left Navigation Rail matching KeyPer App layout */}

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
              presets={presets}
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
