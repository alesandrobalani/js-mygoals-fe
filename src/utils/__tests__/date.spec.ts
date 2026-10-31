import { describe, it, expect } from 'vitest';
import { addMonthsToYearMonth, formatDateBR, formatMonthLabel, toYearMonth } from '../date';

describe('date utils', () => {
  describe('toYearMonth', () => {
    it('extracts YYYY-MM from a date-only string', () => {
      expect(toYearMonth('2026-04-15')).toBe('2026-04');
    });

    it('extracts YYYY-MM from an ISO string', () => {
      expect(toYearMonth('2026-12-31T00:00:00.000Z')).toBe('2026-12');
    });
  });

  describe('addMonthsToYearMonth', () => {
    it('adds months within the same year', () => {
      expect(addMonthsToYearMonth('2026-04', 2)).toBe('2026-06');
    });

    it('rolls over to the next year', () => {
      expect(addMonthsToYearMonth('2026-12', 1)).toBe('2027-01');
      expect(addMonthsToYearMonth('2026-11', 14)).toBe('2028-01');
    });

    it('supports negative offsets', () => {
      expect(addMonthsToYearMonth('2026-01', -1)).toBe('2025-12');
    });

    it('returns the same month for zero', () => {
      expect(addMonthsToYearMonth('2026-07', 0)).toBe('2026-07');
    });
  });

  describe('formatMonthLabel', () => {
    it('formats month name and year in pt-BR', () => {
      expect(formatMonthLabel('2026-11')).toBe('Novembro 2026');
      expect(formatMonthLabel('2027-03')).toBe('Março 2027');
    });
  });

  describe('formatDateBR', () => {
    it('formats date-only and ISO strings as DD/MM/YYYY', () => {
      expect(formatDateBR('2026-11-05')).toBe('05/11/2026');
      expect(formatDateBR('2026-02-28T00:00:00.000Z')).toBe('28/02/2026');
    });
  });
});
