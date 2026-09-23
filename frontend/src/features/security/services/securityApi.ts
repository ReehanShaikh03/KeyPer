import { apiClient } from '@/shared/services/apiClient';
import type { SecurityReport, AuditLogEntry } from '../types/security.types';
import { mockSecurityReport, mockAuditLogs } from '../mocks/security.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const securityApi = {
  /**
   * GET /security/overview - Fetch security risk overview metrics
   */
  async getSecurityReport(): Promise<SecurityReport> {
    if (USE_MOCK) {
      await delay(400);
      return { ...mockSecurityReport };
    }
    try {
      return await apiClient.get<SecurityReport>('/security/overview');
    } catch {
      return { ...mockSecurityReport };
    }
  },

  /**
   * GET /audit-logs - Fetch paginated audit log activity trail
   */
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    if (USE_MOCK) {
      await delay(350);
      return [...mockAuditLogs];
    }
    try {
      const logs = await apiClient.get<AuditLogEntry[]>('/audit-logs');
      return logs;
    } catch {
      return [...mockAuditLogs];
    }
  },

  /**
   * GET /security/breach-check/:prefix - k-Anonymity breach lookup
   */
  async checkBreachPrefix(prefix: string): Promise<{ prefix: string; hashSuffixes: string[] }> {
    if (USE_MOCK) {
      await delay(300);
      return { prefix: prefix.toUpperCase(), hashSuffixes: [] };
    }
    return apiClient.get<{ prefix: string; hashSuffixes: string[] }>(`/security/breach-check/${prefix}`);
  },

  /**
   * Trigger fresh security audit scan
   */
  async runSecurityAudit(): Promise<SecurityReport> {
    if (USE_MOCK) {
      await delay(600);
      return { ...mockSecurityReport };
    }
    try {
      return await apiClient.get<SecurityReport>('/security/overview');
    } catch {
      return { ...mockSecurityReport };
    }
  },
};
