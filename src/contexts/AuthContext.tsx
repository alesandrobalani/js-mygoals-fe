import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, LoginPayload } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe()
      .then((me) => setUser(me))
      .catch(() => localStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  async function login(payload: LoginPayload) {
    const result = await authService.login(payload);
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    setUser(result.user);
  }

  async function logout() {
    const refreshToken = localStorage.getItem('refreshToken') ?? '';
    try {
      await authService.logout(refreshToken);
    } finally {
      localStorage.clear();
      setUser(null);
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
