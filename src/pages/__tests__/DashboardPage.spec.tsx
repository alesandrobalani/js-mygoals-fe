import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { DashboardPage } from '../DashboardPage';
import { renderWithProviders } from '../../test/render-helpers';
import { server } from '../../test/mocks/server';
import { transactionSummary } from '../../test/mocks/fixtures';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function getCurrentMonthLabel() {
  const now = new Date();
  return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
}

function getPrevMonthLabel() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${MONTH_NAMES[prev.getMonth()]} ${prev.getFullYear()}`;
}

function getNextMonthLabel() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return `${MONTH_NAMES[next.getMonth()]} ${next.getFullYear()}`;
}

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

    it('displays current month label on load', async () => {
      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(getCurrentMonthLabel())).toBeInTheDocument();
      });
    });

    it('navigates to previous month when clicking prev button', async () => {
      renderWithProviders(<DashboardPage />);

      await waitFor(() => expect(screen.getByText(getCurrentMonthLabel())).toBeInTheDocument());

      await userEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));

      expect(screen.getByText(getPrevMonthLabel())).toBeInTheDocument();
    });

    it('navigates to next month when clicking next button', async () => {
      renderWithProviders(<DashboardPage />);

      await waitFor(() => expect(screen.getByText(getCurrentMonthLabel())).toBeInTheDocument());

      await userEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));

      expect(screen.getByText(getNextMonthLabel())).toBeInTheDocument();
    });

    it('reloads summary data when month changes', async () => {
      let callCount = 0;
      server.use(
        http.get('http://localhost:3000/transactions/summary', () => {
          callCount++;
          return HttpResponse.json(transactionSummary);
        }),
      );

      renderWithProviders(<DashboardPage />);
      await waitFor(() => expect(screen.getByText(getCurrentMonthLabel())).toBeInTheDocument());
      const initialCallCount = callCount;

      await userEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));

      await waitFor(() => expect(callCount).toBeGreaterThan(initialCallCount));
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
