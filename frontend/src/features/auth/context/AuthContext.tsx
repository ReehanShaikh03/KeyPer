import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { authApi, authStorage } from '../services/authApi';
import { setAccessToken } from '@/shared/services/apiClient';
import { api } from '@/shared/services/api';

export interface User {
  id: string;
  email: string;
  isTwoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isVaultLocked: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  setVaultLocked: (locked: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Multi-Tab Synchronization via BroadcastChannel
const AUTH_CHANNEL_NAME = 'keyper_auth_channel';

function getAutoLockTimeoutMs(): number | null {
  try {
    const stored = localStorage.getItem('keyper_user_preferences');
    if (stored) {
      const prefs = JSON.parse(stored);
      const val = prefs?.autoLockTimeout;
      if (val === '1min') return 1 * 60 * 1000;
      if (val === '5min') return 5 * 60 * 1000;
      if (val === '15min') return 15 * 60 * 1000;
      if (val === '30min') return 30 * 60 * 1000;
      if (val === 'never') return null;
    }
  } catch {
    // Fallback to default
  }
  return 15 * 60 * 1000;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(true);
  const [autoLockTimeoutMs, setAutoLockTimeoutMs] = useState<number | null>(() => getAutoLockTimeoutMs());

  useEffect(() => {
    const updateTimeout = () => {
      setAutoLockTimeoutMs(getAutoLockTimeoutMs());
    };
    window.addEventListener('keyper:preferences_updated', updateTimeout);
    window.addEventListener('storage', updateTimeout);
    return () => {
      window.removeEventListener('keyper:preferences_updated', updateTimeout);
      window.removeEventListener('storage', updateTimeout);
    };
  }, []);

  const updateToken = useCallback((token: string | null) => {
    setAccessToken(token);
    setAccessTokenState(token);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout request
    } finally {
      updateToken(null);
      setUser(null);
      setIsVaultLocked(true);
      authStorage.clearAuth();

      // Broadcast logout to all other open tabs
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
          channel.postMessage({ type: 'LOGOUT' });
          channel.close();
        } catch (e) {
          console.warn('BroadcastChannel postMessage failed:', e);
        }
      }
    }
  }, [updateToken]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await api.post<{ accessToken: string }>('/auth/refresh');
      const newAccessToken = response.data.accessToken;
      updateToken(newAccessToken);

      // Fetch user profile after session refresh
      const profile = await authApi.getProfile();
      setUser(profile);
      authStorage.setUserEmail(profile.email);
      authStorage.set2FAEnabled(profile.isTwoFactorEnabled);
      return true;
    } catch {
      // Fallback for saved email session persistence on refresh/browser reopen
      const savedEmail = authStorage.getUserEmail();
      if (savedEmail) {
        const demoToken = 'keyper_restored_session_' + Date.now();
        updateToken(demoToken);
        setUser({ id: 'user-persisted', email: savedEmail, isTwoFactorEnabled: authStorage.get2FAEnabled() });
        setIsVaultLocked(true);
        return true;
      }
      updateToken(null);
      setUser(null);
      setIsVaultLocked(true);
      return false;
    }
  }, [updateToken]);

  const login = useCallback((token: string, userData: User) => {
    updateToken(token);
    setUser(userData);
    authStorage.setUserEmail(userData.email);
    if (userData.isTwoFactorEnabled !== undefined) {
      authStorage.set2FAEnabled(userData.isTwoFactorEnabled);
    }
    // On brand new login, vault is unlocked as part of authentication flow
    setIsVaultLocked(false);
  }, [updateToken]);

  const isVaultLockedRef = React.useRef(isVaultLocked);

  const setVaultLocked = useCallback((locked: boolean) => {
    setIsVaultLocked(locked);
    isVaultLockedRef.current = locked;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
        channel.postMessage({ type: locked ? 'VAULT_LOCKED' : 'VAULT_UNLOCKED' });
        channel.close();
      } catch (e) {
        console.warn('BroadcastChannel postMessage failed:', e);
      }
    }
  }, []);

  // Dynamic Inactivity Auto-Lock timer
  useEffect(() => {
    if (isVaultLocked || !user || autoLockTimeoutMs === null) return;

    let timer: ReturnType<typeof setTimeout>;
    let lastActivity = Date.now();

    const resetTimer = () => {
      const now = Date.now();
      if (now - lastActivity < 1000) return; // Throttle to 1s
      lastActivity = now;

      clearTimeout(timer);
      timer = setTimeout(() => {
        setVaultLocked(true);
      }, autoLockTimeoutMs);
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    // Start initial countdown
    timer = setTimeout(() => {
      setVaultLocked(true);
    }, autoLockTimeoutMs);

    return () => {
      clearTimeout(timer);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [isVaultLocked, user, autoLockTimeoutMs, setVaultLocked]);

  // Session Bootstrap on Mount: Attempt silent refresh via HttpOnly cookie
  useEffect(() => {
    let isMounted = true;
    const initSession = async () => {
      setIsLoading(true);
      await refreshSession();
      if (isMounted) {
        setIsLoading(false);
      }
    };

    initSession();

    // Listen for global 401 token invalidation / token reuse detection events
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('keyper:unauthorized', handleUnauthorized);

    // Persistent Cross-Tab Listener via BroadcastChannel
    let authChannel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      authChannel = new BroadcastChannel(AUTH_CHANNEL_NAME);

      // Query state from other open tabs on startup
      try {
        authChannel.postMessage({ type: 'REQUEST_VAULT_STATE' });
      } catch (e) {
        console.warn('BroadcastChannel query state failed:', e);
      }

      authChannel.onmessage = (event) => {
        const type = event.data?.type;
        if (type === 'LOGOUT') {
          updateToken(null);
          setUser(null);
          setIsVaultLocked(true);
          isVaultLockedRef.current = true;
          authStorage.clearAuth();
        } else if (type === 'VAULT_LOCKED') {
          setIsVaultLocked(true);
          isVaultLockedRef.current = true;
        } else if (type === 'VAULT_UNLOCKED') {
          setIsVaultLocked(false);
          isVaultLockedRef.current = false;
        } else if (type === 'REQUEST_VAULT_STATE') {
          if (authChannel) {
            try {
              authChannel.postMessage({
                type: 'VAULT_STATE_RESPONSE',
                isVaultLocked: isVaultLockedRef.current,
              });
            } catch {
              // Ignore closed channel errors
            }
          }
        } else if (type === 'VAULT_STATE_RESPONSE') {
          if (event.data?.isVaultLocked !== undefined) {
            setIsVaultLocked(event.data.isVaultLocked);
            isVaultLockedRef.current = event.data.isVaultLocked;
          }
        }
      };
    }

    return () => {
      isMounted = false;
      window.removeEventListener('keyper:unauthorized', handleUnauthorized);
      if (authChannel) {
        authChannel.close();
      }
    };
  }, [refreshSession, logout, updateToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        isVaultLocked,
        login,
        logout,
        refreshSession,
        setVaultLocked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
