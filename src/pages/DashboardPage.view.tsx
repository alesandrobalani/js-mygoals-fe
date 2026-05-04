interface StatCard {
  label: string;
  value: string;
  color: string;
}

interface DashboardViewProps {
  userName: string | undefined;
  cards: StatCard[];
  error: string;
}

export function DashboardView({ userName, cards, error }: DashboardViewProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Olá, {userName}!</h1>
      <p className="text-slate-500 mb-8">Bem-vindo ao MyGoals — seu controle financeiro familiar.</p>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
