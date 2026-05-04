import api from './api';
import type { TransactionCategory } from '../types';

export const categoriesService = {
  async getAll(): Promise<TransactionCategory[]> {
    const { data } = await api.get<TransactionCategory[]>('/categories');
    return data;
  },

  async create(payload: { name: string; description?: string }): Promise<TransactionCategory> {
    const { data } = await api.post<TransactionCategory>('/categories', payload);
    return data;
  },
};
