import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Smartphone, Eye, Lock, Activity, Sparkles, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export const BentoScrollSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const features = [
    {
      id: 'key-derivation',
      icon: Cpu,
      topic: 'Key Derivation Engine',
      badge: 'Argon2id + PBKDF2',
      headline: 'Local Cryptographic Key Matrix',
      explanation: '600,000 PBKDF2 rounds computed in ephemeral RAM. Keys never touch disk storage or server logs.',
      statLabel: 'Hash Rounds',
      statValue: '600,000 Iterations',
      color: '#c084fc',
      gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(99, 102, 241, 0.15) 50%, rgba(13, 16, 26, 0.95) 100%)',
      hoverGradient: 'linear-gradient(135deg, rgba(192, 132, 252, 0.4) 0%, rgba(129, 140, 248, 0.3) 50%, rgba(20, 25, 42, 0.95) 100%)',
    },
    {
      id: 'passkeys',
      icon: Smartphone,
      topic: 'Passkey & Biometrics',
      badge: 'WebAuthn / FIDO2',
      headline: 'Biometric Unlock Without Passwords',
      explanation: 'TouchID, FaceID, and hardware YubiKeys authenticate into your vault in under 100 milliseconds.',
      statLabel: 'Unlock Time',
      statValue: '< 100ms Biometric',
      color: '#38bdf8',
      gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(20, 184, 166, 0.15) 50%, rgba(13, 16, 26, 0.95) 100%)',
      hoverGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.4) 0%, rgba(45, 212, 191, 0.3) 50%, rgba(20, 25, 42, 0.95) 100%)',
    },
    {
      id: 'breach-radar',
      icon: Eye,
      topic: 'Continuous Breach Radar',
      badge: '24/7 Threat Scanning',
      headline: 'Real-Time Dark Web Monitoring',
      explanation: 'K-anonymity hash prefixes verify exposed credentials locally without revealing plain-text data.',
      statLabel: 'Threat Status',
      statValue: '0 Compromised',
      color: '#f87171',
      gradient: 'linear-gradient(135deg, rgba(248, 113, 113, 0.25) 0%, rgba(236, 72, 153, 0.15) 50%, rgba(13, 16, 26, 0.95) 100%)',
      hoverGradient: 'linear-gradient(135deg, rgba(248, 113, 113, 0.4) 0%, rgba(244, 114, 182, 0.3) 50%, rgba(20, 25, 42, 0.95) 100%)',
    },
    {
      id: 'encrypted-sync',
      icon: Lock,
      topic: 'Zero-Trust Encrypted Sync',
      badge: 'AES-256-GCM',
      headline: 'Sealed Ciphertext Cloud Pipeline',
      explanation: 'Server stores unreadable AES-256 blobs. Even under full server breach, data remains unreadable.',
      statLabel: 'Encryption Cipher',
      statValue: '256-bit GCM',
      color: '#818cf8',
      gradient: 'linear-gradient(135deg, rgba(129, 140, 248, 0.25) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(13, 16, 26, 0.95) 100%)',
      hoverGradient: 'linear-gradient(135deg, rgba(129, 140, 248, 0.4) 0%, rgba(192, 132, 252, 0.3) 50%, rgba(20, 25, 42, 0.95) 100%)',
    },
    {
      id: 'security-dashboard',
      icon: Activity,
      topic: 'Vault Health Dashboard',
      badge: 'Live Audit Score',
      headline: 'Real-Time Password Entropy Audit',
      explanation: 'Single live score auditing password age, strength entropy, and cross-site reuse across all accounts.',
      statLabel: 'Vault Health',
      statValue: '98/100 Perfect',
      color: '#34d399',
      gradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.25) 0%, rgba(20, 184, 166, 0.15) 50%, rgba(13, 16, 26, 0.95) 100%)',
      hoverGradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.4) 0%, rgba(45, 212, 191, 0.3) 50%, rgba(20, 25, 42, 0.95) 100%)',
    },
    {
      id: 'recovery-kit',
      icon: Sparkles,
      topic: 'Recovery Kit Protocol',
      badge: 'Ten-Code Failsafe',
      headline: 'Offline Emergency Recovery Keys',
      explanation: 'Ten one-time recovery codes generated locally at setup — your ultimate cryptographic back door.',
      statLabel: 'Failsafe Protocol',
      statValue: '10 Offline Keys',
      color: '#f472b6',
      gradient: 'linear-gradient(135deg, rgba(244, 114, 182, 0.25) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(13, 16, 26, 0.95) 100%)',
      hoverGradient: 'linear-gradient(135deg, rgba(244, 114, 182, 0.4) 0%, rgba(192, 132, 252, 0.3) 50%, rgba(20, 25, 42, 0.95) 100%)',
    },
  ];

  // Auto slide timer
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered, features.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const getCardIndex = (offset: number) => {
    return (currentIndex + offset + features.length) % features.length;
  };

  const leftCard = features[getCardIndex(-1)];
  const centerCard = features[currentIndex];
  const rightCard = features[getCardIndex(1)];
  const farRightCard = features[getCardIndex(2)];

  const CenterIcon = centerCard.icon;
  const LeftIcon = leftCard.icon;
  const RightIcon = rightCard.icon;
  const FarRightIcon = farRightCard.icon;

  return (
    <section
      id="bento-grid"
      style={{ padding: '90px 20px', position: 'relative', zIndex: 2, overflow: 'hidden' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Expanded Section Width (1400px maximum for wide spacious layout) */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '55px' }}>
          <div className="badge-pill-sleek" style={{ marginBottom: '14px' }}>
            <Layers size={13} color="#c084fc" />
            <span>Interactive Feature Showcase</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Everything a vault should do
          </h2>
        </div>

        {/* 3D Capsule Rounded Card Carousel Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            position: 'relative',
            minHeight: '480px',
            width: '100%',
          }}
        >
          
          {/* Left Capsule Card */}
          <motion.div
            onClick={handlePrev}
            whileHover={{ scale: 0.96 }}
            style={{
              width: '160px',
              height: '420px',
              borderRadius: '36px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              opacity: 0.65,
              background: leftCard.gradient,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              display: 'none',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '28px 20px',
              transition: 'background 0.3s ease',
            }}
            className="capsule-card-left"
          >
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: leftCard.color, margin: '0 auto 12px auto' }}>
                <LeftIcon size={18} />
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.25 }}>
                {leftCard.topic}
              </div>
            </div>
          </motion.div>

          {/* Center Main Card (Spacious width & dynamic mouse gradient) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={centerCard.id}
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              onMouseMove={handleMouseMove}
              style={{
                width: '100%',
                maxWidth: '620px', // Increased center card width for spacious feel
                height: '460px',
                borderRadius: '36px',
                position: 'relative',
                overflow: 'hidden',
                background: isHovered
                  ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${centerCard.color}35 0%, rgba(20, 25, 42, 0.92) 70%)`
                  : centerCard.gradient,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(168, 85, 247, 0.12)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '40px 36px',
                transition: 'background 0.3s ease, border-color 0.3s ease',
              }}
            >
              {/* Top Row: Icon & Badge */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(12px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: centerCard.color,
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <CenterIcon size={24} />
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.8rem', color: centerCard.color, background: 'rgba(0, 0, 0, 0.5)', border: `1px solid ${centerCard.color}40`, padding: '5px 14px', borderRadius: '9999px' }}>
                    {centerCard.badge}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Headline, Description & Stat */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    lineHeight: 1.25,
                    marginBottom: '12px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {centerCard.headline}
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  {centerCard.explanation}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '12px 20px',
                  }}
                >
                  <span style={{ fontSize: '0.86rem', color: '#94a3b8' }}>{centerCard.statLabel}</span>
                  <span className="font-mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: centerCard.color }}>
                    {centerCard.statValue}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right Capsule Card 1 */}
          <motion.div
            onClick={handleNext}
            whileHover={{ scale: 0.96 }}
            style={{
              width: '160px',
              height: '420px',
              borderRadius: '36px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              opacity: 0.65,
              background: rightCard.gradient,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              display: 'none',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '28px 20px',
              transition: 'background 0.3s ease',
            }}
            className="capsule-card-right"
          >
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: rightCard.color, margin: '0 auto 12px auto' }}>
                <RightIcon size={18} />
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.25 }}>
                {rightCard.topic}
              </div>
            </div>
          </motion.div>

          {/* Far Right Capsule Card 2 */}
          <motion.div
            onClick={() => setCurrentIndex((prev) => (prev + 2) % features.length)}
            whileHover={{ scale: 0.96 }}
            style={{
              width: '130px',
              height: '380px',
              borderRadius: '36px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              opacity: 0.4,
              background: farRightCard.gradient,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'none',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '22px 14px',
              transition: 'background 0.3s ease',
            }}
            className="capsule-card-far"
          >
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: farRightCard.color, margin: '0 auto 10px auto' }}>
                <FarRightIcon size={15} />
              </div>
              <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.2 }}>
                {farRightCard.topic}
              </div>
            </div>
          </motion.div>

        </div>

        {/* Small Topic Box & Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            marginTop: '40px',
            flexWrap: 'wrap',
          }}
        >
          {/* Prev Button */}
          <button
            onClick={handlePrev}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Main Topic Box */}
          <div
            style={{
              background: 'rgba(15, 18, 28, 0.85)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '9999px',
              padding: '12px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span className="font-mono" style={{ fontSize: '0.82rem', color: '#a855f7', fontWeight: 700 }}>
              0{currentIndex + 1} / 0{features.length}
            </span>
            <div style={{ height: '14px', width: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
              {centerCard.topic}
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Next Slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Carousel Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          {features.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: idx === currentIndex ? '26px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx === currentIndex ? '#a855f7' : 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      <style>{`
        @media (min-width: 768px) {
          .capsule-card-left { display: flex !important; }
          .capsule-card-right { display: flex !important; }
        }
        @media (min-width: 1100px) {
          .capsule-card-far { display: flex !important; }
        }
      `}</style>
    </section>
  );
};
