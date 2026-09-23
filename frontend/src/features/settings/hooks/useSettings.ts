import { useState, useEffect, useCallback } from 'react';
import type { UserSettings, SettingsTab } from '../types/settings.types';
import { settingsApi } from '../services/settingsApi';
import { authApi } from '@/features/auth/services/authApi';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('Profile');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsApi.getSettings();
      // Supplement with real backend profile if available
      try {
        const profile = await authApi.getProfile();
        if (profile) {
          data.profile.email = profile.email;
          data.twoFactor.registeredEmail = profile.email;
          data.twoFactor.emailOtpEnabled = profile.isTwoFactorEnabled;
        }
      } catch {
        // Fall back to settingsApi data if profile endpoint is unauthenticated or mock mode
      }
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateTwoFactorToggle = async (enabled: boolean, otpCode?: string) => {
    if (!settings) return;
    setSaving(true);
    try {
      if (enabled) {
        if (otpCode) {
          await authApi.verifyOtp(otpCode);
        } else {
          await authApi.enable2FA();
        }
      } else {
        await authApi.disable2FA();
      }
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              twoFactor: { ...prev.twoFactor, emailOtpEnabled: enabled },
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update 2FA setting');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updatePreferences = async (newPrefs: Partial<UserSettings['preferences']>) => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await settingsApi.updateSettings({
        preferences: { ...settings.preferences, ...newPrefs },
      });
      setSettings(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const revokeOtherSessions = async () => {
    if (!settings) return;
    try {
      await settingsApi.revokeOtherSessions();
      setSettings({
        ...settings,
        sessions: settings.sessions.filter((s) => s.isCurrent),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke sessions');
    }
  };

  const exportBackup = async () => {
    try {
      const blob = await settingsApi.exportEncryptedVault();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KeyPer-Encrypted-Backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  return {
    settings,
    loading,
    saving,
    error,
    activeTab,
    setActiveTab,
    updateTwoFactorToggle,
    updatePreferences,
    revokeOtherSessions,
    exportBackup,
    refreshSettings: fetchSettings,
  };
}
