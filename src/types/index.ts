export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface TransactionSummary {
  incomeSettled: number;
  incomeNotSettled: number;
  expenseSettled: number;
  expenseNotSettled: number;
}

export const TransactionType = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export interface TransactionCategory {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  description?: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  transactionDate: string;
  updatedAt: string;
  dueDate: string;
  settled: boolean;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTransactionPayload {
  description?: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  transactionItemId: string;
  accountId: string;
  transactionDate: string;
  dueDate?: string;
  settled?: boolean;
}

export interface Account {
  id: string;
  name: string;
  updatedAt: string;
}

export interface CreateAccountPayload {
  description?: string;
  name: string;  
}

export interface TransactionItem {
  id: string;
  name: string;
  updatedAt: string;
}

