import { useEffect, useState } from 'react';
import type { User } from '../types';
import { usersService } from '../services/users.service';
import { UsersView } from './UsersPage.view';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    usersService
      .list()
      .then(setUsers)
      .catch(() => setError('Erro ao carregar usuários.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <UsersView users={users} error={error} />;
}
