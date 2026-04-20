import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { UsersPage } from '../UsersPage';
import { renderWithProviders } from '../../test/render-helpers';
import { server } from '../../test/mocks/server';
import { usersList } from '../../test/mocks/fixtures';

describe('UsersPage', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'mock-access-token');
  });

  it('renders the users list', async () => {
    renderWithProviders(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText(usersList[0].email)).toBeInTheDocument();
      expect(screen.getByText(usersList[1].email)).toBeInTheDocument();
    });
  });

  it('shows role badge correctly', async () => {
    renderWithProviders(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Usuário')).toBeInTheDocument();
    });
  });

  it('shows empty state when no users are returned', async () => {
    server.use(
      http.get('http://localhost:3000/users', () => HttpResponse.json([])),
    );

    renderWithProviders(<UsersPage />);

    await waitFor(() =>
      expect(screen.getByText('Nenhum usuário encontrado.')).toBeInTheDocument(),
    );
  });

  it('shows error message on API failure', async () => {
    server.use(
      http.get('http://localhost:3000/users', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    );

    renderWithProviders(<UsersPage />);

    await waitFor(() =>
      expect(screen.getByText('Erro ao carregar usuários.')).toBeInTheDocument(),
    );
  });

  it('renders the new user link', async () => {
    renderWithProviders(<UsersPage />);

    await waitFor(() => expect(screen.getByText('+ Novo usuário')).toBeInTheDocument());
  });
});
