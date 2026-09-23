import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, RefreshCw, ArrowLeft, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { authApi } from '../services/authApi';

interface TwoFactorVerifyProps {
  tempToken: string;
  emailMasked?: string;
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = ({
  tempToken,
  emailMasked = 'u***@example.com',
  onSuccess,
  onBackToLogin,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccessWave, setIsSuccessWave] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // 60-second cooldown timer for Resend link
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue && value !== '') return;

    const newDigits = [...digits];
    // If multiple characters pasted into box
    if (cleanValue.length > 1) {
      const pastedChars = cleanValue.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedChars[i] || '';
      }
      setDigits(newDigits);
      const nextIndex = Math.min(pastedChars.length, 5);
      inputRefs.current[nextIndex]?.focus();

      if (newDigits.every((d) => d !== '')) {
        verifyCode(newDigits.join(''));
      }
      return;
    }

    newDigits[index] = cleanValue.slice(-1);
    setDigits(newDigits);
    setError(null);

    // Auto-advance
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 boxes are filled
    if (newDigits.every((d) => d !== '')) {
      verifyCode(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    const chars = pasteData.split('');
    for (let i = 0; i < 6; i++) {
      newDigits[i] = chars[i] || '';
    }
    setDigits(newDigits);
    setError(null);

    const nextIndex = Math.min(chars.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (newDigits.every((d) => d !== '')) {
      verifyCode(newDigits.join(''));
    }
  };

  const verifyCode = async (code: string) => {
    if (loading || isSuccessWave) return;
    setLoading(true);
    setError(null);
    setResendMessage(null);

    try {
      await authApi.verifyLoginOtp(tempToken, code);
      setIsSuccessWave(true);
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#14B8A6', '#10B981'],
      });

      setTimeout(() => {
        onSuccess();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Invalid 6-digit code. Please check and try again.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      // Clear boxes on failure and refocus box 0
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    setResendMessage(null);

    try {
      const res = await authApi.resendOtp(tempToken);
      setResendMessage(res.message || 'New verification code sent to your email address.');
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center select-none font-sans">
      <motion.div
        animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#1A1D24] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6 text-center"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-[#6366F1] to-transparent blur-xs opacity-75" />

        {/* Header Icon & Title */}
        <div className="space-y-2">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-14 h-14 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/30 text-[#6366F1] flex items-center justify-center mx-auto shadow-inner"
          >
            <ShieldCheck className="w-7 h-7" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Two-Step Verification
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Enter the 6-digit numeric OTP code sent to your registered email address.
          </p>

          {/* Masked Email Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#0F1115] border border-slate-800 px-3 py-1 rounded-full text-xs text-indigo-300 font-mono mt-1">
            <Lock className="w-3 h-3 text-teal-400 shrink-0" />
            <span>Sent to: {emailMasked}</span>
          </div>
        </div>

        {/* Status Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2 text-left"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {resendMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="bg-teal-950/60 border border-teal-800/60 text-teal-300 text-xs p-3 rounded-xl flex items-center gap-2 text-left"
            >
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{resendMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 6-Digit Single Input Boxes */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-2">
          {digits.map((digit, index) => {
            const isFilled = Boolean(digit);
            return (
              <motion.div
                key={index}
                animate={
                  isSuccessWave
                    ? {
                        scale: [1, 1.15, 1],
                        borderColor: ['#1A1D24', '#10B981', '#10B981'],
                        backgroundColor: ['#0F1115', '#064E3B', '#064E3B'],
                      }
                    : { scale: isFilled ? [1, 1.08, 1] : 1 }
                }
                transition={{
                  duration: isSuccessWave ? 0.35 : 0.15,
                  delay: isSuccessWave ? index * 0.06 : 0,
                }}
                className="relative"
              >
                <input
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading || isSuccessWave}
                  className={`w-11 h-14 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold rounded-2xl bg-[#0F1115] border transition-all duration-200 outline-none ${
                    isSuccessWave
                      ? 'border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-900/40'
                      : isFilled
                      ? 'border-[#6366F1] text-white shadow-md shadow-indigo-950/50'
                      : 'border-slate-800 text-slate-100 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20'
                  }`}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Spinner during verification */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-xs text-indigo-400 font-mono py-1">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Verifying code...</span>
          </div>
        )}

        {/* Cooldown & Resend Flow */}
        <div className="space-y-3 pt-2">
          <div className="text-xs text-slate-400">
            {cooldown > 0 ? (
              <span>Resend available in <strong className="text-indigo-400 font-mono">{cooldown}s</strong></span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || loading}
                className="text-[#14B8A6] hover:text-teal-300 font-semibold underline underline-offset-4 cursor-pointer transition-colors inline-flex items-center gap-1.5"
              >
                {resending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <span>Resend Verification Code</span>
                )}
              </button>
            )}
          </div>

          {/* Abort & Back to Login */}
          <div>
            <button
              type="button"
              onClick={onBackToLogin}
              disabled={loading}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
