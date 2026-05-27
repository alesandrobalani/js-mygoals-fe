import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { AccountSummary } from '../types';
import { AccountsDashboardView } from './AccountsDashboardPage.view';
import { transactionsService } from '../services/transactions.service';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function getCurrentMonthEndDate(): string {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return end.toISOString().split('T')[0];
}

function balanceColor(value: number): string {
  return value >= 0 ? 'text-emerald-600' : 'text-red-500';
}

export function AccountsDashboardPage() {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<AccountSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const endDate = getCurrentMonthEndDate();
    transactionsService
      .getAccountSummary(endDate)
      .then((data) => setSummaries(data))
      .catch(() => setError('Erro ao carregar resumo de contas.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = summaries.flatMap((s) => {
    const settled = s.incomeSettled - s.expenseSettled;
    const estimated = (s.incomeSettled + s.incomeNotSettled) - (s.expenseSettled + s.expenseNotSettled);
    return [
      { label: `Saldo efetivado — ${s.accountName}`, value: formatCurrency(settled), color: balanceColor(settled) },
      { label: `Saldo estimado — ${s.accountName}`, value: formatCurrency(estimated), color: balanceColor(estimated) },
    ];
  });

  return (
    <AccountsDashboardView
      userName={user?.name}
      cards={cards}
      error={error}
    />
  );
}
