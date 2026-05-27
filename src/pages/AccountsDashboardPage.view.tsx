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
  error: string;
}

export function AccountsDashboardView({ userName, accounts, error }: AccountsDashboardViewProps) {
  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-800">Olá, {userName}!</h1>
      </div>
      <p className="text-slate-500 mb-8">Saldos por conta até o mês corrente.</p>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {accounts.length === 0 && !error && (
        <p className="text-slate-400 text-sm">Nenhuma conta cadastrada.</p>
      )}

      <div className="flex flex-col gap-4">
        {accounts.map((account) => (
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
