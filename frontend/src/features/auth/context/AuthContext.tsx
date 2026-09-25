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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(true);

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

  const setVaultLocked = useCallback((locked: boolean) => {
    setIsVaultLocked(locked);
  }, []);

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

    // Cross-Tab Logout Listener via BroadcastChannel
    let authChannel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      authChannel = new BroadcastChannel(AUTH_CHANNEL_NAME);
      authChannel.onmessage = (event) => {
        if (event.data?.type === 'LOGOUT') {
          updateToken(null);
          setUser(null);
          setIsVaultLocked(true);
          authStorage.clearAuth();
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
