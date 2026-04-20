import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { AuthProvider, useAuth } from '../AuthContext';
import { server } from '../../test/mocks/server';

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext', () => {
  afterEach(() => localStorage.clear());

  it('starts with null user when no token is stored', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
  });

  it('loads the current user from token on mount', async () => {
    localStorage.setItem('accessToken', 'mock-access-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user?.email).toBe('admin@mygoals.com');
  });

  it('sets user after successful login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.login({ email: 'admin@mygoals.com', password: 'password123' });
    });

    expect(result.current.user?.email).toBe('admin@mygoals.com');
    expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
  });

  it('clears user after logout', async () => {
    localStorage.setItem('accessToken', 'mock-access-token');

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).not.toBeNull();

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('clears storage when getMe fails', async () => {
    server.use(
      http.get('http://localhost:3000/auth/me', () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );
    localStorage.setItem('accessToken', 'expired-token');

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
  });
});
