# PRODUCT.md

# Agendamento

## 1. Visão do produto

O Agendamento é uma plataforma para gerenciamento de agendamentos, serviços, clientes, profissionais e recursos físicos, como estúdios.

O objetivo é centralizar a operação de agendamento em uma interface simples, rápida e visualmente clara.

O sistema deve permitir que uma organização acompanhe sua agenda, disponibilidade e compromissos sem depender de planilhas ou processos manuais.

---

# 2. Problema que o produto resolve

Operações baseadas em agendamento normalmente precisam controlar simultaneamente:

* clientes;
* profissionais;
* serviços;
* horários;
* disponibilidade;
* recursos físicos;
* conflitos;
* cancelamentos;
* alterações;
* histórico.

Quando essas informações ficam espalhadas, surgem problemas como:

* horários duplicados;
* conflitos de agenda;
* dificuldade para visualizar a ocupação dos recursos;
* alterações difíceis de acompanhar;
* dependência de controles manuais;
* pouca visibilidade da operação.

O Agendamento deve transformar essas informações em uma agenda visual e centralizada.

---

# 3. Objetivo principal

O objetivo principal do sistema é permitir que uma pessoa consiga:

1. visualizar a agenda;
2. entender rapidamente quais recursos estão ocupados;
3. encontrar horários disponíveis;
4. criar um agendamento;
5. alterar um agendamento;
6. cancelar um agendamento;
7. gerenciar disponibilidade;
8. administrar clientes, serviços e recursos.

A operação deve exigir o menor número possível de passos para tarefas frequentes.

---

# 4. Público do sistema

O sistema poderá possuir diferentes tipos de usuários.

A definição final de papéis pode evoluir conforme o produto for especificado.

Possíveis perfis:

### Administrador

Responsável pela configuração e gerenciamento geral.

Pode possuir acesso a:

* usuários;
* serviços;
* recursos;
* configurações;
* agenda;
* clientes;
* relatórios.

### Operador

Responsável pela operação cotidiana.

Pode possuir acesso a:

* agenda;
* criação de agendamentos;
* clientes;
* reagendamento;
* cancelamento;
* disponibilidade.

### Profissional/Técnico

Visualiza e gerencia os compromissos relacionados à sua atuação.

### Cliente

Pode futuramente utilizar uma interface própria para:

* consultar disponibilidade;
* realizar agendamentos;
* consultar seus compromissos;
* cancelar ou reagendar quando permitido.

Os papéis e permissões devem ser definidos de forma explícita antes da implementação de cada área.

---

# 5. Conceitos principais

## Usuário

Pessoa autenticada no sistema.

Possui identidade, credenciais e permissões.

---

## Cliente

Pessoa ou entidade que possui um agendamento.

Um cliente pode possuir vários agendamentos.

---

## Profissional

Pessoa responsável pela execução de determinado serviço.

Um profissional pode possuir disponibilidade própria.

---

## Serviço

Atividade que pode ser agendada.

Um serviço pode possuir:

* nome;
* descrição;
* duração;
* preço, quando aplicável;
* profissionais habilitados;
* recursos necessários.

---

## Estúdio / Recurso

Espaço ou recurso físico utilizado durante um agendamento.

Exemplos:

* Estúdio 1;
* Estúdio 2;
* Sala A;
* Sala B.

Um recurso pode possuir disponibilidade própria.

---

## Agendamento

Representa uma reserva de determinado período.

Um agendamento pode estar relacionado a:

* cliente;
* serviço;
* profissional;
* recurso;
* data;
* horário inicial;
* horário final;
* status.

---

## Disponibilidade

Representa os períodos nos quais determinado profissional ou recurso pode ser utilizado.

---

## Bloqueio

Representa um período no qual determinado horário não pode receber agendamentos.

Exemplos:

* manutenção;
* reunião;
* feriado;
* indisponibilidade;
* reserva interna.

---

# 6. Agendamento

O agendamento é o núcleo do produto.

Um agendamento deve possuir, no mínimo:

```text
Cliente
Serviço
Data
Horário inicial
Horário final
Status
```

Dependendo das regras do negócio:

```text
Profissional
Recurso/Estúdio
Observações
Criado por
Data de criação
Última atualização
```

---

# 7. Ciclo de vida do agendamento

Um agendamento pode passar por diferentes estados.

Exemplo inicial:

```text
Agendado
   ↓
Confirmado
   ↓
Em andamento
   ↓
Concluído
```

Também pode existir:

```text
Agendado
   ↓
Cancelado
```

Os estados definitivos devem ser definidos conforme as regras reais do produto.

O frontend deve representar os estados de maneira clara.

As transições válidas devem ser controladas pelo backend.

---

# 8. Regras de conflito

O sistema não deve permitir conflitos incompatíveis.

Exemplos:

* dois agendamentos utilizando o mesmo recurso no mesmo horário;
* dois agendamentos utilizando o mesmo profissional no mesmo horário;
* agendamento fora da disponibilidade;
* agendamento durante um bloqueio.

As regras devem ser verificadas no backend.

O frontend pode antecipar e sinalizar conflitos para melhorar a experiência, mas não pode ser a única camada de proteção.

---

# 9. Calendário

O calendário é a principal representação visual da agenda.

O sistema deve possuir diferentes visualizações.

## Mensal

Foco:

* visão geral;
* navegação entre períodos;
* quantidade de eventos;
* identificação rápida de dias ocupados.

---

## Semanal

Foco:

* comparação de compromissos ao longo da semana;
* distribuição dos horários;
* visualização dos recursos.

A utilidade da visualização semanal deve ser validada durante o desenvolvimento.

Ela não deve existir apenas porque "todo calendário tem uma visão semanal".

---

## Diário

O calendário diário é uma visualização importante do produto.

Deve permitir observar:

```text
Horário × Recurso
```

Exemplo:

```text
             Estúdio 1     Estúdio 2     Estúdio 3

08:00           │              │              │
09:00           │   Evento     │              │
10:00   Evento  │              │   Evento     │
11:00           │              │              │
12:00           │   Evento     │              │
```

A duração dos eventos deve ser visualmente representada sempre que possível.

---

# 10. Navegação temporal

O usuário deve conseguir:

* voltar;
* avançar;
* retornar ao dia atual;
* selecionar uma data;
* mudar a visualização.

A navegação deve ser rápida e previsível.

---

# 11. Criação de agendamento

O fluxo deve ser simples.

Fluxo conceitual:

```text
Novo agendamento
      ↓
Selecionar cliente
      ↓
Selecionar serviço
      ↓
Selecionar profissional/recurso
      ↓
Selecionar data
      ↓
Selecionar horário
      ↓
Revisar
      ↓
Confirmar
```

O fluxo final pode ser reduzido ou reorganizado conforme testes de usabilidade.

---

# 12. Disponibilidade

O sistema deve permitir definir quando determinado recurso ou profissional pode receber agendamentos.

Possíveis regras:

* dias da semana;
* horário inicial;
* horário final;
* intervalos;
* exceções;
* bloqueios.

A disponibilidade deve ser tratada como regra de negócio.

---

# 13. Bloqueios

O sistema deve permitir bloquear períodos.

Um bloqueio pode possuir:

* recurso;
* profissional;
* data;
* horário inicial;
* horário final;
* motivo;
* observação.

Exemplo:

```text
Estúdio 2
14:00 → 16:00
Motivo: Manutenção
```

Durante esse período, novos agendamentos incompatíveis devem ser impedidos.

---

# 14. Clientes

O sistema deve permitir administrar clientes.

Funcionalidades possíveis:

* criar;
* editar;
* visualizar;
* pesquisar;
* histórico de agendamentos.

O cadastro deve evoluir conforme as necessidades reais do produto.

Não coletar informações sem finalidade definida.

---

# 15. Serviços

O sistema deve permitir administrar os serviços oferecidos.

Um serviço pode possuir:

* nome;
* descrição;
* duração;
* preço;
* status;
* profissionais associados;
* recursos compatíveis.

---

# 16. Estúdios e recursos

O sistema deve permitir administrar os recursos utilizados pela operação.

Cada recurso pode possuir:

* nome;
* descrição;
* status;
* disponibilidade;
* capacidade;
* características específicas.

A estrutura deve permitir que "estúdio" seja apenas um tipo de recurso, caso o produto futuramente precise trabalhar com outros recursos.

---

# 17. Pesquisa e filtros

As telas operacionais devem permitir encontrar informações rapidamente.

Possíveis filtros:

* data;
* período;
* cliente;
* profissional;
* serviço;
* recurso;
* status.

Filtros devem aparecer quando realmente ajudam a operação.

Não transformar cada tela em um painel de filtros.

---

# 18. Dashboard

O dashboard deve fornecer uma visão resumida da operação.

Ele não deve existir apenas para preencher a página inicial com gráficos.

Possíveis informações:

* agendamentos do dia;
* próximos agendamentos;
* ocupação;
* cancelamentos;
* recursos ocupados;
* pendências.

As métricas definitivas devem ser definidas depois que o fluxo principal estiver funcionando.

O calendário é mais importante do que um dashboard cheio de números.

---

# 19. Histórico

Operações importantes podem precisar de histórico.

Possíveis eventos:

* criação;
* alteração;
* cancelamento;
* reagendamento;
* alteração de status.

O nível de auditoria deve ser definido conforme a necessidade do produto.

---

# 20. Notificações

O produto poderá futuramente possuir notificações.

Possibilidades:

* confirmação;
* lembrete;
* cancelamento;
* alteração;
* aviso de indisponibilidade.

O canal pode ser definido posteriormente:

* e-mail;
* WhatsApp;
* notificações internas;
* outros.

Não implementar notificações externas antes de definir o fluxo real.

---

# 21. Responsividade

O sistema deve funcionar em:

* desktop;
* tablet;
* mobile.

Desktop deve priorizar produtividade.

Mobile deve priorizar:

* consulta;
* criação rápida;
* navegação;
* visualização dos compromissos.

A experiência mobile não precisa ser uma cópia reduzida da experiência desktop.

---

# 22. Experiência do usuário

O produto deve privilegiar:

### Clareza

O usuário deve entender o que está acontecendo.

### Velocidade

Tarefas frequentes devem exigir poucos passos.

### Previsibilidade

Ações devem produzir resultados esperados.

### Feedback

O usuário deve saber quando algo:

* foi salvo;
* falhou;
* está carregando;
* foi cancelado;
* precisa de atenção.

### Recuperação

Quando uma operação falhar, o usuário deve conseguir entender o problema e tentar novamente.

---

# 23. MVP

O primeiro MVP deve evitar funcionalidades periféricas.

Prioridade inicial:

```text
1. Autenticação
2. Usuários
3. Clientes
4. Serviços
5. Recursos/Estúdios
6. Disponibilidade
7. Agendamentos
8. Calendário
9. Bloqueios
10. Status e cancelamento
```

Funcionalidades como:

* notificações externas;
* relatórios avançados;
* integrações;
* automações;
* dashboards complexos;

podem ser adicionadas posteriormente.

---

# 24. Fora do MVP

Não implementar automaticamente:

* pagamentos;
* marketplace;
* chat;
* CRM completo;
* campanhas;
* automações complexas;
* integrações externas;
* relatórios avançados.

Essas funcionalidades podem existir futuramente, mas não fazem parte do núcleo inicial.

---

# 25. Princípio de evolução

O produto deve evoluir a partir de necessidades reais.

Não criar funcionalidades apenas porque são comuns em outros sistemas de agendamento.

A pergunta principal deve ser:

> Isso ajuda o usuário a administrar seus agendamentos de maneira mais simples?

Se não, a funcionalidade precisa de uma justificativa melhor.

---

# 26. Critério de sucesso

O produto deve permitir que uma operação consiga responder rapidamente:

* O que está agendado hoje?
* Qual recurso está ocupado?
* Qual horário está disponível?
* Quem é o cliente?
* Qual serviço será realizado?
* Quem é o responsável?
* O que foi cancelado?
* Existe algum conflito?

Se o usuário precisa procurar em várias telas para responder perguntas básicas da operação, a experiência precisa ser revisada.

---

# 27. Visão futura

O Agendamento deve possuir uma arquitetura capaz de evoluir para:

```text
Agendamento
│
├── Gestão de agenda
├── Gestão de clientes
├── Gestão de serviços
├── Gestão de recursos
├── Gestão de profissionais
├── Relatórios
├── Notificações
├── Integrações
└── Portal do cliente
```

Essas possibilidades não devem antecipar complexidade desnecessária no MVP.

---

# 28. Regra principal do produto

O Agendamento não deve tentar ser o sistema que faz tudo.

Ele deve ser excelente naquilo que constitui seu núcleo:

> **organizar, visualizar e administrar agendamentos de forma clara, rápida e confiável.**
