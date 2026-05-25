import {
  UserRole,
  TransactionType,
  type User,
  type AuthResponse,
  type TransactionSummary,
  type Transaction,
  type PaginatedTransactions,
  type TransactionCategory,
  type Account,
  type AccountSummary,
  type TransactionItem,
} from '../../types';

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
  incomeSettled: 5000,
  incomeNotSettled: 1000,
  expenseSettled: 2000,
  expenseNotSettled: 500,
};

export const transactionsList: Transaction[] = [
  {
    id: 'tx-1',
    description: 'Salário',
    amount: 5000,
    type: TransactionType.INCOME,
    category: { id: 'cat-1', name: 'Renda' },
    transactionDate: '2026-04-05T00:00:00.000Z',
    dueDate: '2026-04-05T00:00:00.000Z',
    updatedAt: '2026-04-05T00:00:00.000Z',
    settled: true,
  },
  {
    id: 'tx-2',
    description: 'Supermercado',
    amount: 800,
    type: TransactionType.EXPENSE,
    category: { id: 'cat-2', name: 'Alimentação' },
    transactionDate: '2026-04-10T00:00:00.000Z',
    dueDate: '2026-04-10T00:00:00.000Z',
    updatedAt: '2026-04-10T00:00:00.000Z',
    settled: true,
  },
  {
    id: 'tx-3',
    description: 'Conta de luz',
    amount: 200,
    type: TransactionType.EXPENSE,
    category: { id: 'cat-3', name: 'Contas' },
    transactionDate: '2026-04-15T00:00:00.000Z',
    dueDate: '2026-04-17T00:00:00.000Z',
    updatedAt: '2026-04-15T00:00:00.000Z',
    settled: false,
  },
];

export const paginatedTransactions: PaginatedTransactions = {
  data: transactionsList,
  total: 3,
  page: 1,
  limit: 20,
  totalPages: 1,
};

export const categoriesList: TransactionCategory[] = [
  { id: 'cat-1', name: 'Renda' },
  { id: 'cat-2', name: 'Alimentação' },
  { id: 'cat-3', name: 'Contas' },
];

export const accountsList: Account[] = [
  { id: 'acc-1', name: 'Conta Corrente', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'acc-2', name: 'Poupança', updatedAt: '2026-01-01T00:00:00.000Z' },
];

export const transactionItemsList: TransactionItem[] = [
  { id: 'item-1', name: 'Salário mensal', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'item-2', name: 'Compras gerais', updatedAt: '2026-01-01T00:00:00.000Z' },
];

export const createdCategory: TransactionCategory = {
  id: 'cat-new',
  name: 'Nova Cat',
};

export const createdAccount: Account = {
  id: 'acc-new',
  name: 'Nova Conta',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

export const createdTransactionItem: TransactionItem = {
  id: 'item-new',
  name: 'Novo Item',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

export const createdTransaction: Transaction = {
  id: 'tx-new',
  description: 'Nova despesa',
  amount: 150,
  type: TransactionType.EXPENSE,
  category: categoriesList[1],
  transactionDate: '2026-04-20T00:00:00.000Z',
  dueDate: '2026-04-25T00:00:00.000Z',
  updatedAt: '2026-04-20T00:00:00.000Z',
  settled: true,
};

export const transactionWithDetails: Transaction = {
  id: 'tx-1',
  description: 'Salário',
  amount: 5000,
  type: TransactionType.INCOME,
  category: { id: 'cat-1', name: 'Renda' },
  account: { id: 'acc-1', name: 'Conta Corrente' },
  transactionItem: { id: 'item-1', name: 'Salário mensal' },
  transactionDate: '2026-04-05T00:00:00.000Z',
  dueDate: '2026-04-05T00:00:00.000Z',
  updatedAt: '2026-04-05T00:00:00.000Z',
  settled: true,
};

export const updatedTransaction: Transaction = {
  ...transactionWithDetails,
  amount: 5500,
  description: 'Salário atualizado',
  updatedAt: '2026-05-01T00:00:00.000Z',
};

export const accountSummaryList: AccountSummary[] = [
  {
    account: { id: 'acc-1', name: 'Conta Corrente' },
    incomeSettled: 5000,
    incomeNotSettled: 1000,
    expenseSettled: 2000,
    expenseNotSettled: 500,
  },
  {
    account: { id: 'acc-2', name: 'Poupança' },
    incomeSettled: 3000,
    incomeNotSettled: 0,
    expenseSettled: 1000,
    expenseNotSettled: 200,
  },
];
