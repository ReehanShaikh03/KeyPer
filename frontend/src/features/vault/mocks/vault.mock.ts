import type { VaultEntryResponseDto } from '../types/vault.types';

// Raw mock encrypted fixture data matching NestJS backend format
export const MOCK_VAULT_ENTRIES: VaultEntryResponseDto[] = [
  {
    id: 'e1a39d48-8f12-[#1]',
    userId: 'user-77-uuid',
    iv: 'd3M5Zmh4OWszbWw=',
    // Encrypted JSON payload for Netflix
    ciphertext: 'MOCK_ENC_{"username":"family@securevault.app","password":"SuperSecretP@ssw0rd!","url":"netflix.com","notes":"Shared with family profile."}',
    category: 'Personal',
    title: 'Netflix',
    createdAt: '2025-08-09T10:00:00.000Z',
    updatedAt: '2026-05-16T14:30:00.000Z',
  },
  {
    id: 'e2b40e59-9a23-[#2]',
    userId: 'user-77-uuid',
    iv: 'YTlia2w0bTlwcXJz',
    ciphertext: 'MOCK_ENC_{"username":"dev-lead@github.com","password":"ghp_994817265437812934","url":"github.com","notes":"SSH Key & Personal Access Token included."}',
    category: 'Work',
    title: 'GitHub',
    createdAt: '2025-09-01T08:15:00.000Z',
    updatedAt: '2026-09-13T11:20:00.000Z',
  },
  {
    id: 'e3c51f60-0b34-[#3]',
    userId: 'user-77-uuid',
    iv: 'Y2Q1ZTY3ODkxMTFh',
    ciphertext: 'MOCK_ENC_{"username":"crypto_trader@coinbase.io","password":"2FA_Backup_Seed_Phrase_991823","url":"coinbase.com","notes":"Hardware key 2FA required."}',
    category: 'Finance',
    title: 'Coinbase',
    createdAt: '2025-09-10T12:00:00.000Z',
    updatedAt: '2026-09-12T09:45:00.000Z',
  },
  {
    id: 'e4d62a71-1c45-[#4]',
    userId: 'user-77-uuid',
    iv: 'YjMzNDU2Nzg5MGFi',
    ciphertext: 'MOCK_ENC_{"username":"music_lover@spotify.com","password":"AudioMaster2026!","url":"spotify.com","notes":"Family Plan account manager."}',
    category: 'Personal',
    title: 'Spotify',
    createdAt: '2025-10-05T16:20:00.000Z',
    updatedAt: '2026-09-10T18:00:00.000Z',
  },
  {
    id: 'e5e73b82-2d56-[#5]',
    userId: 'user-77-uuid',
    iv: 'Yzk4NzY1NDMyMTAx',
    ciphertext: 'MOCK_ENC_{"username":"designer@figma.com","password":"123456","url":"figma.com","notes":"Warning: Weak password detected. Upgrade needed.","hasAlert":true}',
    category: 'Work',
    title: 'Figma',
    createdAt: '2025-11-12T19:30:00.000Z',
    updatedAt: '2026-09-09T14:10:00.000Z',
  },
  {
    id: 'e6f84c93-3e67-[#6]',
    userId: 'user-77-uuid',
    iv: 'YWFhYmJiY2NjZGRk',
    ciphertext: 'MOCK_ENC_{"username":"pro_networker@linkedin.com","password":"ConnectAndNetwork#2026","url":"linkedin.com","notes":"Professional social network."}',
    category: 'Social',
    title: 'LinkedIn',
    createdAt: '2025-12-01T11:11:00.000Z',
    updatedAt: '2026-09-07T10:05:00.000Z',
  },
  {
    id: 'e7a95d04-4f78-[#7]',
    userId: 'user-77-uuid',
    iv: 'MTEyMjMzNDQ1NTY2',
    ciphertext: 'MOCK_ENC_{"username":"chase_banking_usr","password":"BankSecureP@ss2026$","url":"chase.com","notes":"Primary checking and savings accounts."}',
    category: 'Finance',
    title: 'Chase Bank',
    createdAt: '2026-01-15T15:00:00.000Z',
    updatedAt: '2026-09-04T16:40:00.000Z',
  },
  {
    id: 'e8b06e15-5a89-[#8]',
    userId: 'user-77-uuid',
    iv: 'OTg3NjU0MzIxMDk4',
    ciphertext: 'MOCK_ENC_{"username":"reddit_user_42","password":"password123","url":"reddit.com","notes":"Breached password detected in recent leak.","hasAlert":true}',
    category: 'Social',
    title: 'Reddit',
    createdAt: '2026-02-20T20:00:00.000Z',
    updatedAt: '2026-08-14T12:00:00.000Z',
  },
];

export function simulateDelay(ms: number = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
