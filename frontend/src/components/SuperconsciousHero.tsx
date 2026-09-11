import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, Key, Zap, Globe, Sparkles, ArrowRight, ChevronDown } from 'lucide-react';

interface SuperconsciousHeroProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export const SuperconsciousHero: React.FC<SuperconsciousHeroProps> = ({ onOpenAuth }) => {
  const floatingTags = [
    { icon: ShieldCheck, text: 'AES-256-GCM', pos: { top: '16%', left: '4%' }, delay: 0 },
    { icon: Key, text: 'Client Keys', pos: { top: '22%', right: '5%' }, delay: 0.5 },
    { icon: Zap, text: 'Argon2id', pos: { bottom: '25%', left: '6%' }, delay: 1.0 },
    { icon: Globe, text: 'WebAuthn', pos: { bottom: '20%', right: '6%' }, delay: 1.5 },
    { icon: Lock, text: 'Zero Server Access', pos: { top: '55%', right: '2%' }, delay: 2.0 },
  ];

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '130px 24px 70px 24px',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      {/* Floating interactive tags */}
      {floatingTags.map((tag, idx) => {
        const Icon = tag.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.7, 1, 0.7],
              y: [0, -12, 0],
              scale: 1,
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: 'mirror',
              delay: tag.delay,
              ease: 'easeInOut',
            }}
            className="floating-tag-desktop"
            style={{
              position: 'absolute',
              ...tag.pos,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              borderRadius: '9999px',
              padding: '8px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#d8b4fe',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
              zIndex: 2,
            }}
          >
            <Icon size={15} style={{ color: '#a855f7' }} />
            <span>{tag.text}</span>
          </motion.div>
        );
      })}

      <div style={{ maxWidth: '1000px', textAlign: 'center', margin: '0 auto', position: 'relative', zIndex: 3 }}>

        {/* Redesigned Sleek Section Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ display: 'inline-block', marginBottom: '24px' }}
        >
          <div className="badge-pill-sleek">
            <Sparkles size={14} color="#c084fc" />
            <span>Zero-Knowledge Vault</span>
          </div>
        </motion.div>

        {/* Clean Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          style={{
            fontSize: 'clamp(2.2rem, 5.5vw, 4.4rem)',
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            marginBottom: '24px',
            maxWidth: '920px',
            margin: '0 auto 24px auto',
          }}
        >
          <span className="text-gradient-white">Zero knowledge encryption </span>
          <br className="hero-break" />
          <span className="text-gradient-purple">
            your passwords are unreadable to everyone.
          </span>
        </motion.h1>

        {/* Clean Subtitle (Simplified text as requested) */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            fontSize: 'clamp(1rem, 1.2vw, 1.18rem)',
            color: '#94a3b8',
            maxWidth: '640px',
            margin: '0 auto 40px auto',
            lineHeight: 1.6,
          }}
        >
          Your master key stays on your device. Pure client-side privacy.
        </motion.p>

        {/* Hero Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => onOpenAuth('signup')}
            className="btn-primary"
            style={{
              padding: '14px 32px',
              fontSize: '0.98rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.35)',
            }}
          >
            Create Your Vault
            <ArrowRight size={18} />
          </button>
          <a
            href="#how-it-works"
            className="btn-secondary"
            style={{
              padding: '14px 32px',
              fontSize: '0.98rem',
              borderRadius: '9999px',
            }}
          >
            How It Works
          </a>
        </motion.div>

        {/* Scroll down indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ marginTop: '60px', display: 'flex', justifyContent: 'center' }}
        >
          <a href="#how-it-works" style={{ color: '#64748b', textDecoration: 'none' }}>
            <ChevronDown size={26} />
          </a>
        </motion.div>

      </div>

      <style>{`
        @media (max-width: 1024px) {
          .floating-tag-desktop { display: none !important; }
        }
      `}</style>
    </section>
  );
};
