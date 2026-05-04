import { useState } from 'react';
import type { TransactionCategory } from '../types';
import { categoriesService } from '../services/categories.service';
import { CreateCategoryQuickModalView } from './CreateCategoryQuickModal.view';

interface CreateCategoryQuickModalProps {
  onClose: () => void;
  onSuccess: (category: TransactionCategory) => void;
}

export function CreateCategoryQuickModal({ onClose, onSuccess }: CreateCategoryQuickModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!name.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await categoriesService.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onSuccess(created);
      onClose();
    } catch {
      setError('Erro ao criar categoria. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CreateCategoryQuickModalView
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
