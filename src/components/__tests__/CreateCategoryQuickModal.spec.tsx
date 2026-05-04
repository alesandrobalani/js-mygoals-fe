import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { CreateCategoryQuickModal } from '../CreateCategoryQuickModal';
import { renderWithProviders } from '../../test/render-helpers';
import { server } from '../../test/mocks/server';
import { createdCategory } from '../../test/mocks/fixtures';

describe('CreateCategoryQuickModal', () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
    onClose.mockClear();
    onSuccess.mockClear();
  });

  describe('happy flow', () => {
    it('renders the modal with Nome and Descrição fields', () => {
      renderWithProviders(<CreateCategoryQuickModal onClose={onClose} onSuccess={onSuccess} />);

      expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
      expect(screen.getByLabelText(/Nome/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Descrição/)).toBeInTheDocument();
    });

    it('keeps Salvar disabled when Nome is empty', () => {
      renderWithProviders(<CreateCategoryQuickModal onClose={onClose} onSuccess={onSuccess} />);

      expect(screen.getByRole('button', { name: /Salvar/ })).toBeDisabled();
    });

    it('enables Salvar when Nome is filled', async () => {
      renderWithProviders(<CreateCategoryQuickModal onClose={onClose} onSuccess={onSuccess} />);

      await userEvent.type(screen.getByLabelText(/Nome/), 'Lazer');

      expect(screen.getByRole('button', { name: /Salvar/ })).not.toBeDisabled();
    });

    it('calls onSuccess with the new category and onClose after submit', async () => {
      renderWithProviders(<CreateCategoryQuickModal onClose={onClose} onSuccess={onSuccess} />);

      await userEvent.type(screen.getByLabelText(/Nome/), createdCategory.name);
      await userEvent.click(screen.getByRole('button', { name: /Salvar/ }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(createdCategory);
        expect(onClose).toHaveBeenCalledOnce();
      });
    });

    it('calls onClose when Cancelar is clicked', async () => {
      renderWithProviders(<CreateCategoryQuickModal onClose={onClose} onSuccess={onSuccess} />);

      await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(onClose).toHaveBeenCalledOnce();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('bad flow', () => {
    it('shows error when POST /categories returns 500', async () => {
      server.use(
        http.post('http://localhost:3000/categories', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
        ),
      );

      renderWithProviders(<CreateCategoryQuickModal onClose={onClose} onSuccess={onSuccess} />);

      await userEvent.type(screen.getByLabelText(/Nome/), 'Lazer');
      await userEvent.click(screen.getByRole('button', { name: /Salvar/ }));

      await waitFor(() =>
        expect(
          screen.getByText('Erro ao criar categoria. Tente novamente.'),
        ).toBeInTheDocument(),
      );

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
