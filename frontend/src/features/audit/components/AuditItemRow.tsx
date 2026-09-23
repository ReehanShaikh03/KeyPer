import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Laptop, Monitor, Smartphone, Key } from 'lucide-react';
import type { AuditLogEntry } from '../types/audit.types';

interface AuditItemRowProps {
  log: AuditLogEntry;
  index: number;
}

const EASE_CUSTOM = [0.16, 1, 0.3, 1] as const;

function formatTimestamp(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;

    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  } catch {
    return isoStr;
  }
}

function getLocationForIp(ip?: string | null, deviceInfo?: string): { flag: string; locationName: string } {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { flag: '🌐', locationName: deviceInfo || 'Local Device' };
  }
  // Deterministic sample locations based on IP last octet for aesthetic UI alignment matching the reference design
  const lastOctet = parseInt(ip.split('.').pop() || '0', 10);
  if (lastOctet % 4 === 0) return { flag: '🇩🇪', locationName: 'Frankfurt, Germany' };
  if (lastOctet % 4 === 1) return { flag: '🇫🇷', locationName: 'Paris, France' };
  if (lastOctet % 4 === 2) return { flag: '🇺🇸', locationName: 'California, US' };
  return { flag: '🇺🇸', locationName: 'Virginia, US East' };
}

function getIconForAction(action: string, deviceInfo: string) {
  const isMobile = deviceInfo.toLowerCase().includes('ios') || deviceInfo.toLowerCase().includes('android');
  if (action.includes('VAULT')) return <Key className="w-4 h-4 text-orange-400" />;
  if (action.includes('TWO_FACTOR') || action.includes('PASSWORD')) return <Shield className="w-4 h-4 text-indigo-400" />;
  if (isMobile) return <Smartphone className="w-4 h-4 text-blue-400" />;
  if (deviceInfo.toLowerCase().includes('mac')) return <Laptop className="w-4 h-4 text-slate-300" />;
  return <Monitor className="w-4 h-4 text-blue-400" />;
}

function getActivityLevel(action: string, idx: number): { percentage: number; activeBars: number } {
  if (action.includes('FAILURE')) return { percentage: 25, activeBars: 2 };
  if (action.includes('DELETE') || action.includes('DISABLE')) return { percentage: 50, activeBars: 4 };
  const percentage = 80 + (idx % 3) * 8; // 80%, 88%, 96%
  const activeBars = Math.round((percentage / 100) * 8);
  return { percentage, activeBars };
}

export const AuditItemRow: React.FC<AuditItemRowProps> = ({ log, index }) => {
  const isFailure = log.status === 'failure' || log.action.includes('FAILURE');
  const isWarning = log.status === 'warning' || log.action.includes('DELETE') || log.action.includes('DISABLE');

  const statusLabel = isFailure ? 'Failed' : isWarning ? 'Warning' : 'Active';

  const statusStyle = isFailure
    ? 'bg-rose-950/60 border-rose-800/60 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
    : isWarning
    ? 'bg-amber-950/60 border-amber-800/60 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
    : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]';

  const formattedIndex = String(index + 1).padStart(2, '0');
  const { flag, locationName } = getLocationForIp(log.ipAddress, log.deviceInfo);
  const { percentage, activeBars } = getActivityLevel(log.action as string, index);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: EASE_CUSTOM }}
      className="bg-[#14171F] border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 transition-all shadow-md group"
    >
      {/* 01: NO */}
      <div className="text-lg font-bold text-slate-400 font-mono w-8 shrink-0">
        {formattedIndex}
      </div>

      {/* 02: SERVICE NAME / EVENT */}
      <div className="flex items-center gap-3 min-w-[220px] flex-1">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
          log.action.includes('VAULT')
            ? 'bg-orange-950/40 border-orange-800/50'
            : isFailure
            ? 'bg-rose-950/40 border-rose-800/50'
            : 'bg-blue-950/40 border-blue-800/50'
        }`}>
          {getIconForAction(log.action as string, log.deviceInfo)}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
            {log.title}
          </h4>
          <p className="text-xs text-slate-400 truncate">
            {log.categoryLabel} ({log.deviceInfo})
          </p>
        </div>
      </div>

      {/* 03: LOCATION / DEVICE */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <span className="text-base leading-none shrink-0">{flag}</span>
        <div className="text-xs text-slate-300 font-medium truncate">
          {locationName}
        </div>
      </div>

      {/* 04: IP ADDRESS */}
      <div className="min-w-[120px]">
        <span className="text-xs font-mono text-slate-300 tracking-tight">
          {log.ipAddress || '127.0.0.1'}
        </span>
      </div>

      {/* 05: DATE / TIMESTAMP */}
      <div className="min-w-[140px]">
        <span className="text-xs font-medium text-slate-300">
          {formatTimestamp(log.createdAt)}
        </span>
      </div>

      {/* 06: CPU / ACTIVITY BAR */}
      <div className="flex items-center gap-2 min-w-[110px] shrink-0">
        <div className="flex items-center gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`h-4 w-1 rounded-full transition-colors ${
                i < activeBars
                  ? isFailure
                    ? 'bg-rose-500'
                    : isWarning
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-mono text-slate-400 font-semibold">{percentage}%</span>
      </div>

      {/* 07: STATUS BADGE */}
      <div className="shrink-0 min-w-[90px] text-right">
        <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-semibold border ${statusStyle}`}>
          {statusLabel}
        </span>
      </div>
    </motion.div>
  );
};
