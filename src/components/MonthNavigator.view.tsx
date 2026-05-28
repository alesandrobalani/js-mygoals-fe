const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface MonthNavigatorViewProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onChange: (year: number, month: number) => void;
}

export function MonthNavigatorView({ year, month, onPrev, onNext, onChange }: MonthNavigatorViewProps) {
  const pickerValue = `${year}-${String(month + 1).padStart(2, '0')}`;

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [y, m] = e.target.value.split('-').map(Number);
    onChange(y, m - 1);
  }

  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <button
        onClick={onPrev}
        aria-label="Mês anterior"
        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <label className="relative cursor-pointer">
        <span className="text-base font-semibold text-slate-700 select-none">
          {MONTH_NAMES[month]} {year}
        </span>
        <input
          type="month"
          value={pickerValue}
          onChange={handlePickerChange}
          aria-label="Selecionar mês e ano"
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
        />
      </label>

      <button
        onClick={onNext}
        aria-label="Próximo mês"
        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
