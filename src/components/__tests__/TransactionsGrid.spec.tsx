import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { TransactionsGrid } from '../TransactionsGrid';
import { renderWithProviders } from '../../test/render-helpers';
import { server } from '../../test/mocks/server';
import { paginatedTransactions, transactionsList } from '../../test/mocks/fixtures';

const defaultProps = {
  startDate: '2026-05-01',
  endDate: '2026-05-31',
};

describe('TransactionsGrid', () => {
  const onEditTransaction = vi.fn();

  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
    onEditTransaction.mockClear();
  });

  describe('happy flow', () => {
    it('renders the table column headers', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => {
        expect(screen.getByText('Data')).toBeInTheDocument();
        expect(screen.getByText('Descrição')).toBeInTheDocument();
        expect(screen.getByText('Tipo')).toBeInTheDocument();
        expect(screen.getByText('Valor')).toBeInTheDocument();
        expect(screen.getByText('Vencimento')).toBeInTheDocument();
      });
    });

    it('displays transactions from backend', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => {
        expect(screen.getByText(transactionsList[0].description!)).toBeInTheDocument();
        expect(screen.getByText(transactionsList[1].description!)).toBeInTheDocument();
        expect(screen.getByText(transactionsList[2].description!)).toBeInTheDocument();
      });
    });

    it('shows income icon for income transactions', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => {
        expect(screen.getByLabelText('Receita')).toBeInTheDocument();
      });
    });

    it('shows expense icon for expense transactions', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => {
        expect(screen.getAllByLabelText('Despesa').length).toBeGreaterThan(0);
      });
    });

    it('renders an edit button for each transaction row', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: 'Editar transação' });
        expect(editButtons).toHaveLength(transactionsList.length);
      });
    });

    it('calls onEditTransaction with the correct transaction when edit is clicked', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() =>
        expect(screen.getByText(transactionsList[0].description!)).toBeInTheDocument(),
      );

      const editButtons = screen.getAllByRole('button', { name: 'Editar transação' });
      await userEvent.click(editButtons[0]);

      expect(onEditTransaction).toHaveBeenCalledOnce();
      expect(onEditTransaction).toHaveBeenCalledWith(transactionsList[0]);
    });

    it('displays pagination info', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => {
        expect(
          screen.getByText(`Página ${paginatedTransactions.page} de ${paginatedTransactions.totalPages}`),
        ).toBeInTheDocument();
      });
    });

    it('shows empty state when no transactions', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/search', () =>
          HttpResponse.json({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
        ),
      );

      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() =>
        expect(screen.getByText('Nenhuma transação no período.')).toBeInTheDocument(),
      );
    });

    it('changes page size when limit button is clicked', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());

      await userEvent.click(screen.getByRole('button', { name: '50' }));

      await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());
    });
  });

  describe('bad flow', () => {
    it('shows error message when backend returns 500', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/search', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() =>
        expect(screen.getByText('Erro ao carregar transações.')).toBeInTheDocument(),
      );
    });

    it('shows error message when backend returns 503', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/search', () =>
          HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 }),
        ),
      );

      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() =>
        expect(screen.getByText('Erro ao carregar transações.')).toBeInTheDocument(),
      );
    });
  });
});
