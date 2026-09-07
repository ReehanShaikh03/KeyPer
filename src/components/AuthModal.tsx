import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode = 'signup', onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !masterPassword) return;

    setIsSubmitted(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#6366f1', '#38bdf8'],
    });
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setEmail('');
    setMasterPassword('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        {/* Backdrop */}
        <motion.div
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
            zIndex: 101,
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

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
                  {mode === 'signup' ? 'Create your KeyPer vault' : 'Unlock your KeyPer vault'}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '6px' }}>
                  {mode === 'signup'
                    ? 'Pick one master password. Your key never leaves this device.'
                    : 'Enter your credentials to decrypt local vault.'}
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div
                style={{
                  display: 'flex',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '12px',
                  padding: '4px',
                  marginBottom: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('signup')}
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
                  onClick={() => setMode('signin')}
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

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

                <div>
                  <label style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                    Master Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••••••"
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
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

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '10px', cursor: 'pointer' }}
                >
                  {mode === 'signup' ? 'Create Vault Now' : 'Decrypt & Sign In'}
                  <ArrowRight size={16} />
                </motion.button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
                Vault Initialized!
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
                Your AES-256 vault key has been derived locally for <strong style={{ color: '#ffffff' }}>{email}</strong>.
              </p>
              <div
                className="font-mono"
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.8rem',
                  color: '#34d399',
                  marginBottom: '24px',
                }}
              >
                Recovery Kit Code: 9F8A-3C21-7890-KEYP
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', cursor: 'pointer' }}
              >
                Enter KeyPer Dashboard
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
