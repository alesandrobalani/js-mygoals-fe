interface SubCard {
  value: string;
  color: string;
}

interface AccountCard {
  accountName: string;
  settled: SubCard;
  estimated: SubCard;
}

interface AccountsPanelViewProps {
  accounts: AccountCard[];
  loading: boolean;
  error: string;
}

export function AccountsPanelView({ accounts, loading, error }: AccountsPanelViewProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">Contas</h2>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && accounts.length === 0 && !error && (
        <p className="text-slate-400 text-sm">Nenhuma conta com movimentação no período.</p>
      )}

      <div className="flex flex-col gap-3">
        {!loading && accounts.map((account) => (
          <div key={account.accountName} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">{account.accountName}</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3">
                <p className="text-xs font-medium text-sky-600 uppercase tracking-wide mb-1">Efetivado</p>
                <p className={`text-sm font-bold ${account.settled.color}`}>{account.settled.value}</p>
              </div>
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wide mb-1">Estimado</p>
                <p className={`text-sm font-bold ${account.estimated.color}`}>{account.estimated.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
