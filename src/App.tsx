import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { UserRoute } from './components/UserRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { CreateUserPage } from './pages/CreateUserPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas protegidas — Layout persiste entre navegações */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>

              {/* Somente admin */}
              <Route element={<AdminRoute />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/new" element={<CreateUserPage />} />
              </Route>

              {/* Somente não-admin */}
              <Route element={<UserRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>

            </Route>
          </Route>

          {/* Qualquer rota desconhecida vai para /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
