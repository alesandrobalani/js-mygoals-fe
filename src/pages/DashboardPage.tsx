import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { transactionsService } from '../services/transactions.service';
import { DashboardView } from './DashboardPage.view';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function getCurrentMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

export function DashboardPage() {
  const { user } = useAuth();
  const [incomeSettled, setIncomeSettled] = useState(0);
  const [incomeNotSettled, setIncomeNotSettled] = useState(0);
  const [expenseSettled, setExpenseSettled] = useState(0);
  const [expenseNotSettled, setExpenseNotSettled] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const { startDate, endDate } = getCurrentMonthRange();
    transactionsService
      .getSummary(startDate, endDate)
      .then((summary) => {
        setIncomeSettled(summary.incomeSettled);
        setIncomeNotSettled(summary.incomeNotSettled);
        setExpenseSettled(summary.expenseSettled);
        setExpenseNotSettled(summary.expenseNotSettled);
      })
      .catch(() => setError('Erro ao carregar resumo financeiro.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: 'Despesas estimadas mês', value: formatCurrency(expenseSettled+expenseNotSettled), color: 'text-red-500' },
    { label: 'Despesas efetivadas mês', value: formatCurrency(expenseSettled), color: 'text-red-500' },
    { label: 'Receitas estimadas mês', value: formatCurrency(incomeSettled+incomeNotSettled), color: 'text-emerald-600' },
    { label: 'Receitas efetivadas mês', value: formatCurrency(incomeSettled), color: 'text-emerald-600' },
    { label: 'Saldo estimado total', value: formatCurrency((incomeSettled + incomeNotSettled) - (expenseSettled + expenseNotSettled)), color: 'text-sky-600' },
    { label: 'Saldo efetivado total', value: formatCurrency(incomeSettled - expenseSettled), color: 'text-sky-600' },
  ];

  return <DashboardView userName={user?.name} cards={cards} error={error} />;
}
