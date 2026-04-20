import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export function UserRoute() {
  const { user } = useAuth();
  if (user?.role === UserRole.ADMIN) return <Navigate to="/users" replace />;
  return <Outlet />;
}
