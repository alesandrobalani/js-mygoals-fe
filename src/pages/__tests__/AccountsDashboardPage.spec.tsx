import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { AccountsDashboardPage } from '../AccountsDashboardPage';
import { renderWithProviders } from '../../test/render-helpers';
import { server } from '../../test/mocks/server';
import { accountSummaryList } from '../../test/mocks/fixtures';

describe('AccountsDashboardPage', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
  });

  describe('happy flow', () => {
    it('renders account names as card labels', async () => {
      renderWithProviders(<AccountsDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/Conta Corrente/)).toBeInTheDocument();
        expect(screen.getByText(/Poupança/)).toBeInTheDocument();
      });
    });

    it('renders settled balance label for each account', async () => {
      renderWithProviders(<AccountsDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(`Saldo efetivado — ${accountSummaryList[0].account.name}`)).toBeInTheDocument();
        expect(screen.getByText(`Saldo efetivado — ${accountSummaryList[1].account.name}`)).toBeInTheDocument();
      });
    });

    it('renders estimated balance label for each account', async () => {
      renderWithProviders(<AccountsDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(`Saldo estimado — ${accountSummaryList[0].account.name}`)).toBeInTheDocument();
        expect(screen.getByText(`Saldo estimado — ${accountSummaryList[1].account.name}`)).toBeInTheDocument();
      });
    });

    it('displays correct settled balance for first account', async () => {
      renderWithProviders(<AccountsDashboardPage />);

      const s = accountSummaryList[0];
      const settled = s.incomeSettled - s.expenseSettled; // 3000
      const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(settled);

      await waitFor(() => {
        expect(screen.getByText(formatted)).toBeInTheDocument();
      });
    });

    it('displays correct estimated balance for second account', async () => {
      renderWithProviders(<AccountsDashboardPage />);

      const s = accountSummaryList[1];
      const estimated = (s.incomeSettled + s.incomeNotSettled) - (s.expenseSettled + s.expenseNotSettled); // 1800
      const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimated);

      await waitFor(() => {
        expect(screen.getByText(formatted)).toBeInTheDocument();
      });
    });

    it('shows loading spinner before data arrives', () => {
      renderWithProviders(<AccountsDashboardPage />);

      expect(screen.queryByText(/Conta Corrente/)).not.toBeInTheDocument();
    });

    it('shows empty state message when no accounts are returned', async () => {
      server.use(
        http.get('http://localhost:3000/accounts/summary', () =>
          HttpResponse.json([]),
        ),
      );

      renderWithProviders(<AccountsDashboardPage />);

      await waitFor(() =>
        expect(screen.getByText('Nenhuma conta cadastrada.')).toBeInTheDocument(),
      );
    });
  });

  describe('bad flow', () => {
    it('shows error message when backend returns 500', async () => {
      server.use(
        http.get('http://localhost:3000/accounts/summary', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      renderWithProviders(<AccountsDashboardPage />);

      await waitFor(() =>
        expect(screen.getByText('Erro ao carregar resumo de contas.')).toBeInTheDocument(),
      );
    });

    it('does not crash when backend returns 503', async () => {
      server.use(
        http.get('http://localhost:3000/accounts/summary', () =>
          HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 }),
        ),
      );

      renderWithProviders(<AccountsDashboardPage />);

      await waitFor(() =>
        expect(screen.getByText('Erro ao carregar resumo de contas.')).toBeInTheDocument(),
      );
    });
  });
});
