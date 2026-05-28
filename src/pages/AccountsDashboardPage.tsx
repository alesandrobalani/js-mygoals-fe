import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { AccountSummary } from '../types';
import { AccountsDashboardView } from './AccountsDashboardPage.view';
import { transactionsService } from '../services/transactions.service';
import { getMonthRange } from '../utils/date';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function balanceColor(value: number): string {
  return value >= 0 ? 'text-emerald-600' : 'text-red-500';
}

export function AccountsDashboardPage() {
  const { user } = useAuth();
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [summaries, setSummaries] = useState<AccountSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { endDate } = getMonthRange(selectedYear, selectedMonth);

  useEffect(() => {
    setLoading(true);
    transactionsService
      .getAccountSummary(endDate)
      .then((data) => setSummaries(data))
      .catch(() => setError('Erro ao carregar resumo de contas.'))
      .finally(() => setLoading(false));
  }, [endDate]);

  function handlePrevMonth() {
    if (selectedMonth === 0) {
      setSelectedYear((y) => y - 1);
      setSelectedMonth(11);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (selectedMonth === 11) {
      setSelectedYear((y) => y + 1);
      setSelectedMonth(0);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  }

  function handleMonthChange(year: number, month: number) {
    setSelectedYear(year);
    setSelectedMonth(month);
  }

  const accounts = summaries.map((s) => {
    const settled = s.incomeSettled - s.expenseSettled;
    const estimated = (s.incomeSettled + s.incomeNotSettled) - (s.expenseSettled + s.expenseNotSettled);
    return {
      accountName: s.accountName,
      settled: { value: formatCurrency(settled), color: balanceColor(settled) },
      estimated: { value: formatCurrency(estimated), color: balanceColor(estimated) },
    };
  });

  return (
    <AccountsDashboardView
      userName={user?.name}
      accounts={accounts}
      loading={loading}
      error={error}
      year={selectedYear}
      month={selectedMonth}
      onPrevMonth={handlePrevMonth}
      onNextMonth={handleNextMonth}
      onMonthChange={handleMonthChange}
    />
  );
}
