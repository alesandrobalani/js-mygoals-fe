import type { AccountSummary } from '../types';
import { transactionsService } from '../services/transactions.service';
import { useAsync } from '../hooks/useAsync';
import { AccountsPanelView } from './AccountsPanel.view';
import { formatCurrency } from '../utils/format';

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
  const { data: accounts = [], loading, error } = useAsync(
    () => transactionsService.getAccountSummary(endDate).then(toAccountCards),
    [startDate, endDate, refreshKey],
  );

  return (
    <AccountsPanelView
      accounts={accounts}
      loading={loading}
      error={error ? 'Erro ao carregar resumo de contas.' : ''}
    />
  );
}

function toAccountCards(summaries: AccountSummary[]): AccountCard[] {
  return summaries
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
          .map(({ accountName, settled, estimated }) => ({ accountName, settled, estimated }));
}
