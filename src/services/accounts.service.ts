import api from './api';
import type { Account, AccountSummary, CreateAccountPayload } from '../types';

export const accountsService = {
  async getAll(): Promise<Account[]> {
    const { data } = await api.get<Account[]>('/accounts');
    return data;
  },

  async create(payload: CreateAccountPayload): Promise<Account> {
    const { data } = await api.post<Account>('/accounts', payload);
    return data;
  },

  async getSummary(endDate: string): Promise<AccountSummary[]> {
    const { data } = await api.get<AccountSummary[]>('/accounts/summary', {
      params: { endDate },
    });
    return data;
  },
};
