import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Key, Check, RefreshCw } from 'lucide-react';
import type { VaultSecurityItem } from '../types/security.types';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

interface QuickFixModalProps {
  item: VaultSecurityItem | null;
  onClose: () => void;
  onSaveFix: (id: string, newPassword: string) => void;
}

export const QuickFixModal: React.FC<QuickFixModalProps> = ({ item, onClose, onSaveFix }) => {
  const [newPassword, setNewPassword] = useState('Kp#9v$L8!zQ2wE5m');
  const [isSaved, setIsSaved] = useState(false);

  if (!item) return null;

  const handleGenerateNew = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    for (let i = 0; i < 18; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      onSaveFix(item.id, newPassword);
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-[#1A1D24] border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Quick Fix: {item.title}</h3>
              <p className="text-xs text-slate-400 font-mono">{item.username}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4 bg-[#14171F] p-3 rounded-xl border border-slate-800">
            {item.isBreached && `Found in ${item.breachSource || 'public data leak'}. Generate a high-entropy unique password below to resolve this vulnerability.`}
            {!item.isBreached && item.isReused && 'This password is reused across multiple services. Update to a unique password.'}
            {!item.isBreached && !item.isReused && item.isWeak && 'This password has low entropy and is vulnerable to cracking. Replace it now.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New WebCrypto-Generated Password
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="font-mono text-xs bg-[#14171F] border-slate-700/60 text-slate-100 focus:ring-indigo-500"
                />
                <Button
                  type="button"
                  onClick={handleGenerateNew}
                  variant="outline"
                  className="bg-[#14171F] border-slate-700/60 text-slate-300 hover:bg-slate-800 p-2.5"
                  title="Generate new password"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
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
                className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 px-4"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Updated!</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Save & Encrypt</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
