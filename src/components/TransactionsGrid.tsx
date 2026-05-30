import { useEffect, useMemo, useState } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { transactionsService } from '../services/transactions.service';
import { TransactionsGridView, formatCurrency } from './TransactionsGrid.view';

export function TransactionsGrid({
  refreshKey = 0,
  startDate,
  endDate,
  onEditTransaction,
}: {
  refreshKey?: number;
  startDate: string;
  endDate: string;
  onEditTransaction: (tx: Transaction) => void;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');

  const filteredTransactions = useMemo(() => {
    if (!filterText) return transactions;
    const lower = filterText.toLowerCase();
    return transactions.filter((tx) => {
      const typeLabel = tx.type === TransactionType.INCOME ? 'receita' : 'despesa';
      const settledLabel = tx.settled ? 'efetivado' : 'pendente';
      return (
        (tx.description ?? '').toLowerCase().includes(lower) ||
        (tx.account?.name ?? '').toLowerCase().includes(lower) ||
        (tx.category?.name ?? '').toLowerCase().includes(lower) ||
        (tx.transactionItem?.name ?? '').toLowerCase().includes(lower) ||
        (tx.dueDate ?? '').toLowerCase().includes(lower) ||
        (tx.transactionDate ?? '').toLowerCase().includes(lower) ||
        typeLabel.includes(lower) ||
        settledLabel.includes(lower) ||
        formatCurrency(tx.amount).toLowerCase().includes(lower)
      );
    });
  }, [transactions, filterText]);

  useEffect(() => {
    setPage(1);
    setFilterText('');
  }, [startDate, endDate]);

  useEffect(() => {
    setLoading(true);
    setError('');
    transactionsService
      .search(startDate, endDate, page, limit)
      .then((result) => {
        setTransactions(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      })
      .catch(() => setError('Erro ao carregar transações.'))
      .finally(() => setLoading(false));
  }, [startDate, endDate, page, limit, refreshKey]);

  function handleLimitChange(newLimit: number) {
    setLimit(newLimit);
    setPage(1);
  }

  return (
    <TransactionsGridView
      transactions={filteredTransactions}
      total={total}
      page={page}
      totalPages={totalPages}
      limit={limit}
      loading={loading}
      error={error}
      filterText={filterText}
      onFilterChange={setFilterText}
      onPageChange={setPage}
      onLimitChange={handleLimitChange}
      onEditTransaction={onEditTransaction}
    />
  );
}
