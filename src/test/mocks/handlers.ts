import { http, HttpResponse } from 'msw';
import { adminUser, authResponse, paginatedTransactions, transactionSummary, usersList } from './fixtures';

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
];
