import { useMemo, useState } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { transactionsService } from '../services/transactions.service';
import { useAsync } from '../hooks/useAsync';
import { TransactionsGridView } from './TransactionsGrid.view';
import { formatCurrency } from '../utils/format';
import { ConfirmDialog } from './ConfirmDialog';

const LIMIT_ROWS = 100;
/** Referência estável para não invalidar o useMemo a cada render. */
const NO_TRANSACTIONS: Transaction[] = [];

export function TransactionsGrid({
  refreshKey = 0,
  startDate,
  endDate,
  onEditTransaction,
  onDeleteSuccess,
}: {
  refreshKey?: number;
  startDate: string;
  endDate: string;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteSuccess?: () => void;
}) {
  const [page, setPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [period, setPeriod] = useState({ startDate, endDate });
  const [deleteKey, setDeleteKey] = useState(0);
  const [transactionToRemove, setTransactionToRemove] = useState<Transaction | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');

  // Mudou o período: volta para a página 1 e limpa o filtro.
  // Ajuste de estado durante o render (padrão recomendado pelo React), sem efeito extra.
  if (period.startDate !== startDate || period.endDate !== endDate) {
    setPeriod({ startDate, endDate });
    setPage(1);
    setFilterText('');
  }

  const { data: result, loading, error: loadError } = useAsync(
    () => transactionsService.search(startDate, endDate, page, LIMIT_ROWS),
    [startDate, endDate, page, refreshKey, deleteKey],
  );
  const transactions = result?.data ?? NO_TRANSACTIONS;
  const total = result?.total ?? 0;
  const totalPages = result?.totalPages ?? 1;
  const error = loadError ? 'Erro ao carregar transações.' : '';

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

  async function handleConfirmRemove() {
    if (!transactionToRemove) return;
    setRemoving(true);
    setRemoveError('');
    try {
      await transactionsService.delete(transactionToRemove.id);
      setTransactionToRemove(null);
      setDeleteKey((k) => k + 1);
      onDeleteSuccess?.();
    } catch {
      setRemoveError('Erro ao remover transação.');
    } finally {
      setRemoving(false);
    }
  }

  return (
    <>
      <TransactionsGridView
        transactions={filteredTransactions}
        total={total}
        page={page}
        totalPages={totalPages}
        loading={loading}
        error={removeError || error}
        filterText={filterText}
        onFilterChange={setFilterText}
        onPageChange={setPage}
        onEditTransaction={onEditTransaction}
        onRemoveTransaction={setTransactionToRemove}
      />
      {transactionToRemove && (
        <ConfirmDialog
          message={`Deseja remover a transação "${transactionToRemove.description ?? 'selecionada'}"?`}
          onConfirm={handleConfirmRemove}
          onCancel={() => { setTransactionToRemove(null); setRemoveError(''); }}
          loading={removing}
        />
      )}
    </>
  );
}
