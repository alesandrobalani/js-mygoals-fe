import type { YearMonth } from '../types';

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function getMonthRange(year: number, month: number): { startDate: string; endDate: string } {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

/** Competência (YYYY-MM) de uma data no formato YYYY-MM-DD ou ISO. */
export function toYearMonth(date: string): YearMonth {
  return date.slice(0, 7);
}

/** Soma meses a uma competência: addMonthsToYearMonth('2026-12', 1) === '2027-01'. */
export function addMonthsToYearMonth(yearMonth: YearMonth, months: number): YearMonth {
  const [year, month] = yearMonth.split('-').map(Number);
  const total = year * 12 + (month - 1) + months;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  return `${y}-${String(m).padStart(2, '0')}`;
}

/** Rótulo legível da competência: '2026-11' -> 'Novembro 2026'. */
export function formatMonthLabel(yearMonth: YearMonth): string {
  const [year, month] = yearMonth.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** Data YYYY-MM-DD (ou ISO) para exibição: '2026-11-05' -> '05/11/2026'. */
export function formatDateBR(date: string): string {
  const [year, month, day] = date.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}
