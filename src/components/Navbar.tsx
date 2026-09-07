import React, { useState, useEffect } from 'react';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
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
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-[#0b0d14]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3.5'
        : 'bg-transparent py-5 border-b border-transparent'
        }`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: isScrolled ? 'blur(8px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(5px)' : 'none',
        backgroundColor: isScrolled ? 'rgba(11, 13, 20, 0.85)' : 'transparent',
        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              }}
            >
              <ShieldCheck size={22} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              KeyPer
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav style={{ display: 'none', alignItems: 'center', gap: '32px' }} className="desktop-nav">
            <a href="#how-it-works" style={navLinkStyle}>
              How it works
            </a>
            <a href="#features" style={navLinkStyle}>
              Features
            </a>
            <a href="#interactive-demo" style={navLinkStyle}>
              Security Demo
            </a>
            <a href="#generator" style={navLinkStyle}>
              Password Generator
            </a>
          </nav>

          {/* Desktop Right CTA */}
          <div style={{ display: 'none', alignItems: 'center', gap: '16px' }} className="desktop-cta">
            <button
              onClick={() => onOpenAuth('signin')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.92rem',
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
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.9rem', borderRadius: '8px' }}
            >
              Get started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: '#0e111a',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              padding: '20px 24px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem', fontWeight: 500 }}
              >
                How it works
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem', fontWeight: 500 }}
              >
                Features
              </a>
              <a
                href="#interactive-demo"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem', fontWeight: 500 }}
              >
                Security Demo
              </a>
              <a
                href="#generator"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '1rem', fontWeight: 500 }}
              >
                Password Generator
              </a>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '8px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signin');
                  }}
                  className="btn-secondary"
                  style={{ width: '100%' }}
                >
                  Sign in
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  Get started
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .desktop-cta { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};

const navLinkStyle: React.CSSProperties = {
  color: '#94a3b8',
  textDecoration: 'none',
  fontSize: '0.92rem',
  fontWeight: 500,
  transition: 'color 0.2s ease',
};
