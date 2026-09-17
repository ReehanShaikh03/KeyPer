import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Zap,
  Lock,
  Key,
  Hash,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Slider } from '@/shared/components/ui/slider';
import { Switch } from '@/shared/components/ui/switch';
import { Button } from '@/shared/components/ui/button';
import type { GeneratorOptions, PasswordStrengthResult, GeneratorMode } from '../types/generator.types';

export interface GeneratorCardProps {
  password: string;
  strength: PasswordStrengthResult;
  options: GeneratorOptions;
  onChangeOptions: (opts: Partial<GeneratorOptions>) => void;
  onGenerate: () => void;
  onCopy: () => void;
  copied: boolean;
  onOpenSavePreset?: () => void;
}

const customEasing = [0.16, 1, 0.3, 1] as const;

export const GeneratorCard: React.FC<GeneratorCardProps> = ({
  password,
  strength,
  options,
  onChangeOptions,
  onGenerate,
  onCopy,
  copied,
  onOpenSavePreset,
}) => {
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const handleRegenerate = () => {
    setIsRotating(true);
    onGenerate();
    setTimeout(() => setIsRotating(false), 350);
  };

  const getStrengthPercentage = () => {
    return Math.min(100, Math.max(10, (strength.score / 4) * 100));
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Title & Subtitle */}
      <div className="text-center md:text-left space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Password generator</span>
        </h1>
        <p className="text-xs text-slate-400 font-normal">
          Generated locally with your browser's cryptographic random source.
        </p>
      </div>

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: customEasing }}
        className="bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-6 md:p-7 shadow-2xl shadow-black/40 space-y-6"
      >
        {/* Mode Selector Tabs (Password / Passphrase / PIN) */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-1.5 bg-[#14171F] p-1 rounded-xl border border-slate-800/60 w-full sm:w-auto">
            {(
              [
                { mode: 'password', label: 'Password', icon: Key },
                { mode: 'passphrase', label: 'Passphrase', icon: Lock },
                { mode: 'pin', label: 'PIN', icon: Hash },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const isActive = options.mode === item.mode;
              return (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => onChangeOptions({ mode: item.mode as GeneratorMode })}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1C202B]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {onOpenSavePreset && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSavePreset}
              className="hidden sm:inline-flex text-xs h-8 px-3"
            >
              Save Preset
            </Button>
          )}
        </div>

        {/* Output Box Panel */}
        <div className="relative bg-[#14171F] border border-slate-800/90 rounded-2xl p-5 space-y-4 shadow-inner">
          <div className="flex items-center justify-between gap-3">
            {/* Password String Display */}
            <div className="flex-1 overflow-x-auto scrollbar-none py-1">
              <motion.div
                key={password}
                initial={{ scale: 0.98, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15, ease: customEasing }}
                className="font-mono text-lg sm:text-xl font-semibold tracking-wider text-slate-100 break-all select-all leading-snug"
              >
                {password || 'Generat1ng...'}
              </motion.div>
            </div>

            {/* Actions: Copy & Regenerate */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onCopy}
                aria-label="Copy password to clipboard"
                title="Copy password"
                className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  copied
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 shadow-sm shadow-emerald-950/50'
                    : 'bg-[#1C202B] border-slate-700/60 text-slate-300 hover:text-white hover:bg-[#252A38]'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleRegenerate}
                aria-label="Regenerate password"
                title="Regenerate password"
                className="p-2.5 rounded-xl bg-[#1C202B] border border-slate-700/60 text-slate-300 hover:text-white hover:bg-[#252A38] transition-all duration-200 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 transition-transform duration-300 ${isRotating ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Strength Indicator Bar */}
          <div className="space-y-2 pt-1">
            <div className="w-full h-2 bg-[#0F1115] rounded-full overflow-hidden border border-slate-800/80">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getStrengthPercentage()}%` }}
                transition={{ duration: 0.3, ease: customEasing }}
                className="h-full rounded-full transition-colors duration-300"
                style={{ backgroundColor: strength.color }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-400">Strength</span>
              <span className="font-semibold transition-colors duration-200" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          </div>
        </div>

        {/* Options Controls Section */}
        <div className="space-y-5 pt-2">
          {options.mode === 'password' && (
            <>
              {/* Length Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="length-slider" className="text-xs font-semibold text-slate-300">
                    Length
                  </label>
                  <span className="font-mono text-sm font-bold text-slate-200 bg-[#14171F] px-2.5 py-0.5 rounded-lg border border-slate-800">
                    {options.length}
                  </span>
                </div>
                <Slider
                  id="length-slider"
                  value={options.length}
                  min={8}
                  max={64}
                  step={1}
                  onChange={(val) => onChangeOptions({ length: val })}
                  ariaLabel="Password length"
                />
              </div>

              {/* Character Set Switches */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-medium text-slate-300">Uppercase (A-Z)</span>
                  <Switch
                    ariaLabel="Toggle Uppercase characters"
                    checked={options.uppercase}
                    onCheckedChange={(val) => onChangeOptions({ uppercase: val })}
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-medium text-slate-300">Lowercase (a-z)</span>
                  <Switch
                    ariaLabel="Toggle Lowercase characters"
                    checked={options.lowercase}
                    onCheckedChange={(val) => onChangeOptions({ lowercase: val })}
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-medium text-slate-300">Numbers (0-9)</span>
                  <Switch
                    ariaLabel="Toggle Numbers"
                    checked={options.numbers}
                    onCheckedChange={(val) => onChangeOptions({ numbers: val })}
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-medium text-slate-300">Symbols (!@#)</span>
                  <Switch
                    ariaLabel="Toggle Symbols"
                    checked={options.symbols}
                    onCheckedChange={(val) => onChangeOptions({ symbols: val })}
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-medium text-slate-300">Exclude ambiguous (0/O, 1/l/I)</span>
                  <Switch
                    ariaLabel="Toggle Exclude Ambiguous characters"
                    checked={options.excludeAmbiguous}
                    onCheckedChange={(val) => onChangeOptions({ excludeAmbiguous: val })}
                  />
                </div>
              </div>
            </>
          )}

          {options.mode === 'passphrase' && (
            <div className="space-y-5">
              {/* Word Count Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="wordcount-slider" className="text-xs font-semibold text-slate-300">
                    Word Count
                  </label>
                  <span className="font-mono text-sm font-bold text-slate-200 bg-[#14171F] px-2.5 py-0.5 rounded-lg border border-slate-800">
                    {options.wordCount || 4} words
                  </span>
                </div>
                <Slider
                  id="wordcount-slider"
                  value={options.wordCount || 4}
                  min={3}
                  max={10}
                  step={1}
                  onChange={(val) => onChangeOptions({ wordCount: val })}
                  ariaLabel="Passphrase word count"
                />
              </div>

              {/* Passphrase Switches */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-medium text-slate-300">Capitalize words</span>
                  <Switch
                    ariaLabel="Capitalize words in passphrase"
                    checked={options.capitalizeWords ?? true}
                    onCheckedChange={(val) => onChangeOptions({ capitalizeWords: val })}
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-medium text-slate-300">Include random number</span>
                  <Switch
                    ariaLabel="Include number in passphrase"
                    checked={options.includeNumberInPassphrase ?? true}
                    onCheckedChange={(val) => onChangeOptions({ includeNumberInPassphrase: val })}
                  />
                </div>
              </div>
            </div>
          )}

          {options.mode === 'pin' && (
            <div className="space-y-5">
              {/* PIN Length Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="pin-slider" className="text-xs font-semibold text-slate-300">
                    PIN Digits
                  </label>
                  <span className="font-mono text-sm font-bold text-slate-200 bg-[#14171F] px-2.5 py-0.5 rounded-lg border border-slate-800">
                    {options.length} digits
                  </span>
                </div>
                <Slider
                  id="pin-slider"
                  value={options.length}
                  min={4}
                  max={12}
                  step={1}
                  onChange={(val) => onChangeOptions({ length: val })}
                  ariaLabel="PIN digit count"
                />
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Advanced Security Metrics */}
        <div className="border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              Advanced Security & Entropy Metrics
            </span>
            {showAdvancedMetrics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showAdvancedMetrics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: customEasing }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-4 bg-[#14171F] rounded-xl border border-slate-800/80 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Entropy</span>
                      <span className="font-mono font-bold text-teal-300 text-sm">{strength.entropyBits} bits</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Est. Crack Time</span>
                      <span className="font-mono font-bold text-indigo-300 text-sm">{strength.crackTimeDisplay}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Zero-Knowledge Guarantee: Password generated exclusively inside WebCrypto browser memory.</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
