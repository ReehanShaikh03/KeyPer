import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ShieldCheck, RefreshCw, FilterX } from 'lucide-react';
import { useAudit } from '../hooks/useAudit';
import { AuditFilterBar } from '../components/AuditFilterBar';
import { AuditItemRow } from '../components/AuditItemRow';

export const AuditPage: React.FC = () => {
  const {
    logs,
    allLogs,
    loading,
    error,
    eventTypeFilter,
    setEventTypeFilter,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    refreshLogs,
  } = useAudit();

  const hasActiveFilters = eventTypeFilter !== 'ALL' || fromDate !== '' || toDate !== '';

  const handleClearFilters = () => {
    setEventTypeFilter('ALL');
    setFromDate('');
    setToDate('');
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex-1 bg-[#0F1115] text-slate-100 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {/* Shimmer Header */}
        <div className="space-y-2 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-slate-800" />
            <div className="h-7 w-48 bg-slate-800 rounded-lg" />
          </div>
          <div className="h-4 w-80 bg-slate-800/60 rounded" />
        </div>

        {/* Shimmer Filter Bar */}
        <div className="bg-[#14171F] border border-slate-800 rounded-2xl h-20 p-4 flex gap-4 items-center animate-pulse">
          <div className="h-10 w-48 bg-slate-800/80 rounded-xl" />
          <div className="h-10 w-40 bg-slate-800/80 rounded-xl" />
          <div className="h-10 w-40 bg-slate-800/80 rounded-xl" />
        </div>

        {/* Shimmer Card Rows matching Settings Page shimmer */}
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-[#14171F] border border-slate-800 rounded-2xl h-20 p-4 flex items-center justify-between gap-4"
            >
              <div className="h-5 w-6 bg-slate-800 rounded shrink-0" />
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 bg-slate-800 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-44 bg-slate-800 rounded" />
                  <div className="h-3 w-28 bg-slate-800/60 rounded" />
                </div>
              </div>
              <div className="h-4 w-32 bg-slate-800/60 rounded hidden md:block" />
              <div className="h-4 w-24 bg-slate-800/60 rounded hidden md:block" />
              <div className="h-4 w-36 bg-slate-800/60 rounded hidden lg:block" />
              <div className="h-7 w-20 bg-slate-800 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0F1115] text-slate-100 overflow-y-auto custom-scrollbar p-6 space-y-6">
      {/* Top Header matching reference layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans flex items-center gap-3">
              Active Audit Trail
              <span className="text-xs font-mono font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
                {allLogs.length} Events Recorded
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Real-time security event log directly synchronized with your database account.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="bg-[#14171F] border border-slate-800 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}

          <button
            onClick={refreshLogs}
            disabled={loading}
            className="bg-[#14171F] border border-slate-800 hover:bg-slate-800/60 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh audit logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Syncing DB...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#14171F] border border-slate-800/80 rounded-2xl p-4 shadow-md">
        <AuditFilterBar
          eventType={eventTypeFilter}
          onEventTypeChange={setEventTypeFilter}
          fromDate={fromDate}
          onFromDateChange={setFromDate}
          toDate={toDate}
          onToDateChange={setToDate}
        />
      </div>

      {/* Table Column Headers */}
      <div className="hidden md:flex items-center justify-between px-5 text-xs font-bold text-slate-400 tracking-wider uppercase font-mono">
        <span className="w-8">NO</span>
        <span className="min-w-[220px] flex-1">SERVICE / EVENT NAME</span>
        <span className="min-w-[160px]">LOCATION / DEVICE</span>
        <span className="min-w-[120px]">IP ADDRESS</span>
        <span className="min-w-[140px]">TIMESTAMP</span>
        <span className="min-w-[110px]">ACTIVITY METRIC</span>
        <span className="min-w-[90px] text-right">STATUS</span>
      </div>

      {/* Audit Item List */}
      <div className="space-y-3">
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/40 rounded-2xl p-4 text-xs text-rose-300 font-mono">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-[#14171F] border border-slate-800 rounded-2xl h-20 p-4 flex items-center justify-between gap-4"
              >
                <div className="h-5 w-6 bg-slate-800 rounded shrink-0" />
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-slate-800 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-44 bg-slate-800 rounded" />
                    <div className="h-3 w-28 bg-slate-800/60 rounded" />
                  </div>
                </div>
                <div className="h-4 w-32 bg-slate-800/60 rounded hidden md:block" />
                <div className="h-4 w-24 bg-slate-800/60 rounded hidden md:block" />
                <div className="h-4 w-36 bg-slate-800/60 rounded hidden lg:block" />
                <div className="h-7 w-20 bg-slate-800 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-[#14171F] border border-slate-800/80 rounded-2xl p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-sans">No audit events match your selected criteria.</p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {logs.map((log, idx) => (
              <AuditItemRow key={log.id} log={log} index={idx} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AuditPage;
