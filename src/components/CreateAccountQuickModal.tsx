import { useState } from 'react';
import { CreateAccountQuickModalView } from './CreateAccountQuickModal.view';
import { accountsService } from '../services/accounts.service';
import type { Account } from '../types';

interface CreateAccountQuickModalProps {
  onClose: () => void;
  onSuccess: (account: Account) => void;
}

export function CreateAccountQuickModal({ onClose, onSuccess }: CreateAccountQuickModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await accountsService.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onSuccess(created);
      onClose();
    } catch {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CreateAccountQuickModalView
      name={name}
      description={description}
      submitting={submitting}
      error={error}
      onNameChange={setName}
      onDescriptionChange={setDescription}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
