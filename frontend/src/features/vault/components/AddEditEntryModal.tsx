import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';
import type { DecryptedVaultEntry, VaultItemData, StrengthAnalysis } from '../types/vault.types';

interface AddEditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, category: string, data: VaultItemData) => Promise<void>;
  editingEntry: DecryptedVaultEntry | null;
  calculateStrength: (password?: string) => StrengthAnalysis;
}

const EASE_CUSTOM = [0.16, 1, 0.3, 1] as const;

export const AddEditEntryModal: React.FC<AddEditEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  calculateStrength,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Personal');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevEntry, setPrevEntry] = useState<DecryptedVaultEntry | null>(null);
  const [prevOpen, setPrevOpen] = useState(false);

  if (editingEntry !== prevEntry || isOpen !== prevOpen) {
    setPrevEntry(editingEntry);
    setPrevOpen(isOpen);
    if (editingEntry) {
      setTitle(editingEntry.title);
      setCategory(editingEntry.category);
      setUsername(editingEntry.decryptedData.username || '');
      setPassword(editingEntry.decryptedData.password || '');
      setUrl(editingEntry.decryptedData.url || '');
      setNotes(editingEntry.decryptedData.notes || '');
    } else {
      setTitle('');
      setUrl('');
      setCategory('Personal');
      setUsername('');
      setPassword('');
      setNotes('');
    }
  }

  if (!isOpen) return null;

  const strength = calculateStrength(password);

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~';
    let newPass = '';
    const array = new Uint32Array(16);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < 16; i++) {
      newPass += chars[array[i] % chars.length];
    }
    setPassword(newPass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(title, category, { username, password, url, notes });
      onClose();
    } catch (err) {
      console.error('Failed to save vault entry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ duration: 0.3, ease: EASE_CUSTOM }}
          className="bg-[#181B22] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
            <h3 className="text-lg font-bold text-white">
              {editingEntry ? 'Edit Vault Entry' : 'Add New Entry'}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Folder</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors"
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Finance">Finance</option>
                  <option value="Social">Social</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Website URL</label>
              <input
                type="text"
                placeholder="e.g. netflix.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#0F1115] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Username / Email
              </label>
              <input
                type="text"
                placeholder="family@securevault.app"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0F1115] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-400">Password</label>
                <motion.button
                  whileTap={{ rotate: 180 }}
                  type="button"
                  onClick={generateSecurePassword}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate strong</span>
                </motion.button>
              </div>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter or generate password"
                className="w-full bg-[#0F1115] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
              />

              {password && (
                <div className="mt-2 space-y-1">
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${strength.score}%`, backgroundColor: strength.color }}
                      transition={{ duration: 0.35, ease: EASE_CUSTOM }}
                    />
                  </div>
                  <div className="text-[11px] text-right font-medium" style={{ color: strength.color }}>
                    {strength.label} password
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Notes (Encrypted)
              </label>
              <textarea
                rows={2}
                placeholder="Optional notes or security answers..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#0F1115] border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="bg-[#6366F1] hover:bg-[#5254E0] text-white px-5 py-2 rounded-xl text-sm font-medium shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Encrypting & Saving...' : 'Save Vault Item'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
