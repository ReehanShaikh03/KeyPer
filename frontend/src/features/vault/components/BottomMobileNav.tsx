import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Key,
  Plus,
  ShieldCheck,
  Menu,
  X,
  Sliders,
  FileText,
  User as UserIcon,
  LogOut,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';

interface BottomMobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddNew: () => void;
  onLockVault?: () => void;
  onLogout?: () => void;
}

export const BottomMobileNav: React.FC<BottomMobileNavProps> = ({
  activeTab,
  setActiveTab,
  onAddNew,
  onLockVault,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, setVaultLocked } = useAuth();

  const handleNavClick = (tabName: string) => {
    setActiveTab(tabName);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      await logout();
    }
  };

  const handleLock = () => {
    setIsMenuOpen(false);
    if (onLockVault) {
      onLockVault();
    } else {
      setVaultLocked(true);
    }
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <>
      {/* Glassmorphic Navigation Bar (Visible on mobile screens < md) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden w-[calc(100%-2rem)] max-w-[360px] h-[64px] bg-[#14171F]/70 backdrop-blur-lg border border-white/10 rounded-[20px] flex items-center shadow-[0_16px_36px_rgba(0,0,0,0.8)] overflow-hidden select-none px-2">
        
        {/* 1. Vault Section */}
        <button
          onClick={() => handleNavClick('Vault')}
          className="relative flex-1 h-full flex flex-col items-center justify-center cursor-pointer group"
        >
          {activeTab === 'Vault' && !isMenuOpen && (
            <motion.div
              layoutId="mobileActiveTop"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[4px] bg-white rounded-b-md shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            />
          )}
          <Shield
            className={`w-6 h-6 relative z-10 transition-colors ${
              activeTab === 'Vault' && !isMenuOpen
                ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                : 'text-slate-500 group-hover:text-slate-300'
            }`}
          />
        </button>

        {/* 2. Generator Section */}
        <button
          onClick={() => handleNavClick('Generator')}
          className="relative flex-1 h-full flex flex-col items-center justify-center cursor-pointer group"
        >
          {activeTab === 'Generator' && !isMenuOpen && (
            <motion.div
              layoutId="mobileActiveTop"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[4px] bg-white rounded-b-md shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            />
          )}
          <Key
            className={`w-6 h-6 relative z-10 transition-colors ${
              activeTab === 'Generator' && !isMenuOpen
                ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                : 'text-slate-500 group-hover:text-slate-300'
            }`}
          />
        </button>

        {/* 3. Add New Section */}
        <button
          onClick={onAddNew}
          className="relative flex-1 h-full flex flex-col items-center justify-center cursor-pointer group"
        >
          <Plus className="w-7 h-7 relative z-10 transition-colors text-slate-400 group-hover:text-slate-200 group-active:scale-95" />
        </button>

        {/* 4. Security Section */}
        <button
          onClick={() => handleNavClick('Security')}
          className="relative flex-1 h-full flex flex-col items-center justify-center cursor-pointer group"
        >
          {activeTab === 'Security' && !isMenuOpen && (
            <motion.div
              layoutId="mobileActiveTop"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[4px] bg-white rounded-b-md shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            />
          )}
          <ShieldCheck
            className={`w-6 h-6 relative z-10 transition-colors ${
              activeTab === 'Security' && !isMenuOpen
                ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                : 'text-slate-500 group-hover:text-slate-300'
            }`}
          />
        </button>

        {/* 5. Menu Section */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="relative flex-1 h-full flex flex-col items-center justify-center cursor-pointer group"
        >
          {(isMenuOpen || activeTab === 'Settings' || activeTab === 'Audit log') && (
            <motion.div
              layoutId="mobileActiveTop"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[4px] bg-white rounded-b-md shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            />
          )}
          <Menu
            className={`w-6 h-6 relative z-10 transition-colors ${
              isMenuOpen || activeTab === 'Settings' || activeTab === 'Audit log'
                ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                : 'text-slate-500 group-hover:text-slate-300'
            }`}
          />
        </button>
      </div>

      {/* Slide-Up Mobile Menu Drawer & Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Dim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs md:hidden"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#14171F] border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Drag Handle & Header */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-10 h-1 bg-slate-700/80 rounded-full mb-3" />
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Menu & Account
                  </span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* User Profile Card */}
              <div className="bg-[#1A1D27] border border-slate-800 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.email || 'Logged In User'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Zero-Knowledge Active
                      </span>
                      {user?.isTwoFactorEnabled && (
                        <span className="text-[10px] bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                          2FA ON
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 pl-2">
                  <UserIcon className="w-5 h-5 text-slate-500" />
                </div>
              </div>

              {/* Navigation Items in Menu */}
              <div className="space-y-2 mb-4">
                {/* Settings */}
                <button
                  onClick={() => handleNavClick('Settings')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${activeTab === 'Settings'
                      ? 'bg-[#232734] border-indigo-500/50 text-white'
                      : 'bg-[#181B24] border-slate-800/80 text-slate-300 hover:bg-[#1E222D]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">Settings</div>
                      <div className="text-xs text-slate-500">Security, auto-lock & vault options</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* Audit Log */}
                <button
                  onClick={() => handleNavClick('Audit log')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${activeTab === 'Audit log'
                      ? 'bg-[#232734] border-indigo-500/50 text-white'
                      : 'bg-[#181B24] border-slate-800/80 text-slate-300 hover:bg-[#1E222D]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">Audit Log</div>
                      <div className="text-xs text-slate-500">View activity & event history</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Quick Actions (Lock Vault & Logout) */}
              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  onClick={handleLock}
                  className="flex-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Lock Vault</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-400 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
