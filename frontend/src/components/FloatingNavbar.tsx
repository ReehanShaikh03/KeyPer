import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowUpRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingNavbarProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({ onOpenAuth }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: '20px',
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 16px',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-pill"
        style={{
          pointerEvents: 'auto',
          width: '100%',
          maxWidth: '960px',
          borderRadius: '9999px',
          padding: isScrolled ? '10px 24px' : '14px 28px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: isScrolled
            ? '0 16px 36px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(168, 85, 247, 0.25)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Brand Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)',
            }}
          >
            <ShieldCheck size={20} color="#ffffff" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            KeyPer
          </span>
        </a>

        {/* Center Nav Links (Includes Password Generator as requested) */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '26px' }} className="desktop-pill-nav">
          <a href="#hero" style={navLinkStyle}>About</a>
          <a href="#how-it-works" style={navLinkStyle}>How It Works</a>
          <a href="#bento-grid" style={navLinkStyle}>Feature Map</a>
          <a href="#interactive-demo" style={navLinkStyle}>Security Demo</a>
          {/* <a href="#generator" style={navLinkStyle}>Generator</a> */}
        </nav>

        {/* Right CTA */}
        <div style={{ display: 'none', alignItems: 'center', gap: '14px' }} className="desktop-pill-cta">
          <button
            onClick={() => onOpenAuth('signin')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            Sign in
          </button>
          <button
            onClick={() => onOpenAuth('signup')}
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '8px 20px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(168, 85, 247, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(168, 85, 247, 0.4)';
            }}
          >
            Get Started
            <ArrowUpRight size={15} />
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-pill-toggle"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </motion.div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            style={{
              position: 'absolute',
              top: '70px',
              left: '20px',
              right: '20px',
              pointerEvents: 'auto',
              background: '#0d101a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <a href="#hero" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>About</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>How It Works</a>
              <a href="#bento-grid" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>Feature Map</a>
              <a href="#interactive-demo" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>Security Demo</a>
              <a href="#generator" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>Generator</a>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('signup'); }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                  color: '#ffffff',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 768px) {
          .desktop-pill-nav { display: flex !important; }
          .desktop-pill-cta { display: flex !important; }
          .mobile-pill-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};

const navLinkStyle: React.CSSProperties = {
  color: '#94a3b8',
  textDecoration: 'none',
  fontSize: '0.88rem',
  fontWeight: 500,
  transition: 'color 0.2s ease',
};

const mobileNavLinkStyle: React.CSSProperties = {
  color: '#e2e8f0',
  textDecoration: 'none',
  fontSize: '1rem',
  fontWeight: 500,
};
