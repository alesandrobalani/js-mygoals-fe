import { http, HttpResponse } from 'msw';
import {
  accountsList,
  accountSummaryList,
  adminUser,
  authResponse,
  categoriesList,
  createdAccount,
  createdCategory,
  createdTransaction,
  createdTransactionItem,
  paginatedTransactions,
  strategicViewTransactions,
  transactionItemsList,
  transactionSummary,
  updatedTransaction,
  usersList,
} from './fixtures';

const BASE = 'http://localhost:3000';

export const handlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    if (body.email === 'admin@mygoals.com' && body.password === 'password123') {
      return HttpResponse.json(authResponse);
    }
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }),

  http.post(`${BASE}/auth/register`, async () => {
    return HttpResponse.json(authResponse, { status: 201 });
  }),

  http.post(`${BASE}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  http.post(`${BASE}/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  }),

  http.get(`${BASE}/auth/me`, () => {
    return HttpResponse.json(adminUser);
  }),

  http.get(`${BASE}/users`, () => {
    return HttpResponse.json(usersList);
  }),

  http.delete(`${BASE}/users/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${BASE}/transactions/summary`, () => {
    return HttpResponse.json(transactionSummary);
  }),

  http.get(`${BASE}/transactions/search`, () => {
    return HttpResponse.json(paginatedTransactions);
  }),

  http.post(`${BASE}/transactions`, () => {
    return HttpResponse.json(createdTransaction, { status: 201 });
  }),

  http.put(`${BASE}/transactions/:id`, () => {
    return HttpResponse.json(updatedTransaction);
  }),

  http.get(`${BASE}/categories`, () => {
    return HttpResponse.json(categoriesList);
  }),

  http.post(`${BASE}/categories`, () => {
    return HttpResponse.json(createdCategory, { status: 201 });
  }),

  http.get(`${BASE}/accounts`, () => {
    return HttpResponse.json(accountsList);
  }),

  http.post(`${BASE}/accounts`, () => {
    return HttpResponse.json(createdAccount, { status: 201 });
  }),

  http.get(`${BASE}/transaction-items`, () => {
    return HttpResponse.json(transactionItemsList);
  }),
  
  http.post(`${BASE}/transaction-items`, () => {
    return HttpResponse.json(createdTransactionItem, { status: 201 });
  }),

  http.get(`${BASE}/transactions/summaryByAccount`, () => {
    return HttpResponse.json(accountSummaryList);
  }),

  http.delete(`${BASE}/transactions/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${BASE}/transactions/strategic-view`, () => {
    return HttpResponse.json(strategicViewTransactions);
  }),
];
