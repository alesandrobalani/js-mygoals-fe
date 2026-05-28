import { MonthNavigatorView } from '../components/MonthNavigator.view';

interface StatCard {
  label: string;
  value: string;
  color: string;
}

interface DashboardViewProps {
  userName: string | undefined;
  cards: StatCard[];
  error: string;
  year: number;
  month: number;
  onOpenModal: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMonthChange: (year: number, month: number) => void;
}

export function DashboardView({
  userName,
  cards,
  error,
  year,
  month,
  onOpenModal,
  onPrevMonth,
  onNextMonth,
  onMonthChange,
}: DashboardViewProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-slate-800">Olá, {userName}!</h1>
        <button
          onClick={onOpenModal}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nova Transação
        </button>
      </div>
      <p className="text-slate-500 mb-6">Bem-vindo ao MyGoals — seu controle financeiro familiar.</p>

      <MonthNavigatorView
        year={year}
        month={month}
        onPrev={onPrevMonth}
        onNext={onNextMonth}
        onChange={onMonthChange}
      />

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
