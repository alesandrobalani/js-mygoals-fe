import { useEffect, useState } from 'react';
import type { Account, Transaction, TransactionCategory, TransactionItem } from '../types';
import { TransactionType } from '../types';
import { transactionsService } from '../services/transactions.service';
import { categoriesService } from '../services/categories.service';
import { accountsService } from '../services/accounts.service';
import { transactionItemsService } from '../services/transaction-items.service';
import { CreateTransactionModalView } from './CreateTransactionModal.view';
import { CreateCategoryQuickModal } from './CreateCategoryQuickModal';
import { CreateAccountQuickModal } from './CreateAccountQuickModal';
import { CreateTransactionItemQuickModal } from './CreateTransactionItemQuickModal';

interface CreateTransactionModalProps {
  onClose: () => void;
  onSuccess: () => void;
  transaction?: Transaction;
}

export function CreateTransactionModal({ onClose, onSuccess, transaction }: CreateTransactionModalProps) {
  const isEditMode = !!transaction;

  const [type, setType] = useState<string>(transaction?.type ?? TransactionType.EXPENSE);
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [transactionDate, setTransactionDate] = useState(
    transaction ? transaction.transactionDate.split('T')[0] : '',
  );
  const [categoryId, setCategoryId] = useState(transaction?.category.id ?? '');
  const [accountId, setAccountId] = useState(transaction?.account?.id ?? '');
  const [transactionItemId, setTransactionItemId] = useState(transaction?.transactionItem?.id ?? '');
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [dueDate, setDueDate] = useState(
    transaction?.dueDate ? transaction.dueDate.split('T')[0] : '',
  );
  const [settled, setSettled] = useState(transaction?.settled ?? true);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isQuickCategoryOpen, setIsQuickCategoryOpen] = useState(false);
  const [isQuickAccountOpen, setIsQuickAccountOpen] = useState(false);
  const [isQuickTransactionItemOpen, setIsQuickTransactionItemOpen] = useState(false);
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

  function handleTransactionItemCreated(newItem: TransactionItem) {
    setTransactionItems((prev) => [...prev, newItem]);
    setTransactionItemId(newItem.id);
    setIsQuickTransactionItemOpen(false);
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
    const payload = {
      type: type as typeof TransactionType[keyof typeof TransactionType],
      amount: Number(amount),
      transactionDate,
      categoryId,
      accountId,
      transactionItemId,
      description: description || undefined,
      dueDate: dueDate || undefined,
      settled,
    };
    try {
      if (isEditMode && transaction) {
        await transactionsService.update(transaction.id, payload);
      } else {
        await transactionsService.create(payload);
      }
      onSuccess();
      onClose();
    } catch {
      setError(isEditMode ? 'Erro ao editar transação. Tente novamente.' : 'Erro ao criar transação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <CreateTransactionModalView
        isEditMode={isEditMode}
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
        onOpenQuickTransactionItem={() => setIsQuickTransactionItemOpen(true)}
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
      {isQuickTransactionItemOpen && (
        <CreateTransactionItemQuickModal
          onClose={() => setIsQuickTransactionItemOpen(false)}
          onSuccess={handleTransactionItemCreated}
        />
      )}
    </>
  );
}
