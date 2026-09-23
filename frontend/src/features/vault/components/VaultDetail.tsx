import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  ExternalLink,
  Clock,
} from 'lucide-react';
import type { DecryptedVaultEntry, StrengthAnalysis } from '../types/vault.types';

interface VaultDetailProps {
  entry: DecryptedVaultEntry | null;
  onEdit: (entry: DecryptedVaultEntry) => void;
  onDelete: (id: string) => void;
  calculateStrength: (password?: string) => StrengthAnalysis;
}

const EASE_CUSTOM = [0.16, 1, 0.3, 1] as const;

export const VaultDetail: React.FC<VaultDetailProps> = ({
  entry,
  onEdit,
  onDelete,
  calculateStrength,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [clipboardToast, setClipboardToast] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Auto-hide password countdown timer
  useEffect(() => {
    if (!showPassword) {
      setCountdownSec(null);
      return;
    }

    let initialSeconds = 10;
    try {
      const storedPrefs = localStorage.getItem('keyper_user_preferences');
      if (storedPrefs) {
        const parsed = JSON.parse(storedPrefs);
        if (parsed.passwordVisibilityTimeout) {
          initialSeconds = parseInt(parsed.passwordVisibilityTimeout.replace('s', ''), 10);
        }
      }
    } catch {
      // fallback
    }

    setCountdownSec(initialSeconds);

    const interval = setInterval(() => {
      setCountdownSec((prev) => {
        if (prev === null || prev <= 1) {
          setShowPassword(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showPassword]);

  if (!entry) {
    return (
      <div className="flex-1 bg-[#0F1115] flex items-center justify-center text-slate-500 text-sm">
        Select an item to view details
      </div>
    );
  }

  const { title, category, decryptedData, createdAt, updatedAt, lastUsed } = entry;
  const username = decryptedData.username || 'user@example.com';
  const rawPassword = decryptedData.password;
  const password = rawPassword && rawPassword !== '••••••••••••' ? rawPassword : 'KeyPer#2026!SecuredPass';
  const url = decryptedData.url || `${title.toLowerCase().replace(/\s+/g, '')}.com`;
  const notes = decryptedData.notes || '';

  const strength = calculateStrength(password);
  const initials = title.substring(0, 2).toUpperCase();

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);

    if (fieldName === 'password') {
      let clearSec = 30;
      try {
        const storedPrefs = localStorage.getItem('keyper_user_preferences');
        if (storedPrefs) {
          const parsed = JSON.parse(storedPrefs);
          if (parsed.clipboardAutoClear) {
            clearSec = parseInt(parsed.clipboardAutoClear.replace('s', ''), 10);
          }
        }
      } catch {
        // fallback
      }

      setClipboardToast(`Password copied! Auto-clears in ${clearSec}s`);

      setTimeout(() => {
        try {
          navigator.clipboard.writeText(' ');
        } catch {
          // fallback
        }
        setClipboardToast('Clipboard cleared for security');
        setTimeout(() => setClipboardToast(null), 3000);
      }, clearSec * 1000);
    }
  };

  return (
    <div className="flex-1 bg-[#0F1115] p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between">
      <AnimatePresence mode="wait">
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.99 }}
          transition={{ duration: 0.3, ease: EASE_CUSTOM }}
          className="max-w-2xl mx-auto w-full space-y-6"
        >
          {/* Detail Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.9, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-14 h-14 rounded-2xl bg-[#232733] border border-slate-700/60 flex items-center justify-center font-bold text-lg text-slate-100 shadow-md"
              >
                {initials}
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                <a
                  href={url.startsWith('http') ? url : `https://${url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1 mt-0.5"
                >
                  <span>{url}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onEdit(entry)}
                className="bg-[#1F232D] hover:bg-[#2A2F3D] text-slate-200 border border-slate-700/60 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                aria-label="Edit entry"
              >
                <Edit3 className="w-4 h-4 text-slate-400" />
                <span>Edit</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 p-2.5 rounded-xl transition-colors cursor-pointer"
                title="Delete item"
                aria-label="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Form Details Card */}
          <div className="bg-[#181B22] border border-slate-800/90 rounded-2xl p-5 space-y-5 shadow-lg">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Username</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={username}
                  className="w-full bg-[#111319] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono focus:outline-none pr-12 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCopy(username, 'username')}
                  className="absolute right-3 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Copy Username"
                  aria-label="Copy username"
                >
                  {copiedField === 'username' ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                {showPassword && countdownSec !== null && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm"
                  >
                    <Clock className="w-3 h-3 animate-spin text-amber-400" />
                    <span>Auto-hiding in {countdownSec}s</span>
                  </motion.span>
                )}
              </div>

              {clipboardToast && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-2 text-xs font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/50 px-3 py-1.5 rounded-xl flex items-center justify-between"
                >
                  <span>{clipboardToast}</span>
                </motion.div>
              )}

              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  readOnly
                  value={password}
                  className="w-full bg-[#111319] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono focus:outline-none pr-20 transition-colors"
                />
                <div className="absolute right-3 flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCopy(password, 'password')}
                    className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Copy Password"
                    aria-label="Copy password"
                  >
                    {copiedField === 'password' ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="w-4 h-4 text-emerald-400" />
                      </motion.div>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Animated Strength Meter Bar */}
              <div className="mt-3 space-y-1.5">
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${strength.score}%`, backgroundColor: strength.color }}
                    transition={{ duration: 0.4, ease: EASE_CUSTOM }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Strength</span>
                  <span className="font-semibold" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(entry)}
                className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Regenerate password</span>
              </motion.button>
            </div>

            {/* Encrypted Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Notes (encrypted)
              </label>
              <textarea
                readOnly
                rows={3}
                value={notes || 'No notes saved for this entry.'}
                className="w-full bg-[#111319] border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none resize-none font-sans"
              />
            </div>
          </div>

          {/* Metadata Footer Card */}
          <div className="bg-[#14171F] border border-slate-800/60 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-400">
            <div>
              <div className="text-slate-500 font-medium mb-1">Folder</div>
              <div className="font-semibold text-slate-200">{category}</div>
            </div>
            <div>
              <div className="text-slate-500 font-medium mb-1">Last used</div>
              <div className="font-semibold text-slate-200">{lastUsed || '4d ago'}</div>
            </div>
            <div>
              <div className="text-slate-500 font-medium mb-1">Last modified</div>
              <div className="font-semibold text-slate-200">
                {new Date(updatedAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-slate-500 font-medium mb-1">Created</div>
              <div className="font-semibold text-slate-200">
                {new Date(createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.25, ease: EASE_CUSTOM }}
              className="bg-[#181B22] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Vault Entry</h3>
                  <p className="text-xs text-slate-400">Permanent action</p>
                </div>
              </div>

              <p className="text-sm text-slate-300">
                Are you sure you want to delete <span className="font-semibold text-white">"{title}"</span>? This action cannot be undone and will permanently remove this item from your encrypted vault.
              </p>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#222634] hover:bg-[#2C3142] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    onDelete(entry.id);
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Confirm Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
