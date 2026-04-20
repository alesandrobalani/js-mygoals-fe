import { useAuth } from '../contexts/AuthContext';
import { DashboardView } from './DashboardPage.view';

const cards = [
  { label: 'Saldo total', value: 'R$ 0,00', color: 'text-sky-600' },
  { label: 'Receitas do mês', value: 'R$ 0,00', color: 'text-emerald-600' },
  { label: 'Despesas do mês', value: 'R$ 0,00', color: 'text-red-500' },
];

export function DashboardPage() {
  const { user } = useAuth();

  return <DashboardView userName={user?.name} cards={cards} />;
}
