import React from 'react';
import { ShieldCheck, Unlock, Bookmark, History } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export interface GeneratorHeaderProps {
  onOpenPresets?: () => void;
  onToggleHistory?: () => void;
  showHistory?: boolean;
}

export const GeneratorHeader: React.FC<GeneratorHeaderProps> = ({
  onOpenPresets,
  onToggleHistory,
  showHistory,
}) => {
  return (
    <header className="h-14 bg-[#14171F] border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-white tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center text-white shadow-md shadow-indigo-900/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-base font-semibold">KeyPer</span>
        </div>
        <span className="text-slate-600 text-xs font-mono">/</span>
        <span className="text-xs text-slate-300 font-medium tracking-wide">Generator</span>
      </div>

      <div className="flex items-center gap-3">
        {onOpenPresets && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenPresets}
            aria-label="Save current generator preset"
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
            <span>Presets</span>
          </Button>
        )}

        {onToggleHistory && (
          <Button
            variant={showHistory ? 'subtle' : 'ghost'}
            size="sm"
            onClick={onToggleHistory}
            aria-label="Toggle transient generation history"
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-teal-400" />
            <span>History</span>
          </Button>
        )}

        <div className="bg-emerald-950/40 border border-emerald-600/40 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs">
          <Unlock className="w-3.5 h-3.5" />
          <span>Unlocked</span>
        </div>
      </div>
    </header>
  );
};
