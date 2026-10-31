import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { formatCurrency } from '../utils/format';

interface TransactionsGridViewProps {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string;
  filterText: string;
  onFilterChange: (text: string) => void;
  onPageChange: (page: number) => void;
  onEditTransaction: (tx: Transaction) => void;
  onRemoveTransaction: (tx: Transaction) => void;
  selectedIds: ReadonlyMap<string, unknown>;
  isSelectable: (tx: Transaction) => boolean;
  onToggleSelect: (tx: Transaction) => void;
  onToggleSelectAll: () => void;
  onOpenCopy: () => void;
  onClearSelection: () => void;
  copySuccessMessage: string;
  onDismissCopySuccess: () => void;
}

export function TransactionsGridView({
  selectedIds,
  isSelectable,
  onToggleSelect,
  onToggleSelectAll,
  onOpenCopy,
  onClearSelection,
  copySuccessMessage,
  onDismissCopySuccess,
  transactions,
  page,
  totalPages,
  loading,
  error,
  filterText,
  onFilterChange,
  onPageChange,
  onEditTransaction,
  onRemoveTransaction,
}: TransactionsGridViewProps) {
  const selectedCount = selectedIds.size;
  const selectableVisible = transactions.filter(isSelectable);
  const visibleSelected = selectableVisible.filter((tx) => selectedIds.has(tx.id)).length;
  const allVisibleSelected = selectableVisible.length > 0 && visibleSelected === selectableVisible.length;
  const someVisibleSelected = visibleSelected > 0 && !allVisibleSelected;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-700">Transações do mês</h2>
        <div className="relative w-64">
          <input
            type="text"
            value={filterText}
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder="Filtrar transações..."
            aria-label="Filtrar transações"
            className="w-full px-3 py-1.5 pr-8 text-sm border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
          />
          {filterText && (
            <button
              type="button"
              onClick={() => onFilterChange('')}
              aria-label="Limpar filtro"
              title="Limpar filtro"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {copySuccessMessage && (
        <div
          role="status"
          className="mb-4 flex items-center justify-between gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700"
        >
          <span>{copySuccessMessage}</span>
          <button
            type="button"
            onClick={onDismissCopySuccess}
            aria-label="Fechar aviso"
            className="p-0.5 rounded hover:bg-emerald-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {selectedCount > 0 && (
        <div
          role="toolbar"
          aria-label="Ações da seleção"
          className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 bg-sky-50 border border-sky-200 rounded-lg text-sm"
        >
          <span className="font-medium text-sky-800">
            {selectedCount} {selectedCount === 1 ? 'selecionado' : 'selecionados'}
          </span>
          <button
            type="button"
            onClick={onOpenCopy}
            className="px-3 py-1 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
          >
            Copiar para competências futuras
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            className="px-2 py-1 rounded-lg text-sky-700 hover:bg-sky-100 transition-colors"
          >
            Limpar seleção
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Nenhuma transação no período.
          </div>
        ) : (
          <table className="w-full table-fixed text-[11px] sm:text-xs md:text-sm">
            <colgroup>
              <col className="w-[4%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[13%]" />
              <col className="w-[12%]" />
              <col className="w-[6%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[6%]" />
              <col className="w-[7%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-1 md:px-3 py-2 md:py-3 text-center">
                  <input
                    type="checkbox"
                    aria-label="Selecionar todos os lançamentos visíveis"
                    checked={allVisibleSelected}
                    disabled={selectableVisible.length === 0}
                    ref={(el) => {
                      if (el) el.indeterminate = someVisibleSelected;
                    }}
                    onChange={onToggleSelectAll}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 accent-sky-600 cursor-pointer disabled:cursor-not-allowed"
                  />
                </th>
                <th className="text-left px-1.5 sm:px-3 md:px-6 py-2 md:py-3 font-medium text-slate-600 break-words">Vencimento</th>
                <th className="text-left px-1.5 sm:px-3 md:px-6 py-2 md:py-3 font-medium text-slate-600 break-words">Data</th>
                <th className="text-left px-1.5 sm:px-3 md:px-6 py-2 md:py-3 font-medium text-slate-600 break-words">Descrição</th>
                <th className="text-left px-1.5 sm:px-3 md:px-6 py-2 md:py-3 font-medium text-slate-600 break-words">Conta</th>
                <th className="text-left px-1.5 sm:px-3 md:px-6 py-2 md:py-3 font-medium text-slate-600 break-words">Tipo</th>
                <th className="text-left px-1.5 sm:px-3 md:px-6 py-2 md:py-3 font-medium text-slate-600 break-words">Categoria</th>
                <th className="text-left px-1.5 sm:px-3 md:px-6 py-2 md:py-3 font-medium text-slate-600 break-words">Item</th>
                <th className="text-right px-1.5 sm:px-3 md:px-6 py-2 md:py-3 font-medium text-slate-600 break-words">Valor</th>
                <th className="text-left px-1.5 sm:px-3 md:px-6 py-2 md:py-3 font-medium text-slate-600 break-words">Efetivado</th>
                <th className="px-1 md:px-4 py-2 md:py-3" />
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr
                  key={tx.id}
                  className={[
                    i < transactions.length - 1 ? 'border-b border-slate-100' : '',
                    tx.type === TransactionType.INCOME ? 'bg-emerald-50/60' : 'bg-red-50/40',
                  ].join(' ')}
                >
                  <td className="px-1 md:px-3 py-2 md:py-4 text-center">
                    {isSelectable(tx) ? (
                      <input
                        type="checkbox"
                        aria-label={`Selecionar ${tx.description ?? 'lançamento'}`}
                        checked={selectedIds.has(tx.id)}
                        onChange={() => onToggleSelect(tx)}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 accent-sky-600 cursor-pointer"
                      />
                    ) : (
                      <span title="Transferências não podem ser copiadas">
                        <input
                          type="checkbox"
                          aria-label={`${tx.description ?? 'Lançamento'}: transferências não podem ser copiadas`}
                          disabled
                          className="w-3.5 h-3.5 md:w-4 md:h-4 cursor-not-allowed opacity-40"
                        />
                      </span>
                    )}
                  </td>
                  <td className="px-1.5 sm:px-3 md:px-6 py-2 md:py-4 text-slate-500 break-words">{tx.dueDate ?? '—'}</td>
                  <td className="px-1.5 sm:px-3 md:px-6 py-2 md:py-4 text-slate-500 break-words">{tx.transactionDate ?? '—'}</td>
                  <td className="px-1.5 sm:px-3 md:px-6 py-2 md:py-4 text-slate-800 truncate" title={tx.description ?? undefined}>{tx.description ?? '—'}</td>
                  <td className="px-1.5 sm:px-3 md:px-6 py-2 md:py-4 text-slate-800 break-words">{tx.account?.name ?? '—'}</td>
                  <td className="px-1.5 sm:px-3 md:px-6 py-2 md:py-4">
                    {tx.type === TransactionType.INCOME ? (
                      <span aria-label="Receita" title="Receita">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="16 12 12 8 8 12" />
                          <line x1="12" y1="16" x2="12" y2="8" />
                        </svg>
                      </span>
                    ) : (
                      <span aria-label="Despesa" title="Despesa">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="8 12 12 16 16 12" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="px-1.5 sm:px-3 md:px-6 py-2 md:py-4 text-slate-800 break-words">{tx.category?.name ?? '—'}</td>
                  <td className="px-1.5 sm:px-3 md:px-6 py-2 md:py-4 text-slate-800 break-words">{tx.transactionItem?.name ?? '—'}</td>
                  <td
                    className={`px-1.5 sm:px-3 md:px-6 py-2 md:py-4 text-right font-medium break-words ${
                      tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-1.5 sm:px-3 md:px-6 py-2 md:py-4">
                    {tx.settled ? (
                      <span aria-label="Efetivado" title="Efetivado">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </span>
                    ) : (
                      <span aria-label="Pendente" title="Pendente">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="px-0.5 md:px-1 py-2 md:py-4">
                    <div className="flex flex-col xl:flex-row items-center justify-center gap-1">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        aria-label="Editar transação"
                        title="Editar"
                        className="p-0.5 md:p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onRemoveTransaction(tx)}
                        aria-label="Remover transação"
                        title="Remover"
                        className="p-0.5 md:p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            &lt; Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próxima &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
