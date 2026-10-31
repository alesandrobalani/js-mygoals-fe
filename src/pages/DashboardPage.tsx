import { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../contexts/useAuth';
import type { Transaction } from '../types';
import { transactionsService } from '../services/transactions.service';
import { DashboardView } from './DashboardPage.view';
import { TransactionsGrid } from '../components/TransactionsGrid';
import { AccountsPanel } from '../components/AccountsPanel';
import { CreateTransactionModal } from '../components/CreateTransactionModal';
import { getMonthRange } from '../utils/date';
import { formatCurrency } from '../utils/format';

export function DashboardPage() {
  const { user } = useAuth();
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { startDate, endDate } = getMonthRange(selectedYear, selectedMonth);

  const { data: summary, loading, error: loadError } = useAsync(
    () => transactionsService.getSummary(startDate, endDate),
    [startDate, endDate, refreshKey],
  );
  const { incomeSettled = 0, incomeNotSettled = 0, expenseSettled = 0, expenseNotSettled = 0 } = summary ?? {};
  const error = loadError ? 'Erro ao carregar resumo financeiro.' : '';

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

  function handleTransactionCreated() {
    setRefreshKey((k) => k + 1);
  }

  function handleEditTransaction(tx: Transaction) {
    setEditingTransaction(tx);
  }

  function handleEditModalClose() {
    setEditingTransaction(null);
  }

  // Spinner de página só na primeira carga. Nas recargas (troca de mês, criação,
  // edição, exclusão, cópia) a página continua montada com os valores anteriores:
  // assim o grid não perde estado (aviso de cópia, seleção) nem o scroll.
  if (loading && !summary) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: 'Despesas estimadas mês', value: formatCurrency(expenseSettled + expenseNotSettled), color: 'text-red-500' },
    { label: 'Despesas efetivadas mês', value: formatCurrency(expenseSettled), color: 'text-red-500' },
    { label: 'Receitas estimadas mês', value: formatCurrency(incomeSettled + incomeNotSettled), color: 'text-emerald-600' },
    { label: 'Receitas efetivadas mês', value: formatCurrency(incomeSettled), color: 'text-emerald-600' },
    { label: 'Saldo estimado total', value: formatCurrency((incomeSettled + incomeNotSettled) - (expenseSettled + expenseNotSettled)), color: 'text-sky-600' },
    { label: 'Saldo efetivado total', value: formatCurrency(incomeSettled - expenseSettled), color: 'text-sky-600' },
  ];

  return (
    <>
      <DashboardView
        userName={user?.name}
        cards={cards}
        error={error}
        year={selectedYear}
        month={selectedMonth}
        onOpenModal={() => setIsModalOpen(true)}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onMonthChange={handleMonthChange}
      />
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0">
          <TransactionsGrid
            refreshKey={refreshKey}
            startDate={startDate}
            endDate={endDate}
            onEditTransaction={handleEditTransaction}
            onDeleteSuccess={() => setRefreshKey((k) => k + 1)}
            onCopySuccess={() => setRefreshKey((k) => k + 1)}
          />
        </div>
        <div className="w-full lg:w-80 shrink-0">
          <AccountsPanel
            refreshKey={refreshKey}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>
      {isModalOpen && (
        <CreateTransactionModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleTransactionCreated}
        />
      )}
      {editingTransaction && (
        <CreateTransactionModal
          transaction={editingTransaction}
          onClose={handleEditModalClose}
          onSuccess={() => { handleTransactionCreated(); handleEditModalClose(); }}
        />
      )}
    </>
  );
}
