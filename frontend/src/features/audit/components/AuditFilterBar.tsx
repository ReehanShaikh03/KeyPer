import React from 'react';
import { Calendar } from 'lucide-react';
import type { EventTypeFilter } from '../hooks/useAudit';
import { CustomSelect } from '@/shared/components/ui/CustomSelect';

interface AuditFilterBarProps {
  eventType: EventTypeFilter;
  onEventTypeChange: (val: EventTypeFilter) => void;
  fromDate: string;
  onFromDateChange: (val: string) => void;
  toDate: string;
  onToDateChange: (val: string) => void;
}

export const AuditFilterBar: React.FC<AuditFilterBarProps> = ({
  eventType,
  onEventTypeChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
}) => {
  const eventTypeOptions = [
    { value: 'ALL', label: 'All events' },
    { value: 'SIGN_IN', label: 'Successful sign-in' },
    { value: 'FAILED_SIGN_IN', label: 'Failed sign-in' },
    { value: 'VAULT_MOD', label: 'Vault modification' },
    { value: 'SECURITY', label: 'Security update' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Event type dropdown matching screenshot design */}
      <div className="flex flex-col gap-1.5 min-w-[200px]">
        <label className="text-xs font-medium text-slate-300 font-sans">Event type</label>
        <CustomSelect
          value={eventType}
          onChange={(val) => onEventTypeChange(val as EventTypeFilter)}
          options={eventTypeOptions}
          ariaLabel="Filter by Event type"
          className="bg-[#14171F] border-slate-800 text-sm py-2.5"
        />
      </div>

      {/* From Date picker matching dd-mm-yyyy placeholder in screenshot */}
      <div className="flex flex-col gap-1.5 min-w-[170px]">
        <label className="text-xs font-medium text-slate-300 font-sans">From</label>
        <div className="relative flex items-center">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            placeholder="dd-mm-yyyy"
            className="w-full bg-[#14171F] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-slate-700 font-mono"
            aria-label="Filter from date"
          />
          <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
        </div>
      </div>

      {/* To Date picker matching dd-mm-yyyy placeholder in screenshot */}
      <div className="flex flex-col gap-1.5 min-w-[170px]">
        <label className="text-xs font-medium text-slate-300 font-sans">To</label>
        <div className="relative flex items-center">
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            placeholder="dd-mm-yyyy"
            className="w-full bg-[#14171F] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-slate-700 font-mono"
            aria-label="Filter to date"
          />
          <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
