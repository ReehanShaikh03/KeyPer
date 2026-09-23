import React from 'react';
import { Clock, ShieldAlert, Key, Unlock, Activity, ShieldCheck, Terminal } from 'lucide-react';
import type { AuditLogEntry } from '../types/security.types';

interface AuditLogQuickViewProps {
  logs: AuditLogEntry[];
}

export const AuditLogQuickView: React.FC<AuditLogQuickViewProps> = ({ logs }) => {
  const getEventIcon = (eventType: AuditLogEntry['eventType']) => {
    switch (eventType) {
      case 'Failed login attempt':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'Master password updated':
        return <Key className="w-4 h-4 text-amber-400" />;
      case '2FA enabled':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'Vault unlocked':
        return <Unlock className="w-4 h-4 text-indigo-400" />;
      default:
        return <Activity className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">Audit log quick-view</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">Recent 5 security events</span>
      </div>

      <div className="space-y-2.5">
        {logs.slice(0, 5).map((log) => (
          <div
            key={log.id}
            className="p-3 rounded-xl bg-[#14171F] border border-slate-800/60 flex items-start justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#1D212C] border border-slate-700/50 mt-0.5">
                {getEventIcon(log.eventType)}
              </div>
              <div>
                <div className="font-semibold text-slate-200">{log.eventType}</div>
                <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                  {log.clientContext.device} • {log.clientContext.browser}
                  {log.clientContext.location ? ` (${log.clientContext.location})` : ''}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-slate-500 font-mono text-[11px] flex items-center justify-end gap-1">
                <Clock className="w-3 h-3 text-slate-600" />
                <span>{log.timestamp.split(' ')[1]}</span>
              </div>
              <div className="text-slate-600 font-mono text-[10px] mt-0.5">
                {log.clientContext.ip}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
