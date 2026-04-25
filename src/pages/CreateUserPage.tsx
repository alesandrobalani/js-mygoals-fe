import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { usersService } from '../services/users.service';
import { CreateUserView } from './CreateUserPage.view';

export function CreateUserPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await usersService.create({ name, email, password, role });
      navigate('/users');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar usuário.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CreateUserView
      name={name}
      email={email}
      password={password}
      role={role}
      error={error}
      loading={loading}
      onNameChange={setName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onRoleChange={setRole}
      onSubmit={handleSubmit}
    />
  );
}
