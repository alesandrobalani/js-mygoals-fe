import type { StrategicViewTransaction } from '../types';
import { TransactionType } from '../types';

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
