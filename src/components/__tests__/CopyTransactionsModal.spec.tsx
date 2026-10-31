import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { CopyTransactionsModal } from '../CopyTransactionsModal';
import { server } from '../../test/mocks/server';
import { buildCopyResult, transactionsList } from '../../test/mocks/fixtures';
import type { CopyTransactionsPayload, CopyTransactionsResult } from '../../types';

const COPY_URL = 'http://localhost:3000/transactions/copy';
// tx-2 "Supermercado" (venc. 10/04) e tx-3 "Conta de luz" (venc. 17/04)
const selected = [transactionsList[1], transactionsList[2]];

function renderModal() {
  const props = {
    transactions: selected,
    currentMonth: '2026-04',
    onClose: vi.fn<() => void>(),
    onSuccess: vi.fn<(result: CopyTransactionsResult) => void>(),
  };
  render(<CopyTransactionsModal {...props} />);
  return props;
}

const monthInput = () => screen.getByLabelText('Mês de destino') as HTMLInputElement;
const addButton = () => screen.getByRole('button', { name: 'Adicionar mês' });
const confirmButton = () => screen.getByRole('button', { name: /^Criar \d+ lançamentos?$|^Copiando/ });

async function addMonth(month?: string) {
  if (month) fireEvent.change(monthInput(), { target: { value: month } });
  await userEvent.click(addButton());
}

describe('CopyTransactionsModal', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
  });

  describe('happy flow', () => {
    it('starts with the month after the displayed one and no preview', () => {
      renderModal();

      expect(screen.getByRole('dialog', { name: 'Copiar para competências futuras' })).toBeInTheDocument();
      expect(screen.getByText(/2 lançamentos selecionados/)).toBeInTheDocument();
      expect(monthInput().value).toBe('2026-05');
      expect(monthInput().min).toBe('2026-05');
      expect(screen.getByText('Escolha ao menos um mês para ver a prévia.')).toBeInTheDocument();
      expect(confirmButton()).toBeDisabled();
      expect(confirmButton()).toHaveTextContent('Criar 0 lançamentos');
    });

    it('adds a month, requests a dry-run preview and lists the copies of that month', async () => {
      const bodies: CopyTransactionsPayload[] = [];
      server.use(
        http.post(COPY_URL, async ({ request }) => {
          const body = (await request.json()) as CopyTransactionsPayload;
          bodies.push(body);
          return HttpResponse.json(buildCopyResult(body));
        }),
      );
      renderModal();

      await addMonth();

      const preview = await screen.findByRole('region', { name: 'Prévia Maio 2026' });
      expect(within(preview).getByText('Supermercado')).toBeInTheDocument();
      expect(within(preview).getByText('Venc. 10/05/2026')).toBeInTheDocument();
      expect(within(preview).getByText('Conta de luz')).toBeInTheDocument();
      expect(within(preview).getByText('Venc. 17/05/2026')).toBeInTheDocument();
      expect(confirmButton()).toHaveTextContent('Criar 2 lançamentos');
      expect(confirmButton()).toBeEnabled();
      expect(bodies[0]).toEqual({ transactionIds: ['tx-2', 'tx-3'], targetMonths: ['2026-05'], dryRun: true });
    });

    it('advances the picker after adding and keeps chosen months sorted', async () => {
      renderModal();

      await addMonth('2026-08');
      expect(monthInput().value).toBe('2026-09');
      await addMonth('2026-06');

      const chips = within(screen.getByRole('list', { name: 'Meses escolhidos' })).getAllByRole('listitem');
      expect(chips.map((c) => c.textContent)).toEqual(['Junho 2026', 'Agosto 2026']);
      await waitFor(() => expect(confirmButton()).toHaveTextContent('Criar 4 lançamentos'));
    });

    it('removes a chosen month and updates the preview', async () => {
      renderModal();
      await addMonth('2026-05');
      await addMonth('2026-06');
      await waitFor(() => expect(confirmButton()).toHaveTextContent('Criar 4 lançamentos'));

      await userEvent.click(screen.getByRole('button', { name: 'Remover Maio 2026' }));

      await waitFor(() => expect(confirmButton()).toHaveTextContent('Criar 2 lançamentos'));
      expect(screen.queryByRole('region', { name: 'Prévia Maio 2026' })).not.toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Prévia Junho 2026' })).toBeInTheDocument();
    });

    it('marks duplicates as ignored and does not count them', async () => {
      server.use(
        http.post(COPY_URL, async ({ request }) => {
          const body = (await request.json()) as CopyTransactionsPayload;
          const result = buildCopyResult(body);
          return HttpResponse.json({
            ...result,
            created: result.created.filter((c) => c.sourceId !== 'tx-3'),
            skipped: [{ sourceId: 'tx-3', targetMonth: '2026-05', dueDate: '2026-05-17', reason: 'duplicate' }],
          });
        }),
      );
      renderModal();

      await addMonth();

      const preview = await screen.findByRole('region', { name: 'Prévia Maio 2026' });
      expect(within(preview).getByText('Conta de luz')).toBeInTheDocument();
      expect(within(preview).getByText('Já existe — será ignorado')).toBeInTheDocument();
      expect(confirmButton()).toHaveTextContent('Criar 1 lançamento');
    });

    it('confirms with dryRun false and reports the result', async () => {
      const bodies: CopyTransactionsPayload[] = [];
      server.use(
        http.post(COPY_URL, async ({ request }) => {
          const body = (await request.json()) as CopyTransactionsPayload;
          bodies.push(body);
          return HttpResponse.json(buildCopyResult(body));
        }),
      );
      const { onSuccess } = renderModal();
      await addMonth();
      await waitFor(() => expect(confirmButton()).toBeEnabled());

      await userEvent.click(confirmButton());

      await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
      expect(bodies.at(-1)).toEqual({ transactionIds: ['tx-2', 'tx-3'], targetMonths: ['2026-05'], dryRun: false });
      expect(onSuccess.mock.calls[0][0].created).toHaveLength(2);
    });

    it('calls onClose when cancel is clicked', async () => {
      const { onClose } = renderModal();

      await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('month rules', () => {
    it('does not allow the displayed month or earlier', async () => {
      renderModal();

      fireEvent.change(monthInput(), { target: { value: '2026-04' } });
      expect(addButton()).toBeDisabled();

      fireEvent.change(monthInput(), { target: { value: '2025-12' } });
      expect(addButton()).toBeDisabled();
    });

    it('does not allow adding the same month twice', async () => {
      renderModal();
      await addMonth('2026-07');

      fireEvent.change(monthInput(), { target: { value: '2026-07' } });

      expect(addButton()).toBeDisabled();
    });

    it('limits the selection to 24 months', async () => {
      renderModal();

      // fireEvent (síncrono): 24 cliques com userEvent ficam lentos sob a suíte completa
      for (let i = 0; i < 24; i++) fireEvent.click(addButton());

      expect(screen.getByText(/24\/24 meses/)).toBeInTheDocument();
      expect(addButton()).toBeDisabled();
    });
  });

  describe('bad flow', () => {
    it('shows an error and keeps confirm disabled when the preview fails', async () => {
      server.use(http.post(COPY_URL, () => HttpResponse.json({ message: 'boom' }, { status: 500 })));
      renderModal();

      await addMonth();

      expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao calcular a prévia da cópia.');
      expect(confirmButton()).toBeDisabled();
    });

    it('explains when the backend refuses transfers (400)', async () => {
      server.use(
        http.post(COPY_URL, () =>
          HttpResponse.json({ message: 'Transfer transactions cannot be copied', transferIds: ['tx-2'] }, { status: 400 }),
        ),
      );
      renderModal();

      await addMonth();

      expect(await screen.findByRole('alert')).toHaveTextContent('Transferências não podem ser copiadas');
    });

    it('explains when selected transactions no longer exist (404)', async () => {
      server.use(
        http.post(COPY_URL, () =>
          HttpResponse.json({ message: 'Transactions not found', notFoundIds: ['tx-2'] }, { status: 404 }),
        ),
      );
      renderModal();

      await addMonth();

      expect(await screen.findByRole('alert')).toHaveTextContent('não existem mais');
    });

    it('keeps the modal open and shows the error when the copy itself fails', async () => {
      server.use(
        http.post(COPY_URL, async ({ request }) => {
          const body = (await request.json()) as CopyTransactionsPayload;
          if (body.dryRun) return HttpResponse.json(buildCopyResult(body));
          return HttpResponse.json({ message: 'boom' }, { status: 500 });
        }),
      );
      const { onSuccess } = renderModal();
      await addMonth();
      await waitFor(() => expect(confirmButton()).toBeEnabled());

      await userEvent.click(confirmButton());

      expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao copiar lançamentos.');
      expect(onSuccess).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
