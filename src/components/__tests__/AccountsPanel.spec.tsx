import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { AccountsPanel } from '../AccountsPanel';
import { renderWithProviders } from '../../test/render-helpers';
import { server } from '../../test/mocks/server';
import { accountSummaryList } from '../../test/mocks/fixtures';

const defaultProps = {
  startDate: '2026-05-01',
  endDate: '2026-05-31',
};

describe('AccountsPanel', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
  });

  describe('happy flow', () => {
    it('renders account names and settled/estimated values from backend', async () => {
      renderWithProviders(<AccountsPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Conta Corrente')).toBeInTheDocument();
        expect(screen.getByText('Poupança')).toBeInTheDocument();
      });
    });

    it('hides accounts with both settled and estimated equal to zero', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/summaryByAccount', () =>
          HttpResponse.json([
            ...accountSummaryList,
            {
              accountName: 'Conta Zerada',
              incomeSettled: 0,
              incomeNotSettled: 0,
              expenseSettled: 0,
              expenseNotSettled: 0,
            },
          ]),
        ),
      );

      renderWithProviders(<AccountsPanel {...defaultProps} />);

      await waitFor(() => expect(screen.getByText('Conta Corrente')).toBeInTheDocument());
      expect(screen.queryByText('Conta Zerada')).not.toBeInTheDocument();
    });

  });

  describe('bad flow', () => {
    it('shows error message when backend returns 500', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/summaryByAccount', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      renderWithProviders(<AccountsPanel {...defaultProps} />);

      await waitFor(() =>
        expect(screen.getByText('Erro ao carregar resumo de contas.')).toBeInTheDocument(),
      );
    });

    it('shows empty state when there are no accounts to display', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/summaryByAccount', () => HttpResponse.json([])),
      );

      renderWithProviders(<AccountsPanel {...defaultProps} />);

      await waitFor(() =>
        expect(screen.getByText('Nenhuma conta com movimentação no período.')).toBeInTheDocument(),
      );
    });
  });
});
