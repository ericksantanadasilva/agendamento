# AGENTS.md

## Agendamento

Este documento define como agentes de IA e desenvolvedores devem trabalhar neste projeto.

O objetivo é manter o projeto consistente em arquitetura, código, experiência visual e regras de negócio, evitando soluções improvisadas, duplicação e alterações desnecessárias.

---

# 1. Objetivo do projeto

O Agendamento é uma aplicação web para gerenciamento de agendamentos, serviços, disponibilidade, recursos/estúdios, usuários e operações relacionadas.

O projeto deve ser tratado como uma aplicação full-stack real, e não como uma coleção de telas independentes.

Uma funcionalidade pode envolver simultaneamente:

* interface;
* estado da aplicação;
* chamadas à API;
* regras de negócio;
* autenticação/autorização;
* banco de dados;
* validações;
* feedback visual;
* testes.

Ao implementar uma funcionalidade, analise o impacto em todas essas camadas antes de começar a alterar arquivos.

---

# 2. Princípios fundamentais

## 2.1 Pequena mudança necessária

Faça a menor alteração capaz de resolver o problema corretamente.

Não:

* refatore arquivos sem necessidade;
* reorganize pastas apenas por preferência;
* substitua bibliotecas sem necessidade;
* altere a arquitetura para resolver um problema local;
* crie abstrações prematuramente.

Antes de criar algo novo, procure algo existente que possa ser reutilizado.

---

## 2.2 Entenda antes de alterar

Antes de implementar uma funcionalidade:

1. examine a estrutura existente;
2. procure componentes semelhantes;
3. procure serviços existentes;
4. procure DTOs e validações existentes;
5. procure modelos Prisma relacionados;
6. leia as regras relevantes em `DESIGN_SYSTEM.md`;
7. identifique dependências entre frontend e backend;
8. só então implemente.

Não presuma que algo não existe apenas porque não foi mencionado na solicitação.

---

# 3. Arquitetura do projeto

O projeto utiliza um monorepo simples.

Frontend e backend pertencem ao mesmo repositório, mas são aplicações independentes em runtime.

```text
agendamento/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── package.json
│   └── Dockerfile
│
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── AGENTS.md
├── DESIGN_SYSTEM.md
├── PRODUCT.md
├── ARCHITECTURE.md
└── README.md
```

## Frontend

Tecnologias principais:

* Next.js;
* React;
* TypeScript;
* Tailwind CSS;
* shadcn/ui quando apropriado.

Responsabilidades:

* interface;
* navegação;
* componentes;
* formulários;
* experiência do usuário;
* chamadas à API;
* estados de loading, erro e vazio.

O frontend NÃO acessa PostgreSQL diretamente.

---

## Backend

Tecnologias principais:

* NestJS;
* TypeScript;
* Prisma;
* PostgreSQL.

Responsabilidades:

* regras de negócio;
* autenticação;
* autorização;
* validação;
* persistência;
* consultas;
* transações;
* API REST.

Fluxo obrigatório:

```text
Frontend
   ↓
HTTP/API
   ↓
NestJS
   ↓
Prisma
   ↓
PostgreSQL
```

Nunca criar acesso direto do frontend ao banco.

---

# 4. Infraestrutura

A aplicação será executada em VPS própria.

Tecnologias de infraestrutura:

* Docker;
* Docker Compose;
* PostgreSQL;
* Nginx Proxy Manager.

Supabase NÃO faz parte deste projeto.

Não adicionar:

* Supabase Auth;
* Supabase Database;
* Supabase Storage;
* Supabase Edge Functions;
* qualquer dependência do Supabase.

Se uma necessidade surgir que normalmente seria resolvida pelo Supabase, avaliar primeiro como implementá-la dentro da arquitetura atual.

---

# 5. Containers

Frontend e backend devem possuir containers separados.

Exemplo:

```text
Docker
│
├── agendamento-web
│      └── Next.js :3000
│
├── agendamento-api
│      └── NestJS :3000
│
└── agendamento-db
       └── PostgreSQL :5432
```

Aplicações podem utilizar a mesma porta interna dentro de seus próprios containers.

Não criar conflitos de porta desnecessários no host.

Quando possível, utilizar redes Docker para comunicação entre serviços.

---

# 6. Nginx Proxy Manager

O Nginx Proxy Manager é responsável pelo acesso externo aos serviços.

O frontend e backend devem permanecer isolados dos detalhes de infraestrutura.

Exemplo conceitual:

```text
Internet
   │
   ↓
Nginx Proxy Manager
   │
   ├── agendamento.example → frontend:3000
   │
   └── api.agendamento.example → backend:3000
```

Não alterar configurações de proxy sem necessidade.

---

# 7. Regra de funcionalidades Full-Stack

Uma solicitação de funcionalidade deve ser analisada como uma unidade de produto.

Exemplo:

> "Adicionar bloqueio de horários."

Não assumir que isso significa apenas criar um componente visual.

Avaliar:

```text
Feature: Bloqueio de horários

Banco
├── modelo
└── migration

Backend
├── DTO
├── validação
├── service
├── controller
└── regras de conflito

Frontend
├── API client
├── formulário
├── calendário
├── estados
└── feedback

Testes
├── regras de negócio
└── comportamento da interface quando aplicável
```

Quando uma funcionalidade exigir alterações em frontend e backend, trate-as como uma única feature.

---

# 8. Frontend

## 8.1 Next.js

Utilizar as convenções atuais do Next.js.

Preferir Server Components quando não houver necessidade de interatividade no cliente.

Utilizar `"use client"` somente quando necessário, por exemplo:

* estado local;
* eventos de interação;
* hooks;
* APIs do navegador;
* componentes interativos.

Não transformar toda a aplicação em Client Components sem necessidade.

---

# 9. Componentes

Antes de criar um componente:

1. procure componentes existentes;
2. procure componentes equivalentes em `components/ui`;
3. verifique o `DESIGN_SYSTEM.md`;
4. avalie se a necessidade é realmente reutilizável.

Não criar componentes duplicados apenas com pequenas diferenças visuais.

Evitar nomes como:

```text
CardNovo
CardModerno
CardEspecial
CardDashboard
CardAgendamentoNovo
```

Quando todos representam essencialmente o mesmo conceito, deve existir uma abstração coerente.

---

# 10. shadcn/ui

shadcn/ui pode ser utilizado como base para componentes comuns.

Ele é uma ferramenta de implementação, não a identidade visual do projeto.

Sempre que um componente shadcn for utilizado:

* respeitar o Design System;
* ajustar tokens quando necessário;
* evitar copiar estilos arbitrariamente;
* manter consistência com os demais componentes.

Não instalar uma biblioteca inteira apenas para resolver um componente simples.

---

# 11. Design System

O arquivo `DESIGN_SYSTEM.md` é obrigatório para decisões visuais.

Antes de criar uma interface:

1. consultar os tokens;
2. reutilizar componentes existentes;
3. respeitar espaçamento;
4. respeitar tipografia;
5. respeitar radius;
6. respeitar cores;
7. respeitar padrões de interação.

Não inventar uma nova linguagem visual em uma página isolada.

---

# 12. Layout

O projeto possui dois modelos principais de navegação.

Desktop:

```text
┌──────────────┬─────────────────────────┐
│              │                         │
│   Sidebar    │        Conteúdo         │
│              │                         │
│              │                         │
└──────────────┴─────────────────────────┘
```

Mobile:

```text
┌──────────────────────────────┐
│                              │
│          Conteúdo            │
│                              │
│                              │
│    ╭────────────────────╮    │
│    │  Home Calendar ... │    │
│    ╰────────────────────╯    │
└──────────────────────────────┘
```

A navegação mobile utiliza uma Floating Bottom Navigation.

Não tentar simplesmente reduzir a Sidebar para o tamanho de uma tela mobile.

---

# 13. Calendário

O calendário é uma parte central do produto.

Não assumir que uma biblioteca visual pronta deve controlar a experiência.

A aplicação terá componentes próprios de calendário.

Bibliotecas de utilidade de datas podem ser utilizadas para cálculos.

Exemplo:

```text
date-fns
   ↓
cálculos de data/hora
   ↓
engine do calendário
   ↓
componentes visuais
```

Evitar acoplar regras de negócio diretamente à camada visual.

---

# 14. Visualizações do calendário

Devem existir, conforme necessidade do produto:

* visualização mensal;
* visualização semanal;
* visualização diária.

A infraestrutura deve ser compartilhada sempre que possível.

Estrutura conceitual:

```text
Calendar
│
├── MonthView
│
├── WeekView
│
└── DayView
```

Não implementar três sistemas de calendário completamente independentes.

---

# 15. Calendário por recursos

O calendário deve suportar recursos como estúdios.

A visualização diária pode utilizar:

```text
             Estúdio A   Estúdio B   Estúdio C
08:00           │           │           │
09:00           │  Evento   │           │
10:00  Evento   │           │  Evento   │
11:00           │           │           │
```

A arquitetura deve permitir que outros tipos de recurso sejam adicionados futuramente sem reescrever o calendário.

---

# 16. Eventos do calendário

Um evento deve possuir informações suficientes para ser representado visualmente.

Exemplos:

* título;
* horário inicial;
* horário final;
* duração;
* recurso;
* status;
* serviço;
* cliente;
* identificador.

O componente visual não deve decidir regras de negócio.

---

# 17. Sobreposição de eventos

O calendário deve considerar a possibilidade de eventos sobrepostos.

A lógica de posicionamento deve ficar separada da apresentação visual.

Não resolver sobreposição com valores fixos ou hacks específicos para um caso.

---

# 18. Responsividade

A interface deve ser pensada para:

* desktop;
* tablet;
* mobile.

Não criar uma interface desktop e simplesmente "espremer" para mobile.

No mobile:

* priorizar informações essenciais;
* utilizar navegação inferior flutuante;
* evitar tabelas impossíveis de utilizar;
* utilizar scroll horizontal somente quando fizer sentido;
* considerar visualizações específicas para telas pequenas.

---

# 19. Backend NestJS

Organizar o backend por domínio/feature.

Exemplo:

```text
backend/src/
├── auth/
├── users/
├── clients/
├── technicians/
├── studios/
├── services/
├── availability/
├── appointments/
└── common/
```

Cada módulo deve manter responsabilidades claras.

Evitar um `service.ts` gigante contendo toda a aplicação.

---

# 20. Controllers

Controllers devem cuidar principalmente de:

* receber requisições;
* validar entrada por DTOs;
* chamar services;
* retornar respostas apropriadas.

Não colocar regras complexas de negócio diretamente nos controllers.

---

# 21. Services

Services concentram regras de negócio.

Exemplo:

```text
AppointmentsService
```

pode ser responsável por:

* criar agendamento;
* verificar disponibilidade;
* verificar conflitos;
* cancelar;
* reagendar;
* alterar status.

---

# 22. Prisma

Prisma será utilizado como ORM.

Toda alteração estrutural do banco deve ser representada por migration.

Não alterar manualmente o banco de produção ignorando o histórico de migrations.

Ao alterar o schema:

1. alterar `schema.prisma`;
2. criar migration;
3. testar;
4. atualizar código dependente.

---

# 23. PostgreSQL

PostgreSQL é a fonte persistente principal da aplicação.

Não criar armazenamento paralelo sem justificativa.

Não duplicar dados desnecessariamente.

Utilizar índices quando consultas reais justificarem.

---

# 24. Autenticação

A autenticação será implementada pelo backend NestJS.

Não utilizar autenticação do Supabase.

O backend deve ser responsável por:

* login;
* sessão/token;
* validação de identidade;
* autorização;
* expiração;
* proteção de endpoints.

Detalhes de implementação podem evoluir conforme a arquitetura de autenticação for definida.

Nunca armazenar senhas em texto puro.

Utilizar hashing adequado.

---

# 25. Autorização

Autenticação responde:

> Quem é o usuário?

Autorização responde:

> O que esse usuário pode fazer?

As duas responsabilidades devem permanecer separadas.

Permissões devem ser verificadas no backend.

Nunca confiar somente em esconder botões no frontend.

---

# 26. Validação

Validar dados:

```text
Frontend
   ↓
Backend
```

A validação do frontend melhora a experiência.

A validação do backend protege o sistema.

Nunca considerar validação visual suficiente.

---

# 27. Tratamento de estados

Interfaces devem considerar:

* loading;
* sucesso;
* erro;
* vazio;
* indisponível;
* confirmação;
* operações em andamento.

Não deixar páginas com estados indefinidos.

---

# 28. Tratamento de erros

Erros de API devem possuir formato consistente.

O frontend deve transformar erros técnicos em mensagens compreensíveis quando necessário.

Não mostrar stack traces ou informações internas ao usuário.

---

# 29. Segurança

Nunca colocar:

* senhas;
* tokens;
* chaves privadas;
* secrets;
* credenciais de banco

no código-fonte.

Utilizar variáveis de ambiente.

Não commitar `.env` real.

---

# 30. Dependências

Antes de instalar uma nova biblioteca:

1. verificar se o projeto já possui solução equivalente;
2. verificar se a funcionalidade pode ser implementada de maneira simples;
3. considerar manutenção e tamanho da dependência;
4. verificar compatibilidade com a arquitetura.

Não adicionar dependências apenas para economizar algumas linhas de código.

---

# 31. Performance

Evitar otimizações prematuras.

Porém:

* não fazer consultas desnecessárias;
* não carregar dados gigantes sem necessidade;
* utilizar paginação quando apropriado;
* evitar renders desnecessários;
* evitar componentes client-side sem necessidade.

Performance deve ser tratada com base em problemas reais.

---

# 32. Acessibilidade

Componentes devem considerar:

* navegação por teclado;
* foco;
* labels;
* contraste;
* estados de erro;
* leitores de tela quando aplicável;
* áreas clicáveis adequadas.

Não remover indicadores de foco apenas por estética.

---

# 33. Animações

Animações devem ser discretas e funcionais.

Usar principalmente para:

* entrada de elementos;
* mudança de estado;
* feedback;
* navegação;
* hover;
* abertura/fechamento.

Evitar animações que prejudiquem:

* leitura;
* navegação;
* performance;
* acessibilidade.

Respeitar `prefers-reduced-motion`.

---

# 34. Git

Não executar comandos destrutivos sem necessidade.

Nunca apagar alterações do usuário para "limpar" o projeto.

Antes de modificar arquivos importantes, entenda o estado atual.

Commits devem representar mudanças coerentes.

Exemplos:

```text
feat: add appointment calendar
feat: add studio availability
fix: prevent overlapping appointments
refactor: extract calendar event positioning
```

Evitar commits genéricos como:

```text
update
changes
fix stuff
```

---

# 35. Testes

Testes devem priorizar regras de negócio importantes.

Especialmente:

* autenticação;
* autorização;
* conflitos de horário;
* disponibilidade;
* criação de agendamento;
* cancelamento;
* regras de duração;
* permissões.

Não escrever testes apenas para aumentar quantidade de cobertura.

---

# 36. Build e qualidade

Antes de considerar uma alteração concluída, quando aplicável:

```text
lint
↓
test
↓
build
```

Erros introduzidos pela alteração devem ser corrigidos antes da conclusão.

---

# 37. Quando criar abstrações

Criar abstrações quando existir:

* reutilização real;
* regra compartilhada;
* complexidade suficiente;
* necessidade de manutenção centralizada.

Evitar abstrações baseadas apenas em uma possibilidade futura.

Primeiro resolva o problema real.

Depois generalize quando houver evidência.

---

# 38. Anti-AI-Slop

O projeto não deve parecer gerado automaticamente.

Evitar:

* gradientes gratuitos;
* excesso de cards;
* textos genéricos;
* dashboards visualmente barulhentos;
* sombras exageradas;
* animações em tudo;
* componentes duplicados;
* ícones usados sem propósito;
* páginas com excesso de elementos;
* layouts idênticos aos templates populares;
* bibliotecas adicionadas sem necessidade.

O objetivo é uma interface intencional, limpa e coerente.

---

# 39. Regra de ouro para agentes

Antes de criar:

> Procure.

Antes de duplicar:

> Reutilize.

Antes de instalar:

> Verifique se já existe.

Antes de alterar arquitetura:

> Confirme se é necessário.

Antes de criar uma tela:

> Entenda a feature.

Antes de implementar uma feature:

> Entenda frontend, backend e banco.

Antes de finalizar:

> Verifique se a mudança está consistente com o projeto inteiro.

---

# 40. Ordem de prioridade

Quando houver conflito entre decisões:

1. segurança;
2. regras de negócio;
3. arquitetura;
4. consistência do projeto;
5. acessibilidade;
6. experiência do usuário;
7. performance;
8. estética;
9. conveniência de implementação.

Uma solução visualmente bonita que viola regras de negócio não é uma solução correta.

---

# 41. Checklist final

Antes de concluir uma tarefa:

* [ ] Entendi a estrutura existente?
* [ ] Procurei componentes reutilizáveis?
* [ ] Consultei `DESIGN_SYSTEM.md`?
* [ ] Evitei duplicação?
* [ ] A alteração respeita a arquitetura?
* [ ] O frontend conversa com o backend corretamente?
* [ ] O backend valida os dados?
* [ ] Regras de negócio permanecem no backend?
* [ ] O banco possui migration quando necessário?
* [ ] Loading, erro e vazio foram considerados?
* [ ] Desktop e mobile foram considerados?
* [ ] Acessibilidade básica foi considerada?
* [ ] Não adicionei dependências desnecessárias?
* [ ] Não introduzi secrets?
* [ ] Testes relevantes foram considerados?
* [ ] Lint/build/test passam quando aplicável?
* [ ] A solução continua simples de entender?

---

# 42. Resultado esperado

O projeto deve permanecer:

* simples de entender;
* consistente;
* modular;
* seguro;
* responsivo;
* visualmente coerente;
* fácil de manter;
* adequado para evolução futura.

A IA deve ajudar a construir o sistema, não transformar o projeto em uma coleção de decisões difíceis de explicar.
