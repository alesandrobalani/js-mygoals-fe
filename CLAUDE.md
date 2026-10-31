# MyGoals — Frontend (js-mygoals-fe)

SPA de controle financeiro familiar. React 19 + TypeScript + Vite + Tailwind v4 + React Router v7 + Axios.
Consome a API NestJS do repositório irmão `../js-mygoals-be` (ver `../js-mygoals-be/CLAUDE.md`).

## Comandos

- `npm run test:run` — roda todos os testes (Vitest, jsdom). Use `npx vitest run <caminho>` para um arquivo.
- `npm run lint` — ESLint.
- `npm run build` — `tsc -b && vite build`. **Rode antes de concluir uma tarefa**: o Vitest não falha por erro de tipo, o `tsc` sim.
- `npm run dev` — servidor em http://localhost:5173 (backend esperado em http://localhost:3000).

Definição de pronto: `test:run`, `lint` e `build` passando.

## Arquitetura e convenções

- **Padrão Container/View** (obrigatório para componentes e páginas):
  - `X.tsx` — estado, efeitos, chamadas aos services, handlers.
  - `X.view.tsx` — componente puro (`XView`), recebe tudo por props, sem chamadas de API nem `useEffect` de dados.
- `src/services/*.service.ts` — um objeto `xxxService` por recurso, usando a instância `api` de `services/api.ts` (injeta JWT e faz refresh automático em 401). Nunca use `axios` direto.
- **Carregamento de dados**: use `useAsync(fn, reloadOn)` de `src/hooks/useAsync.ts` (`loading` derivado, descarta respostas antigas, mantém o último `data`). Não faça `setLoading(true)`/`setError('')` dentro de `useEffect` — o lint (`react-hooks/set-state-in-effect`) bloqueia. Para resetar estado quando uma prop muda, ajuste durante o render comparando com o valor anterior (ver `TransactionsGrid.tsx`).
- Arquivos `.tsx` exportam só componentes (`react-refresh/only-export-components`): hooks vão em `src/hooks/` ou junto do contexto (`contexts/useAuth.ts`), funções puras em `src/utils/`.
- `src/types/index.ts` — tipos compartilhados. **Devem refletir os DTOs/respostas do backend** (`../js-mygoals-be/src/dto` e controllers em `../js-mygoals-be/src/modules`). Ao mudar o contrato, confira os dois lados.
- `src/utils/date.ts` — helpers de período (ex.: `getMonthRange`). Datas trafegam como string `YYYY-MM-DD`.
- Rotas em `src/App.tsx`, protegidas por `ProtectedRoute` / `AdminRoute` / `UserRoute`; navegação no `Layout`.
- Textos da UI em **pt-BR**. Moeda com `formatCurrency` de `src/utils/format.ts` (BRL) — não crie outro formatador nem exporte helpers de arquivos de componente (regra `react-refresh/only-export-components`).
- Estilo só com classes Tailwind; o layout precisa funcionar em desktop e mobile (Android).

## Testes

- Ficam em `__tests__/` ao lado do código: `src/{components,pages,services,contexts}/__tests__/*.spec.ts(x)`.
- API mockada com **MSW**: handlers em `src/test/mocks/handlers.ts`, dados em `src/test/mocks/fixtures.ts`. Endpoint novo ⇒ adicionar handler + fixture.
- Páginas/containers: renderizar com `renderWithProviders` (`src/test/render-helpers.tsx`). Views: `render` direto com props e `vi.fn()`.
- Toda feature nova cobre **happy flow e bad flow** (erro da API, lista vazia, validação).

## Fluxo de features

- Cada feature tem uma pasta `specifications/NN-nome-da-feature/` com o pedido original (`01-prompt.txt`, …).
- Use o skill `/feature NN-nome` para implementar uma spec (planeja → implementa → testa → documenta).
- **Sempre atualize o `README.md`** (seção "Funcionalidades implementadas" e outras afetadas) quando o comportamento visível mudar.

## Git

- Branches: `feature/<nome-curto>` a partir de `main`; PR para `main`.
- Mensagens de commit em português, curtas e no imperativo/descritivo (ex.: "remoção do dashboard de contas").
- Arquivos em UTF-8 **sem BOM** (há histórico de acentuação corrompida).
