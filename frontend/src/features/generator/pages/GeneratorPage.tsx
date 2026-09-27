import React, { useState } from 'react';

import { usePasswordGenerator } from '../hooks/usePasswordGenerator';
import { useGeneratorPresets } from '../hooks/useGeneratorPresets';
import { GeneratorCard } from '../components/GeneratorCard';
import { GeneratorPresetModal } from '../components/GeneratorPresetModal';

export const GeneratorPage: React.FC = () => {
  const {
    password,
    strength,
    options,
    updateOptions,
    generatePassword,
    copyToClipboard,
    copied,
  } = usePasswordGenerator();

  const {
    presets,
    savePreset,
    deletePreset,
  } = useGeneratorPresets();

  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  return (
    <div className="flex-1 bg-[#0F1115] text-slate-100 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 select-none w-full h-full">
      <div className="max-w-2xl mx-auto w-full pb-16 md:pb-8">
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
