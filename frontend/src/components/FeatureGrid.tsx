import React, { useRef } from 'react';
import { KeyRound, Eye, RefreshCw, Smartphone, ShieldCheck, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export const FeatureGrid: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      gsap.fromTo(
        cardsRef.current,
        {
          opacity: 0,
          y: 45,
          scale: 0.96,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    },
    { scope: containerRef }
  );

  const features = [
    {
      icon: KeyRound,
      title: 'Password generator',
      description: '8–64 characters, ambiguity-free, strength scored live.',
    },
    {
      icon: Eye,
      title: 'Breach monitoring',
      description: 'Continuous checks flag exposed credentials with urgency levels.',
    },
    {
      icon: RefreshCw,
      title: 'Cross-device sync',
      description: 'Encrypted blobs sync; keys never do.',
    },
    {
      icon: Smartphone,
      title: '2FA & passkeys',
      description: 'TOTP codes, hardware keys and WebAuthn unlock.',
    },
    {
      icon: ShieldCheck,
      title: 'Security dashboard',
      description: 'A single score for weak, reused and breached passwords.',
      // Highlight removed as requested so it matches all previous cards dynamically!
    },
    {
      icon: Sparkles,
      title: 'Recovery kit',
      description: 'Ten one-time codes generated at signup — the only way back in.',
    },
  ];

  return (
    <section id="features" ref={containerRef} style={{ padding: '90px 24px', position: 'relative' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '55px' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            Everything a vault should do
          </h2>
        </div>

        {/* 6 Feature Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                ref={(el) => (cardsRef.current[idx] = el)}
                className="glass-card"
                style={{
                  padding: '32px 28px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(18, 22, 34, 0.7)',
                  cursor: 'pointer',
                }}
              >
                {/* Icon Container */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8',
                    marginBottom: '20px',
                    transition: 'transform 0.15s ease, background 0.15s ease',
                  }}
                >
                  <Icon size={22} />
                </div>

                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '10px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
