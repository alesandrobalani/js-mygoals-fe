import { useEffect, useState } from 'react';
import type { Account, TransactionCategory, TransactionItem } from '../types';
import { TransactionType } from '../types';
import { transactionsService } from '../services/transactions.service';
import { categoriesService } from '../services/categories.service';
import { accountsService } from '../services/accounts.service';
import { transactionItemsService } from '../services/transaction-items.service';
import { CreateTransactionModalView } from './CreateTransactionModal.view';
import { CreateCategoryQuickModal } from './CreateCategoryQuickModal';
import { CreateAccountQuickModal } from './CreateAccountQuickModal';

interface CreateTransactionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTransactionModal({ onClose, onSuccess }: CreateTransactionModalProps) {
  const [type, setType] = useState<string>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [transactionItemId, setTransactionItemId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [settled, setSettled] = useState(true);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isQuickCategoryOpen, setIsQuickCategoryOpen] = useState(false);
  const [isQuickAccountOpen, setIsQuickAccountOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      categoriesService.getAll(),
      accountsService.getAll(),
      transactionItemsService.getAll(),
    ])
      .then(([cats, accs, items]) => {
        setCategories(cats);
        setAccounts(accs);
        setTransactionItems(items);
      })
      .catch(() => setError('Erro ao carregar opções do formulário.'))
      .finally(() => setLoadingOptions(false));
  }, []);

  function handleCategoryCreated(newCategory: TransactionCategory) {
    setCategories((prev) => [...prev, newCategory]);
    setCategoryId(newCategory.id);
    setIsQuickCategoryOpen(false);
  }

  function handleAccountCreated(newAccount: Account) {
    setAccounts((prev) => [...prev, newAccount]);
    setAccountId(newAccount.id);
    setIsQuickAccountOpen(false);
  }

  const isValid =
    amount !== '' &&
    Number(amount) > 0 &&
    transactionDate !== '' &&
    categoryId !== '' &&
    accountId !== '' &&
    transactionItemId !== '';

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    setError('');
    try {
      await transactionsService.create({
        type: type as typeof TransactionType[keyof typeof TransactionType],
        amount: Number(amount),
        transactionDate,
        categoryId,
        accountId,
        transactionItemId,
        description: description || undefined,
        dueDate: dueDate || undefined,
        settled,
      });
      onSuccess();
      onClose();
    } catch {
      setError('Erro ao criar transação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <CreateTransactionModalView
        type={type}
        amount={amount}
        transactionDate={transactionDate}
        categoryId={categoryId}
        accountId={accountId}
        transactionItemId={transactionItemId}
        description={description}
        dueDate={dueDate}
        settled={settled}
        categories={categories}
        accounts={accounts}
        transactionItems={transactionItems}
        loadingOptions={loadingOptions}
        submitting={submitting}
        error={error}
        isValid={isValid}
        onTypeChange={setType}
        onAmountChange={setAmount}
        onTransactionDateChange={setTransactionDate}
        onCategoryChange={setCategoryId}
        onAccountChange={setAccountId}
        onTransactionItemChange={setTransactionItemId}
        onDescriptionChange={setDescription}
        onDueDateChange={setDueDate}
        onSettledChange={setSettled}
        onSubmit={handleSubmit}
        onClose={onClose}
        onOpenQuickCategory={() => setIsQuickCategoryOpen(true)}
        onOpenQuickAccount={() => setIsQuickAccountOpen(true)}
      />
      {isQuickCategoryOpen && (
        <CreateCategoryQuickModal
          onClose={() => setIsQuickCategoryOpen(false)}
          onSuccess={handleCategoryCreated}
        />
      )}
      {isQuickAccountOpen && (
        <CreateAccountQuickModal
          onClose={() => setIsQuickAccountOpen(false)}
          onSuccess={handleAccountCreated}
        />
      )}
    </>
  );
}
