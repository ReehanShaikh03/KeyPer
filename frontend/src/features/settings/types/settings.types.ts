export interface UserProfile {
  displayName: string;
  email: string;
}

export interface TwoFactorState {
  emailOtpEnabled: boolean;
  registeredEmail: string;
  isVerified: boolean;
  resendCooldownSeconds: number;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface VaultPreferences {
  autoLockTimeout: '1min' | '5min' | '15min' | '30min' | 'never';
  clipboardAutoClear: '15s' | '30s' | '60s' | '120s';
  passwordVisibilityTimeout?: '5s' | '10s' | '15s' | '30s' | '60s';
  theme: 'dark' | 'light' | 'system';
}

export interface UserSettings {
  profile: UserProfile;
  twoFactor: TwoFactorState;
  sessions: UserSession[];
  preferences: VaultPreferences;
}

export type SettingsTab = 'Profile' | 'Security' | 'Appearance' | 'Data';
