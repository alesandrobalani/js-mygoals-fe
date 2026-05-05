import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { CreateTransactionModal } from '../CreateTransactionModal';
import { renderWithProviders } from '../../test/render-helpers';
import { server } from '../../test/mocks/server';
import { categoriesList, accountsList, transactionItemsList, createdTransaction } from '../../test/mocks/fixtures';

describe('CreateTransactionModal', () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
    onClose.mockClear();
    onSuccess.mockClear();
  });

  describe('happy flow', () => {
    it('renders the modal with all form fields', async () => {
      renderWithProviders(<CreateTransactionModal onClose={onClose} onSuccess={onSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Nova Transação')).toBeInTheDocument();
        expect(screen.getByLabelText(/Tipo/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Valor/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Data da transação/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Categoria/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Conta/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Item/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Descrição/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Data de vencimento/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Efetivado/)).toBeInTheDocument();
      });
    });

    it('renders settled checkbox checked by default', async () => {
      renderWithProviders(<CreateTransactionModal onClose={onClose} onSuccess={onSuccess} />);

      await waitFor(() => {
        const checkbox = screen.getByLabelText(/Efetivado/);
        expect(checkbox).toBeChecked();
      });
    });

    it('sends settled=true when checkbox is checked (default)', async () => {
      let capturedBody: unknown;
      server.use(
        http.post('http://localhost:3000/transactions', async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json(createdTransaction, { status: 201 });
        }),
      );

      renderWithProviders(<CreateTransactionModal onClose={onClose} onSuccess={onSuccess} />);

      await waitFor(() =>
        expect(screen.getByRole('option', { name: categoriesList[0].name })).toBeInTheDocument(),
      );

      await userEvent.type(screen.getByLabelText(/Valor/), '150');
      await userEvent.type(screen.getByLabelText(/Data da transação/), '2026-04-20');
      await userEvent.selectOptions(screen.getByLabelText(/Categoria/), categoriesList[0].id);
      await userEvent.selectOptions(screen.getByLabelText(/Conta/), accountsList[0].id);
      await userEvent.selectOptions(screen.getByLabelText(/Item/), transactionItemsList[0].id);

      await userEvent.click(screen.getByRole('button', { name: /Salvar/ }));

      await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
      expect((capturedBody as Record<string, unknown>).settled).toBe(true);
    });

    it('sends settled=false when checkbox is unchecked', async () => {
      let capturedBody: unknown;
      server.use(
        http.post('http://localhost:3000/transactions', async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json(createdTransaction, { status: 201 });
        }),
      );

      renderWithProviders(<CreateTransactionModal onClose={onClose} onSuccess={onSuccess} />);

      await waitFor(() =>
        expect(screen.getByRole('option', { name: categoriesList[0].name })).toBeInTheDocument(),
      );

      await userEvent.type(screen.getByLabelText(/Valor/), '150');
      await userEvent.type(screen.getByLabelText(/Data da transação/), '2026-04-20');
      await userEvent.selectOptions(screen.getByLabelText(/Categoria/), categoriesList[0].id);
      await userEvent.selectOptions(screen.getByLabelText(/Conta/), accountsList[0].id);
      await userEvent.selectOptions(screen.getByLabelText(/Item/), transactionItemsList[0].id);
      await userEvent.click(screen.getByLabelText(/Efetivado/));

      await userEvent.click(screen.getByRole('button', { name: /Salvar/ }));

      await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
      expect((capturedBody as Record<string, unknown>).settled).toBe(false);
    });

    it('loads categories into select', async () => {
      renderWithProviders(<CreateTransactionModal onClose={onClose} onSuccess={onSuccess} />);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: categoriesList[0].name })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: categoriesList[1].name })).toBeInTheDocument();
      });
    });

    it('loads accounts into select', async () => {
      renderWithProviders(<CreateTransactionModal onClose={onClose} onSuccess={onSuccess} />);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: accountsList[0].name })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: accountsList[1].name })).toBeInTheDocument();
      });
    });

    it('loads transaction items into select', async () => {
      renderWithProviders(<CreateTransactionModal onClose={onClose} onSuccess={onSuccess} />);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: transactionItemsList[0].name })).toBeInTheDocument();
      });
    });

    it('calls onSuccess and onClose after successful submit', async () => {
      renderWithProviders(<CreateTransactionModal onClose={onClose} onSuccess={onSuccess} />);

      await waitFor(() =>
        expect(screen.getByRole('option', { name: categoriesList[0].name })).toBeInTheDocument(),
      );

      await userEvent.type(screen.getByLabelText(/Valor/), '150');
      await userEvent.type(screen.getByLabelText(/Data da transação/), '2026-04-20');
      await userEvent.selectOptions(screen.getByLabelText(/Categoria/), categoriesList[0].id);
      await userEvent.selectOptions(screen.getByLabelText(/Conta/), accountsList[0].id);
      await userEvent.selectOptions(screen.getByLabelText(/Item/), transactionItemsList[0].id);

      await userEvent.click(screen.getByRole('button', { name: /Salvar/ }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledOnce();
        expect(onClose).toHaveBeenCalledOnce();
      });
    });

    it('calls onClose when Cancelar is clicked', async () => {
      renderWithProviders(<CreateTransactionModal onClose={onClose} onSuccess={onSuccess} />);

      await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(onClose).toHaveBeenCalledOnce();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('keeps Salvar disabled when required fields are empty', async () => {
      renderWithProviders(<CreateTransactionModal onClose={onClose} onSuccess={onSuccess} />);

      expect(screen.getByRole('button', { name: /Salvar/ })).toBeDisabled();
    });
  });

  describe('bad flow', () => {
    it('shows error when POST /transactions returns 500', async () => {
      server.use(
        http.post('http://localhost:3000/transactions', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      renderWithProviders(<CreateTransactionModal onClose={onClose} onSuccess={onSuccess} />);

      await waitFor(() =>
        expect(screen.getByRole('option', { name: categoriesList[0].name })).toBeInTheDocument(),
      );

      await userEvent.type(screen.getByLabelText(/Valor/), '150');
      await userEvent.type(screen.getByLabelText(/Data da transação/), '2026-04-20');
      await userEvent.selectOptions(screen.getByLabelText(/Categoria/), categoriesList[0].id);
      await userEvent.selectOptions(screen.getByLabelText(/Conta/), accountsList[0].id);
      await userEvent.selectOptions(screen.getByLabelText(/Item/), transactionItemsList[0].id);

      await userEvent.click(screen.getByRole('button', { name: /Salvar/ }));

      await waitFor(() =>
        expect(
          screen.getByText('Erro ao criar transação. Tente novamente.'),
        ).toBeInTheDocument(),
      );

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('shows error when lookup APIs fail', async () => {
      server.use(
        http.get('http://localhost:3000/categories', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      renderWithProviders(<CreateTransactionModal onClose={onClose} onSuccess={onSuccess} />);

      await waitFor(() =>
        expect(
          screen.getByText('Erro ao carregar opções do formulário.'),
        ).toBeInTheDocument(),
      );
    });
  });
});
