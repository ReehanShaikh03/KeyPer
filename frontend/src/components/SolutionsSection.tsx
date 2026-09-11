import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, ShieldCheck, Check, Key, Zap, Lock, Database, ArrowRight } from 'lucide-react';

export const SolutionsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'individuals' | 'teams'>('individuals');

  return (
    <section id="for-whom" style={{ padding: '100px 24px', position: 'relative', zIndex: 2 }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="badge-pill" style={{ marginBottom: '16px', background: 'rgba(56, 189, 248, 0.1)', borderColor: 'rgba(56, 189, 248, 0.25)' }}>
            <Users size={14} style={{ color: '#38bdf8' }} />
            <span>Tailored Security</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Who is KeyPer built for?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginTop: '12px' }}>
            Designed for privacy-minded individuals and security-first engineering teams.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              padding: '6px',
              backdropFilter: 'blur(12px)',
            }}
          >
            <button
              onClick={() => setActiveTab('individuals')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 28px',
                borderRadius: '9999px',
                border: 'none',
                background: activeTab === 'individuals' ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'transparent',
                color: activeTab === 'individuals' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.94rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: activeTab === 'individuals' ? '0 4px 15px rgba(168, 85, 247, 0.4)' : 'none',
              }}
            >
              <User size={18} />
              For Individuals
            </button>

            <button
              onClick={() => setActiveTab('teams')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 28px',
                borderRadius: '9999px',
                border: 'none',
                background: activeTab === 'teams' ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'transparent',
                color: activeTab === 'teams' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.94rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: activeTab === 'teams' ? '0 4px 15px rgba(168, 85, 247, 0.4)' : 'none',
              }}
            >
              <Users size={18} />
              For Teams & Businesses
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          {activeTab === 'individuals' ? (
            <motion.div
              key="individuals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '32px',
                alignItems: 'center',
              }}
            >
              {/* Left Details */}
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
                  Complete Personal Data Sovereignty
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '28px' }}>
                  Never worry about forgotten credentials, credential stuffing, or server data leaks again. Your vault is fully encrypted locally on your phone and laptop.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {individualFeatures.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ padding: '4px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', marginTop: '2px' }}>
                        <Check size={16} />
                      </div>
                      <div>
                        <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.98rem' }}>{item.title}</h4>
                        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Interactive Mockup Dashboard Card */}
              <div
                className="glass-bento"
                style={{
                  padding: '32px',
                  borderRadius: '24px',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.78rem', color: '#c084fc' }}>Personal Vault v2026</span>
                </div>

                {/* Simulated Vault Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <VaultMockItem name="GitHub Account" email="alex@dev.io" icon="🐙" status="AES-256 Sealed" />
                  <VaultMockItem name="Primary Bank Vault" email="alex@bank.com" icon="🏦" status="AES-256 Sealed" />
                  <VaultMockItem name="Crypto Seed Phrase" email="Hardware Ledger" icon="💎" status="Encrypted RAM" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="teams"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '32px',
                alignItems: 'center',
              }}
            >
              {/* Left Details */}
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
                  Zero-Trust Enterprise Password & Secrets Management
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '28px' }}>
                  Grant role-based vault permissions, enforce hardware 2FA policies, and maintain cryptographic audit trails across your organization.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {teamFeatures.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ padding: '4px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', marginTop: '2px' }}>
                        <Check size={16} />
                      </div>
                      <div>
                        <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.98rem' }}>{item.title}</h4>
                        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Team Audit Dashboard Mockup Card */}
              <div
                className="glass-bento"
                style={{
                  padding: '32px',
                  borderRadius: '24px',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>Org Security Policy</span>
                  <span className="font-mono" style={{ fontSize: '0.78rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '9999px' }}>SAML SSO Active</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <TeamMockItem user="Engineering Team" role="Admin" access="Dev Vault" status="Zero-Trust Validated" />
                  <TeamMockItem user="DevOps CI/CD Pipeline" role="Service Account" access="AWS API Keys" status="Encrypted Blob" />
                  <TeamMockItem user="Executive Leadership" role="Read Only" access="Legal Vault" status="Hardware 2FA" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

const individualFeatures = [
  { title: 'Zero-Knowledge Master Vault', desc: 'Single master password unlocks everything on your device.' },
  { title: 'Seamless Cross-Device Sync', desc: 'Encrypted blobs sync instantly via Apple iCloud, Google Drive, or KeyPer Sync.' },
  { title: 'Emergency Recovery Kit', desc: '10 offline one-time recovery codes generated at signup.' },
];

const teamFeatures = [
  { title: 'Granular Role-Based Access (RBAC)', desc: 'Control vault access by team, department, or individual role.' },
  { title: 'Okta & Azure AD SAML/SSO', desc: 'Integrate directly with your enterprise identity provider.' },
  { title: 'Cryptographic Audit Logging', desc: 'Immutable logs of all vault access events for compliance.' },
];

const VaultMockItem: React.FC<{ name: string; email: string; icon: string; status: string }> = ({ name, email, icon, status }) => (
  <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      <div>
        <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>{name}</div>
        <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{email}</div>
      </div>
    </div>
    <span className="font-mono" style={{ fontSize: '0.75rem', color: '#c084fc', background: 'rgba(168, 85, 247, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
      {status}
    </span>
  </div>
);

const TeamMockItem: React.FC<{ user: string; role: string; access: string; status: string }> = ({ user, role, access, status }) => (
  <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div>
      <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>{user}</div>
      <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{role} • {access}</div>
    </div>
    <span className="font-mono" style={{ fontSize: '0.75rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
      {status}
    </span>
  </div>
);
