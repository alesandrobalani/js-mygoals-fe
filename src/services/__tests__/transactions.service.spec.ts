import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { transactionsService } from '../transactions.service';
import { paginatedTransactions, transactionSummary } from '../../test/mocks/fixtures';
import { server } from '../../test/mocks/server';

describe('transactionsService', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
  });

  describe('getSummary', () => {
    it('returns the transaction summary for the given period', async () => {
      const result = await transactionsService.getSummary('2026-04-01', '2026-04-30');

      expect(result.income).toBe(transactionSummary.income);
      expect(result.expense).toBe(transactionSummary.expense);
    });

    it('throws when the backend returns an unexpected error', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/summary', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      await expect(
        transactionsService.getSummary('2026-04-01', '2026-04-30'),
      ).rejects.toThrow();
    });
  });

  describe('search', () => {
    it('returns paginated transactions for the given period', async () => {
      const result = await transactionsService.search('2026-04-01', '2026-04-30', 1, 20);

      expect(result.data).toHaveLength(paginatedTransactions.data.length);
      expect(result.total).toBe(paginatedTransactions.total);
      expect(result.page).toBe(paginatedTransactions.page);
      expect(result.totalPages).toBe(paginatedTransactions.totalPages);
    });

    it('throws when the backend returns an unexpected error', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/search', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      await expect(
        transactionsService.search('2026-04-01', '2026-04-30', 1, 20),
      ).rejects.toThrow();
    });
  });
});
