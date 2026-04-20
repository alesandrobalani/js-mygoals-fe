import { describe, it, expect, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { LoginPage } from '../LoginPage';
import { renderWithProviders } from '../../test/render-helpers';
import { server } from '../../test/mocks/server';
import { authResponse } from '../../test/mocks/fixtures';

describe('LoginPage', () => {
  afterEach(() => localStorage.clear());

  it('renders the login form', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('removes the form after successful login (redirect happened)', async () => {
    renderWithProviders(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('seu@email.com'), 'admin@mygoals.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /entrar/i })).not.toBeInTheDocument(),
    );
  });

  it('shows error message on failed login', async () => {
    server.use(
      http.post('http://localhost:3000/auth/login', () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );

    renderWithProviders(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('seu@email.com'), 'wrong@email.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() =>
      expect(screen.getByText('E-mail ou senha inválidos.')).toBeInTheDocument(),
    );
  });

  it('disables the button while loading', async () => {
    server.use(
      http.post('http://localhost:3000/auth/login', async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return HttpResponse.json(authResponse);
      }),
    );

    renderWithProviders(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('seu@email.com'), 'admin@mygoals.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');

    const button = screen.getByRole('button', { name: /entrar/i });
    user.click(button);

    await waitFor(() => expect(button).toBeDisabled());
  });
});
