import { apiClient } from '@/shared/services/apiClient';
import { AuditAction, type AuditLogEntry, type AuditFilterParams } from '../types/audit.types';
import { MOCK_AUDIT_LOGS, simulateDelay } from '../mocks/audit.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let localMockLogs = [...MOCK_AUDIT_LOGS];

function parseUserAgent(ua?: string | null): { deviceInfo: string; browserInfo: string } {
  if (!ua) return { deviceInfo: 'Unknown Device', browserInfo: 'Browser' };
  
  let deviceInfo = 'Desktop';
  if (ua.includes('Windows')) deviceInfo = 'Windows';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS')) deviceInfo = 'macOS';
  else if (ua.includes('Ubuntu')) deviceInfo = 'Ubuntu';
  else if (ua.includes('Linux')) deviceInfo = 'Linux';
  else if (ua.includes('iPhone') || ua.includes('iPad')) deviceInfo = 'iOS';
  else if (ua.includes('Android')) deviceInfo = 'Android';

  let browserInfo = 'Browser';
  if (ua.includes('Edg/')) browserInfo = 'Edge';
  else if (ua.includes('Chrome/')) browserInfo = 'Chrome';
  else if (ua.includes('Firefox/')) browserInfo = 'Firefox';
  else if (ua.includes('Safari/')) browserInfo = 'Safari';

  return { deviceInfo, browserInfo };
}

export const auditApi = {
  /**
   * GET /audit-logs - Fetch paginated audit logs from backend with filtering
   */
  async getLogs(params: AuditFilterParams = {}): Promise<AuditLogEntry[]> {
    if (USE_MOCK) {
      await simulateDelay(350);
      return this.filterMockLogs(params);
    }

    try {
      const queryParams: Record<string, string> = {};
      if (params.page) queryParams.page = params.page.toString();
      if (params.limit) queryParams.limit = params.limit.toString();
      if (params.action && params.action !== 'ALL') {
        if (params.action === 'SIGN_IN') queryParams.action = 'LOGIN_SUCCESS';
        else if (params.action === 'FAILED_SIGN_IN') queryParams.action = 'LOGIN_FAILURE';
        else if (Object.values(AuditAction).includes(params.action as any)) queryParams.action = params.action;
      }

      const response = await apiClient.get<any>('/audit-logs', { params: queryParams });
      
      // Unwrap NestJS pagination envelope: { data: AuditLog[], total, page, lastPage }
      const items: any[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      // Transform NestJS backend response into UI AuditLogEntry contracts
      return items.map((item, idx) => {
        const actionStr = item.action || AuditAction.LOGIN_SUCCESS;
        let title = 'Security action performed';
        let categoryLabel = 'Security';
        let status: 'success' | 'failure' | 'warning' = 'success';

        switch (actionStr) {
          case AuditAction.LOGIN_SUCCESS:
            title = 'Successful Sign-in';
            categoryLabel = 'Sign-in';
            status = 'success';
            break;
          case AuditAction.LOGIN_FAILURE:
            title = 'Failed Master Password Attempt';
            categoryLabel = 'Failed Sign-in';
            status = 'failure';
            break;
          case AuditAction.LOGOUT:
            title = 'User Logged Out';
            categoryLabel = 'Session';
            status = 'warning';
            break;
          case AuditAction.VAULT_CREATE:
            title = `Vault Entry Created ${item.metadata?.title ? `(${item.metadata.title})` : ''}`;
            categoryLabel = 'Vault Modification';
            status = 'success';
            break;
          case AuditAction.VAULT_UPDATE:
            title = `Vault Entry Updated ${item.metadata?.updatedTitle || item.metadata?.title ? `(${item.metadata?.updatedTitle || item.metadata?.title})` : ''}`;
            categoryLabel = 'Vault Modification';
            status = 'success';
            break;
          case AuditAction.VAULT_DELETE:
            title = `Vault Entry Deleted ${item.metadata?.title ? `(${item.metadata.title})` : ''}`;
            categoryLabel = 'Vault Modification';
            status = 'warning';
            break;
          case AuditAction.VAULT_READ:
            title = `Vault Entry Decrypted ${item.metadata?.title ? `(${item.metadata.title})` : ''}`;
            categoryLabel = 'Vault Access';
            status = 'success';
            break;
          case AuditAction.TWO_FACTOR_ENABLE:
            title = '2FA Email OTP Enabled';
            categoryLabel = 'Security Update';
            status = 'success';
            break;
          case AuditAction.TWO_FACTOR_DISABLE:
            title = '2FA Security Disabled';
            categoryLabel = 'Security Update';
            status = 'warning';
            break;
          case AuditAction.PASSWORD_RESET_REQUEST:
            title = 'Password Reset Requested';
            categoryLabel = 'Security Update';
            status = 'warning';
            break;
          case AuditAction.PASSWORD_RESET_SUCCESS:
            title = 'Password Reset Successful';
            categoryLabel = 'Security Update';
            status = 'success';
            break;
          case AuditAction.MASTER_PASSWORD_CHANGE:
            title = 'Master Password Updated';
            categoryLabel = 'Security Update';
            status = 'warning';
            break;
          default:
            title = actionStr.replace(/_/g, ' ');
            categoryLabel = 'General';
            status = 'success';
        }

        const { deviceInfo, browserInfo } = parseUserAgent(item.userAgent);

        return {
          id: item.id || `backend-${idx}`,
          userId: item.userId,
          action: actionStr,
          title,
          categoryLabel,
          deviceInfo,
          browserInfo,
          ipAddress: item.ipAddress || '198.51.100.211',
          userAgent: item.userAgent,
          metadata: item.metadata,
          status,
          createdAt: item.createdAt || new Date().toISOString(),
          indexNum: String(idx + 1).padStart(2, '0'),
        };
      });
    } catch (err) {
      console.error('NestJS /audit-logs endpoint error:', err);
      // Return empty array on real backend failure instead of silent mock replacement
      return [];
    }
  },

  filterMockLogs(params: AuditFilterParams): AuditLogEntry[] {
    let result = [...localMockLogs];

    if (params.action && params.action !== 'ALL') {
      result = result.filter((log) => {
        if (params.action === 'SIGN_IN') return log.action === AuditAction.LOGIN_SUCCESS;
        if (params.action === 'FAILED_SIGN_IN') return log.action === AuditAction.LOGIN_FAILURE;
        if (params.action === 'VAULT_MOD') return (['VAULT_CREATE', 'VAULT_UPDATE', 'VAULT_DELETE'] as string[]).includes(log.action as string);
        if (params.action === 'SECURITY') return (['TWO_FACTOR_ENABLE', 'TWO_FACTOR_DISABLE', 'PASSWORD_RESET_SUCCESS', 'MASTER_PASSWORD_CHANGE'] as string[]).includes(log.action as string);
        return log.action === params.action;
      });
    }

    if (params.fromDate) {
      const fromTimestamp = new Date(params.fromDate).getTime();
      if (!isNaN(fromTimestamp)) {
        result = result.filter((log) => new Date(log.createdAt).getTime() >= fromTimestamp);
      }
    }

    if (params.toDate) {
      const toTimestamp = new Date(params.toDate).getTime();
      if (!isNaN(toTimestamp)) {
        result = result.filter((log) => new Date(log.createdAt).getTime() <= toTimestamp + 86400000);
      }
    }

    return result;
  },
};

