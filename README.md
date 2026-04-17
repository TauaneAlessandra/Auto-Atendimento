# 💎 Luna — Sistema Inteligente de Cotações

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

Luna é uma plataforma premium de **Auto-Atendimento e Gestão de Cotações**. Projetada para modernizar o fluxo de vendas, ela combina um chatbot conversacional humano com um painel administrativo robusto para controle total do ciclo de vida das propostas.

---

## 🚀 Funcionalidades Principais

### 🤖 Chatbot Conversacional (Luna)
- **Fluxo Humano:** Experiência de conversação natural para coleta de dados (**Nome**, **Telefone**, **Responsável** e **Endereço**).
- **Catálogo Interativo:** Seleção de produtos com fotos, descrição e controle dinâmico de quantidades.
- **Geração Instantânea:** Criação de cotações em PDF premium e texto formatado pronto para WhatsApp/Teams.
- **Validade Automática:** Cotações geradas com prazo de expiração configurável (padrão 15 dias).

### 📑 Portal de Aprovação Digital
- **Link Exclusivo:** Cada cotação gera um token único para acesso do cliente.
- **Aprovação em um Clique:** Interface simplificada para o cliente revisar itens e aprovar/rejeitar legalmente a proposta.
- **Track de Status:** Após aprovação, o cliente pode acompanhar o status da entrega/execução em tempo real.

### 📊 Painel Administrativo (Elite)
- **Dashboard Analítico:** Gráficos avançados (Highcharts) com volume de cotações, conversão e KPIs financeiros.
- **Gestão de Inventário:** CRUD completo de produtos com ferramenta de crop de imagem integrada.
- **Gestão de Cotações:** Controle total de status (Pendente, Aprovado, Rejeitado, Em Andamento, Concluído).
- **Segurança RBAC:** Controle de acesso baseado em cargos (Admin vs. Chat).

---

## 🛠️ Arquitetura e Tecnologias

O projeto utiliza uma arquitetura **MVC Modular (Smart Dash Inspired)**, garantindo escalabilidade e facilidade de manutenção através de uma separação clara de responsabilidades.

### **Frontend**
- **Core:** React 18 + Vite + TypeScript.
- **Arquitetura:** MVVM (Model-View-ViewModel) para desacoplamento de lógica de UI.
- **UI/UX:** Joy UI (MUI), TailwindCSS e Lucide Icons.
- **Gráficos:** Recharts & Highcharts.

### **Backend**
- **Runtime:** Node.js com Express e TypeScript.
- **ORM:** Prisma (Single Source of Truth).
- **Database:** SQLite (fácil setup, escalável para SQL Server/Postgres).
- **Segurança:** Auth JWT, Bcrypt hashing e Rate Limiting.

---

## 📐 Fluxo de Desenvolvimento (Smart Dash)

Para manter a consistência e qualidade do código, seguimos dois fluxos principais:

### 1. Fluxo Teórico (Criação de Novas Features)
1. **Model/Schema:** Definir a estrutura no `schema.prisma`.
2. **Backend Module:** Criar Repository, Controller e Routes.
3. **API Service:** Implementar a chamada no `frontend/src/services/api.ts`.
4. **ViewModel:** Criar o hook de lógica em `frontend/src/viewmodels`.
5. **View/Feature:** Implementar a UI em `frontend/src/features`.

### 2. Fluxo Prático (Agilidade)
- Utilização de componentes base e estruturas modulares existentes para replicação rápida de funcionalidades CRUD ou listagens.

---

## ⚙️ Como Começar

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**

### 1. Preparação do Backend
```bash
cd backend

# Instale as dependências
npm install

# Configure o .env (use .env.example como base)
cp .env.example .env

# Configure o banco de dados (Prisma)
npm run prisma:migrate

# Popule o banco com dados iniciais (Produtos e Admin padrão)
npm run seed

# Inicie o servidor
npm run dev
```
> O servidor estará rodando em `http://localhost:3001`

### 2. Preparação do Frontend
```bash
cd frontend

# Instale as dependências
npm install

# Inicie a interface
npm run dev
```
> Acesse em `http://localhost:5173`

---

## 🔑 Acesso Padrão (Administrador)

| Campo | Credencial |
| :--- | :--- |
| **E-mail** | `admin@admin.com` |
| **Senha** | `admin123` |

---

## 📂 Estrutura do Projeto

```text
Chatbot/
├── backend/
│   ├── src/
│   │   ├── modules/       # Lógica segmentada (Cotações, Produtos, etc)
│   │   ├── middlewares/    # Segurança e Processamento
│   │   └── config/         # Variáveis e Globais
│   └── prisma/             # Schema e Migrations
└── frontend/
    ├── src/
    │   ├── features/       # Módulos de página (Chat, Admin, Approval, Auth)
    │   ├── viewmodels/     # Hooks de lógica de negócio (MVVM)
    │   ├── services/       # Integração com API
    │   ├── components/     # UI Reutilizável
    │   ├── context/        # Estado Global
    │   └── types/          # Definições de TypeScript
```

---

## 🎨 Design Philosophy
Luna segue os princípios de **Glassmorphism** e **Modern Minimalism**. Utilizamos paletas de cores HSL cuidadosamente selecionadas, animações sutis de micro-interação e tipografia legível para garantir uma experiência premium.

---
Desenvolvido com ❤️ por [Tauane Alessandra](https://github.com/TauaneAlessandra)
