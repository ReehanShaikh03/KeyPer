import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuth }) => {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#090b10',
        padding: '50px 24px 40px 24px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          {/* Left Copyright & Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={18} color="#ffffff" />
            </div>
            <span style={{ fontSize: '0.92rem', color: '#64748b', fontWeight: 500 }}>
              © 2026 KeyPer
            </span>
          </div>

          {/* Right Links */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '28px',
              fontSize: '0.9rem',
            }}
          >
            <button
              onClick={() => onOpenAuth('signup')}
              style={footerLinkButtonStyle}
            >
              Create a vault
            </button>
            <button
              onClick={() => onOpenAuth('signin')}
              style={footerLinkButtonStyle}
            >
              Sign in
            </button>
            <a href="#how-it-works" style={footerLinkStyle}>
              How encryption works
            </a>
            <a href="#interactive-demo" style={footerLinkStyle}>
              Security whitepaper
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const footerLinkStyle: React.CSSProperties = {
  color: '#94a3b8',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
};

const footerLinkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#94a3b8',
  fontSize: '0.9rem',
  cursor: 'pointer',
  padding: 0,
  transition: 'color 0.2s ease',
};
