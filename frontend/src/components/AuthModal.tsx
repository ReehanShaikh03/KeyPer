import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, Mail, ArrowRight, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { authApi, authStorage } from '@/features/auth/services/authApi';
import { useAuth } from '@/features/auth/context/AuthContext';
import { TwoFactorVerify } from '@/features/auth/components/TwoFactorVerify';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess?: () => void;
}

type ModalViewMode = 'signin' | 'signup' | '2fa' | 'recovery';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode = 'signup', onClose, onSuccess }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<ModalViewMode>(initialMode);
  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [emailMasked, setEmailMasked] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setInfoMessage(null);
    }
  }, [isOpen, initialMode]);

  const handleModeChange = (newMode: ModalViewMode) => {
    setMode(newMode);
    setError(null);
    setInfoMessage(null);
  };

  const triggerSuccessAndEnterVault = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#6366f1', '#38bdf8'],
    });
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!email || !masterPassword) return;
        const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
        const authSalt = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');

        await authApi.register({
          email,
          password: masterPassword,
          authSalt,
        });

        const loginRes = await authApi.login({
          email,
          password: masterPassword,
        });

        if (loginRes.requires2FA) {
          setTempToken(loginRes.tempToken || '');
          setEmailMasked(loginRes.email || email);
          setMode('2fa');
          return;
        }

        const token = loginRes.accessToken || loginRes.token || 'keyper_token_' + Date.now();
        login(token, {
          id: loginRes.user?.id || `user-${Date.now()}`,
          email: loginRes.user?.email || email,
          isTwoFactorEnabled: loginRes.user?.isTwoFactorEnabled,
        });

        triggerSuccessAndEnterVault();
      } else if (mode === 'signin') {
        if (!email || !masterPassword) return;

        try {
          await authApi.getPreLoginSalt({ email });
        } catch {
          // Continue if user isn't found yet or backend salt fetch skips
        }

        const res = await authApi.login({
          email,
          password: masterPassword,
        });

        if (res.requires2FA) {
          setTempToken(res.tempToken || '');
          setEmailMasked(res.email || email);
          setMode('2fa');
          return;
        }

        const token = res.accessToken || res.token || 'keyper_token_' + Date.now();
        login(token, {
          id: res.user?.id || `user-${Date.now()}`,
          email: res.user?.email || email,
          isTwoFactorEnabled: res.user?.isTwoFactorEnabled,
        });

        triggerSuccessAndEnterVault();
      } else if (mode === 'recovery') {
        if (!email) return;
        if (recoveryCode) {
          const res = await authApi.redeemRecoveryCode({ email, code: recoveryCode });
          if (res.tempAuthToken) {
            authStorage.setToken(res.tempAuthToken);
            authStorage.setUserEmail(email);
          }
          triggerSuccessAndEnterVault();
        } else {
          await authApi.requestPasswordReset({ email });
          setInfoMessage('Password reset request submitted. Check your inbox for instructions.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication request failed. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(5, 7, 12, 0.85)',
              backdropFilter: 'blur(16px)',
              cursor: 'pointer',
            }}
          />

          {/* Modal Window */}
          <motion.div
            key="modal-window"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px',
              background: '#0d101a',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              borderRadius: '24px',
              padding: '36px 32px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(168, 85, 247, 0.15)',
              zIndex: 10000,
            }}
          >
            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </motion.button>

            {mode === '2fa' ? (
              <TwoFactorVerify
                tempToken={tempToken}
                emailMasked={emailMasked}
                onSuccess={triggerSuccessAndEnterVault}
                onBackToLogin={() => handleModeChange('signin')}
              />
            ) : (
              <>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                      boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
                    }}
                  >
                    <ShieldCheck size={26} color="#ffffff" />
                  </div>
                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                    {mode === 'signup' && 'Create your KeyPer vault'}
                    {mode === 'signin' && 'Unlock your KeyPer vault'}
                    {mode === 'recovery' && 'Account Recovery'}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '6px' }}>
                    {mode === 'signup' && 'Pick a master password. Your key never leaves this device.'}
                    {mode === 'signin' && 'Enter your master password to authenticate and decrypt vault.'}
                    {mode === 'recovery' && 'Request reset token or enter your 10-char recovery code.'}
                  </p>
                </div>

            {/* Mode Toggle Tabs for Sign Up / Sign In */}
            {(mode === 'signin' || mode === 'signup') && (
              <div
                style={{
                  display: 'flex',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '12px',
                  padding: '4px',
                  marginBottom: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleModeChange('signup')}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: '10px',
                    border: 'none',
                    background: mode === 'signup' ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'transparent',
                    color: mode === 'signup' ? '#ffffff' : '#94a3b8',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Create Vault
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleModeChange('signin')}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: '10px',
                    border: 'none',
                    background: mode === 'signin' ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'transparent',
                    color: mode === 'signin' ? '#ffffff' : '#94a3b8',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Sign In
                </motion.button>
              </div>
            )}

            {infoMessage && (
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8', fontSize: '0.82rem', padding: '10px 12px', borderRadius: '10px', marginBottom: '16px' }}>
                {infoMessage}
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#f43f5e', fontSize: '0.82rem', padding: '10px 12px', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(mode === 'signup' || mode === 'signin' || mode === 'recovery') && (
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        padding: '11px 12px 11px 40px',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}

              {(mode === 'signup' || mode === 'signin') && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      Master Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => handleModeChange('recovery')}
                        style={{ background: 'none', border: 'none', color: '#a855f7', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••••••"
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        padding: '11px 40px 11px 40px',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'recovery' && (
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                    Emergency Recovery Code (Optional)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="10-character code"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        padding: '11px 12px 11px 40px',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '10px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Processing...' : (
                  <>
                    {mode === 'signup' && 'Create Vault Now'}
                    {mode === 'signin' && 'Decrypt & Sign In'}
                    {mode === 'recovery' && (recoveryCode ? 'Redeem Recovery Code' : 'Request Password Reset')}
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>

              {mode === 'recovery' && (
                <button
                  type="button"
                  onClick={() => handleModeChange('signin')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'center', marginTop: '4px' }}
                >
                  Back to Sign In
                </button>
              )}
            </form>
          </>
        )}
      </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
