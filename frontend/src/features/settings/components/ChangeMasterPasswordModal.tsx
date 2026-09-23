import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { settingsApi } from '../services/settingsApi';

interface ChangeMasterPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangeMasterPasswordModal: React.FC<ChangeMasterPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  if (!isOpen) return null;

  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'text-slate-500' };
    let score = 0;
    if (pass.length >= 12) score += 40;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 20;
    if (/[^A-Za-z0-9]/.test(pass)) score += 20;

    if (score < 50) return { score, label: 'Weak', color: 'text-rose-400' };
    if (score < 80) return { score, label: 'Good', color: 'text-amber-400' };
    return { score, label: 'Strong', color: 'text-emerald-400' };
  };

  const strength = calculateStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Current master password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New master password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setUpdating(true);
    try {
      await settingsApi.changeMasterPassword(currentPassword, newPassword);
      setUpdating(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setUpdating(false);
      setError(err.message || 'Failed to update master password in database.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-[#1A1D24] border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden text-slate-100"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Change Master Password</h3>
              <p className="text-xs text-slate-400">Re-encrypts local vault keys via domain separation</p>
            </div>
          </div>

          <div className="bg-[#14171F] border border-indigo-900/40 rounded-xl p-3 mb-4 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Changing this re-encrypts all vault entries locally using WebCrypto. You will remain signed in on this device only.
            </p>
          </div>

          {error && (
            <div className="bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current master password
              </label>
              <div className="relative">
                <Input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-[#14171F] border-slate-700/60 text-slate-100 text-xs font-mono pr-10 focus:ring-indigo-500"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New master password
              </label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#14171F] border-slate-700/60 text-slate-100 text-xs font-mono pr-10 focus:ring-indigo-500"
                  placeholder="Enter new strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Live Strength Meter */}
              <div className="flex items-center justify-between text-xs mt-1.5 font-mono">
                <span className="text-slate-400">Strength</span>
                <span className={`font-semibold ${strength.color}`}>{strength.label}</span>
              </div>
              <div className="w-full bg-[#14171F] h-1.5 rounded-full overflow-hidden mt-1 border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${strength.score < 50
                    ? 'bg-rose-500'
                    : strength.score < 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                    }`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm new master password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-[#14171F] border-slate-700/60 text-slate-100 text-xs font-mono focus:ring-indigo-500"
                placeholder="Re-type new password"
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
                disabled={updating}
                className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 px-4 cursor-pointer"
              >
                {updating ? (
                  <span>Re-encrypting...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Update Master Password</span>
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
