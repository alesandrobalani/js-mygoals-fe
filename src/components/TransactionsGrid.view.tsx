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
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
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
                <th className="text-left px-6 py-3 font-medium text-slate-600">Tipo</th>
                <th className="text-right px-6 py-3 font-medium text-slate-600">Valor</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Vencimento</th>
                <th className="text-left px-6 py-3 font-medium text-slate-600">Efetivado</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={tx.id} className={i < transactions.length - 1 ? 'border-b border-slate-100' : ''}>
                  <td className="px-6 py-4 text-slate-500">{formatDate(tx.transactionDate)}</td>
                  <td className="px-6 py-4 text-slate-800">{tx.description ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.type === TransactionType.INCOME
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {tx.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-medium ${
                      tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(tx.dueDate)}</td>
                  <td className="px-6 py-4 text-slate-500">{tx.settled ? 'Sim' : 'Não'}</td>
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
