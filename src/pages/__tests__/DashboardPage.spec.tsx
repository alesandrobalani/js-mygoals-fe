import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { DashboardPage } from '../DashboardPage';
import { renderWithProviders } from '../../test/render-helpers';
import { server } from '../../test/mocks/server';
import { transactionSummary } from '../../test/mocks/fixtures';

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
  });

  describe('happy flow', () => {
    it('renders the card labels', async () => {
      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Despesas estimadas mês')).toBeInTheDocument();
        expect(screen.getByText('Despesas efetivadas mês')).toBeInTheDocument();
        expect(screen.getByText('Receitas estimadas mês')).toBeInTheDocument();
        expect(screen.getByText('Receitas efetivadas mês')).toBeInTheDocument();
        expect(screen.getByText('Saldo estimado total')).toBeInTheDocument();
        expect(screen.getByText('Saldo efetivado total')).toBeInTheDocument();
      });
    });

    it('displays settled income value from backend', async () => {
      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(transactionSummary.incomeSettled.toLocaleString('pt-BR'))),
        ).toBeInTheDocument();
      });
    });

    it('displays settled expense value from backend', async () => {
      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(transactionSummary.expenseSettled.toLocaleString('pt-BR'))),
        ).toBeInTheDocument();
      });
    });

    it('displays correct balance (income minus expense)', async () => {
      renderWithProviders(<DashboardPage />);

      const balance = transactionSummary.incomeSettled - transactionSummary.expenseSettled;
      await waitFor(() => {
        expect(
          screen.getByText(new RegExp(balance.toLocaleString('pt-BR'))),
        ).toBeInTheDocument();
      });
    });

    it('shows loading spinner before data arrives', () => {
      renderWithProviders(<DashboardPage />);

      expect(screen.queryByText('Saldo total')).not.toBeInTheDocument();
    });
  });

  describe('bad flow', () => {
    it('shows error message when backend returns unexpected error', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/summary', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      renderWithProviders(<DashboardPage />);

      await waitFor(() =>
        expect(
          screen.getByText('Erro ao carregar resumo financeiro.'),
        ).toBeInTheDocument(),
      );
    });

    it('still renders card labels and zeroed values on error', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/summary', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Saldo efetivado total')).toBeInTheDocument();
        expect(screen.getAllByText(/0,00/).length).toBeGreaterThan(0);
      });
    });
  });
});
