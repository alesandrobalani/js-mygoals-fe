import { describe, it, expect, afterEach } from 'vitest';
import { authService } from '../auth.service';
import { adminUser, authResponse } from '../../test/mocks/fixtures';

describe('authService', () => {
  describe('login', () => {
    it('returns auth response on valid credentials', async () => {
      const result = await authService.login({
        email: 'admin@mygoals.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe(authResponse.accessToken);
      expect(result.user.email).toBe(adminUser.email);
    });

    it('throws on invalid credentials', async () => {
      await expect(
        authService.login({ email: 'wrong@email.com', password: 'wrong' }),
      ).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('resolves without error', async () => {
      await expect(authService.logout('mock-refresh-token')).resolves.toBeUndefined();
    });
  });

  describe('getMe', () => {
    it('returns the current user when token is set', async () => {
      localStorage.setItem('accessToken', 'mock-access-token');
      const user = await authService.getMe();
      expect(user.id).toBe(adminUser.id);
    });

    afterEach(() => localStorage.clear());
  });
});
