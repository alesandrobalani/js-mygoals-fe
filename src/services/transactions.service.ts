import api from './api';
import type { TransactionSummary } from '../types';

export const transactionsService = {
  async getSummary(startDate: string, endDate: string): Promise<TransactionSummary> {
    const { data } = await api.get<TransactionSummary>('/transactions/summary', {
      params: { startDate, endDate },
    });
    return data;
  },
};
