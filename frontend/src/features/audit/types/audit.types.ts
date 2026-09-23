export const AuditAction = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  VAULT_CREATE: 'VAULT_CREATE',
  VAULT_UPDATE: 'VAULT_UPDATE',
  VAULT_DELETE: 'VAULT_DELETE',
  VAULT_READ: 'VAULT_READ',
  TWO_FACTOR_ENABLE: 'TWO_FACTOR_ENABLE',
  TWO_FACTOR_DISABLE: 'TWO_FACTOR_DISABLE',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
  MASTER_PASSWORD_CHANGE: 'MASTER_PASSWORD_CHANGE',
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: AuditAction | string;
  title: string;
  categoryLabel: string;
  deviceInfo: string;
  browserInfo: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any> | null;
  status: 'success' | 'failure' | 'warning';
  createdAt: string;
  indexNum?: string;
}

export interface AuditLogResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  lastPage: number;
}

export interface AuditFilterParams {
  action?: string;
  fromDate?: string;
  toDate?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

