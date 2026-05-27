import api from './api';
import type { Account, CreateAccountPayload } from '../types';

export const accountsService = {
  async getAll(): Promise<Account[]> {
    const { data } = await api.get<Account[]>('/accounts');
    return data;
  },

  async create(payload: CreateAccountPayload): Promise<Account> {
    const { data } = await api.post<Account>('/accounts', payload);
    return data;
  },

};
