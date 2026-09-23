import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  AlertTriangle,
  Copy,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useSecurity } from '../hooks/useSecurity';
import { useVault } from '@/features/vault/hooks/useVault';
import { useVaultCrypto } from '@/features/vault/hooks/useVaultCrypto';
import { vaultApi } from '@/features/vault/services/vaultApi';
import { SecurityTrendChart } from '../components/SecurityTrendChart';
import { SecurityHexagonGraph } from '../components/SecurityHexagonGraph';
import { QuickFixModal } from '../components/QuickFixModal';
import type { VaultSecurityItem } from '../types/security.types';

interface SecurityPageProps {
  onNavigateToVault?: (entryId: string) => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = () => {
  const {
    report,
    loading,
    auditing,
    breachedItems,
    weakItems,
    reusedGroups,
    quickFixItem,
    setQuickFixItem,
    runAudit,
  } = useSecurity();

  const { allEntries: entries, reloadVault } = useVault();
  const { encryptData } = useVaultCrypto();

  const handleSaveFix = async (item: VaultSecurityItem, newPassword: string) => {
    try {
      const matchingEntry = entries.find((e) => e.id === item.id);
      const title = matchingEntry?.title || item.title;
      const category = matchingEntry?.category || 'General';
      const username = matchingEntry?.decryptedData.username || item.username;
      const url = matchingEntry?.decryptedData.url || item.domain || '';
      const notes = matchingEntry?.decryptedData.notes || '';

      const { iv, ciphertext } = await encryptData({ username, password: newPassword, url, notes });
      await vaultApi.update(item.id, { title, category, iv, ciphertext });
      await reloadVault();
      await runAudit();
    } catch (err) {
      console.error('Failed to update vault entry password in DB:', err);
    }
  };

  return (
    <div className="flex-1 bg-[#0F1115] text-slate-100 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-5 sm:space-y-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Security dashboard</h1>
          <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-1.5 font-mono">
            <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Calculated locally across {report?.totalPasswordsScanned || 0} entries — zero-knowledge audit.</span>
          </p>
        </div>

        {/* Animated Audit Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={runAudit}
          disabled={auditing}
          className="w-full sm:w-auto bg-[#1F232D] border border-slate-700/60 hover:bg-[#2A2F3D] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-400 ${auditing ? 'animate-spin' : ''}`} />
          <span>{auditing ? 'Running Security Audit...' : 'Run Security Audit'}</span>
        </motion.button>
      </div>

      {/* Shimmer Loading Skeletons during Audit & Data Loading */}
      {auditing || loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-[#1A1D24] border border-slate-800 rounded-2xl h-[260px] p-6 flex flex-col justify-between">
              <div className="h-4 w-40 bg-slate-800 rounded" />
              <div className="h-20 w-32 bg-slate-800 rounded mt-4" />
              <div className="h-28 w-full bg-slate-800/60 rounded-xl" />
            </div>
            <div className="lg:col-span-6 bg-[#1A1D24] border border-slate-800 rounded-2xl h-[260px] p-6 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin opacity-50" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#1A1D24] border border-slate-800 rounded-2xl p-4 h-24 flex items-center justify-between">
                <div className="w-24 h-16 bg-slate-800 rounded-xl" />
                <div className="space-y-2 flex-1 ml-3">
                  <div className="h-3 w-16 bg-slate-800 rounded" />
                  <div className="h-5 w-24 bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1A1D24] border border-slate-800 rounded-2xl p-5 h-80 space-y-4">
                <div className="h-5 w-36 bg-slate-800 rounded" />
                <div className="h-3 w-48 bg-slate-800/60 rounded" />
                <div className="space-y-3 pt-2">
                  <div className="h-14 bg-slate-800/40 rounded-xl" />
                  <div className="h-14 bg-slate-800/40 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Top Section: Glowing Neon Curve Trend Chart (Image 1) & Hexagonal Radar Graph (Image 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Score Trend Indicator matching Reference Image 1 */}
            <div className="lg:col-span-6 bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-lg">
              <SecurityTrendChart trend={report?.scoreTrend || []} currentScore={report?.overallScore || 82} />
            </div>

            {/* Right Card: 6-Axis Hexagonal Security Radar Graph matching Reference Image 2 */}
            <div className="lg:col-span-6 bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
              <div className="w-full text-xs font-semibold text-slate-400 tracking-wide uppercase mb-3 text-center">
                Cryptographic Radar Audit Matrix
              </div>
              <SecurityHexagonGraph metrics={report?.hexagonMetrics} />
            </div>
          </div>

          {/* Metrics Summary Stat Cards - Styled like Reference Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI Card 1: Total Scanned */}
            <div className="bg-[#0B0D12] border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-4 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
              {/* Left Neon Card Block (Matching Reference Image) */}
              <div className="w-32 h-24 rounded-xl bg-gradient-to-br from-[#BEF264] via-[#A3E635] to-[#84CC16] p-2.5 flex flex-col justify-between shrink-0 shadow-lg text-slate-950 relative overflow-hidden">
                <div className="flex items-center justify-between text-[9px] font-bold tracking-wider uppercase opacity-80">
                  <span>Vault</span>
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-black font-sans tracking-tighter opacity-90 uppercase">
                  TOTAL
                </div>
              </div>
              {/* Right Side Content */}
              <div className="flex-1 pr-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Zero-Knowledge Audit
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5 tracking-tight">
                  {report?.totalPasswordsScanned || 0} Items
                </h3>
                <p className="text-[11px] text-slate-400 leading-snug mt-1 font-mono">
                  Continuous vault scan
                </p>
              </div>
            </div>

            {/* KPI Card 2: Breached Passwords */}
            <div className="bg-[#0B0D12] border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-4 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
              {/* Left Neon Card Block */}
              <div className="w-32 h-24 rounded-xl bg-gradient-to-br from-[#F43F5E] via-[#E11D48] to-[#9F1239] p-2.5 flex flex-col justify-between shrink-0 shadow-lg text-white relative overflow-hidden">
                <div className="flex items-center justify-between text-[9px] font-bold tracking-wider uppercase opacity-90">
                  <span>Audit</span>
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-black font-sans tracking-tighter opacity-95 uppercase">
                  BREACHED
                </div>
              </div>
              {/* Right Side Content */}
              <div className="flex-1 pr-1">
                <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block">
                  Critical Leaks
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5 tracking-tight">
                  {report?.breachedCount || 0} Leaks
                </h3>
                <p className="text-[11px] text-rose-400/80 leading-snug mt-1 font-mono">
                  HIBP anonymity scan
                </p>
              </div>
            </div>

            {/* KPI Card 3: Reused Passwords */}
            <div className="bg-[#0B0D12] border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-4 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
              {/* Left Neon Card Block */}
              <div className="w-32 h-24 rounded-xl bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#B45309] p-2.5 flex flex-col justify-between shrink-0 shadow-lg text-slate-950 relative overflow-hidden">
                <div className="flex items-center justify-between text-[9px] font-bold tracking-wider uppercase opacity-90">
                  <span>Hygiene</span>
                  <Copy className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-black font-sans tracking-tighter opacity-95 uppercase">
                  REUSED
                </div>
              </div>
              {/* Right Side Content */}
              <div className="flex-1 pr-1">
                <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
                  Duplicate Groups
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5 tracking-tight">
                  {report?.reusedCount || 0} Reused
                </h3>
                <p className="text-[11px] text-amber-400/80 leading-snug mt-1 font-mono">
                  Shared password hashes
                </p>
              </div>
            </div>

            {/* KPI Card 4: Weak Passwords */}
            <div className="bg-[#0B0D12] border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-4 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
              {/* Left Neon Card Block */}
              <div className="w-32 h-24 rounded-xl bg-gradient-to-br from-[#6366F1] via-[#4F46E5] to-[#38BDF8] p-2.5 flex flex-col justify-between shrink-0 shadow-lg text-white relative overflow-hidden">
                <div className="flex items-center justify-between text-[9px] font-bold tracking-wider uppercase opacity-90">
                  <span>Entropy</span>
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="text-xl font-black font-sans tracking-tighter opacity-95 uppercase">
                  WEAK
                </div>
              </div>
              {/* Right Side Content */}
              <div className="flex-1 pr-1">
                <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider block">
                  Low Entropy
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5 tracking-tight">
                  {report?.weakCount || 0} Weak
                </h3>
                <p className="text-[11px] text-sky-400/80 leading-snug mt-1 font-mono">
                  Below security bar
                </p>
              </div>
            </div>
          </div>

          {/* Categorized Side-by-Side Issue Dashboards: Breached, Reused, and Weak */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Breached Passwords Section Card */}
            <div className="bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg min-h-[320px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <h3 className="text-base font-bold text-rose-400">Breached passwords</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2.5 py-1 rounded-md">
                    {breachedItems.length} Leaks
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Passwords exposed in known public breaches.
                </p>

                <div className="space-y-2.5 mt-4">
                  {breachedItems.length > 0 ? (
                    breachedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-[#14171F] border border-slate-800/60 rounded-xl hover:border-slate-700 transition-colors"
                      >
                        <div className="truncate mr-2">
                          <h4 className="text-sm font-semibold text-slate-100 truncate">{item.title}</h4>
                          <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                            {item.username}
                          </p>
                        </div>
                        <button
                          onClick={() => setQuickFixItem(item)}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 px-3 py-1.5 rounded-lg hover:bg-indigo-900/60 transition-all shrink-0 cursor-pointer"
                        >
                          Fix now
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-[#14171F]/50 border border-slate-800/40 rounded-xl">
                      <ShieldAlert className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-300">0 Breached Passwords</p>
                      <p className="text-[11px] text-slate-500 mt-1">No credentials found in leak databases.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reused Passwords Section Card */}
            <div className="bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg min-h-[320px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Copy className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-bold text-amber-400">Reused passwords</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-md">
                    {reusedGroups.length} Groups
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Duplicate passwords shared across multiple services.
                </p>

                <div className="space-y-3 mt-4">
                  {reusedGroups.length > 0 ? (
                    reusedGroups.map((group, gIdx) => {
                      const titlesList = group.map((i) => i.title).join(', ');
                      return (
                        <div
                          key={gIdx}
                          className="bg-[#14171F] border border-slate-800/60 rounded-xl p-3.5 space-y-2.5"
                        >
                          <div className="text-xs font-medium text-slate-300">
                            Same password is used in these accounts:
                            <span className="block text-[11px] font-mono text-amber-400/90 mt-1">
                              {titlesList}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/40">
                            {group.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between bg-[#1A1D24] border border-slate-700/60 px-2.5 py-1.5 rounded-lg text-xs"
                              >
                                <div className="truncate mr-2 min-w-0">
                                  <span className="font-semibold text-slate-200 truncate block">{item.title}</span>
                                  <span className="text-[10px] text-slate-400 font-mono truncate block">{item.username}</span>
                                </div>
                                <button
                                  onClick={() => setQuickFixItem(item)}
                                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 px-2.5 py-1 rounded-md hover:bg-indigo-900/60 transition-all shrink-0 cursor-pointer"
                                >
                                  Fix now
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center bg-[#14171F]/50 border border-slate-800/40 rounded-xl">
                      <Copy className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-300">0 Reused Passwords</p>
                      <p className="text-[11px] text-slate-500 mt-1">Every vault item has a unique password.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Weak Passwords Section Card */}
            <div className="bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg min-h-[320px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-sky-400" />
                    <h3 className="text-base font-bold text-sky-400">Weak passwords</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2.5 py-1 rounded-md">
                    {weakItems.length} Items
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Low cryptographic entropy passwords.
                </p>

                <div className="space-y-2.5 mt-4">
                  {weakItems.length > 0 ? (
                    weakItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-[#14171F] border border-slate-800/60 rounded-xl hover:border-slate-700 transition-colors"
                      >
                        <div className="truncate mr-2">
                          <h4 className="text-sm font-semibold text-slate-100 truncate">{item.title}</h4>
                          <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                            {item.username}
                          </p>
                        </div>
                        <button
                          onClick={() => setQuickFixItem(item)}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 px-3 py-1.5 rounded-lg hover:bg-indigo-900/60 transition-all shrink-0 cursor-pointer"
                        >
                          Fix now
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-[#14171F]/50 border border-slate-800/40 rounded-xl">
                      <AlertTriangle className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-300">0 Weak Passwords</p>
                      <p className="text-[11px] text-slate-500 mt-1">All vault passwords meet high entropy standards.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Inline Quick Fix Modal linked with Database */}
      <QuickFixModal
        item={quickFixItem}
        onClose={() => setQuickFixItem(null)}
        onSaveFix={async (_id, newPassword) => {
          if (quickFixItem) {
            await handleSaveFix(quickFixItem, newPassword);
          }
        }}
      />
    </div>
  );
};

