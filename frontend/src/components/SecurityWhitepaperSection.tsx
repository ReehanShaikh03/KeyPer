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
    <section id="whitepaper" ref={containerRef} className="py-12 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        
        <div
          ref={cardRef}
          className="glass-bento p-5 sm:p-8 md:p-11 rounded-3xl shadow-2xl border border-purple-500/25 bg-gradient-to-br from-[#121622]/90 to-[#0D101A]/95"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Description */}
            <div className="lg:col-span-6 space-y-4">
              <div className="badge-pill-sleek inline-flex items-center gap-2 mb-2">
                <Lock size={13} color="#c084fc" />
                <span>Audited Cryptography</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Built on provable security
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                KeyPer operates under a strict zero-knowledge paradigm. Your master key is never transmitted or logged.
              </p>
              
              <div className="space-y-2.5 pt-1 pb-2">
                <div className="flex items-center gap-2.5 text-slate-300 text-xs sm:text-sm">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>100% Independently audited</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300 text-xs sm:text-sm">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Open-source encryption core</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300 text-xs sm:text-sm">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>SOC2 Type II & ISO 27001 Certified</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="#whitepaper"
                  className="btn-secondary inline-flex items-center gap-2 text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('KeyPer Security Whitepaper v2026 loaded: Zero-Knowledge Architecture verified.');
                  }}
                >
                  <span>Read Security Whitepaper</span>
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>

            {/* Right Tech Specs Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
              {specs.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.03] border border-white/[0.08] hover:border-purple-500/30 rounded-2xl p-4 sm:p-4.5 transition-all duration-200 min-w-0"
                >
                  <h4 className="text-purple-400 text-[11px] sm:text-xs uppercase font-bold tracking-wider mb-1 truncate">
                    {item.title}
                  </h4>
                  <div className="text-white font-bold text-sm sm:text-base mb-1.5 leading-snug break-words">
                    {item.detail}
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
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
