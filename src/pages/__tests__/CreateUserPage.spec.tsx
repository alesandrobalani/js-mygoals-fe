import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { CreateUserPage } from '../CreateUserPage';
import { renderWithProviders } from '../../test/render-helpers';
import { server } from '../../test/mocks/server';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('CreateUserPage', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
    mockNavigate.mockReset();
  });

  it('renders the create user form', () => {
    renderWithProviders(<CreateUserPage />);

    expect(screen.getByPlaceholderText('João Silva')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('joao@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('mínimo 8 caracteres')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar usuário/i })).toBeInTheDocument();
  });

  it('submits the form and navigates to /users on success', async () => {
    renderWithProviders(<CreateUserPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('João Silva'), 'Novo Usuario');
    await user.type(screen.getByPlaceholderText('joao@email.com'), 'novo@mygoals.com');
    await user.type(screen.getByPlaceholderText('mínimo 8 caracteres'), 'senha1234');
    await user.click(screen.getByRole('button', { name: /criar usuário/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/users'));
  });

  it('shows error message on API failure', async () => {
    server.use(
      http.post('http://localhost:3000/auth/register', () =>
        HttpResponse.json({ message: 'Email already taken' }, { status: 409 }),
      ),
    );

    renderWithProviders(<CreateUserPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('João Silva'), 'Duplicado');
    await user.type(screen.getByPlaceholderText('joao@email.com'), 'dup@mygoals.com');
    await user.type(screen.getByPlaceholderText('mínimo 8 caracteres'), 'senha1234');
    await user.click(screen.getByRole('button', { name: /criar usuário/i }));

    await waitFor(() => expect(screen.getByRole('button', { name: /criar usuário/i })).not.toBeDisabled());
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
