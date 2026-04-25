import { UserRole, type User, type AuthResponse, type TransactionSummary } from '../../types';

export const adminUser: User = {
  id: 'user-admin-1',
  email: 'admin@mygoals.com',
  name: 'João Admin',
  role: UserRole.ADMIN,
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const regularUser: User = {
  id: 'user-regular-1',
  email: 'user@mygoals.com',
  name: 'Maria',
  role: UserRole.USER,
  updatedAt: '2024-01-02T00:00:00.000Z',
};

export const authResponse: AuthResponse = {
  user: adminUser,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

export const usersList: User[] = [adminUser, regularUser];

export const transactionSummary: TransactionSummary = {
  income: 5000,
  expense: 2000,
};
