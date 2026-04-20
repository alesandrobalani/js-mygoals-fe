import { Link } from 'react-router-dom';
import type { User } from '../types';
import { UserRole } from '../types';

interface UsersViewProps {
  users: User[];
  error: string;
}

function roleBadgeClass(role: UserRole) {
  return role === UserRole.ADMIN ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600';
}

export function UsersView({ users, error }: UsersViewProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuários</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie os usuários do sistema</p>
        </div>
        <Link
          to="/users/new"
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Novo usuário
        </Link>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">Nenhum usuário encontrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-6 py-3 font-medium text-slate-600">Nome</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">E-mail</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Perfil</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Atualizado em</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className={i < users.length - 1 ? 'border-b border-slate-100' : ''}>
                  <td className="px-6 py-4 text-slate-800 font-medium">{u.name}</td>
                  <td className="px-6 py-4 text-slate-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadgeClass(u.role)}`}>
                      {u.role === UserRole.ADMIN ? 'Admin' : 'Usuário'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(u.updatedAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
