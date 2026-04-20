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

## Pré-requisitos

- Node.js 20+
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

## Como rodar

```bash
npm install
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

## Build para produção

```bash
npm run build
npm run preview
```

## Estrutura de pastas

```
src/
  contexts/     # AuthContext (estado de autenticação global)
  components/   # Layout, ProtectedRoute
  pages/        # LoginPage, DashboardPage, UsersPage, CreateUserPage
  services/     # api.ts (axios), auth.service.ts, users.service.ts
  types/        # Tipagens compartilhadas
```
