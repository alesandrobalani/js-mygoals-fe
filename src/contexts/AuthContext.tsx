import { useEffect, useState, type ReactNode } from 'react';
import type { User, LoginPayload } from '../types';
import { authService } from '../services/auth.service';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Só há sessão a restaurar se existir token; sem token, já começa carregado.
  const [loading, setLoading] = useState(() => localStorage.getItem('accessToken') !== null);

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) return;
    authService
      .getMe()
      .then((me) => setUser(me))
      .catch(() => localStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  async function login(payload: LoginPayload): Promise<User> {
    const result = await authService.login(payload);
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    setUser(result.user);
    return result.user;
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
