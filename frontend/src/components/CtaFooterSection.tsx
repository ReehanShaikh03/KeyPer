import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, CheckCircle2, Sparkles, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CtaFooterSectionProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export const CtaFooterSection: React.FC<CtaFooterSectionProps> = ({ onOpenAuth }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitted(true);
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#a855f7', '#6366f1', '#38bdf8'],
    });
  };

  return (
    <section id="cta" style={{ position: 'relative', zIndex: 2 }}>
      
      {/* Bold CTA Container */}
      <div style={{ padding: '70px 24px 90px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-bento"
            style={{
              padding: '50px 32px',
              borderRadius: '28px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(24, 18, 40, 0.85) 0%, rgba(13, 16, 26, 0.95) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(168, 85, 247, 0.2)',
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="badge-pill-sleek" style={{ marginBottom: '18px' }}>
                <Sparkles size={13} color="#c084fc" />
                <span>Zero-Trust Vault Access</span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  marginBottom: '16px',
                  lineHeight: 1.15,
                }}
              >
                Take control of your digital keys
              </h2>

              <p
                style={{
                  color: '#94a3b8',
                  fontSize: '1rem',
                  maxWidth: '560px',
                  margin: '0 auto 32px auto',
                  lineHeight: 1.5,
                }}
              >
                Create your local encrypted KeyPer vault in under 60 seconds.
              </p>

              {!submitted ? (
                <form
                  onSubmit={handleWaitlist}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    maxWidth: '480px',
                    margin: '0 auto',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                    <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '9999px',
                        padding: '13px 18px 13px 44px',
                        color: '#ffffff',
                        fontSize: '0.94rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      padding: '13px 26px',
                      borderRadius: '9999px',
                      background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                      fontSize: '0.94rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Get Early Access
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '16px',
                    padding: '18px',
                    maxWidth: '440px',
                    margin: '0 auto',
                  }}
                >
                  <CheckCircle2 size={28} color="#10b981" style={{ margin: '0 auto 8px auto' }} />
                  <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>You're on the KeyPer VIP List!</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '4px' }}>
                    Check your inbox at <strong style={{ color: '#ffffff' }}>{email}</strong> for early vault access.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Superconscious Dark Minimalist Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#040508',
          padding: '50px 24px 36px 24px',
        }}
      >
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', marginBottom: '36px' }}>
            
            {/* Col 1 Branding */}
            <div>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '14px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={17} color="#ffffff" />
                </div>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>KeyPer</span>
              </a>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Zero-knowledge password vault. Encrypted locally before cloud sync.
              </p>
            </div>

            {/* Col 2 Product */}
            <div>
              <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem', marginBottom: '12px' }}>Product</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <li><a href="#hero" style={footerLinkStyle}>About KeyPer</a></li>
                <li><a href="#how-it-works" style={footerLinkStyle}>How It Works</a></li>
                <li><a href="#bento-grid" style={footerLinkStyle}>Feature Map</a></li>
                <li><a href="#generator" style={footerLinkStyle}>Password Generator</a></li>
              </ul>
            </div>

            {/* Col 3 Security */}
            <div>
              <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem', marginBottom: '12px' }}>Security</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <li><a href="#whitepaper" style={footerLinkStyle}>Whitepaper</a></li>
                <li><a href="#whitepaper" style={footerLinkStyle}>Security Audit</a></li>
                <li><a href="#privacy" style={footerLinkStyle}>Privacy Guarantee</a></li>
              </ul>
            </div>

            {/* Col 4 Connect */}
            <div>
              <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem', marginBottom: '12px' }}>Community</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <li><a href="https://github.com" target="_blank" rel="noreferrer" style={footerLinkStyle}>GitHub</a></li>
                <li><a href="https://twitter.com" target="_blank" rel="noreferrer" style={footerLinkStyle}>Twitter</a></li>
              </ul>
            </div>

          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '24px 0' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '0.82rem', color: '#64748b' }}>
            <div>© 2026 KeyPer. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <span>AES-256-GCM</span>
              <span>•</span>
              <span>Zero-Server Access</span>
            </div>
          </div>

        </div>
      </footer>

    </section>
  );
};

const footerLinkStyle: React.CSSProperties = {
  color: '#94a3b8',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
};
