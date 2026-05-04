import api from './api';
import type { Account } from '../types';

export const accountsService = {
  async getAll(): Promise<Account[]> {
    const { data } = await api.get<Account[]>('/accounts');
    return data;
  },
};
