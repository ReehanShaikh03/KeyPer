import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, EyeOff, Check, AlertCircle, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';
import confetti from 'canvas-confetti';
import { authApi, authStorage } from '../services/authApi';
import { Button } from '@/shared/components/ui/button';

interface ResetPasswordPageProps {
  onSuccess: () => void;
  onGoToLogin?: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onSuccess, onGoToLogin }) => {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extract token and optional email from URL parameters: ?token=XYZ&email=abc@xyz.com
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email') || authStorage.getUserEmail() || '';

    setToken(urlToken);
    setEmail(urlEmail);

    if (!urlToken) {
      setError('Invalid or missing password reset token. Please request a new link from the sign-in page.');
    }
  }, []);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Empty', color: '#6B7280' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: '#EF4444' };
    if (score <= 4) return { score: 2, label: 'Good', color: '#F59E0B' };
    return { score: 3, label: 'Strong', color: '#10B981' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing password reset token.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Master password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    try {
      setLoading(true);

      // Generate a new client-side domain separation salt for zero-knowledge key derivation
      const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
      const newAuthSalt = Array.from(saltBytes).map((b) => b.toString(16).padStart(2, '0')).join('');

      // 1. Submit password reset to NestJS backend endpoint POST /auth/recovery/reset
      await authApi.resetPassword({
        token,
        newPassword,
        newAuthSalt,
      });

      // Clear token and reset-password path from URL address bar so refreshes don't re-enter reset card
      window.history.replaceState({}, document.title, '/');

      setSuccess(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#6366f1', '#10b981', '#38bdf8'],
      });

      // 2. Automatically log user in or attempt login if email is available
      if (email) {
        try {
          const loginRes = await authApi.login({ email, password: newPassword });
          if (loginRes.accessToken || loginRes.token) {
            setTimeout(() => {
              onSuccess();
            }, 1200);
            return;
          }
        } catch (loginErr) {
          console.warn('Auto-login post reset skipped:', loginErr);
        }
      }

      // Fallback redirect to Vault / App after brief success feedback
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset master password. Token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen w-full bg-[#05070C] text-slate-100 flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/20 via-transparent to-cyan-950/20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#14171F] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center mx-auto text-indigo-400 shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reset Master Password</h1>
          <p className="text-xs text-slate-400 font-mono">
            Set your new master password to re-key your KeyPer vault
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs p-4 rounded-xl flex items-center gap-3 text-left"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-900/80 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-emerald-200">Password Reset Successful!</p>
              <p className="text-xs text-emerald-400/90 mt-0.5">Opening your secure vault...</p>
            </div>
          </motion.div>
        )}

        {!token ? (
          <div className="pt-2 text-center space-y-4">
            <Button
              onClick={() => {
                if (onGoToLogin) onGoToLogin();
                else window.location.href = '/';
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl cursor-pointer"
            >
              Return to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                New Master Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 8 characters"
                  className="w-full bg-[#1A1D24] border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Indicator */}
              {newPassword && (
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Strength:</span>
                  <span className="font-semibold" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Confirm Master Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full bg-[#1A1D24] border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || success}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-900/30 transition-all mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Updating Vault Keys...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Reset Password & Open Vault</span>
                </>
              )}
            </Button>
          </form>
        )}

        {/* Back Link */}
        <div className="pt-2 text-center">
          <button
            onClick={() => {
              if (onGoToLogin) onGoToLogin();
              else window.location.href = '/';
            }}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
