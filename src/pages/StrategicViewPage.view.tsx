import { useEffect, useRef, useState } from 'react';
import type { CategoryEntry, DateEntry, ItemEntry, TypeEntry } from './StrategicViewPage';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

function MultiSelect({ label, options, selected, onToggle }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayLabel =
    selected.length === 0
      ? `Todos(as) ${label}`
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selecionados`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Filtrar por ${label}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        <span>{displayLabel}</span>
        <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute left-0 top-full z-10 mt-1 max-h-60 w-56 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">Nenhuma opção disponível</p>
          ) : (
            options.map((opt) => (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => onToggle(opt)}
                  className="accent-sky-600"
                />
                {opt}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface StrategicViewViewProps {
  loading: boolean;
  error: string;
  startDate: string;
  endDate: string;
  onlySettled: boolean;
  selectedCategories: string[];
  selectedItems: string[];
  allCategories: string[];
  allItems: string[];
  types: TypeEntry[];
  grandTotal: number;
  expandedPaths: Set<string>;
  formatCurrency: (value: number) => string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onOnlySettledChange: (value: boolean) => void;
  onToggleCategory: (name: string) => void;
  onToggleItem: (name: string) => void;
  onTogglePath: (path: string) => void;
}

function amountClass(total: number): string {
  return total >= 0 ? 'text-emerald-600' : 'text-red-500';
}

interface RowProps {
  label: string;
  total: number;
  depth: number;
  path: string;
  hasChildren: boolean;
  expanded: boolean;
  formatCurrency: (v: number) => string;
  onToggle: (path: string) => void;
}

function TreeRow({ label, total, depth, path, hasChildren, expanded, formatCurrency, onToggle }: RowProps) {
  const paddingLeft = 16 + depth * 20;

  return (
    <div
      role={hasChildren ? 'button' : undefined}
      tabIndex={hasChildren ? 0 : undefined}
      aria-expanded={hasChildren ? expanded : undefined}
      className={`flex items-center justify-between py-2 pr-4 ${
        depth === 0 ? 'border-b border-slate-100 font-medium' : ''
      } ${hasChildren ? 'cursor-pointer hover:bg-slate-50' : 'text-slate-500'}`}
      style={{ paddingLeft: `${paddingLeft}px` }}
      onClick={() => hasChildren && onToggle(path)}
      onKeyDown={(e) => {
        if (hasChildren && (e.key === 'Enter' || e.key === ' ')) onToggle(path);
      }}
    >
      <div className="flex items-center gap-1 text-sm min-w-0">
        <span className="w-4 shrink-0 text-center text-slate-400 text-xs select-none">
          {hasChildren ? (expanded ? '−' : '+') : ''}
        </span>
        <span className="truncate">{label}</span>
      </div>
      <span className={`text-sm font-medium shrink-0 ml-4 ${amountClass(total)}`}>
        {formatCurrency(total)}
      </span>
    </div>
  );
}

function CategoryRow({
  categories,
  parentPath,
  depth,
  expandedPaths,
  formatCurrency,
  onTogglePath,
}: {
  categories: CategoryEntry[];
  parentPath: string;
  depth: number;
  expandedPaths: Set<string>;
  formatCurrency: (v: number) => string;
  onTogglePath: (path: string) => void;
}) {
  return (
    <>
      {categories.map((category) => {
        const path = `${parentPath}/${category.name}`;
        const expanded = expandedPaths.has(path);
        return (
          <div key={category.name}>
            <TreeRow
              label={category.name}
              total={category.total}
              depth={depth}
              path={path}
              hasChildren={category.items.length > 0}
              expanded={expanded}
              formatCurrency={formatCurrency}
              onToggle={onTogglePath}
            />
            {expanded && (
              <ItemRows
                items={category.items}
                parentPath={path}
                depth={depth + 1}
                expandedPaths={expandedPaths}
                formatCurrency={formatCurrency}
                onTogglePath={onTogglePath}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

function DateRows({
  dates,
  parentPath,
  depth,
  formatCurrency,
  onTogglePath,
}: {
  dates: DateEntry[];
  parentPath: string;
  depth: number;
  expandedPaths: Set<string>;
  formatCurrency: (v: number) => string;
  onTogglePath: (path: string) => void;
}) {
  return (
    <>
      {dates.map((d) => {
        const path = `${parentPath}/${d.date}`;
        return (
          <div key={d.date}>
            <TreeRow
              label={d.displayDate}
              total={d.total}
              depth={depth}
              path={path}
              hasChildren={false}
              expanded={false}
              formatCurrency={formatCurrency}
              onToggle={onTogglePath}
            />            
          </div>
        );
      })}
    </>
  );
}

function ItemRows({
  items,
  parentPath,
  depth,
  expandedPaths,
  formatCurrency,
  onTogglePath,
}: {
  items: ItemEntry[];
  parentPath: string;
  depth: number;
  expandedPaths: Set<string>;
  formatCurrency: (v: number) => string;
  onTogglePath: (path: string) => void;
}) {
  return (
    <>
      {items.map((item) => {
        const path = `${parentPath}/${item.name}`;
        const expanded = expandedPaths.has(path);
        return (
          <div key={item.name}>
            <TreeRow
              label={item.name}
              total={item.total}
              depth={depth}
              path={path}
              hasChildren={item.dates.length > 0}
              expanded={expanded}
              formatCurrency={formatCurrency}
              onToggle={onTogglePath}
            />
            {expanded && (
              <DateRows
                dates={item.dates}
                parentPath={path}
                depth={depth + 1}
                expandedPaths={expandedPaths}
                formatCurrency={formatCurrency}
                onTogglePath={onTogglePath}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export function StrategicViewView({
  loading,
  error,
  startDate,
  endDate,
  onlySettled,
  selectedCategories,
  selectedItems,
  allCategories,
  allItems,
  types,
  grandTotal,
  expandedPaths,
  formatCurrency,
  onStartDateChange,
  onEndDateChange,
  onOnlySettledChange,
  onToggleCategory,
  onToggleItem,
  onTogglePath,
}: StrategicViewViewProps) {
  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-slate-800">Visão Estratégica</h1>

      {/* Filtros */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <p className="text-sm font-medium text-slate-600">Filtros</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="startDate" className="text-sm text-slate-600 whitespace-nowrap">
              De
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="endDate" className="text-sm text-slate-600 whitespace-nowrap">
              Até
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
            <input
              type="checkbox"
              checked={onlySettled}
              onChange={(e) => onOnlySettledChange(e.target.checked)}
              className="accent-sky-600"
              aria-label="Apenas efetivado"
            />
            Apenas efetivado
          </label>
          <MultiSelect
            label="categorias"
            options={allCategories}
            selected={selectedCategories}
            onToggle={onToggleCategory}
          />
          <MultiSelect
            label="itens"
            options={allItems}
            selected={selectedItems}
            onToggle={onToggleItem}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Categoria / Item</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</span>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <p className="text-center py-8 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && types.length === 0 && (
          <p className="text-center py-8 text-sm text-slate-400">
            Nenhuma transação encontrada para o período.
          </p>
        )}

        {!loading && !error && types.length > 0 && (
          <>
            {types.map((type) => {
              const path = type.label;
              const expanded = expandedPaths.has(path);
              return (
                <div key={type.label}>
                  <TreeRow
                    label={type.label}
                    total={type.total}
                    depth={0}
                    path={path}
                    hasChildren={type.categories.length > 0}
                    expanded={expanded}
                    formatCurrency={formatCurrency}
                    onToggle={onTogglePath}
                  />
                  {expanded && (
                    <CategoryRow
                      categories={type.categories}
                      parentPath={path}
                      depth={1}
                      expandedPaths={expandedPaths}
                      formatCurrency={formatCurrency}
                      onTogglePath={onTogglePath}
                    />
                  )}
                </div>
              );
            })}

            {/* Totalizador */}
            <div className="flex items-center justify-between px-4 py-3 border-t-2 border-slate-300 bg-slate-50">
              <span className="text-sm font-bold text-slate-700">TOTAL</span>
              <span className={`text-sm font-bold ${amountClass(grandTotal)}`}>
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
