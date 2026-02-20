'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'tenant' | 'landlord' | 'agent';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setTokens: (
    accessToken: string,
    refreshToken: string,
    user: User,
  ) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'chioma_access_token',
  REFRESH_TOKEN: 'chioma_refresh_token',
  USER: 'chioma_user',
} as const;

const AUTH_COOKIE_NAME = 'chioma_auth_token';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Sets a simple cookie that the Next.js middleware can read to verify
 * an auth session exists. This is a session marker — not the actual JWT.
 */
function setAuthCookie(token: string) {
  document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function removeAuthCookie() {
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: true, // starts true while we hydrate from localStorage
  });

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    try {
      const storedAccessToken = localStorage.getItem(
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
      );
      const storedRefreshToken = localStorage.getItem(
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
      );
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);

      if (storedAccessToken && storedUser) {
        const user: User = JSON.parse(storedUser);
        setState({
          user,
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch {
      // If anything fails (corrupted storage, etc.) just reset
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      removeAuthCookie();
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  /**
   * Directly set tokens & user (useful after registration or
   * when the backend response is already available).
   */
  const setTokens = useCallback(
    (accessToken: string, refreshToken: string, user: User) => {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
      setAuthCookie(accessToken);

      setState({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        loading: false,
      });
    },
    [],
  );

  /**
   * Login with email/password — calls the backend auth endpoint.
   */
  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            error:
              errorData.message || 'Invalid credentials. Please try again.',
          };
        }

        const data = await response.json();
        setTokens(data.accessToken, data.refreshToken, data.user);
        return { success: true };
      } catch {
        return {
          success: false,
          error: 'Network error. Please check your connection.',
        };
      }
    },
    [setTokens],
  );

  /**
   * Logout — clears tokens from storage, cookie, and state.
   */
  const logout = useCallback(async () => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

    // Best-effort call to backend logout
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Silently fail — we still clear local state
      }
    }

    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    removeAuthCookie();

    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
    });

    router.push('/login');
  }, [router]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    setTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
