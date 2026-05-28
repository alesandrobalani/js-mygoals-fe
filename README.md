# js-mygoals-fe

Frontend do sistema de controle financeiro familiar **MyGoals**.

## Tecnologias

- **React** + TypeScript (Vite)
- **Tailwind CSS** — design clean e responsivo
- **React Router v7** — navegação SPA
- **Axios** — comunicação com a API (`js-mygoals-be`)

## Funcionalidades implementadas

- Autenticação de usuário (login / logout / refresh token automático)
- Gestão de usuários: listagem e criação (apenas Admin)
- Rotas protegidas por JWT
- Layout responsivo para Web desktop e Mobile Android
- **Dashboard de Transações** (`/dashboard`): cards de saldo, receitas e despesas com navegação por mês (anterior/próximo e seleção direta de mês/ano)
- **Dashboard de Contas** (`/contas`): saldo efetivado e estimado por conta cadastrada
- Grid de transações do mês selecionado com paginação (20 / 50 / 100 registros por página)
- Criação e edição de transações via modal no dashboard (com atualização automática do grid e resumo)
- Criação rápida de categoria, conta e item inline no modal de transação

## Pré-requisitos

- Node.js 22+ **ou** Docker
- Backend `js-mygoals-be` em execução em `http://localhost:3000`

## Configuração

Copie o arquivo de variáveis de ambiente:

```bash
cp .env.example .env
```

Edite `.env` conforme necessário:

```
VITE_API_URL=http://localhost:3000
```

## Como rodar (local)

```bash
npm install
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

## Como rodar com Docker

Construa a imagem passando a URL do backend como argumento de build:

```bash
docker build --build-arg VITE_API_URL=http://localhost:3000 -t js-mygoals-fe .
```

Execute o container:

```bash
docker run -p 8080:80 js-mygoals-fe
```

Acesse: [http://localhost:8080](http://localhost:8080)

> **Nota:** `VITE_API_URL` é incorporada em tempo de build pelo Vite. Sempre informe o valor correto no `--build-arg` ao gerar a imagem para produção.

## Build para produção (local)

```bash
npm run build
npm run preview
```

## Estrutura de pastas

```
src/
  contexts/     # AuthContext (estado de autenticação global)
  components/   # Layout, ProtectedRoute, TransactionsGrid, MonthNavigator
  pages/        # LoginPage, DashboardPage, AccountsDashboardPage, UsersPage, CreateUserPage
  services/     # api.ts (axios), auth.service.ts, users.service.ts, transactions.service.ts, accounts.service.ts
  utils/        # date.ts (getMonthRange)
  types/        # Tipagens compartilhadas
```

## Navegação por mês no Dashboard

Ao abrir o Dashboard de Transações, o mês corrente é exibido automaticamente. Para trocar a competência:

- **`←` / `→`** — navega um mês para trás ou para frente
- **Clique no rótulo do mês** (ex.: "Maio 2026") — abre um seletor nativo de mês/ano para ir direto a qualquer período

Todos os cards de resumo e a grade de transações são atualizados automaticamente ao mudar o mês.
