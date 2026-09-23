import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AuditLogEntry } from '../types/audit.types';
import { auditApi } from '../services/auditApi';

export type EventTypeFilter = 'ALL' | 'SIGN_IN' | 'FAILED_SIGN_IN' | 'VAULT_MOD' | 'SECURITY';

export function useAudit() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States matching the user's reference image
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeFilter>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await auditApi.getLogs({
        action: eventTypeFilter,
        fromDate,
        toDate,
      });
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [eventTypeFilter, fromDate, toDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Client-side filtering for immediate snappy responsiveness
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // Filter by Event Type
    if (eventTypeFilter !== 'ALL') {
      result = result.filter((log) => {
        if (eventTypeFilter === 'SIGN_IN') return log.action === 'LOGIN_SUCCESS' || log.status === 'success';
        if (eventTypeFilter === 'FAILED_SIGN_IN') return log.action === 'LOGIN_FAILURE' || log.status === 'failure';
        if (eventTypeFilter === 'VAULT_MOD') return log.action.includes('VAULT_');
        if (eventTypeFilter === 'SECURITY') return log.action.includes('TWO_FACTOR_') || log.action.includes('PASSWORD_');
        return true;
      });
    }

    // Filter by From Date (dd-mm-yyyy or yyyy-mm-dd)
    if (fromDate) {
      const fromTs = new Date(fromDate).getTime();
      if (!isNaN(fromTs)) {
        result = result.filter((log) => new Date(log.createdAt).getTime() >= fromTs);
      }
    }

    // Filter by To Date
    if (toDate) {
      const toTs = new Date(toDate).getTime();
      if (!isNaN(toTs)) {
        result = result.filter((log) => new Date(log.createdAt).getTime() <= toTs + 86400000);
      }
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (log) =>
          log.title.toLowerCase().includes(q) ||
          log.categoryLabel.toLowerCase().includes(q) ||
          log.browserInfo.toLowerCase().includes(q) ||
          (log.ipAddress && log.ipAddress.includes(q))
      );
    }

    return result;
  }, [logs, eventTypeFilter, fromDate, toDate, searchQuery]);

  return {
    logs: filteredLogs,
    allLogs: logs,
    loading,
    error,
    eventTypeFilter,
    setEventTypeFilter,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    searchQuery,
    setSearchQuery,
    refreshLogs: fetchLogs,
  };
}
