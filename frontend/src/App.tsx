import React, { useState, useEffect } from 'react';
import { WaveBackground } from './components/WaveBackground';
import { FloatingNavbar } from './components/FloatingNavbar';
import { SuperconsciousHero } from './components/SuperconsciousHero';
import { HowItWorks } from './components/HowItWorks';
import { BentoScrollSection } from './components/BentoScrollSection';
import { InteractivePlayground } from './components/InteractivePlayground';
import { SecurityWhitepaperSection } from './components/SecurityWhitepaperSection';
import { CtaFooterSection } from './components/CtaFooterSection';
import { AuthModal } from './components/AuthModal';
import { VaultPage } from '@/features/vault/pages/VaultPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { authStorage } from '@/features/auth/services/authApi';

export const App: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [currentView, setCurrentView] = useState<'landing' | 'vault' | 'reset-password'>(() => {
    // 1. Check if user is navigating via password reset email link
    const path = window.location.pathname;
    const search = window.location.search;
    if (path.includes('/reset-password') || search.includes('token=')) {
      return 'reset-password';
    }

    // 2. Check if token exists in localStorage on initial render / page load
    const token = authStorage.getToken();
    return token ? 'vault' : 'landing';
  });

  // Keep session synced across tabs and on storage updates
  useEffect(() => {
    const handleStorageChange = () => {
      const search = window.location.search;
      if (search.includes('token=')) {
        setCurrentView('reset-password');
        return;
      }
      const token = authStorage.getToken();
      if (token) {
        setCurrentView('vault');
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setCurrentView('vault');
  };

  const handleLogout = () => {
    authStorage.clearAuth();
    setCurrentView('landing');
  };

  if (currentView === 'reset-password') {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          // Clear query params and reset-password route from URL address bar smoothly to root '/'
          window.history.replaceState({}, document.title, '/');
          setCurrentView('vault');
        }}
        onGoToLogin={() => {
          window.history.replaceState({}, document.title, '/');
          setCurrentView('landing');
          handleOpenAuth('signin');
        }}
      />
    );
  }

  if (currentView === 'vault') {
    return <VaultPage onLogout={handleLogout} />;
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#05070c', overflowX: 'hidden' }}>
      {/* Superconscious Fluid Wave Background Canvas */}
      <WaveBackground />

      {/* Ambient Radial Gradient Orbs */}
      <div className="superconscious-bg">
        <div className="glow-purple-orb" />
        <div className="glow-cyan-orb" />
        <div className="glow-violet-deep" />
      </div>

      {/* Main App Layout */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top Floating Navbar */}
        <FloatingNavbar onOpenAuth={handleOpenAuth} />

        <main>
          {/* Superconscious Hero Section */}
          <SuperconsciousHero onOpenAuth={handleOpenAuth} />

          {/* 3-Step Process Section */}
          <HowItWorks />

          {/* Dynamic Scroll Expansion Bento Grid */}
          <BentoScrollSection />

          {/* Live Interactive Encryption Simulator & Live Password Generator */}
          <InteractivePlayground />

          {/* Audited Cryptography & Security Whitepaper */}
          <SecurityWhitepaperSection />
        </main>

        {/* CTA & Footer */}
        <CtaFooterSection onOpenAuth={handleOpenAuth} />
      </div>

      {/* Interactive Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;
