import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { transactionItemsService } from '../transaction-items.service';
import { transactionItemsList } from '../../test/mocks/fixtures';
import { server } from '../../test/mocks/server';

describe('transactionItemsService', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
  });

  describe('getAll', () => {
    it('returns the list of transaction items', async () => {
      const result = await transactionItemsService.getAll();

      expect(result).toHaveLength(transactionItemsList.length);
      expect(result[0].name).toBe(transactionItemsList[0].name);
    });

    it('throws when the backend returns an unexpected error', async () => {
      server.use(
        http.get('http://localhost:3000/transaction-items', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      await expect(transactionItemsService.getAll()).rejects.toThrow();
    });
  });
});
