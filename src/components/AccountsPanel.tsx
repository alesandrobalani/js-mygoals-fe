import { useEffect, useState } from 'react';
import { transactionsService } from '../services/transactions.service';
import { AccountsPanelView } from './AccountsPanel.view';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function balanceColor(value: number): string {
  return value >= 0 ? 'text-emerald-600' : 'text-red-500';
}

interface AccountCard {
  accountName: string;
  settled: { value: string; color: string };
  estimated: { value: string; color: string };
}

export function AccountsPanel({
  startDate,
  endDate,
  refreshKey = 0,
}: {
  startDate: string;
  endDate: string;
  refreshKey?: number;
}) {
  const [accounts, setAccounts] = useState<AccountCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      transactionsService.getAccountSummary(endDate)
    ])
      .then(([summaries]) => {
        const cards = summaries
          .map((s) => {
            const settled = s.incomeSettled - s.expenseSettled;
            const estimated = (s.incomeSettled + s.incomeNotSettled) - (s.expenseSettled + s.expenseNotSettled);
            return {
              accountName: s.accountName,
              settled: { value: formatCurrency(settled), color: balanceColor(settled) },
              estimated: { value: formatCurrency(estimated), color: balanceColor(estimated) },
              _settledRaw: settled,
              _estimatedRaw: estimated,
            };
          })
          .filter((account) => account._settledRaw !== 0 || account._estimatedRaw !== 0)
          .sort((a, b) => b._settledRaw - a._settledRaw || b._estimatedRaw - a._estimatedRaw)
          .map(({ _settledRaw, _estimatedRaw, ...card }) => card);

        setAccounts(cards);
      })
      .catch(() => setError('Erro ao carregar resumo de contas.'))
      .finally(() => setLoading(false));
  }, [startDate, endDate, refreshKey]);

  return <AccountsPanelView accounts={accounts} loading={loading} error={error} />;
}
