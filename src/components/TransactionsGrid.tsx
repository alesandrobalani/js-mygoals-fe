import { useMemo, useState } from 'react';
import type { CopyTransactionsResult, Transaction } from '../types';
import { TransactionType } from '../types';
import { transactionsService } from '../services/transactions.service';
import { useAsync } from '../hooks/useAsync';
import { TransactionsGridView } from './TransactionsGrid.view';
import { formatCurrency } from '../utils/format';
import { toYearMonth } from '../utils/date';
import { ConfirmDialog } from './ConfirmDialog';
import { CopyTransactionsModal } from './CopyTransactionsModal';

const LIMIT_ROWS = 100;
/** Referência estável para não invalidar o useMemo a cada render. */
const NO_TRANSACTIONS: Transaction[] = [];

/** Transferências não podem ser copiadas (regra do backend). */
const isCopyable = (tx: Transaction) => !tx.category?.isTransfer;

export function TransactionsGrid({
  refreshKey = 0,
  startDate,
  endDate,
  onEditTransaction,
  onDeleteSuccess,
  onCopySuccess,
}: {
  refreshKey?: number;
  startDate: string;
  endDate: string;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteSuccess?: () => void;
  /** Chamado após copiar lançamentos, para atualizar resumo e painel. */
  onCopySuccess?: () => void;
}) {
  const [page, setPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [period, setPeriod] = useState({ startDate, endDate });
  const [deleteKey, setDeleteKey] = useState(0);
  const [transactionToRemove, setTransactionToRemove] = useState<Transaction | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');
  // Map (e não Set) para manter os dados de itens selecionados em outras páginas.
  const [selected, setSelected] = useState<Map<string, Transaction>>(() => new Map());
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const [copySuccessMessage, setCopySuccessMessage] = useState('');

  // Mudou o período: volta para a página 1, limpa filtro, seleção e aviso.
  // Ajuste de estado durante o render (padrão recomendado pelo React), sem efeito extra.
  if (period.startDate !== startDate || period.endDate !== endDate) {
    setPeriod({ startDate, endDate });
    setPage(1);
    setFilterText('');
    setSelected(new Map());
    setCopySuccessMessage('');
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
      const removedId = transactionToRemove.id;
      setSelected((prev) => {
        if (!prev.has(removedId)) return prev;
        const next = new Map(prev);
        next.delete(removedId);
        return next;
      });
      setTransactionToRemove(null);
      setDeleteKey((k) => k + 1);
      onDeleteSuccess?.();
    } catch {
      setRemoveError('Erro ao remover transação.');
    } finally {
      setRemoving(false);
    }
  }

  function handleToggleSelect(tx: Transaction) {
    if (!isCopyable(tx)) return;
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(tx.id)) next.delete(tx.id);
      else next.set(tx.id, tx);
      return next;
    });
  }

  /** Marca todas as linhas visíveis copiáveis; se já estiverem todas marcadas, desmarca-as. */
  function handleToggleSelectAll() {
    const visible = filteredTransactions.filter(isCopyable);
    setSelected((prev) => {
      const next = new Map(prev);
      const allSelected = visible.length > 0 && visible.every((tx) => prev.has(tx.id));
      for (const tx of visible) {
        if (allSelected) next.delete(tx.id);
        else next.set(tx.id, tx);
      }
      return next;
    });
  }

  function handleCopySuccess(result: CopyTransactionsResult) {
    const created = result.created.length;
    const skipped = result.skipped.length;
    let message = `${created} ${created === 1 ? 'lançamento criado' : 'lançamentos criados'}`;
    if (skipped > 0) message += ` · ${skipped} ${skipped === 1 ? 'ignorado' : 'ignorados'} por já existir${skipped === 1 ? '' : 'em'}`;
    setCopySuccessMessage(message);
    setIsCopyOpen(false);
    setSelected(new Map());
    onCopySuccess?.();
  }

  return (
    <>
      <TransactionsGridView
        selectedIds={selected}
        isSelectable={isCopyable}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onOpenCopy={() => setIsCopyOpen(true)}
        onClearSelection={() => setSelected(new Map())}
        copySuccessMessage={copySuccessMessage}
        onDismissCopySuccess={() => setCopySuccessMessage('')}
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
      {isCopyOpen && (
        <CopyTransactionsModal
          transactions={[...selected.values()]}
          currentMonth={toYearMonth(startDate)}
          onClose={() => setIsCopyOpen(false)}
          onSuccess={handleCopySuccess}
        />
      )}
    </>
  );
}
