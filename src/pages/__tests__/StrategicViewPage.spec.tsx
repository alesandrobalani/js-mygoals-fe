import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { StrategicViewPage } from '../StrategicViewPage';
import { renderWithProviders } from '../../test/render-helpers';
import { server } from '../../test/mocks/server';
import { strategicViewTransactions } from '../../test/mocks/fixtures';
import { buildTreeData } from '../StrategicViewPage';

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

    it('renders account names after data loads', async () => {
      renderWithProviders(<StrategicViewPage />);
      await waitFor(() => {
        expect(screen.getByText('Conta Corrente')).toBeInTheDocument();
        expect(screen.getByText('Poupança')).toBeInTheDocument();
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

      // sv-1: +5000, sv-2: -800, sv-3: -200 → total = 4000
      const expectedTotal = 5000 - 800 - 200;

      await waitFor(() => {
        expect(screen.getByText('TOTAL')).toBeInTheDocument();
        const totalRow = screen.getByText('TOTAL').closest('div')!;
        expect(within(totalRow).getByText(fmt(expectedTotal))).toBeInTheDocument();
      });
    });

    it('displays per-account totals', async () => {
      renderWithProviders(<StrategicViewPage />);

      // Conta Corrente: +5000 - 800 = +4200
      // Poupança: -200
      await waitFor(() => {
        expect(screen.getByText(fmt(4200))).toBeInTheDocument();
        expect(screen.getByText(fmt(-200))).toBeInTheDocument();
      });
    });

    it('expands an account row to show categories', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Conta Corrente')).toBeInTheDocument());

      await userEvent.click(screen.getByText('Conta Corrente'));

      await waitFor(() => {
        expect(screen.getByText('Renda')).toBeInTheDocument();
        expect(screen.getByText('Alimentação')).toBeInTheDocument();
      });
    });

    it('collapses an expanded account when clicked again', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Conta Corrente')).toBeInTheDocument());

      await userEvent.click(screen.getByText('Conta Corrente'));
      await waitFor(() => expect(screen.getByText('Renda')).toBeInTheDocument());

      await userEvent.click(screen.getByText('Conta Corrente'));
      await waitFor(() => expect(screen.queryByText('Renda')).not.toBeInTheDocument());
    });

    it('expands category row to show items', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Conta Corrente')).toBeInTheDocument());
      await userEvent.click(screen.getByText('Conta Corrente'));
      await waitFor(() => expect(screen.getByText('Renda')).toBeInTheDocument());

      await userEvent.click(screen.getByText('Renda'));
      await waitFor(() => expect(screen.getByText('Salário mensal')).toBeInTheDocument());
    });

    it('expands item row to show due dates', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Conta Corrente')).toBeInTheDocument());
      await userEvent.click(screen.getByText('Conta Corrente'));
      await waitFor(() => expect(screen.getByText('Renda')).toBeInTheDocument());
      await userEvent.click(screen.getByText('Renda'));
      await waitFor(() => expect(screen.getByText('Salário mensal')).toBeInTheDocument());
      await userEvent.click(screen.getByText('Salário mensal'));

      await waitFor(() => expect(screen.getByText('05/07/2026')).toBeInTheDocument());
    });

    it('expands date row to show income/expense type', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Conta Corrente')).toBeInTheDocument());
      await userEvent.click(screen.getByText('Conta Corrente'));
      await waitFor(() => expect(screen.getByText('Renda')).toBeInTheDocument());
      await userEvent.click(screen.getByText('Renda'));
      await waitFor(() => expect(screen.getByText('Salário mensal')).toBeInTheDocument());
      await userEvent.click(screen.getByText('Salário mensal'));
      await waitFor(() => expect(screen.getByText('05/07/2026')).toBeInTheDocument());
      await userEvent.click(screen.getByText('05/07/2026'));

      await waitFor(() => expect(screen.getByText('Receita')).toBeInTheDocument());
    });

    it('filters by "apenas efetivado" hiding non-settled transactions', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Poupança')).toBeInTheDocument());

      // sv-3 is the only Poupança transaction and it is not settled
      const checkbox = screen.getByRole('checkbox', { name: /apenas efetivado/i });
      await userEvent.click(checkbox);

      await waitFor(() => expect(screen.queryByText('Poupança')).not.toBeInTheDocument());
    });

    it('grand total updates when apenas efetivado is applied', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('TOTAL')).toBeInTheDocument());

      const checkbox = screen.getByRole('checkbox', { name: /apenas efetivado/i });
      await userEvent.click(checkbox);

      // sv-1 settled +5000, sv-2 settled -800 → 4200
      await waitFor(() => {
        const totalRow = screen.getByText('TOTAL').closest('div')!;
        expect(within(totalRow).getByText(fmt(4200))).toBeInTheDocument();
      });
    });

    it('filters by category using multi-select', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Conta Corrente')).toBeInTheDocument());

      const catButton = screen.getByRole('button', { name: /filtrar por categorias/i });
      await userEvent.click(catButton);

      const rendaCheckbox = screen.getByRole('checkbox', { name: 'Renda' });
      await userEvent.click(rendaCheckbox);

      // Close dropdown by clicking elsewhere — just press Escape or click body
      await userEvent.keyboard('{Escape}');

      // Only Conta Corrente should remain (Poupança is under Contas, not Renda)
      await waitFor(() => expect(screen.queryByText('Poupança')).not.toBeInTheDocument());
      expect(screen.getByText('Conta Corrente')).toBeInTheDocument();
    });

    it('filters by item using multi-select', async () => {
      renderWithProviders(<StrategicViewPage />);

      await waitFor(() => expect(screen.getByText('Conta Corrente')).toBeInTheDocument());

      const itemButton = screen.getByRole('button', { name: /filtrar por itens/i });
      await userEvent.click(itemButton);

      const itemCheckbox = screen.getByRole('checkbox', { name: 'Energia elétrica' });
      await userEvent.click(itemCheckbox);

      // Only Poupança has Energia elétrica
      await waitFor(() => expect(screen.queryByText('Conta Corrente')).not.toBeInTheDocument());
      expect(screen.getByText('Poupança')).toBeInTheDocument();
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

  // ─── Unit: buildTreeData ──────────────────────────────────────────────────

  describe('buildTreeData', () => {
    it('computes net totals correctly (income positive, expense negative)', () => {
      const { grandTotal } = buildTreeData(strategicViewTransactions);
      expect(grandTotal).toBeCloseTo(5000 - 800 - 200);
    });

    it('groups transactions by account', () => {
      const { accounts } = buildTreeData(strategicViewTransactions);
      const names = accounts.map((a) => a.name);
      expect(names).toContain('Conta Corrente');
      expect(names).toContain('Poupança');
    });

    it('groups by category within account', () => {
      const { accounts } = buildTreeData(strategicViewTransactions);
      const cc = accounts.find((a) => a.name === 'Conta Corrente')!;
      const catNames = cc.categories.map((c) => c.name);
      expect(catNames).toContain('Renda');
      expect(catNames).toContain('Alimentação');
    });

    it('returns empty accounts array for empty input', () => {
      const { accounts, grandTotal } = buildTreeData([]);
      expect(accounts).toHaveLength(0);
      expect(grandTotal).toBe(0);
    });
  });
});
