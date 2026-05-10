import { useState } from 'react';
import { CreateTransactionItemQuickModalView } from './CreateTransactionItemQuickModal.view';
import { transactionItemsService } from '../services/transaction-items.service';
import type { TransactionItem } from '../types';

interface CreateTransactionItemQuickModalProps {
  onClose: () => void;
  onSuccess: (transactionItem: TransactionItem) => void;
}

export function CreateTransactionItemQuickModal({ onClose, onSuccess }: CreateTransactionItemQuickModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await transactionItemsService.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onSuccess(created);
      onClose();
    } catch {
      setError('Erro ao criar item de transação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CreateTransactionItemQuickModalView
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
