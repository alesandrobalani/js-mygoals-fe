import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { accountsService } from '../accounts.service';
import { accountsList, createdAccount } from '../../test/mocks/fixtures';
import { server } from '../../test/mocks/server';

describe('accountsService', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
  });

  describe('getAll', () => {
    it('returns the list of accounts', async () => {
      const result = await accountsService.getAll();

      expect(result).toHaveLength(accountsList.length);
      expect(result[0].name).toBe(accountsList[0].name);
    });

    it('throws when the backend returns an unexpected error', async () => {
      server.use(
        http.get('http://localhost:3000/accounts', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      await expect(accountsService.getAll()).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('returns the created account', async () => {
      const result = await accountsService.create({ name: createdAccount.name });

      expect(result.id).toBe(createdAccount.id);
      expect(result.name).toBe(createdAccount.name);
      expect(result.updatedAt).toBe(createdAccount.updatedAt);
    });

    it('throws when the backend returns an unexpected error', async () => {
      server.use(
        http.post('http://localhost:3000/accounts', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      await expect(accountsService.create({ name: 'Lazer', description: 'Lazer description' })).rejects.toThrow();
    });
  });
  
});
