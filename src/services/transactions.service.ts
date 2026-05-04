import api from './api';
import type { CreateTransactionPayload, PaginatedTransactions, Transaction, TransactionSummary } from '../types';

export const transactionsService = {
  async getSummary(startDate: string, endDate: string): Promise<TransactionSummary> {
    const { data } = await api.get<TransactionSummary>('/transactions/summary', {
      params: { startDate, endDate },
    });
    return data;
  },

  async search(
    startDate: string,
    endDate: string,
    page: number,
    limit: number,
  ): Promise<PaginatedTransactions> {
    const { data } = await api.get<PaginatedTransactions>('/transactions/search', {
      params: { startDate, endDate, page, limit },
    });
    return data;
  },

  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    const { data } = await api.post<Transaction>('/transactions', payload);
    return data;
  },
};
