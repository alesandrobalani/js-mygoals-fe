import type { Transaction } from '../types';
import { TransactionType } from '../types';


const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

interface TransactionsGridViewProps {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  loading: boolean;
  error: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEditTransaction: (tx: Transaction) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function TransactionsGridView({
  transactions,
  page,
  totalPages,
  limit,
  loading,
  error,
  onPageChange,
  onLimitChange,
  onEditTransaction,
}: TransactionsGridViewProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">Transações do mês</h2>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-6 py-3 font-medium text-slate-600">Data</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Descrição</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Conta</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Tipo</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Categoria</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Item</th>
                <th className="text-right px-6 py-3 font-medium text-slate-600">Valor</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Vencimento</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Efetivado</th>
                <th className="px-4 py-3" />
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
                  <td className="px-6 py-4 text-slate-500">{tx.transactionDate ?? '—'}</td>
                  <td className="px-6 py-4 text-slate-800">{tx.description ?? '—'}</td>
                  <td className="px-6 py-4 text-slate-800">{tx.account?.name ?? '—'}</td>
                  <td className="px-6 py-4">
                    {tx.type === TransactionType.INCOME ? (
                      <span aria-label="Receita" title="Receita">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="16 12 12 8 8 12" />
                          <line x1="12" y1="16" x2="12" y2="8" />
                        </svg>
                      </span>
                    ) : (
                      <span aria-label="Despesa" title="Despesa">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="8 12 12 16 16 12" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-800">{tx.category?.name ?? '—'}</td>
                  <td className="px-6 py-4 text-slate-800">{tx.transactionItem?.name ?? '—'}</td>
                  <td
                    className={`px-6 py-4 text-right font-medium ${
                      tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{tx.dueDate ?? '—'}</td>
                  <td className="px-6 py-4">
                    {tx.settled ? (
                      <span aria-label="Efetivado" title="Efetivado">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </span>
                    ) : (
                      <span aria-label="Pendente" title="Pendente">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onEditTransaction(tx)}
                      aria-label="Editar transação"
                      title="Editar"
                      className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <span>Registros por página:</span>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              onClick={() => onLimitChange(size)}
              className={`px-2 py-1 rounded ${
                limit === size
                  ? 'bg-sky-600 text-white font-medium'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

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
