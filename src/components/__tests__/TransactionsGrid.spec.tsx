import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { TransactionsGrid } from '../TransactionsGrid';
import { AuthProvider } from '../../contexts/AuthContext';
import { renderWithProviders } from '../../test/render-helpers';
import { server } from '../../test/mocks/server';
import { paginatedTransactions, transactionsList, transferTransaction } from '../../test/mocks/fixtures';

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

  });

  describe('filter', () => {
    it('renders the filter input', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());

      expect(screen.getByRole('textbox', { name: 'Filtrar transações' })).toBeInTheDocument();
    });

    it('shows only matching rows when filter text is typed', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());

      await userEvent.type(screen.getByRole('textbox', { name: 'Filtrar transações' }), 'supermercado');

      expect(screen.getByText('Supermercado')).toBeInTheDocument();
      expect(screen.queryByText('Salário')).not.toBeInTheDocument();
      expect(screen.queryByText('Conta de luz')).not.toBeInTheDocument();
    });

    it('restores all rows when filter is cleared', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());

      const input = screen.getByRole('textbox', { name: 'Filtrar transações' });
      await userEvent.type(input, 'supermercado');
      await userEvent.clear(input);

      await waitFor(() => {
        expect(screen.getByText('Salário')).toBeInTheDocument();
        expect(screen.getByText('Supermercado')).toBeInTheDocument();
        expect(screen.getByText('Conta de luz')).toBeInTheDocument();
      });
    });

    it('filters case-insensitively', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());

      await userEvent.type(screen.getByRole('textbox', { name: 'Filtrar transações' }), 'SALÁRIO');

      expect(screen.getByText('Salário')).toBeInTheDocument();
      expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
    });

    it('filters by category name', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());

      await userEvent.type(screen.getByRole('textbox', { name: 'Filtrar transações' }), 'Alimentação');

      expect(screen.getByText('Supermercado')).toBeInTheDocument();
      expect(screen.queryByText('Salário')).not.toBeInTheDocument();
    });

    it('shows empty state when filter matches nothing', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Filtrar transações' }),
        'xyzinexistente',
      );

      expect(screen.getByText('Nenhuma transação no período.')).toBeInTheDocument();
    });

    it('filters by transaction type "receita"', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());

      await userEvent.type(screen.getByRole('textbox', { name: 'Filtrar transações' }), 'receita');

      expect(screen.getByText('Salário')).toBeInTheDocument();
      expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
      expect(screen.queryByText('Conta de luz')).not.toBeInTheDocument();
    });

    it('filters by transaction type "despesa"', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());

      await userEvent.type(screen.getByRole('textbox', { name: 'Filtrar transações' }), 'despesa');

      expect(screen.getByText('Supermercado')).toBeInTheDocument();
      expect(screen.getByText('Conta de luz')).toBeInTheDocument();
      expect(screen.queryByText('Salário')).not.toBeInTheDocument();
    });

    it('filters by settled status "pendente"', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());

      await userEvent.type(screen.getByRole('textbox', { name: 'Filtrar transações' }), 'pendente');

      expect(screen.getByText('Conta de luz')).toBeInTheDocument();
      expect(screen.queryByText('Salário')).not.toBeInTheDocument();
      expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
    });

    it('filters by settled status "efetivado"', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());

      await userEvent.type(screen.getByRole('textbox', { name: 'Filtrar transações' }), 'efetivado');

      expect(screen.getByText('Salário')).toBeInTheDocument();
      expect(screen.getByText('Supermercado')).toBeInTheDocument();
      expect(screen.queryByText('Conta de luz')).not.toBeInTheDocument();
    });

    it('filters by formatted amount', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());

      await userEvent.type(screen.getByRole('textbox', { name: 'Filtrar transações' }), '200,00');

      expect(screen.getByText('Conta de luz')).toBeInTheDocument();
      expect(screen.queryByText('Salário')).not.toBeInTheDocument();
      expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
    });

    it('filters by transaction date', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText('Salário')).toBeInTheDocument());

      await userEvent.type(screen.getByRole('textbox', { name: 'Filtrar transações' }), '2026-04-10');

      expect(screen.getByText('Supermercado')).toBeInTheDocument();
      expect(screen.queryByText('Salário')).not.toBeInTheDocument();
      expect(screen.queryByText('Conta de luz')).not.toBeInTheDocument();
    });
  });

  describe('remove transaction', () => {
    it('renders a remove button for each transaction row', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => {
        const removeButtons = screen.getAllByRole('button', { name: 'Remover transação' });
        expect(removeButtons).toHaveLength(transactionsList.length);
      });
    });

    it('opens ConfirmDialog when remove button is clicked', async () => {
      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText(transactionsList[0].description!)).toBeInTheDocument());

      const removeButtons = screen.getAllByRole('button', { name: 'Remover transação' });
      await userEvent.click(removeButtons[0]);

      expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });

    it('closes dialog without calling API when cancel is clicked', async () => {
      let deleteCalled = false;
      server.use(
        http.delete('http://localhost:3000/transactions/:id', () => {
          deleteCalled = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText(transactionsList[0].description!)).toBeInTheDocument());

      await userEvent.click(screen.getAllByRole('button', { name: 'Remover transação' })[0]);
      await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument();
      expect(deleteCalled).toBe(false);
    });

    it('calls DELETE API and refreshes grid when confirm is clicked', async () => {
      let deleteCalledId: string | undefined;
      server.use(
        http.delete('http://localhost:3000/transactions/:id', ({ params }) => {
          deleteCalledId = params.id as string;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText(transactionsList[0].description!)).toBeInTheDocument());

      await userEvent.click(screen.getAllByRole('button', { name: 'Remover transação' })[0]);
      await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

      await waitFor(() => expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument());
      expect(deleteCalledId).toBe(transactionsList[0].id);
    });

    it('shows error message when DELETE API returns 500', async () => {
      server.use(
        http.delete('http://localhost:3000/transactions/:id', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      renderWithProviders(<TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} />);

      await waitFor(() => expect(screen.getByText(transactionsList[0].description!)).toBeInTheDocument());

      await userEvent.click(screen.getAllByRole('button', { name: 'Remover transação' })[0]);
      await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

      await waitFor(() =>
        expect(screen.getByText('Erro ao remover transação.')).toBeInTheDocument(),
      );
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

  describe('selection and copy', () => {
    const SEARCH_URL = 'http://localhost:3000/transactions/search';
    const rowCheckbox = (description: string) => screen.getByRole('checkbox', { name: `Selecionar ${description}` });
    const selectAll = () => screen.getByRole('checkbox', { name: 'Selecionar todos os lançamentos visíveis' });
    const toolbar = () => screen.queryByRole('toolbar', { name: 'Ações da seleção' });

    async function renderLoaded(extra: Partial<Parameters<typeof TransactionsGrid>[0]> = {}) {
      const result = renderWithProviders(
        <TransactionsGrid {...defaultProps} onEditTransaction={onEditTransaction} {...extra} />,
      );
      await waitFor(() => expect(screen.getByText(transactionsList[0].description!)).toBeInTheDocument());
      return result;
    }

    it('renders a checkbox per row and a select-all checkbox, none checked', async () => {
      await renderLoaded();

      for (const tx of transactionsList) expect(rowCheckbox(tx.description!)).not.toBeChecked();
      expect(selectAll()).not.toBeChecked();
      expect(toolbar()).not.toBeInTheDocument();
    });

    it('selects a row and shows the action bar', async () => {
      await renderLoaded();

      await userEvent.click(rowCheckbox('Supermercado'));

      expect(rowCheckbox('Supermercado')).toBeChecked();
      expect(toolbar()).toHaveTextContent('1 selecionado');
      expect(selectAll()).toBePartiallyChecked();
    });

    it('selects and unselects all visible rows', async () => {
      await renderLoaded();

      await userEvent.click(selectAll());
      expect(toolbar()).toHaveTextContent('3 selecionados');
      expect(selectAll()).toBeChecked();

      await userEvent.click(selectAll());
      expect(toolbar()).not.toBeInTheDocument();
    });

    it('select-all only affects rows matching the filter', async () => {
      await renderLoaded();

      await userEvent.type(screen.getByLabelText('Filtrar transações'), 'luz');
      await userEvent.click(selectAll());
      await userEvent.click(screen.getByRole('button', { name: 'Limpar filtro' }));

      expect(toolbar()).toHaveTextContent('1 selecionado');
      expect(rowCheckbox('Conta de luz')).toBeChecked();
      expect(rowCheckbox('Salário')).not.toBeChecked();
    });

    it('disables transfers and ignores them in select-all', async () => {
      server.use(
        http.get(SEARCH_URL, () =>
          HttpResponse.json({ ...paginatedTransactions, data: [transactionsList[0], transferTransaction], total: 2 }),
        ),
      );
      await renderLoaded();

      const transferBox = screen.getByRole('checkbox', {
        name: `${transferTransaction.description}: transferências não podem ser copiadas`,
      });
      expect(transferBox).toBeDisabled();
      expect(screen.getByTitle('Transferências não podem ser copiadas')).toBeInTheDocument();

      await userEvent.click(selectAll());
      expect(toolbar()).toHaveTextContent('1 selecionado');
      expect(selectAll()).toBeChecked();
    });

    it('keeps the selection across pages', async () => {
      server.use(
        http.get(SEARCH_URL, ({ request }) => {
          const page = Number(new URL(request.url).searchParams.get('page'));
          const data = page === 1 ? [transactionsList[0], transactionsList[1]] : [transactionsList[2]];
          return HttpResponse.json({ data, total: 3, page, limit: 2, totalPages: 2 });
        }),
      );
      await renderLoaded();

      await userEvent.click(rowCheckbox('Supermercado'));
      await userEvent.click(screen.getByRole('button', { name: 'Próxima >' }));
      await waitFor(() => expect(screen.getByText('Conta de luz')).toBeInTheDocument());
      await userEvent.click(rowCheckbox('Conta de luz'));

      expect(toolbar()).toHaveTextContent('2 selecionados');
      await userEvent.click(screen.getByRole('button', { name: '< Anterior' }));
      await waitFor(() => expect(rowCheckbox('Supermercado')).toBeChecked());
    });

    it('clears the selection when the period changes', async () => {
      const { rerender } = await renderLoaded();
      await userEvent.click(rowCheckbox('Supermercado'));
      expect(toolbar()).toBeInTheDocument();

      rerender(
        <MemoryRouter>
          <AuthProvider>
            <TransactionsGrid startDate="2026-06-01" endDate="2026-06-30" onEditTransaction={onEditTransaction} />
          </AuthProvider>
        </MemoryRouter>,
      );

      await waitFor(() => expect(rowCheckbox('Supermercado')).not.toBeChecked());
      expect(toolbar()).not.toBeInTheDocument();
    });

    it('clears the selection with "Limpar seleção"', async () => {
      await renderLoaded();
      await userEvent.click(rowCheckbox('Supermercado'));

      await userEvent.click(screen.getByRole('button', { name: 'Limpar seleção' }));

      expect(toolbar()).not.toBeInTheDocument();
      expect(rowCheckbox('Supermercado')).not.toBeChecked();
    });

    it('copies the selection, shows the success notice and notifies the parent', async () => {
      const onCopySuccess = vi.fn();
      await renderLoaded({ onCopySuccess });
      await userEvent.click(rowCheckbox('Supermercado'));
      await userEvent.click(rowCheckbox('Conta de luz'));

      await userEvent.click(screen.getByRole('button', { name: 'Copiar para competências futuras' }));
      const dialog = screen.getByRole('dialog', { name: 'Copiar para competências futuras' });
      // período exibido é maio/2026: o primeiro mês sugerido é junho
      expect((within(dialog).getByLabelText('Mês de destino') as HTMLInputElement).value).toBe('2026-06');
      await userEvent.click(within(dialog).getByRole('button', { name: 'Adicionar mês' }));
      const confirm = await within(dialog).findByRole('button', { name: 'Criar 2 lançamentos' });
      await waitFor(() => expect(confirm).toBeEnabled());
      await userEvent.click(confirm);

      expect(await screen.findByRole('status')).toHaveTextContent('2 lançamentos criados');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(toolbar()).not.toBeInTheDocument();
      expect(onCopySuccess).toHaveBeenCalledTimes(1);

      await userEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }));
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('mentions ignored duplicates in the success notice', async () => {
      server.use(
        http.post('http://localhost:3000/transactions/copy', () =>
          HttpResponse.json({
            dryRun: false,
            created: [{ sourceId: 'tx-2', targetMonth: '2026-06', amount: 800, type: 'expense', dueDate: '2026-06-10', transactionDate: '2026-06-10' }],
            skipped: [{ sourceId: 'tx-3', targetMonth: '2026-06', dueDate: '2026-06-17', reason: 'duplicate' }],
          }),
        ),
      );
      await renderLoaded();
      await userEvent.click(rowCheckbox('Supermercado'));
      await userEvent.click(rowCheckbox('Conta de luz'));
      await userEvent.click(screen.getByRole('button', { name: 'Copiar para competências futuras' }));
      await userEvent.click(screen.getByRole('button', { name: 'Adicionar mês' }));
      const confirm = await screen.findByRole('button', { name: 'Criar 1 lançamento' });
      await waitFor(() => expect(confirm).toBeEnabled());

      await userEvent.click(confirm);

      expect(await screen.findByRole('status')).toHaveTextContent('1 lançamento criado · 1 ignorado por já existir');
    });

    it('keeps the selection when the copy modal is cancelled', async () => {
      await renderLoaded();
      await userEvent.click(rowCheckbox('Supermercado'));
      await userEvent.click(screen.getByRole('button', { name: 'Copiar para competências futuras' }));

      await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(toolbar()).toHaveTextContent('1 selecionado');
    });
  });
});
