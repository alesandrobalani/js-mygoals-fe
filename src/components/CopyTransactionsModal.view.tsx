import type { CopyTransactionsCreatedItem, CopyTransactionsSkippedItem, YearMonth } from '../types';
import { TransactionType } from '../types';
import { formatCurrency } from '../utils/format';
import { formatDateBR, formatMonthLabel } from '../utils/date';

export interface PreviewGroup {
  month: YearMonth;
  created: CopyTransactionsCreatedItem[];
  skipped: (CopyTransactionsSkippedItem & { description: string })[];
}

interface CopyTransactionsModalViewProps {
  selectedCount: number;
  months: YearMonth[];
  pendingMonth: YearMonth;
  minMonth: YearMonth;
  maxMonths: number;
  canAddMonth: boolean;
  groups: PreviewGroup[];
  previewLoading: boolean;
  createCount: number;
  submitting: boolean;
  error: string;
  onPendingMonthChange: (month: YearMonth) => void;
  onAddMonth: () => void;
  onRemoveMonth: (month: YearMonth) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const plural = (n: number, singular: string, pluralForm: string) => (n === 1 ? singular : pluralForm);

export function CopyTransactionsModalView({
  selectedCount,
  months,
  pendingMonth,
  minMonth,
  maxMonths,
  canAddMonth,
  groups,
  previewLoading,
  createCount,
  submitting,
  error,
  onPendingMonthChange,
  onAddMonth,
  onRemoveMonth,
  onConfirm,
  onClose,
}: CopyTransactionsModalViewProps) {
  const confirmDisabled = submitting || previewLoading || createCount === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="copy-transactions-title"
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 id="copy-transactions-title" className="text-lg font-semibold text-slate-800">
            Copiar para competências futuras
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {selectedCount} {plural(selectedCount, 'lançamento selecionado', 'lançamentos selecionados')}. As cópias
            são criadas como não efetivadas.
          </p>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1">
          <label htmlFor="copy-target-month" className="block text-sm font-medium text-slate-700 mb-1">
            Meses de destino
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="copy-target-month"
              type="month"
              aria-label="Mês de destino"
              value={pendingMonth}
              min={minMonth}
              onChange={(e) => onPendingMonthChange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              type="button"
              onClick={onAddMonth}
              disabled={!canAddMonth}
              className="px-3 py-2 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Adicionar mês
            </button>
            <span className="text-xs text-slate-400">
              {months.length}/{maxMonths} meses · a partir de {formatMonthLabel(minMonth)}
            </span>
          </div>

          {months.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Meses escolhidos">
              {months.map((month) => (
                <li
                  key={month}
                  className="flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-medium"
                >
                  {formatMonthLabel(month)}
                  <button
                    type="button"
                    onClick={() => onRemoveMonth(month)}
                    aria-label={`Remover ${formatMonthLabel(month)}`}
                    className="p-0.5 rounded-full hover:bg-sky-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <div role="alert" className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-4">
            {months.length === 0 ? (
              <p className="text-sm text-slate-400">Escolha ao menos um mês para ver a prévia.</p>
            ) : previewLoading ? (
              <div className="flex justify-center py-6" aria-label="Calculando prévia">
                <div className="w-6 h-6 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              groups.map((group) => (
                <section key={group.month} aria-label={`Prévia ${formatMonthLabel(group.month)}`} className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">{formatMonthLabel(group.month)}</h3>
                  <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg text-xs sm:text-sm">
                    {group.created.map((item) => (
                      <li key={`${item.sourceId}-c`} className="flex items-center justify-between gap-3 px-3 py-2">
                        <span className="truncate text-slate-800">{item.description ?? '—'}</span>
                        <span className="shrink-0 text-slate-500">Venc. {formatDateBR(item.dueDate)}</span>
                        <span
                          className={`shrink-0 font-medium ${
                            item.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {formatCurrency(item.amount)}
                        </span>
                      </li>
                    ))}
                    {group.skipped.map((item) => (
                      <li key={`${item.sourceId}-s`} className="flex items-center justify-between gap-3 px-3 py-2 bg-amber-50/60">
                        <span className="truncate text-slate-500 line-through">{item.description}</span>
                        <span className="shrink-0 text-amber-700">Já existe — será ignorado</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="px-4 py-2 text-sm rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting
              ? 'Copiando...'
              : `Criar ${createCount} ${plural(createCount, 'lançamento', 'lançamentos')}`}
          </button>
        </div>
      </div>
    </div>
  );
}
