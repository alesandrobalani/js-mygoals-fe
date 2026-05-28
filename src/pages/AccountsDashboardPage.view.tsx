import { MonthNavigatorView } from '../components/MonthNavigator.view';

interface SubCard {
  value: string;
  color: string;
}

interface AccountCard {
  accountName: string;
  settled: SubCard;
  estimated: SubCard;
}

interface AccountsDashboardViewProps {
  userName: string | undefined;
  accounts: AccountCard[];
  loading: boolean;
  error: string;
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMonthChange: (year: number, month: number) => void;
}

export function AccountsDashboardView({ userName, accounts, loading, error, year, month, onPrevMonth, onNextMonth, onMonthChange }: AccountsDashboardViewProps) {
  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-800">Olá, {userName}!</h1>
      </div>
      <p className="text-slate-500 mb-6">Saldos por conta no mês selecionado.</p>

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

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && accounts.length === 0 && !error && (
        <p className="text-slate-400 text-sm">Nenhuma conta cadastrada.</p>
      )}

      <div className="flex flex-col gap-4">
        {!loading && accounts.map((account) => (
          <div key={account.accountName} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-700 mb-4">{account.accountName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                <p className="text-xs font-medium text-sky-600 uppercase tracking-wide mb-1">Efetivado</p>
                <p className={`text-xl font-bold ${account.settled.color}`}>{account.settled.value}</p>
              </div>
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wide mb-1">Estimado</p>
                <p className={`text-xl font-bold ${account.estimated.color}`}>{account.estimated.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
