import { useAuth } from '../contexts/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Olá, {user?.name}!</h1>
      <p className="text-slate-500 mb-8">Bem-vindo ao MyGoals — seu controle financeiro familiar.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Saldo total', value: 'R$ 0,00', color: 'text-sky-600' },
          { label: 'Receitas do mês', value: 'R$ 0,00', color: 'text-emerald-600' },
          { label: 'Despesas do mês', value: 'R$ 0,00', color: 'text-red-500' },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
