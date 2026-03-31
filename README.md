# Sistema de Orçamentos — Chatbot

Sistema completo para geração de orçamentos via chatbot conversacional, com painel administrativo, fluxo de aprovação e acompanhamento de obras.

---

## Visão Geral

```
Chatbot/
├── backend/    → API REST (Node.js + Express + TypeScript + Prisma)
└── frontend/   → Interface web (React + Vite + TypeScript + TailwindCSS)
```

---

## Funcionalidades

### Chatbot
- Fluxo conversacional: nome → telefone → gestor → centro de custo
- Catálogo de produtos com foto, preço e unidade
- Carrinho com controle de quantidade (mín/máx)
- Geração de OS com validade de 15 dias
- Exportação em **PDF** e texto formatado para **Microsoft Teams**
- Link público de aprovação gerado automaticamente

### Aprovação
- Página pública acessível via link único (`/aprovacao/:token`)
- Cliente pode **aprovar** ou **rejeitar** a proposta
- Proposta expira automaticamente após 15 dias
- Após aprovação, acompanhamento do status da obra em tempo real

### Painel Administrativo
| Módulo | Funcionalidades |
|---|---|
| **Dashboard** | OS por dia/mês/ano, valor estimado, gráficos |
| **Produtos** | CRUD completo com foto (crop antes do upload) |
| **Ordens de Serviço** | Listagem, detalhes, link de aprovação, status da obra |
| **Usuários** | Cadastro com perfis `admin` e `chat` |
| **Configurações** | Tipos de serviço e unidades de medida |

---

## Tecnologias

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de dados:** SQLite
- **Autenticação:** JWT (jsonwebtoken + bcryptjs)
- **Upload:** Multer
- **Arquitetura:** MVC modular por feature

### Frontend
- **Framework:** React 18 + Vite
- **Linguagem:** TypeScript (.tsx / .ts)
- **Estilo:** TailwindCSS
- **Roteamento:** React Router v6
- **HTTP:** Axios
- **Gráficos:** Recharts
- **PDF:** jsPDF + jsPDF-AutoTable
- **Crop de imagem:** react-easy-crop

---

## Como Rodar

### Pré-requisitos
- Node.js 18+
- npm

### 1. Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar banco de dados
npm run prisma:migrate

# Popular dados iniciais
npm run seed

# Iniciar servidor de desenvolvimento
npm run dev
```

Servidor disponível em: `http://localhost:3001`

### 2. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Interface disponível em: `http://localhost:5173`

---

## Acesso Inicial

| Campo | Valor |
|---|---|
| Email | `admin@admin.com` |
| Senha | `admin123` |

> Acesso de administrador criado automaticamente pelo seed.

---

## Estrutura do Backend

```
backend/src/
├── config/
│   └── database.ts              # PrismaClient singleton
├── middlewares/
│   ├── auth.middleware.ts        # JWT authenticate + requireAdmin
│   ├── upload.middleware.ts      # Multer (fotos de produto)
│   └── error.middleware.ts       # 404 e error handler global
├── modules/
│   ├── auth/                     # Login e /me
│   ├── users/                    # CRUD de usuários
│   ├── products/                 # CRUD de produtos
│   ├── service-types/            # Tipos de serviço
│   ├── units/                    # Unidades de medida
│   ├── orders/                   # Ordens de serviço + aprovação
│   └── dashboard/                # Estatísticas
├── routes/
│   └── index.ts                  # Agrega todos os módulos
└── app.ts                        # Entry point
```

## Estrutura do Frontend

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx       # Shell do painel admin
│   │   ├── Sidebar.tsx           # Menu lateral
│   │   └── Header.tsx            # Cabeçalho com dropdown
│   └── ui/
│       ├── Button.tsx            # 5 variantes + loading
│       ├── Input.tsx             # Com label, erro e ícones
│       ├── Select.tsx            # Select estilizado
│       ├── Textarea.tsx          # Textarea com label/erro
│       ├── Badge.tsx             # 6 cores com dot indicator
│       ├── Card.tsx              # Surface branca
│       ├── Modal.tsx             # Com Escape, scroll lock e footer
│       ├── Toast.tsx             # Notificações + hook useToast
│       ├── Spinner.tsx           # Loading spinner
│       └── ImageCropper.tsx      # Upload com crop (react-easy-crop)
└── features/
    ├── auth/LoginPage.tsx
    ├── chat/ChatPage.tsx
    ├── admin/
    │   ├── dashboard/DashboardPage.tsx
    │   ├── products/ProductsPage.tsx
    │   ├── orders/OrdersPage.tsx
    │   ├── settings/SettingsPage.tsx
    │   └── users/UsersPage.tsx
    └── approval/ApprovalPage.tsx
```

---

## Rotas da API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/login` | — | Login |
| `GET` | `/api/auth/me` | JWT | Usuário autenticado |
| `GET` | `/api/products/public` | — | Produtos ativos (chatbot) |
| `POST` | `/api/orders` | — | Criar OS (chatbot) |
| `GET` | `/api/orders/approval/:token` | — | Buscar OS por token |
| `PATCH` | `/api/orders/approval/:token/approve` | — | Aprovar proposta |
| `PATCH` | `/api/orders/approval/:token/reject` | — | Rejeitar proposta |
| `GET` | `/api/orders` | Admin | Listar todas as OS |
| `PATCH` | `/api/orders/:id/work-status` | Admin | Atualizar status da obra |
| `GET` | `/api/dashboard/stats` | Admin | Estatísticas |
| `GET/POST/PUT/DELETE` | `/api/products` | Admin | CRUD de produtos |
| `GET/POST/PUT/DELETE` | `/api/users` | Admin | CRUD de usuários |
| `GET/POST/PUT/DELETE` | `/api/service-types` | Admin | Tipos de serviço |
| `GET/POST/PUT/DELETE` | `/api/units` | Admin | Unidades |

---

## Fluxo de Status da OS

```
[Criada] → pending
              ↓ (aprovação em até 15 dias)
         ┌────┴────┐
      approved   rejected
         ↓
    em_andamento
         ↓
      pausado ↔ em_andamento
         ↓
      concluido

(sem aprovação em 15 dias) → expired
```

---

## Scripts Disponíveis

### Backend
| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (ts-node-dev) |
| `npm run build` | Compilar TypeScript |
| `npm start` | Iniciar versão compilada |
| `npm run prisma:migrate` | Criar/atualizar banco de dados |
| `npm run prisma:studio` | Interface visual do banco |
| `npm run seed` | Popular dados iniciais |

### Frontend
| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Build para produção |
| `npm run preview` | Visualizar build de produção |
