import { useEffect, useState } from 'react';
import type { Transaction } from '../types';
import { transactionsService } from '../services/transactions.service';
import { TransactionsGridView } from './TransactionsGrid.view';

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

  useEffect(() => {
    setPage(1);
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
      transactions={transactions}
      total={total}
      page={page}
      totalPages={totalPages}
      limit={limit}
      loading={loading}
      error={error}
      onPageChange={setPage}
      onLimitChange={handleLimitChange}
      onEditTransaction={onEditTransaction}
    />
  );
}
