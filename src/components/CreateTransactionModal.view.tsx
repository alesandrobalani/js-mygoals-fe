import type { Account, TransactionCategory, TransactionItem } from '../types';
import { TransactionType } from '../types';

interface CreateTransactionModalViewProps {
  type: string;
  amount: string;
  transactionDate: string;
  categoryId: string;
  accountId: string;
  transactionItemId: string;
  description: string;
  dueDate: string;
  categories: TransactionCategory[];
  accounts: Account[];
  transactionItems: TransactionItem[];
  loadingOptions: boolean;
  submitting: boolean;
  error: string;
  isValid: boolean;
  onTypeChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onTransactionDateChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onAccountChange: (v: string) => void;
  onTransactionItemChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  settled: boolean;
  onDueDateChange: (v: string) => void;
  onSettledChange: (v: boolean) => void;
  onSubmit: () => void;
  onClose: () => void;
  onOpenQuickCategory: () => void;
  onOpenQuickAccount: () => void;
  onOpenQuickTransactionItem: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:bg-slate-100';

const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export function CreateTransactionModalView({
  type,
  amount,
  transactionDate,
  categoryId,
  accountId,
  transactionItemId,
  description,
  dueDate,
  settled,
  categories,
  accounts,
  transactionItems,
  loadingOptions,
  submitting,
  error,
  isValid,
  onTypeChange,
  onAmountChange,
  onTransactionDateChange,
  onCategoryChange,
  onAccountChange,
  onTransactionItemChange,
  onDescriptionChange,
  onDueDateChange,
  onSettledChange,
  onSubmit,
  onClose,
  onOpenQuickCategory,
  onOpenQuickAccount,
  onOpenQuickTransactionItem,
}: CreateTransactionModalViewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-5">Nova Transação</h2>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Tipo */}
          <div>
            <label htmlFor="tx-type" className={labelClass}>Tipo *</label>
            <select
              id="tx-type"
              className={inputClass}
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              disabled={submitting}
            >
              <option value={TransactionType.EXPENSE}>Despesa</option>
              <option value={TransactionType.INCOME}>Receita</option>
            </select>
          </div>

          {/* Valor */}
          <div>
            <label htmlFor="tx-amount" className={labelClass}>Valor (R$) *</label>
            <input
              id="tx-amount"
              type="number"
              min="0.01"
              step="0.01"
              className={inputClass}
              placeholder="0,00"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Data da transação */}
          <div>
            <label htmlFor="tx-date" className={labelClass}>Data da transação *</label>
            <input
              id="tx-date"
              type="date"
              className={inputClass}
              value={transactionDate}
              onChange={(e) => onTransactionDateChange(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="tx-category" className={labelClass}>Categoria *</label>
            <div className="flex gap-2">
              <select
                id="tx-category"
                className={inputClass}
                value={categoryId}
                onChange={(e) => onCategoryChange(e.target.value)}
                disabled={loadingOptions || submitting}
              >
                <option value="">{loadingOptions ? 'Carregando...' : 'Selecione'}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={onOpenQuickCategory}
                disabled={submitting}
                title="Nova categoria"
                className="px-3 py-2 text-sky-600 border border-slate-300 rounded-lg hover:bg-sky-50 disabled:opacity-40 text-sm font-bold shrink-0"
              >
                +
              </button>
            </div>
          </div>

          {/* Conta */}
          <div>
            <label htmlFor="tx-account" className={labelClass}>Conta *</label>
            <div className="flex gap-2">
              <select
                id="tx-account"
                className={inputClass}
                value={accountId}
                onChange={(e) => onAccountChange(e.target.value)}
                disabled={loadingOptions || submitting}
              >
                <option value="">{loadingOptions ? 'Carregando...' : 'Selecione'}</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={onOpenQuickAccount}
                disabled={submitting}
                title="Nova conta"
                className="px-3 py-2 text-sky-600 border border-slate-300 rounded-lg hover:bg-sky-50 disabled:opacity-40 text-sm font-bold shrink-0"
              >
                +
              </button>
            </div>
          </div>

          {/* Item */}
          <div>
            <label htmlFor="tx-item" className={labelClass}>Item *</label>
            <div className="flex gap-2">

              <select
                id="tx-item"
                className={inputClass}
                value={transactionItemId}
                onChange={(e) => onTransactionItemChange(e.target.value)}
                disabled={loadingOptions || submitting}
              >
                <option value="">{loadingOptions ? 'Carregando...' : 'Selecione'}</option>
                {transactionItems.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={onOpenQuickTransactionItem}
                disabled={submitting}
                title="Novo item"
                className="px-3 py-2 text-sky-600 border border-slate-300 rounded-lg hover:bg-sky-50 disabled:opacity-40 text-sm font-bold shrink-0"
              >
                +
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div className="col-span-2">
            <label htmlFor="tx-description" className={labelClass}>Descrição</label>
            <input
              id="tx-description"
              type="text"
              className={inputClass}
              placeholder="Descrição opcional"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Data de vencimento */}
          <div className="col-span-2">
            <label htmlFor="tx-due-date" className={labelClass}>Data de vencimento</label>
            <input
              id="tx-due-date"
              type="date"
              className={inputClass}
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
              disabled={submitting}
            />
          </div>

          {/* Efetivado */}
          <div className="col-span-2">
            <label htmlFor="tx-settled" className={labelClass}>Efetivado</label>
            <div className="flex items-center gap-2">
              <input
                id="tx-settled"
                type="checkbox"
                className="form-checkbox text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                checked={settled}
                onChange={(e) => onSettledChange(e.target.checked)}
                disabled={submitting}
              />
              <span className="text-sm text-slate-600">Marcar como efetivado</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!isValid || submitting}
            className="px-4 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
