import { useMemo, useState } from 'react';
import { transactionsService } from '../services/transactions.service';
import type { StrategicViewTransaction } from '../types';
import { useAsync } from '../hooks/useAsync';
import { buildTreeData } from '../utils/strategic-tree';
import { getMonthRange } from '../utils/date';
import { StrategicViewView } from './StrategicViewPage.view';
import { formatCurrency } from '../utils/format';

/** Referência estável para não invalidar os useMemo a cada render. */
const NO_TRANSACTIONS: StrategicViewTransaction[] = [];

export function StrategicViewPage() {
  const now = new Date();
  const { startDate: defaultStart, endDate: defaultEnd } = getMonthRange(now.getFullYear(), now.getMonth());

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [onlySettled, setOnlySettled] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const { data, loading, error: loadError } = useAsync(
    () => transactionsService.getStrategicView(startDate, endDate),
    [startDate, endDate],
  );
  const transactions = data ?? NO_TRANSACTIONS;
  const error = loadError ? 'Erro ao carregar visão estratégica.' : '';

  const allCategories = useMemo(
    () => [...new Set(transactions.map((tx) => tx.categoryName))].sort(),
    [transactions],
  );

  const allItems = useMemo(
    () => [...new Set(transactions.map((tx) => tx.itemName))].sort(),
    [transactions],
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (onlySettled && !tx.settled) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(tx.categoryName)) return false;
      if (selectedItems.length > 0 && !selectedItems.includes(tx.itemName)) return false;
      return true;
    });
  }, [transactions, onlySettled, selectedCategories, selectedItems]);

  const { types, grandTotal } = useMemo(
    () => buildTreeData(filteredTransactions),
    [filteredTransactions],
  );

  function togglePath(path: string) {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        for (const key of next) {
          if (key === path || key.startsWith(path + '/')) {
            next.delete(key);
          }
        }
      } else {
        next.add(path);
      }
      return next;
    });
  }

  function toggleCategory(name: string) {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  }

  function toggleItem(name: string) {
    setSelectedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name],
    );
  }

  return (
    <StrategicViewView
      loading={loading}
      error={error}
      startDate={startDate}
      endDate={endDate}
      onlySettled={onlySettled}
      selectedCategories={selectedCategories}
      selectedItems={selectedItems}
      allCategories={allCategories}
      allItems={allItems}
      types={types}
      grandTotal={grandTotal}
      expandedPaths={expandedPaths}
      formatCurrency={formatCurrency}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      onOnlySettledChange={setOnlySettled}
      onToggleCategory={toggleCategory}
      onToggleItem={toggleItem}
      onTogglePath={togglePath}
    />
  );
}
