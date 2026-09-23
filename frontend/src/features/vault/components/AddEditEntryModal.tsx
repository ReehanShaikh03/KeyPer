import React, { useState } from 'react';
import { CustomSelect } from '@/shared/components/ui/CustomSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';
import type { DecryptedVaultEntry, VaultItemData, StrengthAnalysis } from '../types/vault.types';

const WORD_LIST = [
  'Acid', 'Acorn', 'Beacon', 'Breeze', 'Bridge', 'Cobalt', 'Cosmos', 'Crystal', 'Dragon', 'Eagle',
  'Falcon', 'Galaxy', 'Glacier', 'Granite', 'Harbor', 'Helix', 'Horizon', 'Island', 'Jaguar', 'Jungle',
  'Legend', 'Matrix', 'Meteor', 'Nebula', 'Nexus', 'Oasis', 'Obsidian', 'Ocean', 'Orbit', 'Panther',
  'Phantom', 'Phoenix', 'Planet', 'Prism', 'Pulse', 'Quantum', 'Radar', 'Shadow', 'Silver', 'Solstice',
  'Spectrum', 'Sphere', 'Summit', 'Thunder', 'Titan', 'Vortex', 'Zenith', 'Zephyr'
];

interface AddEditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, category: string, data: VaultItemData) => Promise<void>;
  editingEntry: DecryptedVaultEntry | null;
  calculateStrength: (password?: string) => StrengthAnalysis;
  folders?: string[];
  activeFolder?: string;
}

const EASE_CUSTOM = [0.16, 1, 0.3, 1] as const;

export const AddEditEntryModal: React.FC<AddEditEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  calculateStrength,
  folders = ['All items'],
  activeFolder = 'All items',
}) => {
  const defaultFolder =
    activeFolder && activeFolder !== 'All items'
      ? activeFolder
      : folders.find((f) => f !== 'All items') || 'General';

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState(defaultFolder);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [genType, setGenType] = useState<'strong' | 'passphrase' | 'pin'>('strong');

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
      setCategory(defaultFolder);
      setUsername('');
      setPassword('');
      setNotes('');
    }
  }

  if (!isOpen) return null;

  const rawFolderList = folders.filter((f) => f !== 'All items');
  const availableFolderOptions = rawFolderList.length > 0 ? rawFolderList : ['General', 'Work', 'Personal', 'Finance', 'Social'];
  if (category && !availableFolderOptions.includes(category)) {
    availableFolderOptions.push(category);
  }

  const strength = calculateStrength(password);

  const handleGeneratePassword = () => {
    if (genType === 'pin') {
      const pinLength = 6;
      const digits: string[] = [];
      const array = new Uint32Array(pinLength);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < pinLength; i++) {
        digits.push((array[i] % 10).toString());
      }
      setPassword(digits.join(''));
    } else if (genType === 'passphrase') {
      const count = 4;
      const sep = '-';
      const words: string[] = [];
      const array = new Uint32Array(count);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < count; i++) {
        words.push(WORD_LIST[array[i] % WORD_LIST.length]);
      }
      const randIndex = array[0] % words.length;
      words[randIndex] += (array[1] % 10).toString();
      setPassword(words.join(sep));
    } else {
      // Strong Password
      const passLength = 20;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~';
      let newPass = '';
      const array = new Uint32Array(passLength);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < passLength; i++) {
        newPass += chars[array[i] % chars.length];
      }
      setPassword(newPass);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !password.trim()) return;

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
          transition={{ duration: 0.25, ease: EASE_CUSTOM }}
          className="bg-[#181B22] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
            <h3 className="text-base font-bold text-white">
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
                <CustomSelect
                  value={category}
                  onChange={setCategory}
                  options={availableFolderOptions}
                  ariaLabel="Select Folder"
                  className="bg-[#0F1115] border-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="user@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0F1115] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-400">
                  Password *
                </label>
                <div className="flex items-center gap-1.5 bg-[#0F1115] p-1 rounded-lg border border-slate-800">
                  {[
                    { id: 'strong', label: 'Strong' },
                    { id: 'passphrase', label: 'Passphrase' },
                    { id: 'pin', label: 'PIN' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setGenType(t.id as 'strong' | 'passphrase' | 'pin')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        genType === t.id
                          ? 'bg-[#6366F1] text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="ml-1 px-2 py-1 rounded text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                    title="Generate Password"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate</span>
                  </button>
                </div>
              </div>

              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password is required"
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
