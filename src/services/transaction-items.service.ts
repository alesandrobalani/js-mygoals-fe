import api from './api';
import type { TransactionItem } from '../types';

export const transactionItemsService = {
  async getAll(): Promise<TransactionItem[]> {
    const { data } = await api.get<TransactionItem[]>('/transaction-items');
    return data;
  },
};
