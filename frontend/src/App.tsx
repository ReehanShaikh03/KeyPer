import React, { useState } from 'react';
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
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { AppLoadingSplashScreen } from './components/AppLoadingSplashScreen';
import { VaultUnlockView } from '@/features/auth/components/VaultUnlockView';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading, isVaultLocked, logout, setVaultLocked, refreshSession } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [isResetPassword, setIsResetPassword] = useState(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    return path.includes('/reset-password') || search.includes('token=');
  });

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = async () => {
    setAuthModalOpen(false);
    setVaultLocked(false);
    // Async profile refresh in background without unmounting vault page
    refreshSession().catch(() => {});
  };

  // 1. Cold Start Bootstrap: Show dark slate splash loader while silent refresh is in progress
  if (isLoading) {
    return <AppLoadingSplashScreen />;
  }

  // 2. Password Reset View
  if (isResetPassword) {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          window.history.replaceState({}, document.title, '/');
          setIsResetPassword(false);
          setVaultLocked(false);
        }}
        onGoToLogin={() => {
          window.history.replaceState({}, document.title, '/');
          setIsResetPassword(false);
          handleOpenAuth('signin');
        }}
      />
    );
  }

  // 3. User is NOT authenticated via session cookie -> Public Marketing Landing Page
  if (!isAuthenticated) {
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
          <FloatingNavbar onOpenAuth={handleOpenAuth} />

          <main>
            <SuperconsciousHero onOpenAuth={handleOpenAuth} />
            <HowItWorks />
            <BentoScrollSection />
            <InteractivePlayground />
            <SecurityWhitepaperSection />
          </main>

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
  }

  // 4. User is authenticated via session cookie, but client-side encryption key is locked (fresh tab / reload)
  if (isVaultLocked) {
    return <VaultUnlockView onUnlockSuccess={() => setVaultLocked(false)} />;
  }

  // 5. User is authenticated AND vault is unlocked -> Full Vault Dashboard
  return <VaultPage onLogout={() => logout()} />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
