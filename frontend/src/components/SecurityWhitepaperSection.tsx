import React, { useRef } from 'react';
import { CheckCircle2, Lock, ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export const SecurityWhitepaperSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !cardRef.current) return;

      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          y: 40,
          scale: 0.97,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
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

  const specs = [
    {
      title: 'Key Derivation',
      detail: 'Argon2id & PBKDF2',
      desc: '600,000 rounds protects against brute force.',
    },
    {
      title: 'Symmetric Cipher',
      detail: 'AES-256-GCM',
      desc: 'Authenticated encryption with tamper-proof integrity.',
    },
    {
      title: 'Biometric Unlock',
      detail: 'WebAuthn & YubiKey',
      desc: 'TouchID, FaceID, and FIDO2 passkey support.',
    },
    {
      title: 'Zero Memory Leak',
      detail: 'Ephemeral RAM Wiping',
      desc: 'Keys wiped from device RAM immediately after use.',
    },
  ];

  return (
    <section id="whitepaper" ref={containerRef} style={{ padding: '80px 24px', position: 'relative' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        <div
          ref={cardRef}
          className="glass-bento"
          style={{
            padding: '44px 36px',
            background: 'linear-gradient(135deg, rgba(18, 22, 34, 0.9) 0%, rgba(13, 16, 26, 0.95) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '36px', alignItems: 'center' }}>
            
            {/* Left Description */}
            <div>
              <div className="badge-pill-sleek" style={{ marginBottom: '16px' }}>
                <Lock size={13} color="#c084fc" />
                <span>Audited Cryptography</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.3rem)', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
                Built on provable security
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: '22px' }}>
                KeyPer operates under a strict zero-knowledge paradigm. Your master key is never transmitted or logged.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>100% Independently audited</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Open-source encryption core</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>SOC2 Type II & ISO 27001 Certified</span>
                </div>
              </div>

              <a
                href="#whitepaper"
                className="btn-secondary"
                style={{ fontSize: '0.88rem', padding: '10px 20px', borderRadius: '8px' }}
                onClick={(e) => {
                  e.preventDefault();
                  alert('KeyPer Security Whitepaper v2026 loaded: Zero-Knowledge Architecture verified.');
                }}
              >
                Read Security Whitepaper
                <ArrowUpRight size={15} />
              </a>
            </div>

            {/* Right Tech Specs Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {specs.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '14px',
                    padding: '18px',
                  }}
                >
                  <h4 style={{ color: '#c084fc', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                    {item.title}
                  </h4>
                  <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>
                    {item.detail}
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.4 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
