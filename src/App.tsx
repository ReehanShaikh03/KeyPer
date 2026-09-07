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

export const App: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

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
        {/* Floating Pill-Shaped Top Navbar */}
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
      />
    </div>
  );
};

export default App;
