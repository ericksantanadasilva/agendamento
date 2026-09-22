# Agendamento

Plataforma full-stack para gerenciamento de agendamentos, serviços, clientes, profissionais e recursos físicos (como estúdios).

O projeto é estruturado em um monorepo simples e direto, mantendo o frontend e backend desacoplados em runtime.

---

## 1. Estrutura do Repositório

```text
agendamento/
│
├── frontend/                 # Next.js (App Router), React, TypeScript, Tailwind CSS
│   ├── app/                  # Rotas e layout
│   ├── components/           # Componentes organizados
│   │   ├── ui/               # Primitivos visuais (Button, Input, Card) com tokens
│   │   ├── layout/           # Sidebar (Desktop), FloatingBottomNav (Mobile), PageHeader
│   │   └── calendar/         # Estrutura base para a engine de calendário
│   ├── hooks/                # Hooks utilitários
│   ├── lib/                  # Utilitários (cn) e API Client
│   ├── Dockerfile            # Container de produção do frontend
│   └── package.json
│
├── backend/                  # NestJS, TypeScript, Prisma ORM
│   ├── src/
│   │   ├── common/           # Utilitários e filtros compartilhados
│   │   ├── health/           # Checagem de integridade (/api/health)
│   │   ├── prisma/           # PrismaService e PrismaModule
│   │   └── [domínios]/       # Módulos futuros (users, appointments, studios, etc.)
│   ├── prisma/
│   │   └── schema.prisma     # Schema do banco PostgreSQL
│   ├── Dockerfile            # Container de produção do backend
│   └── package.json
│
├── docker-compose.yml        # Orquestração de containers (frontend, backend, postgres)
├── AGENTS.md                 # Diretrizes e regras fundamentais de desenvolvimento
├── DESIGN_SYSTEM.md          # Especificação de design tokens e padrões visuais
├── PRODUCT.md                # Visão de produto, regras e requisitos
└── README.md
```

---

## 2. Tecnologias Utilizadas

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Lucide React, clsx, tailwind-merge.
- **Backend**: NestJS 11, TypeScript, Prisma ORM 6.
- **Banco de Dados**: PostgreSQL 16.
- **Infraestrutura**: Docker & Docker Compose.
- **Sem Supabase**: A autenticação, autorização e persistência são controladas pelo backend NestJS e PostgreSQL.

---

## 3. Como Executar o Projeto

### Opção A: Execução Completa via Docker Compose (Recomendada)

1. Certifique-se de que o Docker está em execução.
2. Na raiz do projeto, suba os serviços:

```bash
docker compose up -d --build
```

3. Acesse:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API (Health)**: [http://localhost:3001/api/health](http://localhost:3001/api/health)
   - **PostgreSQL**: `localhost:5432`

Para parar os serviços:
```bash
docker compose down
```

---

### Opção B: Execução Local para Desenvolvimento

#### 1. Iniciar o Banco de Dados (PostgreSQL)

Você pode subir apenas o container do banco:

```bash
docker compose up -d postgres
```

#### 2. Configurar e Iniciar o Backend

```bash
cd backend
npm install
npx prisma generate
npm run start:dev
```

A API estará disponível em [http://localhost:3001/api](http://localhost:3001/api).

#### 3. Iniciar o Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

---

## 4. Documentação de Referência

- [`AGENTS.md`](./AGENTS.md): Regras de ouro para agentes de IA e desenvolvedores.
- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md): Especificação dos tokens semânticos, paleta dark-first, botões, inputs, cards e navegação responsiva.
- [`PRODUCT.md`](./PRODUCT.md): Visão de negócio, ciclo de vida de agendamentos e arquitetura de domínios.
