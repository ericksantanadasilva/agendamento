# Agendamento

**Sistema de reserva de estúdios.** Aplicação web full-stack para uma equipe reservar estúdios sem conflitos de horário, com calendário, controle de acesso por papel e painel de administração.

<!--
Prints: coloque as imagens em docs/img/ e descomente as linhas abaixo.
![Calendário](docs/img/calendario.png)
![Painel de administração](docs/img/admin.png)
-->

> Projeto de portfólio. A interface está em português e os horários seguem o fuso de São Paulo.

---

## Demonstração

Ambiente no ar: **https://agenda.ericksantana.dev.br**

| Papel    | E-mail                 | Senha         |
| -------- | ---------------------- | ------------- |
| Operador | `operador@exemplo.com` | `senha12345`  |
| Usuário  | `user@exemplo.com`     | `senha122345` |

O que vale experimentar:

- Como **operador**: crie um bloqueio sobre uma reserva existente e veja a confirmação de cancelamento.
- Como **usuário**: crie uma reserva e altere-a nos primeiros 5 minutos. Depois disso, o sistema recusa. O calendário mostra os horários ocupados sem revelar de quem são.

Os dados são fictícios, e o ambiente pode ser reiniciado a qualquer momento. O login de administrador não é divulgado.

## O problema

Reservas de estúdio costumam viver em planilhas e mensagens: dois pedidos para o mesmo horário, ninguém sabe quem pode alterar o quê, e bloqueios como manutenção e feriados são esquecidos. O Agendamento concentra isso num só lugar: o sistema recusa conflitos, respeita o horário de funcionamento de cada estúdio e controla quem pode reservar, alterar e cancelar.

## Funcionalidades

### Calendário e reservas

- Calendário nas visões de **dia**, **semana** e **mês**, com um estúdio por coluna no dia e cores estáveis por estúdio.
- Clicar num horário livre abre a reserva já preenchida com o estúdio, a data e a hora.
- **Criar, editar e cancelar** reservas. O fim é calculado no servidor a partir da duração escolhida.
- **Operadores e administradores** reservam em nome de outra pessoa.
- Cada reserva tem um **serviço** em texto livre (por exemplo, "Gravação da aula 12").

### Bloqueios

- Operadores e administradores bloqueiam um estúdio por um período (manutenção, feriado, evento).
- Se o bloqueio cai sobre reservas existentes, o sistema **lista quem seria afetado** e só cancela tudo, em uma única transação, depois da confirmação.

### Administração

- **Estúdios**, **durações** e **horários de funcionamento** por dia da semana (sem períodos sobrepostos).
- **Usuários**: criar, editar nome e papel, ativar e desativar, e redefinir a senha de outra pessoa.
- **Bloqueios**: listar por estúdio e desativar.

### Conta

- **Meu perfil**: cada pessoa troca o próprio nome e a própria senha.
- Três papéis: **ADMIN**, **OPERATOR** e **USER**, com as permissões conferidas no backend.

## Regras de negócio

- Uma reserva precisa caber inteira num período de funcionamento do estúdio. Períodos que se encostam (08:00–12:00 e 12:00–18:00) contam como um só, e um fim às 00:00 vale como 24:00.
- Não pode haver sobreposição com outra reserva agendada nem com um bloqueio ativo no mesmo estúdio.
- O usuário comum só altera ou cancela a **própria** reserva nos **5 primeiros minutos** depois de criá-la. Operador e administrador alteram qualquer uma. Ninguém altera uma reserva que já começou.
- Na agenda, o usuário comum vê **quais horários estão ocupados**, sem ver quem reservou nem o motivo dos bloqueios. O dono da reserva e a equipe veem os detalhes.
- **Nada é apagado.** Estúdios, durações, horários, usuários e bloqueios são desativados, e as reservas viram "canceladas" com o motivo, o que preserva o histórico.
- Os horários ficam em UTC no banco e são exibidos no fuso `America/Sao_Paulo`.
- A consulta da agenda é limitada a 42 dias por vez.

## Stack

| Camada    | Tecnologias                                                           |
| --------- | --------------------------------------------------------------------- |
| Frontend  | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Lucide |
| Backend   | NestJS 11, TypeScript, Prisma 6                                       |
| Banco     | PostgreSQL 16                                                         |
| Segurança | JWT, bcrypt, class-validator, Helmet, Throttler                       |
| Testes    | Jest                                                                  |
| Infra     | Docker, proxy reverso (Nginx Proxy Manager)                           |

Os componentes da interface (botão, campo, diálogo, seletor, seletor de data e de hora) são próprios, em `frontend/components/ui`, no estilo do shadcn/ui, sem biblioteca de componentes pronta.

## Arquitetura

```text
Navegador ──► Next.js (frontend) ──► API NestJS ──► Prisma ──► PostgreSQL
```

O frontend nunca acessa o banco: toda regra de negócio e de permissão vive na API. O front apenas reflete essas regras (por exemplo, esconde o botão de editar quando a API recusaria).

## Estrutura do repositório

```text
agendamento/
├── backend/
│   ├── prisma/               # schema, migrations e seed do primeiro ADMIN
│   └── src/
│       ├── auth/             # login, refresh token, guards e papéis
│       ├── users/            # usuários, perfil e redefinição de senha
│       ├── studios/          # estúdios
│       ├── durations/        # durações de reserva
│       ├── availabilities/   # horários de funcionamento
│       ├── blocks/           # bloqueios
│       ├── appointments/     # reservas e regras de conflito
│       ├── agenda/           # leitura da agenda com visibilidade por papel
│       └── health/           # /api/health
├── frontend/
│   ├── app/                  # páginas (calendário, estúdios, durações, horários, usuários, bloqueios, perfil)
│   ├── components/           # ui, calendar, layout, admin e formulários
│   ├── hooks/                # carregamento de dados
│   └── lib/                  # cliente da API, autenticação, fuso horário
├── docs/                     # documentos do planejamento original
├── docker-compose.yml        # produção (sem portas publicadas)
└── .env.example              # variáveis do compose
```

## Decisões de projeto

- **Reservas validadas no servidor.** A API recalcula o fim, confere o horário de funcionamento e os conflitos. O front só ajuda a preencher.
- **Autenticação em duas camadas.** O token de acesso dura 15 minutos e fica só na memória do navegador. Um refresh token de 7 dias fica num cookie `httpOnly`, é guardado no banco apenas como hash e **gira a cada uso**: reutilizar um token já trocado revoga toda a sequência de renovações daquele login. Assim, desativar um usuário ou mudar o papel dele vale em até 15 minutos.
- **Desativar em vez de apagar**, para manter o histórico e evitar reservas órfãs.
- **Fuso fixo.** O sistema é de uma única operação, em São Paulo. Todas as conversões passam por um único tradutor no front, e o servidor trabalha em UTC.
- **Single-tenant.** Sem multiempresa por enquanto, o que simplifica o modelo e as permissões.
- **Cores dos estúdios automáticas.** Seguem a ordem de criação, sem configuração, e se repetem só a partir do nono estúdio.

## Como rodar localmente

### Requisitos

- Node.js 22
- PostgreSQL 16, com dois bancos: um para a aplicação e outro "sombra" (usado só pelo `prisma migrate dev`)

### Backend

```bash
cd backend
cp .env.example .env   # preencha DATABASE_URL, SHADOW_DATABASE_URL e JWT_SECRET
npm install
npx prisma generate
npx prisma migrate deploy
```

Crie o primeiro administrador (o script só cria, e recusa um e-mail que já exista):

```bash
read -p 'E-mail do administrador: ' SEED_ADMIN_EMAIL
read -s -p 'Senha (mínimo de 8 caracteres): ' SEED_ADMIN_PASSWORD; echo
export SEED_ADMIN_EMAIL SEED_ADMIN_PASSWORD
npm run seed
unset SEED_ADMIN_PASSWORD
```

O nome é opcional (`SEED_ADMIN_NAME`, padrão "Administrador"). Depois:

A API fica em `http://localhost:3001/api`, e o `GET /api/health` confirma que ela está de pé.

### Frontend

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
npm install
npm run dev
```

A aplicação fica em `http://localhost:3000`. Entre com o administrador criado no seed e cadastre, nesta ordem: um **estúdio**, uma **duração** e os **horários de funcionamento**. Sem eles, ninguém consegue reservar.

### Variáveis do backend

| Variável              | Para que serve                                                                    |
| --------------------- | --------------------------------------------------------------------------------- |
| `DATABASE_URL`        | Conexão com o banco da aplicação                                                  |
| `SHADOW_DATABASE_URL` | Banco sombra, só para criar migrations em desenvolvimento                         |
| `JWT_SECRET`          | Segredo que assina os tokens de acesso (use um valor longo e aleatório)           |
| `FRONTEND_URL`        | Origem permitida no CORS, sem barra no final                                      |
| `PORT`                | Porta da API (padrão 3001)                                                        |
| `TRUST_PROXY`         | Número de proxies confiáveis na frente da API (use `1` atrás de um proxy reverso) |

O front e a API precisam ficar no **mesmo site** (por exemplo, `app.exemplo.com` e `api.exemplo.com`), porque o cookie do refresh token só viaja entre origens do mesmo domínio.

## Qualidade e testes

```bash
# backend
npm test                     # testes da regra de horários e do serviço de reservas
npm run build

# frontend
npm run format:check
npx tsc --noEmit
npx eslint .
npm run build
```

Existem testes automáticos para a função que decide se uma reserva cabe nos horários de funcionamento e para o `AppointmentsService` (criação, edição e cancelamento: permissões, janela de 5 minutos, conflitos e horário de funcionamento). As regras dos demais módulos foram validadas manualmente via API e interface, e cobri-las com testes é um dos próximos passos.

## Docker e deploy

O repositório traz Dockerfiles para a API e para o frontend (com saída `standalone`) e um `docker-compose.yml` de produção. A demonstração roda assim, numa VPS, atrás de um proxy reverso (Nginx Proxy Manager, com HTTPS), **sem publicar portas**. O compose espera um PostgreSQL acessível pela rede Docker (`DB_HOST`) e as variáveis do `.env.example` da raiz.

```bash
cp .env.example .env   # preencha DB_HOST, DB_PASSWORD, JWT_SECRET, FRONTEND_URL e NEXT_PUBLIC_API_URL
docker compose build
docker compose run --rm agendamento-migrate
docker compose up -d
```

Crie o primeiro administrador depois das migrations, com `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` definidos no terminal:

```bash
docker compose run --rm -e SEED_ADMIN_EMAIL -e SEED_ADMIN_PASSWORD agendamento-migrate npx ts-node prisma/seed.ts
```

A `NEXT_PUBLIC_API_URL` é gravada no frontend durante o build: se ela mudar, é preciso reconstruir a imagem.

## Fora do escopo (por enquanto)

- Notificações por e-mail ou chat (hoje quem cancela uma reserva por bloqueio avisa as pessoas por fora).
- Reservas recorrentes.
- Lista de serviços pré-definidos e editáveis pelo administrador.
- "Mostrar desativados" nas telas de configuração.
- Troca obrigatória de senha no primeiro login.
- Testes automáticos dos demais módulos (usuários, bloqueios, autenticação e agenda).

## Documentação adicional

- [`docs/PRODUCT.md`](./docs/PRODUCT.md): planejamento original do produto (mais amplo que o que foi implementado).
- [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md): referência visual (cores, tipografia e comportamento do calendário).

## Autor

Desenvolvido por Erick Sant'Ana.
