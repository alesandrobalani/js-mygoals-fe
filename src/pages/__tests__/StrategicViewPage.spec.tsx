import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { StrategicViewPage } from '../StrategicViewPage';
import { renderWithProviders } from '../../test/render-helpers';
import { server } from '../../test/mocks/server';
import { strategicViewTransactions } from '../../test/mocks/fixtures';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v).replace(/\s/g, ' ').trim();

describe('StrategicViewPage', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
  });

  // ─── Happy flows ─────────────────────────────────────────────────────────

  describe('happy flow', () => {
    it('shows a loading spinner before data arrives', () => {
      renderWithProviders(<StrategicViewPage />);
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders categories names after data loads', async () => {
      renderWithProviders(<StrategicViewPage />);
      await waitFor(() => {
        expect(screen.getByText('Renda')).toBeInTheDocument();
        expect(screen.getByText('Alimentação')).toBeInTheDocument();
      });
    });

    it('renders the section title', async () => {
      renderWithProviders(<StrategicViewPage />);
      await waitFor(() => {
        expect(screen.getByText('Visão Estratégica')).toBeInTheDocument();
      });
    });

    it('displays the grand total correctly', async () => {
      renderWithProviders(<StrategicViewPage />);

      const expectedTotal = 5000 - 800 - 200;

      await waitFor(() => {
        expect(screen.getByText('TOTAL')).toBeInTheDocument();
        const totalRow = screen.getByText('TOTAL').closest('div')!;
        expect(within(totalRow).getByText(fmt(expectedTotal))).toBeInTheDocument();
      });
    });

    it('displayscategories totals', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => {
        expect(screen.getByText(fmt(5000))).toBeInTheDocument();
        expect(screen.getByText(fmt(-1000))).toBeInTheDocument();
      });
    });

    it('expands an category row to show item', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Alimentação')).toBeInTheDocument());

      await userEvent.click(screen.getByText('Alimentação'));

      await waitFor(() => {
        expect(screen.getByText('Compras gerais')).toBeInTheDocument();
        expect(screen.getByText('Mercado')).toBeInTheDocument();
      });
    });

    it('collapses an expanded category when clicked again', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Alimentação')).toBeInTheDocument());

      await userEvent.click(screen.getByText('Alimentação'));
      await waitFor(() => expect(screen.getByText('Mercado')).toBeInTheDocument());

      await userEvent.click(screen.getByText('Alimentação'));
      await waitFor(() => expect(screen.queryByText('Mercado')).not.toBeInTheDocument());
    });

    it('expands item row to show due dates', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Alimentação')).toBeInTheDocument());
      await userEvent.click(screen.getByText('Alimentação'));
      await waitFor(() => expect(screen.getByText('Mercado')).toBeInTheDocument());
      await userEvent.click(screen.getByText('Mercado'));

      await waitFor(() => expect(screen.getByText('17/07/2026')).toBeInTheDocument());
    });

    it('expands date row to show income/expense type', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Alimentação')).toBeInTheDocument());
      await userEvent.click(screen.getByText('Alimentação'));
      await waitFor(() => expect(screen.getByText('Mercado')).toBeInTheDocument());
      await userEvent.click(screen.getByText('Mercado'));
      await waitFor(() => expect(screen.getByText('17/07/2026')).toBeInTheDocument());
      await userEvent.click(screen.getByText('17/07/2026'));

      await waitFor(() => expect(screen.getByText('Despesa')).toBeInTheDocument());
    });

    it('filters by "apenas efetivado" hiding non-settled transactions', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Alimentação')).toBeInTheDocument());

      const checkbox = screen.getByRole('checkbox', { name: /apenas efetivado/i });
      await userEvent.click(checkbox);

      await waitFor(() => expect(screen.queryByText('Alimentação')).not.toBeInTheDocument());
    });

    it('grand total updates when apenas efetivado is applied', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('TOTAL')).toBeInTheDocument());

      const checkbox = screen.getByRole('checkbox', { name: /apenas efetivado/i });
      await userEvent.click(checkbox);

      await waitFor(() => {
        const totalRow = screen.getByText('TOTAL').closest('div')!;
        expect(within(totalRow).getByText(fmt(5000))).toBeInTheDocument();
      });
    });

    it('filters by category using multi-select', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Alimentação')).toBeInTheDocument());

      const catButton = screen.getByRole('button', { name: /filtrar por categorias/i });
      await userEvent.click(catButton);

      const rendaCheckbox = screen.getByRole('checkbox', { name: 'Renda' });
      await userEvent.click(rendaCheckbox);

      const table = screen.getByText('Categoria / Item').closest('.rounded-2xl') as HTMLElement;

      await waitFor(() => expect(within(table).queryByText('Alimentação')).not.toBeInTheDocument());
      expect(within(table).getByText('Renda')).toBeInTheDocument();
    });

    it('filters by item using multi-select', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Renda')).toBeInTheDocument());

      const itemButton = screen.getByRole('button', { name: /filtrar por itens/i });
      await userEvent.click(itemButton);

      const itemCheckbox = screen.getByRole('checkbox', { name: 'Mercado' });
      await userEvent.click(itemCheckbox);

      await waitFor(() => expect(screen.queryByText('Renda')).not.toBeInTheDocument());
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
    });

    it('date range inputs are pre-filled with current month', async () => {
      renderWithProviders(<StrategicViewPage />);

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const firstDay = `${year}-${month}-01`;

      await waitFor(() => {
        const startInput = screen.getByLabelText('De') as HTMLInputElement;
        expect(startInput.value).toBe(firstDay);
      });
    });

    it('changing start date triggers a new API call', async () => {
      let callCount = 0;
      server.use(
        http.get('http://localhost:3000/transactions/strategic-view', () => {
          callCount++;
          return HttpResponse.json(strategicViewTransactions);
        }),
      );

      renderWithProviders(<StrategicViewPage />);
      await waitFor(() => expect(callCount).toBeGreaterThan(0));
      const prevCount = callCount;

      const startInput = screen.getByLabelText('De') as HTMLInputElement;
      await userEvent.clear(startInput);
      await userEvent.type(startInput, '2026-06-01');

      await waitFor(() => expect(callCount).toBeGreaterThan(prevCount));
    });

    it('shows empty state when no transactions are returned', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/strategic-view', () =>
          HttpResponse.json([]),
        ),
      );

      renderWithProviders(<StrategicViewPage />);

      await waitFor(() =>
        expect(screen.getByText('Nenhuma transação encontrada para o período.')).toBeInTheDocument(),
      );
    });
  });

  // ─── Bad flows ────────────────────────────────────────────────────────────

  describe('bad flow', () => {
    it('shows error message when API returns 500', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/strategic-view', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      renderWithProviders(<StrategicViewPage />);

      await waitFor(() =>
        expect(screen.getByText('Erro ao carregar visão estratégica.')).toBeInTheDocument(),
      );
    });

    it('shows error message when API returns 503', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/strategic-view', () =>
          HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 }),
        ),
      );

      renderWithProviders(<StrategicViewPage />);

      await waitFor(() =>
        expect(screen.getByText('Erro ao carregar visão estratégica.')).toBeInTheDocument(),
      );
    });

    it('does not render account rows on API failure', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/strategic-view', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.queryByRole('button', { name: /conta corrente/i })).not.toBeInTheDocument());
    });

    it('hides loading spinner after an error', async () => {
      server.use(
        http.get('http://localhost:3000/transactions/strategic-view', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      renderWithProviders(<StrategicViewPage />);

      await waitFor(() =>
        expect(screen.getByText('Erro ao carregar visão estratégica.')).toBeInTheDocument(),
      );

      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
  });

});
