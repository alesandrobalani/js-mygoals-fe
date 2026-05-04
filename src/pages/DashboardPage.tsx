import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { transactionsService } from '../services/transactions.service';
import { DashboardView } from './DashboardPage.view';
import { TransactionsGrid } from '../components/TransactionsGrid';
import { CreateTransactionModal } from '../components/CreateTransactionModal';

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
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const { startDate, endDate } = getCurrentMonthRange();
    transactionsService
      .getSummary(startDate, endDate)
      .then((summary) => {
        setIncome(summary.income);
        setExpense(summary.expense);
      })
      .catch(() => setError('Erro ao carregar resumo financeiro.'))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  function handleTransactionCreated() {
    setRefreshKey((k) => k + 1);
    setLoading(true);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: 'Saldo total', value: formatCurrency(income - expense), color: 'text-sky-600' },
    { label: 'Receitas do mês', value: formatCurrency(income), color: 'text-emerald-600' },
    { label: 'Despesas do mês', value: formatCurrency(expense), color: 'text-red-500' },
  ];

  return (
    <>
      <DashboardView
        userName={user?.name}
        cards={cards}
        error={error}
        onOpenModal={() => setIsModalOpen(true)}
      />
      <TransactionsGrid refreshKey={refreshKey} />
      {isModalOpen && (
        <CreateTransactionModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleTransactionCreated}
        />
      )}
    </>
  );
}
