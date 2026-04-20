import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export function AdminRoute() {
  const { user } = useAuth();
  if (user?.role !== UserRole.ADMIN) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
