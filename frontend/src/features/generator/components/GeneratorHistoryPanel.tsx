import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Copy, Eye, EyeOff, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { GeneratorHistoryItem } from '../types/generator.types';

export interface GeneratorHistoryPanelProps {
  history: GeneratorHistoryItem[];
  onCopy: (passwordText: string) => void;
  onClearHistory: () => void;
}

export const GeneratorHistoryPanel: React.FC<GeneratorHistoryPanelProps> = ({
  history,
  onCopy,
  onClearHistory,
}) => {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-[#1A1D24] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-slate-100"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <History className="w-4 h-4 text-teal-400" />
          <span>Session Password History</span>
        </div>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="text-xs text-rose-400 hover:text-rose-300 h-7 px-2"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/40 p-2.5 rounded-xl">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>Transient RAM storage only. Erased instantly when page reloads.</span>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto scrollbar-thin pr-1">
        {history.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs italic">
            No passwords generated in this session yet.
          </div>
        ) : (
          history.map((item) => {
            const isRevealed = !!revealedIds[item.id];
            return (
              <div
                key={item.id}
                className="bg-[#14171F] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 group hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="uppercase text-indigo-400 font-semibold">{item.mode}</span>
                    <span>•</span>
                    <span>{item.timestamp}</span>
                  </div>

                  <div className="font-mono text-xs text-slate-200 truncate tracking-wide">
                    {isRevealed ? item.passwordText : '••••••••••••••••••••'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleReveal(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#232732] transition-colors"
                    title={isRevealed ? 'Mask Password' : 'Reveal Password'}
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onCopy(item.passwordText)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-[#232732] transition-colors"
                    title="Copy Password"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
