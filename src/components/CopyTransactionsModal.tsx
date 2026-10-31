import { useState } from 'react';
import { isAxiosError } from 'axios';
import type { CopyTransactionsResult, Transaction, YearMonth } from '../types';
import { transactionsService } from '../services/transactions.service';
import { useAsync } from '../hooks/useAsync';
import { addMonthsToYearMonth } from '../utils/date';
import { CopyTransactionsModalView, type PreviewGroup } from './CopyTransactionsModal.view';

/** Mesmo limite do backend (COPY_MAX_TARGET_MONTHS). */
const MAX_TARGET_MONTHS = 24;

interface CopyErrorBody {
  transferIds?: string[];
  notFoundIds?: string[];
}

/** Traduz os erros do endpoint de cópia para mensagens ao usuário. */
function copyErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<CopyErrorBody>(error)) {
    const body = error.response?.data;
    if (body?.transferIds?.length) return 'Transferências não podem ser copiadas. Remova-as da seleção.';
    if (body?.notFoundIds?.length) return 'Alguns lançamentos selecionados não existem mais. Atualize a página e selecione novamente.';
  }
  return fallback;
}

export function CopyTransactionsModal({
  transactions,
  currentMonth,
  onClose,
  onSuccess,
}: {
  /** Lançamentos selecionados (origem da cópia). */
  transactions: Transaction[];
  /** Competência exibida no dashboard; só meses posteriores podem ser escolhidos. */
  currentMonth: YearMonth;
  onClose: () => void;
  onSuccess: (result: CopyTransactionsResult) => void;
}) {
  const minMonth = addMonthsToYearMonth(currentMonth, 1);
  const [months, setMonths] = useState<YearMonth[]>([]);
  const [pendingMonth, setPendingMonth] = useState<YearMonth>(minMonth);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const transactionIds = transactions.map((tx) => tx.id);

  const { data: preview, loading: previewLoading, error: previewError } = useAsync(
    () =>
      months.length === 0
        ? Promise.resolve(null)
        : transactionsService.copy({ transactionIds, targetMonths: months, dryRun: true }),
    [transactionIds, months],
  );
  // Só usa a prévia que corresponde aos meses atuais: durante a recarga o useAsync
  // ainda devolve a anterior, e ela não pode alimentar o botão de confirmar.
  const isPreviewLoading = months.length > 0 && previewLoading;
  const currentPreview = months.length > 0 && !previewLoading && !previewError ? preview : null;

  const canAddMonth =
    pendingMonth >= minMonth && !months.includes(pendingMonth) && months.length < MAX_TARGET_MONTHS;

  function handleAddMonth() {
    if (!canAddMonth) return;
    setMonths((prev) => [...prev, pendingMonth].sort());
    setPendingMonth(addMonthsToYearMonth(pendingMonth, 1));
    setSubmitError('');
  }

  function handleRemoveMonth(month: YearMonth) {
    setMonths((prev) => prev.filter((m) => m !== month));
    setSubmitError('');
  }

  const descriptions = new Map(transactions.map((tx) => [tx.id, tx.description ?? '—']));
  const groups: PreviewGroup[] = currentPreview
    ? months.map((month) => ({
        month,
        created: currentPreview.created.filter((c) => c.targetMonth === month),
        skipped: currentPreview.skipped
          .filter((s) => s.targetMonth === month)
          .map((s) => ({ ...s, description: descriptions.get(s.sourceId) ?? '—' })),
      }))
    : [];
  const createCount = currentPreview?.created.length ?? 0;

  async function handleConfirm() {
    if (createCount === 0) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await transactionsService.copy({ transactionIds, targetMonths: months, dryRun: false });
      onSuccess(result);
    } catch (err) {
      setSubmitError(copyErrorMessage(err, 'Erro ao copiar lançamentos.'));
    } finally {
      setSubmitting(false);
    }
  }

  const previewErrorMessage = previewError
    ? copyErrorMessage(previewError, 'Erro ao calcular a prévia da cópia.')
    : '';

  return (
    <CopyTransactionsModalView
      selectedCount={transactions.length}
      months={months}
      pendingMonth={pendingMonth}
      minMonth={minMonth}
      maxMonths={MAX_TARGET_MONTHS}
      canAddMonth={canAddMonth}
      groups={groups}
      previewLoading={isPreviewLoading}
      createCount={createCount}
      submitting={submitting}
      error={submitError || previewErrorMessage}
      onPendingMonthChange={setPendingMonth}
      onAddMonth={handleAddMonth}
      onRemoveMonth={handleRemoveMonth}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}
