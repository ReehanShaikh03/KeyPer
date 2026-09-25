import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, ArrowRight, LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authStorage } from '../services/authApi';
import { useVaultCrypto } from '@/features/vault/hooks/useVaultCrypto';

interface VaultUnlockViewProps {
  onUnlockSuccess: () => void;
}

const EASE_CUSTOM = [0.16, 1, 0.3, 1] as const;

export const VaultUnlockView: React.FC<VaultUnlockViewProps> = ({ onUnlockSuccess }) => {
  const { user, logout, setVaultLocked } = useAuth();
  const { unlockVault } = useVaultCrypto();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDerivingKey, setIsDerivingKey] = useState(false);

  const userEmail = user?.email || authStorage.getUserEmail() || 'user@keyper.local';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsDerivingKey(true);
    setError('');

    try {
      const ok = await unlockVault(password);
      if (ok) {
        setVaultLocked(false);
        onUnlockSuccess();
      } else {
        setError('Incorrect Master Password. Please check your credentials and try again.');
      }
    } catch {
      setError('An error occurred while deriving WebCrypto encryption key.');
    } finally {
      setIsDerivingKey(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background radial orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={error ? { opacity: 1, scale: 1, y: 0, x: [-4, 4, -4, 4, 0] } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CUSTOM }}
        className="w-full max-w-md bg-[#181B22] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10 text-center"
      >
        {/* Top Lock Badge */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center shadow-inner"
        >
          <KeyRound className="w-8 h-8" />
        </motion.div>

        {/* Title & Email Context */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-white">Vault Locked</h2>
          <p className="text-xs text-slate-400">
            Authenticated session active for <span className="text-indigo-300 font-medium">{userEmail}</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
            Enter your Master Password to derive your AES-256-GCM encryption key in memory. Your master password is never stored or transmitted.
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="relative text-left">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoFocus
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F1115] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono transition-all duration-200"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-400 font-medium text-left"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isDerivingKey}
            className="w-full bg-[#6366F1] hover:bg-[#5254E0] text-white py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDerivingKey ? (
              <span>Deriving PBKDF2 Key...</span>
            ) : (
              <>
                <span>Unlock Vault</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer Actions & Zero Knowledge Note */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            onClick={() => logout()}
            type="button"
            className="text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out / Switch Account</span>
          </button>

          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero-Knowledge</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
