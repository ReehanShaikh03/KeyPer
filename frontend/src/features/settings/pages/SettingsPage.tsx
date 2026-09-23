import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Palette,
  Database,
  Lock,
  Mail,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Download,
  AlertTriangle,
  Clock,
  Clipboard,
  Save,
  Check,
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { ChangeMasterPasswordModal } from '../components/ChangeMasterPasswordModal';
import { DangerDeleteModal } from '../components/DangerDeleteModal';
import type { SettingsTab, UserSettings } from '../types/settings.types';
import { Input } from '@/shared/components/ui/input';
import { Switch } from '@/shared/components/ui/switch';
import { Button } from '@/shared/components/ui/button';
import { authStorage } from '@/features/auth/services/authApi';

interface SettingsPageProps {
  onLogout?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  const {
    settings,
    loading,
    saving,
    activeTab,
    setActiveTab,
    updateTwoFactorToggle,
    updatePreferences,
    revokeOtherSessions,
    exportBackup,
  } = useSettings();

  const [isChangeMasterOpen, setIsChangeMasterOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  
  // Pending changes state for Save button
  const [pendingPrefs, setPendingPrefs] = useState<UserSettings['preferences'] | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLogOutCurrentDevice = () => {
    authStorage.clearAuth();
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/';
    }
  };

  useEffect(() => {
    if (settings) {
      setPendingPrefs(settings.preferences);
    }
  }, [settings]);

  const hasUnsavedChanges = settings && pendingPrefs && JSON.stringify(settings.preferences) !== JSON.stringify(pendingPrefs);

  const handleSaveChanges = async () => {
    if (!pendingPrefs) return;
    await updatePreferences(pendingPrefs);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (loading || !settings || !pendingPrefs) {
    return (
      <div className="flex-1 bg-[#0F1115] text-slate-100 overflow-y-auto custom-scrollbar p-4 sm:p-6 select-none max-w-4xl mx-auto space-y-6">
        {/* Shimmer Loading Header */}
        <div className="space-y-2 animate-pulse">
          <div className="h-7 w-40 bg-slate-800 rounded-lg" />
          <div className="h-4 w-80 bg-slate-800/60 rounded" />
        </div>
        {/* Shimmer Tabs */}
        <div className="flex gap-2 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 bg-[#14171F] border border-slate-800 rounded-xl" />
          ))}
        </div>
        {/* Shimmer Cards */}
        <div className="space-y-6 animate-pulse">
          <div className="bg-[#1A1D24] border border-slate-800 rounded-2xl h-36 p-5 flex flex-col justify-between">
            <div className="h-4 w-32 bg-slate-800 rounded" />
            <div className="h-9 w-full max-w-md bg-slate-800/60 rounded-xl" />
          </div>
          <div className="bg-[#1A1D24] border border-slate-800 rounded-2xl h-44 p-5 flex flex-col justify-between">
            <div className="h-4 w-48 bg-slate-800 rounded" />
            <div className="h-4 w-72 bg-slate-800/60 rounded" />
            <div className="h-9 w-44 bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
    { key: 'Profile', label: 'Profile', icon: User },
    { key: 'Security', label: 'Security', icon: Shield },
    { key: 'Appearance', label: 'Appearance', icon: Palette },
    { key: 'Data', label: 'Data', icon: Database },
  ];

  return (
    <div className="flex-1 bg-[#0F1115] text-slate-100 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6 max-w-4xl mx-auto select-none">
      {/* Header with Save Changes Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Manage your account credentials, security policies, and vault preferences
          </p>
        </div>

        {/* Save Changes Floating Action (Visible on Appearance and Security tabs only) */}
        {(activeTab === 'Appearance' || activeTab === 'Security') && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {savedSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved!</span>
              </motion.div>
            )}

            <Button
              onClick={handleSaveChanges}
              disabled={!hasUnsavedChanges || saving}
              className={`text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                hasUnsavedChanges
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30'
                  : 'bg-[#181B22] border border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saving ? 'Saving...' : 'Save changes'}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Segmented Pill Tabs */}
      <div className="flex items-center gap-1 bg-[#14171F] p-1 rounded-xl border border-slate-800/80 w-fit">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSettingsTab"
                  className="absolute inset-0 bg-[#262A36] rounded-lg border border-slate-700/60 shadow-xs"
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {/* 1. PROFILE TAB PANEL */}
          {activeTab === 'Profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Account Profile Card */}
              <div className="bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 tracking-wide">Account</h3>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                  <Input
                    type="email"
                    readOnly
                    value={settings.profile.email}
                    className="bg-[#14171F] border-slate-800 text-slate-300 font-mono text-xs max-w-md focus:ring-0 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Change Master Password Card matching screenshot structure */}
              <div className="bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Change master password</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Changing this re-encrypts your vault keys. You&apos;ll stay signed in on this device only.
                  </p>
                </div>

                {passwordChangeSuccess && (
                  <div className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Master password successfully updated! Local vault keys re-encrypted.</span>
                  </div>
                )}

                <div>
                  <Button
                    onClick={() => setIsChangeMasterOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Update master password</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. SECURITY TAB PANEL */}
          {activeTab === 'Security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Email OTP 2FA Card */}
              <div className="bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">Email OTP 2FA (via Brevo)</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Receive a 6-digit verification code via email upon login
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.twoFactor.emailOtpEnabled}
                    onCheckedChange={(checked) => updateTwoFactorToggle(checked)}
                  />
                </div>

                {settings.twoFactor.emailOtpEnabled && (
                  <div className="bg-[#14171F] border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                      <span>Registered Email:</span>
                      <strong className="text-indigo-400">{settings.twoFactor.registeredEmail}</strong>
                    </div>
                    <span className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Active Sessions Card */}
              <div className="bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Active Sessions</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Devices currently authorized to access your vault
                    </p>
                  </div>
                  {settings.sessions.length > 1 && (
                    <button
                      onClick={revokeOtherSessions}
                      className="bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/50 text-rose-400 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out All Other Devices</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {settings.sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="bg-[#14171F] border border-slate-800/60 rounded-xl p-3.5 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-200">{sess.device}</h4>
                          {sess.isCurrent && (
                            <span className="bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 text-[10px] font-mono px-2 py-0.2 rounded-full">
                              Current Device
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {sess.browser} • {sess.ip} ({sess.location})
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-mono">{sess.lastActive}</span>
                        {sess.isCurrent && (
                          <button
                            onClick={handleLogOutCurrentDevice}
                            className="bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                            title="Log out from this device and clear session tokens"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Log Out</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. APPEARANCE & PREFERENCES TAB PANEL */}
          {activeTab === 'Appearance' && (
            <motion.div
              key="appearance"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Vault Auto-Lock Card */}
              <div className="bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">Auto-Lock Timeout</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Automatically lock the vault after a period of inactivity to prevent unauthorized access.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {(['1min', '5min', '15min', '30min', 'never'] as const).map((timeout) => {
                    const isSelected = pendingPrefs.autoLockTimeout === timeout;
                    return (
                      <button
                        key={timeout}
                        onClick={() => setPendingPrefs((prev) => prev ? { ...prev, autoLockTimeout: timeout } : prev)}
                        className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer border ${isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                          : 'bg-[#14171F] border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                      >
                        {timeout === 'never' ? 'Never' : timeout.replace('min', ' min')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clipboard Auto-Clear Card */}
              <div className="bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Clipboard className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">Clipboard Auto-Clear</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Clear copied passwords from system memory after the selected duration.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {(['15s', '30s', '60s', '120s'] as const).map((dur) => {
                    const isSelected = pendingPrefs.clipboardAutoClear === dur;
                    return (
                      <button
                        key={dur}
                        onClick={() => setPendingPrefs((prev) => prev ? { ...prev, clipboardAutoClear: dur } : prev)}
                        className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer border ${isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                          : 'bg-[#14171F] border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                      >
                        {dur}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Password Visibility Auto-Hide Card */}
              <div className="bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">Password Eye Auto-Hide</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Automatically hide visible unmasked passwords after clicking the eye icon.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {(['5s', '10s', '15s', '30s', '60s'] as const).map((dur) => {
                    const isSelected = (pendingPrefs.passwordVisibilityTimeout || '10s') === dur;
                    return (
                      <button
                        key={dur}
                        onClick={() => setPendingPrefs((prev) => prev ? { ...prev, passwordVisibilityTimeout: dur } : prev)}
                        className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer border ${isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                          : 'bg-[#14171F] border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                      >
                        {dur}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. DATA MANAGEMENT & DANGER ZONE TAB PANEL */}
          {activeTab === 'Data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Vault Export Card */}
              <div className="bg-[#1A1D24] border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">Export Encrypted Vault Backup</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Download an AES-256-GCM encrypted JSON payload containing your vault data. Keep this file safe.
                </p>
                <div>
                  <Button
                    onClick={exportBackup}
                    className="bg-[#14171F] border border-slate-700/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Export Backup File (.json)</span>
                  </Button>
                </div>
              </div>

              {/* Danger Zone Card */}
              <div className="bg-[#1A1D24] border border-rose-900/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-rose-400">Danger Zone</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Permanently delete your vault entries, zero-knowledge keys, and user account. This cannot be undone.
                </p>
                <div>
                  <Button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/80 text-rose-300 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Erase Entire Vault & Delete Account</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ChangeMasterPasswordModal
        isOpen={isChangeMasterOpen}
        onClose={() => setIsChangeMasterOpen(false)}
        onSuccess={() => setPasswordChangeSuccess(true)}
      />

      <DangerDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={(txt) => {
          console.log('Account deleted with confirmation:', txt);
        }}
      />
    </div>
  );
};
