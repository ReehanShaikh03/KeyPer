import React, { useRef } from 'react';
import { Lock, ShieldCheck, Eye, Fingerprint, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface HeroProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(badgeRef.current, { opacity: 0, y: -20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 })
        .fromTo(titleRef.current, { opacity: 0, y: 30, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, '-=0.3')
        .fromTo(descRef.current, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .fromTo(buttonsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
        .fromTo(pillsRef.current?.children ? Array.from(pillsRef.current.children) : [], { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08 }, '-=0.2');
    },
    { scope: containerRef }
  );

  const highlights = [
    { icon: Lock, label: 'AES-256 encryption' },
    { icon: ShieldCheck, label: 'Zero-knowledge architecture' },
    { icon: Eye, label: 'Breach monitoring' },
    { icon: Fingerprint, label: '2FA built in' },
  ];

  return (
    <section ref={containerRef} style={{ padding: '90px 24px 70px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        
        {/* Top Zero Knowledge Badge */}
        <div ref={badgeRef} style={{ display: 'inline-block', marginBottom: '32px' }}>
          <div className="badge-pill" style={{ cursor: 'pointer' }}>
            <Lock size={14} style={{ color: '#818cf8' }} />
            <span>Zero-knowledge by design</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1
          ref={titleRef}
          style={{
            fontSize: 'clamp(2.6rem, 5.8vw, 4.4rem)',
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            marginBottom: '26px',
            maxWidth: '920px',
            margin: '0 auto 26px auto',
          }}
        >
          <span className="text-gradient">Your passwords, </span>
          <br className="hero-br" />
          <span className="text-gradient-cyan">
            encrypted before they ever leave your device
          </span>
        </h1>

        {/* Subtitle Description */}
        <p
          ref={descRef}
          style={{
            fontSize: 'clamp(1.05rem, 1.25vw, 1.22rem)',
            color: '#94a3b8',
            maxWidth: '700px',
            margin: '0 auto 44px auto',
            lineHeight: 1.6,
          }}
        >
          KeyPer locks everything with a key derived from your master password.
          The key stays on your device — so even we can't read your vault.
        </p>

        {/* Action Buttons */}
        <div
          ref={buttonsRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            flexWrap: 'wrap',
            marginBottom: '85px',
          }}
        >
          <button
            onClick={() => onOpenAuth('signup')}
            className="btn-primary"
            style={{ padding: '14px 34px', fontSize: '1.02rem', borderRadius: '12px' }}
          >
            Get started free
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => onOpenAuth('signin')}
            className="btn-secondary"
            style={{ padding: '14px 34px', fontSize: '1.02rem', borderRadius: '12px' }}
          >
            I already have a vault
          </button>
        </div>

        {/* Highlight Feature Pills Bar */}
        <div
          ref={pillsRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            maxWidth: '1020px',
            margin: '0 auto',
          }}
        >
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="glass-card"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '9px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8',
                  }}
                >
                  <Icon size={18} />
                </div>
                <span style={{ fontSize: '0.94rem', fontWeight: 600, color: '#e2e8f0' }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
