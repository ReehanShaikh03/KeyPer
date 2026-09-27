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
      {/* Curved Hump Floating Glass Navigation Bar (Visible on mobile screens < md) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden w-[calc(100%-2rem)] max-w-[360px] h-[58px] select-none">
        {/* Backdrop & SVG Background Shell with Center Upward Hump */}
        <div className="absolute inset-0 backdrop-blur-xl drop-shadow-[0_16px_36px_rgba(0,0,0,0.8)]">
          <svg
            className="w-full h-full pointer-events-none"
            viewBox="0 0 360 58"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="navHumpBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#181924" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#101119" stopOpacity="0.98" />
              </linearGradient>
              <linearGradient id="navHumpBorder" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="50%" stopColor="rgba(168,85,247,0.4)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
              </linearGradient>
            </defs>
            <path
              d="M 26,10 L 134,10 C 152,10 162,0 180,0 C 198,0 208,10 226,10 L 334,10 A 24,24 0 0,1 358,34 A 24,24 0 0,1 334,58 L 26,58 A 24,24 0 0,1 2,34 A 24,24 0 0,1 26,10 Z"
              fill="url(#navHumpBg)"
              stroke="url(#navHumpBorder)"
              strokeWidth="1.2"
            />
          </svg>
        </div>

        {/* Center Action '+' Button Vertically Aligned with Icons */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-0.5 z-20">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92, rotate: 90 }}
            onClick={onAddNew}
            className="w-[42px] h-[42px] rounded-full bg-[#161724] border-2 border-[#8B5CF6] text-white flex items-center justify-center cursor-pointer shadow-[0_0_18px_rgba(139,92,246,0.65)] group transition-transform"
            title="Add New Entry"
            aria-label="Add new entry"
          >
            <Plus className="w-5 h-5 text-white stroke-[2.2] transition-transform group-active:scale-110" />
          </motion.button>
        </div>

        {/* 5-Column Navigation Grid matching user sections */}
        <nav
          aria-label="Mobile Navigation"
          className="relative z-10 grid grid-cols-5 h-full pt-1 items-center text-center"
        >
          {/* 1. Vault Section */}
          <button
            onClick={() => handleNavClick('Vault')}
            className="flex flex-col items-center justify-center h-full cursor-pointer group"
          >
            <div className="relative flex flex-col items-center">
              <Shield
                className={`w-5 h-5 transition-all duration-200 ${
                  activeTab === 'Vault' && !isMenuOpen
                    ? 'text-white fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {activeTab === 'Vault' && !isMenuOpen && (
                <motion.div
                  layoutId="mobileActiveDot"
                  className="mt-1 w-1.5 h-1.5 bg-[#8B5CF6] rounded-full shadow-[0_0_8px_#8B5CF6]"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </div>
          </button>

          {/* 2. Generator Section */}
          <button
            onClick={() => handleNavClick('Generator')}
            className="flex flex-col items-center justify-center h-full cursor-pointer group"
          >
            <div className="relative flex flex-col items-center">
              <Key
                className={`w-5 h-5 transition-all duration-200 ${
                  activeTab === 'Generator' && !isMenuOpen
                    ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {activeTab === 'Generator' && !isMenuOpen && (
                <motion.div
                  layoutId="mobileActiveDot"
                  className="mt-1 w-1.5 h-1.5 bg-[#8B5CF6] rounded-full shadow-[0_0_8px_#8B5CF6]"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </div>
          </button>

          {/* 3. Center Spacer for Plus Button */}
          <div className="pointer-events-none" />

          {/* 4. Security Section */}
          <button
            onClick={() => handleNavClick('Security')}
            className="flex flex-col items-center justify-center h-full cursor-pointer group"
          >
            <div className="relative flex flex-col items-center">
              <ShieldCheck
                className={`w-5 h-5 transition-all duration-200 ${
                  activeTab === 'Security' && !isMenuOpen
                    ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {activeTab === 'Security' && !isMenuOpen && (
                <motion.div
                  layoutId="mobileActiveDot"
                  className="mt-1 w-1.5 h-1.5 bg-[#8B5CF6] rounded-full shadow-[0_0_8px_#8B5CF6]"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </div>
          </button>

          {/* 5. Menu Section */}
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex flex-col items-center justify-center h-full cursor-pointer group"
          >
            <div className="relative flex flex-col items-center">
              <Menu
                className={`w-5 h-5 transition-all duration-200 ${
                  isMenuOpen || activeTab === 'Settings' || activeTab === 'Audit log'
                    ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {(isMenuOpen || activeTab === 'Settings' || activeTab === 'Audit log') && (
                <motion.div
                  layoutId="mobileActiveDot"
                  className="mt-1 w-1.5 h-1.5 bg-[#8B5CF6] rounded-full shadow-[0_0_8px_#8B5CF6]"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </div>
          </button>
        </nav>
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
