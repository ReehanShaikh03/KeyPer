import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, Trash2, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import type { GeneratorOptions, GeneratorPresetDto } from '../types/generator.types';

export interface GeneratorPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: GeneratorOptions;
  presets: GeneratorPresetDto[];
  onSavePreset: (name: string, isDefault: boolean) => Promise<any>;
  onApplyPreset: (presetOptions: GeneratorOptions) => void;
  onDeletePreset: (id: string) => Promise<void>;
}

export const GeneratorPresetModal: React.FC<GeneratorPresetModalProps> = ({
  isOpen,
  onClose,
  options,
  presets,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
}) => {
  const [presetName, setPresetName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) {
      setError('Preset name is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSavePreset(presetName.trim(), isDefault);
      setPresetName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save preset');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-[#1A1D24] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 font-bold text-white text-base">
              <Bookmark className="w-5 h-5 text-indigo-400" />
              <span>Generator Presets</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#252A38] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form to Save Current Settings */}
          <form onSubmit={handleSave} className="space-y-3.5 bg-[#14171F] p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Save Current Configuration</h3>
            {error && <div className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-800/50">{error}</div>}

            <div className="space-y-2">
              <Input
                placeholder="Preset Name (e.g. Master Vault Standard)"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Set as default generator configuration</span>
              </label>

              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Preset'}
              </Button>
            </div>
          </form>

          {/* List of Existing Presets */}
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved Presets</h3>
            {presets.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No custom presets saved yet.</p>
            ) : (
              presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between bg-[#14171F] p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{preset.name}</span>
                      {preset.isDefault && (
                        <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-700/50">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {preset.options.mode.toUpperCase()} • Length {preset.options.length}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onApplyPreset(preset.options);
                        onClose();
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 h-7 px-2"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Apply
                    </Button>
                    <button
                      onClick={() => onDeletePreset(preset.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#252A38] transition-colors"
                      title="Delete Preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
