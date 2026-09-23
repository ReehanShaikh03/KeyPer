import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

interface DangerDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (confirmationText: string) => void;
}

export const DangerDeleteModal: React.FC<DangerDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmInput !== 'DELETE MY VAULT') {
      setError('You must type exactly "DELETE MY VAULT" to proceed.');
      return;
    }
    onConfirmDelete(confirmInput);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-[#1A1D24] border border-rose-900/60 rounded-2xl shadow-2xl p-6 relative overflow-hidden text-slate-100"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-400">Erase Entire Vault & Account</h3>
              <p className="text-xs text-slate-400 font-mono">Irreversible Action</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-rose-950/40 p-3 rounded-xl border border-rose-900/50 mb-4">
            This will permanently delete all encrypted entries, master keys, active sessions, and account data. This action <strong className="text-rose-400 font-bold">CANNOT BE UNDONE</strong>.
          </p>

          {error && (
            <div className="bg-rose-950/80 text-rose-300 text-xs p-2.5 rounded-lg mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Type <span className="font-mono text-rose-400 font-bold">DELETE MY VAULT</span> to confirm:
              </label>
              <Input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DELETE MY VAULT"
                className="bg-[#14171F] border-rose-800/60 text-rose-300 text-xs font-mono focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={confirmInput !== 'DELETE MY VAULT'}
                className="text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 px-4 disabled:opacity-40 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Permanently Erase</span>
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
