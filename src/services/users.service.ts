import api from './api';
import type { AuthResponse, RegisterPayload, User } from '../types';

export const usersService = {
  async list(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async create(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
