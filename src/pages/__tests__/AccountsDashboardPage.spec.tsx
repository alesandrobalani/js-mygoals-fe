import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { AccountsDashboardPage } from '../AccountsDashboardPage';
import { renderWithProviders } from '../../test/render-helpers';
import { server } from '../../test/mocks/server';
import { accountSummaryList } from '../../test/mocks/fixtures';

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

describe('AccountsDashboardPage', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
  });

  describe('happy flow', () => {
    it('renders account names as card labels', async () => {
      renderWithProviders(<AccountsDashboardPage />);

      await waitFor(() => {
        expect(screen.getAllByText(/Conta Corrente/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Poupança/).length).toBeGreaterThan(0);
      });
    });

    it('renders settled balance label for each account', async () => {
      renderWithProviders(<AccountsDashboardPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Efetivado').length).toBe(accountSummaryList.length);
      });
    });

    it('renders estimated balance label for each account', async () => {
      renderWithProviders(<AccountsDashboardPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Estimado').length).toBe(accountSummaryList.length);
      });
    });

    it('displays correct settled balance for first account', async () => {
      renderWithProviders(<AccountsDashboardPage />);

      const s = accountSummaryList[0];
      const settled = s.incomeSettled - s.expenseSettled; // 3000

      await waitFor(() => {
        const label = screen.getAllByText('Efetivado')[0];
        expect(label.nextElementSibling?.textContent?.replace(/\s/g, ' ').trim())
          .toBe(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(settled).replace(/\s/g, ' ').trim());
      });
    });

    it('displays correct estimated balance for second account', async () => {
      renderWithProviders(<AccountsDashboardPage />);

      const s = accountSummaryList[1];
      const estimated = (s.incomeSettled + s.incomeNotSettled) - (s.expenseSettled + s.expenseNotSettled); // 1800

      await waitFor(() => {
        const label = screen.getAllByText('Estimado')[1];
        expect(label.nextElementSibling?.textContent?.replace(/\s/g, ' ').trim())
          .toBe(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimated).replace(/\s/g, ' ').trim());
      });
    });

    it('shows loading spinner before data arrives', () => {
      renderWithProviders(<AccountsDashboardPage />);

      expect(screen.queryByText(/Conta Corrente/)).not.toBeInTheDocument();
    });

    it('displays current month label on load', async () => {
      renderWithProviders(<AccountsDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(getCurrentMonthLabel())).toBeInTheDocument();
      });
    });

    it('navigates to previous month when clicking prev button', async () => {
      renderWithProviders(<AccountsDashboardPage />);

      await waitFor(() => expect(screen.getByText(getCurrentMonthLabel())).toBeInTheDocument());

      await userEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));

      expect(screen.getByText(getPrevMonthLabel())).toBeInTheDocument();
    });

    it('navigates to next month when clicking next button', async () => {
      renderWithProviders(<AccountsDashboardPage />);

      await waitFor(() => expect(screen.getByText(getCurrentMonthLabel())).toBeInTheDocument());

      await userEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));

      expect(screen.getByText(getNextMonthLabel())).toBeInTheDocument();
    });

    it('reloads account data when month changes', async () => {
      let callCount = 0;
      server.use(
        http.get('http://localhost:3000/transactions/summaryByAccount', () => {
          callCount++;
          return HttpResponse.json(accountSummaryList);
        }),
      );

      renderWithProviders(<AccountsDashboardPage />);
      await waitFor(() => expect(screen.getByText(getCurrentMonthLabel())).toBeInTheDocument());
      const initialCallCount = callCount;

      await userEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));

      await waitFor(() => expect(callCount).toBeGreaterThan(initialCallCount));
    });

    it('shows empty state message when no accounts are returned', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/summaryByAccount', () =>
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
        http.get('http://localhost:3000/transactions/summaryByAccount', () =>
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
        http.get('http://localhost:3000/transactions/summaryByAccount', () =>
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
