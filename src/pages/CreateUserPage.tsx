import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserRole } from '../types';
import { usersService } from '../services/users.service';

export function CreateUserPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await usersService.create({ name, email, password, role });
      navigate('/users');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao criar usuário.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition bg-white"
            >
              <option value={UserRole.USER}>Usuário</option>
              <option value={UserRole.ADMIN}>Administrador</option>
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
