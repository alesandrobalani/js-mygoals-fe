import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { LayoutView } from './Layout.view';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const navLinks =
    user?.role === UserRole.ADMIN
      ? [{ to: '/users', label: 'Usuários' }]
      : [
          { to: '/dashboard', label: 'Transações' },
          { to: '/visao-estrategica', label: 'Visão Estratégica' },
        ];

  return (
    <LayoutView
      userName={user?.name}
      navLinks={navLinks}
      activePath={location.pathname}
      onLogout={handleLogout}
    />
  );
}
