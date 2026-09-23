import type { UserSettings } from '../types/settings.types';

export const mockUserSettings: UserSettings = {
  profile: {
    displayName: 'Reehan Shaikh',
    email: 'reehan@securevault.app',
  },
  twoFactor: {
    emailOtpEnabled: true,
    registeredEmail: 'reehan@securevault.app',
    isVerified: true,
    resendCooldownSeconds: 0,
  },
  sessions: [
    {
      id: 'sess-1',
      device: 'Windows 11 Workstation',
      browser: 'Chrome 128.0',
      ip: '192.168.1.42',
      location: 'Mumbai, IN',
      lastActive: 'Active now',
      isCurrent: true,
    },
    {
      id: 'sess-2',
      device: 'MacBook Pro 16"',
      browser: 'Safari 17.4',
      ip: '103.42.18.10',
      location: 'Bengaluru, IN',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
    {
      id: 'sess-3',
      device: 'iPhone 15 Pro',
      browser: 'KeyPer iOS Client 2.1',
      ip: '157.33.91.4',
      location: 'Mumbai, IN',
      lastActive: '1 day ago',
      isCurrent: false,
    },
  ],
  preferences: {
    autoLockTimeout: '15min',
    clipboardAutoClear: '30s',
    passwordVisibilityTimeout: '10s',
    theme: 'dark',
  },
};
