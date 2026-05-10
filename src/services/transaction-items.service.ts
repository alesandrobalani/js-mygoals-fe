import api from './api';
import type { TransactionItem } from '../types';

export const transactionItemsService = {
  async getAll(): Promise<TransactionItem[]> {
    const { data } = await api.get<TransactionItem[]>('/transaction-items');
    return data;
  },

  async create(payload: { name: string; description?: string }): Promise<TransactionItem> {
    const { data } = await api.post<TransactionItem>('/transaction-items', payload);
    return data;
  },
};
