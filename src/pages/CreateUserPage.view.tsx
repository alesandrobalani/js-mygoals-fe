import { Link } from 'react-router-dom';
import type { FormEvent } from 'react';
import type { UserRole } from '../types';
import { UserRole as UserRoleEnum } from '../types';

interface CreateUserViewProps {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  error: string;
  loading: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRoleChange: (value: UserRole) => void;
  onSubmit: (e: FormEvent) => void;
}

export function CreateUserView({
  name, email, password, role, error, loading,
  onNameChange, onEmailChange, onPasswordChange, onRoleChange, onSubmit,
}: CreateUserViewProps) {
  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/users" className="text-slate-400 hover:text-slate-600 text-sm transition-colors">
          ← Usuários
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">Novo usuário</h1>
      <p className="text-slate-500 text-sm mb-8">Preencha os dados para criar uma nova conta.</p>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              required
              placeholder="João Silva"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              placeholder="joao@email.com"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              minLength={8}
              placeholder="mínimo 8 caracteres"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Perfil</label>
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition bg-white"
            >
              <option value={UserRoleEnum.USER}>Usuário</option>
              <option value={UserRoleEnum.ADMIN}>Administrador</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              to="/users"
              className="flex-1 py-2.5 text-center border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Criando...' : 'Criar usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
