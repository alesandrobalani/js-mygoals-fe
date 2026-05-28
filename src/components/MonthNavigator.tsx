import { MonthNavigatorView } from './MonthNavigator.view';

interface MonthNavigatorProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onChange: (year: number, month: number) => void;
}

export function MonthNavigator(props: MonthNavigatorProps) {
  return <MonthNavigatorView {...props} />;
}
