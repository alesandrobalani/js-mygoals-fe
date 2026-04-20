import { describe, it, expect } from 'vitest';
import { usersService } from '../users.service';
import { usersList, authResponse } from '../../test/mocks/fixtures';
import { UserRole } from '../../types';

describe('usersService', () => {
  describe('list', () => {
    it('returns the list of users', async () => {
      const users = await usersService.list();
      expect(users).toHaveLength(usersList.length);
      expect(users[0].email).toBe(usersList[0].email);
    });
  });

  describe('create', () => {
    it('creates a user and returns auth response', async () => {
      const result = await usersService.create({
        name: 'Novo Usuario',
        email: 'novo@mygoals.com',
        password: 'senha1234',
        role: UserRole.USER,
      });

      expect(result.accessToken).toBe(authResponse.accessToken);
      expect(result.user).toBeDefined();
    });
  });
});
