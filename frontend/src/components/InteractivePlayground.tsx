import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, Zap, RefreshCw, Key, Copy, Check } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

export const InteractivePlayground: React.FC = () => {
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
          duration: 0.6,
          stagger: 0.15,
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

  // Encryption Simulator State
  const [rawSecret, setRawSecret] = useState<string>('MyBankPasscode$2026!');
  const [masterPassword, setMasterPassword] = useState<string>('CorrectHorseBatteryStaple');
  const [encryptedBlob, setEncryptedBlob] = useState<string>('');

  // Password Generator State
  const [length, setLength] = useState<number>(18);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Password generator logic
  const generatePassword = () => {
    let charset = '';
    if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';

    let result = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
    setGeneratedPassword(result);
  };

  useEffect(() => {
    generatePassword();
  }, [length, useUpper, useLower, useNumbers, useSymbols]);

  // Simulate client-side AES-256-GCM encryption
  useEffect(() => {
    if (!rawSecret) {
      setEncryptedBlob('');
      return;
    }
    let hash = 0;
    const combined = rawSecret + '::' + masterPassword;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
    const mockIv = 'a3f9e1207b';
    const mockSalt = '99cf2b8a00';
    setEncryptedBlob(`keyper:v1:$aes-256-gcm$salt=${mockSalt}$iv=${mockIv}$ciphertext=${hexHash}e84b912f7c001a9668d2e`);
  }, [rawSecret, masterPassword]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#a855f7', '#6366f1', '#38bdf8'],
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    let score = 0;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;
    if (useUpper) score += 1;
    if (useNumbers) score += 1;
    if (useSymbols) score += 1;

    if (score <= 2) return { label: 'Weak', color: '#ef4444', percent: 25 };
    if (score === 3) return { label: 'Medium', color: '#f59e0b', percent: 50 };
    if (score === 4) return { label: 'Strong', color: '#10b981', percent: 75 };
    return { label: 'Unbreakable', color: '#a855f7', percent: 100 };
  };

  const strength = getStrength();

  return (
    <section id="interactive-demo" ref={containerRef} style={{ padding: '80px 24px', position: 'relative' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* Sleek Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <div className="badge-pill-sleek" style={{ marginBottom: '14px' }}>
            <Zap size={13} color="#c084fc" />
            <span>Interactive Demo</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#ffffff' }}>
            Test security & generate keys live
          </h2>
        </div>

        {/* 2 Card Side-by-Side Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Card 1: Encryption Simulator */}
          <div
            ref={(el) => { cardsRef.current[0] = el; }}
            className="glass-bento"
            style={{
              padding: '32px 28px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf' }}>
                <Lock size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>Encryption Simulator</h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Client-side AES-256-GCM</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Secret Data
                </label>
                <input
                  type="text"
                  value={rawSecret}
                  onChange={(e) => setRawSecret(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Master Password
                </label>
                <input
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                AES-256 Encrypted Blob (Sent to Server)
              </label>
              <div
                className="font-mono"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '0.78rem',
                  color: '#2dd4bf',
                  wordBreak: 'break-all',
                  minHeight: '60px',
                }}
              >
                {encryptedBlob || 'No payload'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px' }}>
              <ShieldCheck size={16} color="#a855f7" />
              <span>Keys stay strictly in browser memory.</span>
            </div>
          </div>

          {/* Card 2: Password Generator (Connected with Navbar #generator) */}
          <div
            id="generator"
            ref={(el) => { cardsRef.current[1] = el; }}
            className="glass-bento"
            style={{
              padding: '32px 28px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                  <Key size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>Password Generator</h3>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cryptographic Entropy</span>
                </div>
              </div>
              <button
                onClick={generatePassword}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
                title="Regenerate"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {/* Generated Output */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#c084fc',
                  wordBreak: 'break-all',
                }}
              >
                {generatedPassword}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? '#10b981' : 'rgba(168, 85, 247, 0.25)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Strength Meter */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Strength</span>
                <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
              </div>
              <div style={{ height: '5px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${strength.percent}%`, background: strength.color, transition: 'all 0.3s ease' }} />
              </div>
            </div>

            {/* Length Control */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
                <span>Length</span>
                <span className="font-mono" style={{ fontWeight: 700, color: '#ffffff' }}>{length} chars</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }}
              />
            </div>

            {/* Toggles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <label style={toggleStyle}>
                <input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} style={checkStyle} />
                A-Z Upper
              </label>
              <label style={toggleStyle}>
                <input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} style={checkStyle} />
                a-z Lower
              </label>
              <label style={toggleStyle}>
                <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} style={checkStyle} />
                0-9 Numbers
              </label>
              <label style={toggleStyle}>
                <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} style={checkStyle} />
                !@# Symbols
              </label>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  padding: '10px 12px',
  color: '#ffffff',
  fontSize: '0.9rem',
  outline: 'none',
};

const toggleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
};

const checkStyle: React.CSSProperties = {
  accentColor: '#a855f7',
  width: '14px',
  height: '14px',
  cursor: 'pointer',
};
