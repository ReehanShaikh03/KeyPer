import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Lock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const HowItWorks: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      gsap.fromTo(
        cardsRef.current,
        {
          opacity: 0,
          y: 40,
          scale: 0.96,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.12,
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

  const steps = [
    {
      step: '01',
      title: 'Create your vault',
      description: 'One master password derived locally.',
    },
    {
      step: '02',
      title: 'Encrypt locally',
      description: 'AES-256-GCM seals data before sync.',
    },
    {
      step: '03',
      title: 'Access anywhere',
      description: 'Unlock with master password or passkey.',
    },
  ];

  return (
    <section id="how-it-works" ref={containerRef} style={{ padding: '80px 24px', position: 'relative' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Redesigned Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <div className="badge-pill-sleek" style={{ marginBottom: '14px' }}>
            <Lock size={13} color="#c084fc" />
            <span>3 Simple Steps</span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            How it works
          </h2>
        </div>

        {/* 3 Step Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {steps.map((item, idx) => (
            <div
              key={idx}
              ref={(el) => (cardsRef.current[idx] = el)}
              className="glass-bento"
              style={{
                padding: '30px 26px',
                borderRadius: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#c084fc',
                    marginBottom: '16px',
                    letterSpacing: '0.05em',
                  }}
                >
                  {item.step}
                </div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '8px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
