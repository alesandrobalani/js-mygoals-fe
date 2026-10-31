# Plano — 13-copy-transactions

Contrato: `POST /transactions/copy` (js-mygoals-be, spec 10-copy-transactions)
- body `{ transactionIds: string[], targetMonths: 'YYYY-MM'[], dryRun?: boolean }`
- 200 `{ dryRun, created: [{ sourceId, targetMonth, description, amount, type, dueDate, transactionDate }], skipped: [{ sourceId, targetMonth, dueDate, reason: 'duplicate' }] }`
- 404 `{ message, notFoundIds }` · 400 `{ message, transferIds }` (ou erros de validação)

## Decisões aprovadas
- Meses de destino: escolha livre, somente meses **posteriores** ao mês exibido no dashboard; máximo 24.
- Mensagem de sucesso: aviso verde acima do grid, com botão de fechar; some ao trocar de mês.
- Seleção guardada como `Map<id, Transaction>` (permite descrever duplicados na prévia, já que `skipped` não traz descrição, e manter itens de outras páginas).
- "Selecionar todos" atua sobre as linhas visíveis (página atual + filtro), ignorando transferências.

## Arquivos
- `src/types/index.ts` — `isTransfer?` em `TransactionCategory`; `CopyTransactionsPayload`, `CopyTransactionsResult`, itens.
- `src/services/transactions.service.ts` — `copy(payload)`.
- `src/utils/date.ts` — `formatMonthLabel('YYYY-MM')`, `toYearMonth(date)`, `addMonthsToYearMonth`.
- `src/components/TransactionsGrid.tsx` / `.view.tsx` — coluna de checkbox (cabeçalho com estado parcial), transferências desabilitadas com tooltip, barra de ação, aviso de sucesso, limpeza da seleção ao trocar o período, prop `onCopySuccess`.
- `src/components/CopyTransactionsModal.tsx` / `.view.tsx` — seletor de meses (input month + Adicionar, chips removíveis), prévia via `useAsync` com `dryRun: true` agrupada por mês, duplicados marcados, botão "Criar X lançamentos", erros no modal.
- `src/pages/DashboardPage.tsx` — `onCopySuccess` incrementa `refreshKey`.
- `src/test/mocks/handlers.ts` / `fixtures.ts` — endpoint de cópia.

## Testes
- `TransactionsGrid.spec` — seleção, selecionar todos, transferência desabilitada, seleção mantida na paginação e limpa ao trocar mês, barra de ação, aviso de sucesso.
- `CopyTransactionsModal.spec` — meses (adicionar, remover, limite, mínimo), prévia agrupada, duplicados, botão desabilitado, confirmação, erros 400/404/500.
- `transactions.service.spec` — `copy()`.
- `utils/__tests__/date.spec` — helpers de mês.

## Documentação
- README: "Funcionalidades implementadas".
