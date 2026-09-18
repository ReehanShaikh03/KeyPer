import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';

interface MasterPasswordModalProps {
  isOpen: boolean;
  onUnlock: (password: string) => Promise<boolean>;
}

const EASE_CUSTOM = [0.16, 1, 0.3, 1] as const;

export const MasterPasswordModal: React.FC<MasterPasswordModalProps> = ({
  isOpen,
  onUnlock,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDerivingKey, setIsDerivingKey] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsDerivingKey(true);
    setError('');

    try {
      const success = await onUnlock(password);
      if (!success) {
        setError('Failed to derive encryption key. Check master password.');
      }
    } catch {
      setError('An error occurred during WebCrypto key derivation.');
    } finally {
      setIsDerivingKey(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={error ? { opacity: 1, scale: 1, y: 0, x: [-4, 4, -4, 4, 0] } : { opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ duration: 0.35, ease: EASE_CUSTOM }}
          className="bg-[#181B22] border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center shadow-inner"
          >
            <ShieldCheck className="w-8 h-8" />
          </motion.div>

          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Unlock KeyPer Vault</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Enter your Master Password to derive your client-side WebCrypto encryption key (K<sub>enc</sub>). Plaintext never leaves your browser.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F1115] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono transition-all duration-200"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-400 font-medium"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isDerivingKey}
              className="w-full bg-[#6366F1] hover:bg-[#5254E0] text-white py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition-all cursor-pointer disabled:opacity-50"
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

          <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-1.5 border-t border-slate-800/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero-Knowledge Architecture • AES-256-GCM</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
