import { useEffect, useMemo, useState } from 'react';
import { transactionsService } from '../services/transactions.service';
import type { StrategicViewTransaction } from '../types';
import { TransactionType } from '../types';
import { getMonthRange } from '../utils/date';
import { StrategicViewView } from './StrategicViewPage.view';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

export type TypeEntry = { type: string; label: string; total: number; categories: CategoryEntry[] };
export type CategoryEntry = { name: string; total: number; items: ItemEntry[] };
export type ItemEntry = { name: string; total: number; dates: DateEntry[] };
export type DateEntry = { date: string; displayDate: string; total: number };

export function buildTreeData(transactions: StrategicViewTransaction[]): {
  types: TypeEntry[];
  grandTotal: number;
} {
  const typeMap = new Map<
    string,
    {
      total: number;
      categories: Map<
          string,
            {
              total: number;
              items: Map<string, { total: number; dates: Map<string, { total: number }> }>;
            }
          >;
    }
  >();

  for (const tx of transactions.sort((a, b) => b.amount - a.amount)) {
    const sign = tx.type === TransactionType.INCOME ? 1 : -1;
    const value = sign * tx.amount;
    const dueDateStr = tx.dueDate.split('T')[0];

    if (!typeMap.has(tx.type)) {
      typeMap.set(tx.type, { total: 0, categories: new Map() });
    }
    const type = typeMap.get(tx.type)!;
    type.total += value;

    if (!type.categories.has(tx.categoryName)) {
      type.categories.set(tx.categoryName, { total: 0, items: new Map() });
    }
    const category = type.categories.get(tx.categoryName)!;
    category.total += value;

    if (!category.items.has(tx.itemName)) {
      category.items.set(tx.itemName, { total: 0, dates: new Map() });
    }
    const item = category.items.get(tx.itemName)!;
    item.total += value;

    if (!item.dates.has(dueDateStr)) {
      item.dates.set(dueDateStr, {total: 0});
    }
    const dateEntry = item.dates.get(dueDateStr)!;
    dateEntry.total += value;
  }

  const types: TypeEntry[] = [];
  let grandTotal = 0;

  for (const [typeLabel, typeData] of typeMap) {
    grandTotal += typeData.total;
    const categories: CategoryEntry[] = [];

    for (const [categoryName, categoryData] of typeData.categories) {
      const items: ItemEntry[] = [];

      for (const [itemName, itemData] of categoryData.items) {
        const dates: DateEntry[] = [];
        for (const [dueDateStr, dateData] of itemData.dates) {
          dates.push({
            date: dueDateStr,            
            displayDate: formatDate(dueDateStr),
            total: dateData.total
          });
        }
        items.push({ name: itemName, total: itemData.total, dates });
      }

      categories.push({ name: categoryName, total: categoryData.total, items });
    }

    types.push({ type: typeLabel, label: typeLabel === TransactionType.INCOME ? 'Receita' : 'Despesa', total: typeData.total, categories });
  }

  return { types, grandTotal };
}

export function StrategicViewPage() {
  const now = new Date();
  const { startDate: defaultStart, endDate: defaultEnd } = getMonthRange(now.getFullYear(), now.getMonth());

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [onlySettled, setOnlySettled] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<StrategicViewTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    setError('');
    transactionsService
      .getStrategicView(startDate, endDate)
      .then(setTransactions)
      .catch(() => setError('Erro ao carregar visão estratégica.'))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

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
