export interface VaultSecurityItem {
  id: string;
  title: string;
  username: string;
  password?: string;
  domain?: string;
  faviconUrl?: string;
  strengthScore: number; // 0 to 100
  isWeak: boolean;
  isReused: boolean;
  reusedCount?: number;
  reusedWithTitles?: string[];
  isBreached: boolean;
  breachSource?: string;
  breachDate?: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  lastUpdated: string;
}

export interface SecurityScoreTrendPoint {
  label: string; // e.g., '6 mo', '5 mo', etc.
  score: number;
}

export interface HexagonMetric {
  key: string;
  label: string;
  score: number; // 0 - 100
  targetScore: number; // 0 - 100
}

export interface SecurityReport {
  overallScore: number; // 0 - 100
  scoreTrend: SecurityScoreTrendPoint[];
  hexagonMetrics?: HexagonMetric[];
  totalPasswordsScanned: number;
  breachedCount: number;
  reusedCount: number;
  weakCount: number;
  twoFactorCoverageCount: number;
  twoFactorEligibleSites: Array<{
    id: string;
    title: string;
    domain: string;
  }>;
  items: VaultSecurityItem[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: 'Master password updated' | '2FA enabled' | 'Failed login attempt' | 'Vault unlocked' | 'Entry updated' | 'Security audit performed';
  clientContext: {
    ip: string;
    device: string;
    browser: string;
    location?: string;
  };
  severity: 'info' | 'warning' | 'danger';
}

export type SecurityFilterTab = 'all' | 'breached' | 'reused' | 'weak';
