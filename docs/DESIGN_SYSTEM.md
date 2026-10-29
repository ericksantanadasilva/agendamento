> **Referência visual.** Os princípios, as cores, a tipografia e o comportamento do calendário valem para a implementação atual. Os exemplos que mencionam Cliente, Serviço, Dashboard ou Profissional vêm do planejamento original e não existem no sistema; veja o [README](../README.md) para o escopo real.

---

# Agendamento Design System

Este documento define a linguagem visual e os padrões de interface do Agendamento.

O objetivo é criar uma interface:

- moderna;
- minimalista;
- técnica;
- elegante;
- funcional;
- consistente;
- responsiva;
- visualmente memorável sem ser chamativa.

A interface deve transmitir organização, precisão e qualidade sem parecer excessivamente corporativa, genérica ou baseada em um template SaaS.

---

# 1. Princípios visuais

## 1.1 Minimalismo com personalidade

O Agendamento deve seguir uma filosofia de **minimalismo expressivo**.

Minimalismo não significa simplesmente utilizar fundo escuro, poucos elementos e muitos cards.

A personalidade deve surgir através de:

- composição;
- tipografia;
- contraste;
- espaçamento;
- proporção;
- ritmo visual;
- detalhes técnicos;
- uso controlado da cor;
- pequenas decisões de interface.

A interface deve ser interessante mesmo quando não possui elementos decorativos.

A pergunta principal antes de adicionar qualquer elemento visual deve ser:

> Isso melhora a compreensão, a navegação ou a identidade do produto?

Se a resposta for não, provavelmente não deve existir.

---

## 1.2 Referência estética

A principal referência estética do produto é uma linguagem de design minimalista e técnica semelhante à utilizada no portfólio pessoal do projeto.

A referência não deve ser copiada literalmente.

O objetivo é compartilhar uma mesma família visual:

```text
Minimalismo
+
Tipografia forte
+
Espaço negativo
+
Contraste
+
Detalhes técnicos
+
Composição cuidadosa
+
Personalidade discreta
```

O Agendamento deve parecer uma evolução natural dessa linguagem aplicada a um produto de software.

---

## 1.3 Não parecer um SaaS genérico

O Agendamento NÃO deve seguir automaticamente padrões visuais comuns de dashboards SaaS.

Evitar a combinação:

```text
Fundo azul-marinho
+
Primary azul
+
Cards em excesso
+
Border radius exagerado
+
Gradientes
+
Glow
+
Sombras fortes
+
Badges em excesso
+
Ícones em todo lugar
```

Essa combinação não representa a identidade do Agendamento.

O produto deve possuir uma aparência mais próxima de uma **ferramenta profissional cuidadosamente projetada** do que de um template de dashboard.

---

# 2. Identidade visual

A identidade visual segue:

```text
Dark-first
+
Neutro
+
Minimalista
+
Técnico
+
Elegante
+
Contemporâneo
+
Humano
+
Preciso
```

A interface deve possuir bastante espaço negativo.

Elementos importantes devem ganhar destaque através de composição e hierarquia, não através de efeitos.

A estética deve ser:

```text
quieta
mas não sem graça.

minimalista
mas não vazia.

técnica
mas não fria.

profissional
mas não corporativa.

elegante
mas não luxuosa.
```

---

# 3. Tema e superfícies

Dark mode é o tema principal da aplicação.

A base visual deve ser predominantemente neutra.

Paleta conceitual:

```text
Background          #0A0A0A
Surface             #111111
Surface Elevated    #171717

Border              #242424
Border Subtle       #1C1C1C

Text Primary        #F5F5F5
Text Secondary      #A3A3A3
Text Muted          #737373
```

Esses valores representam a direção visual e devem ser centralizados em tokens.

As superfícies devem possuir pequenas diferenças de luminosidade.

Evitar grandes diferenças de cor entre superfícies.

Exemplo:

```text
Background
    ↓
Surface
    ↓
Surface Elevated
```

A hierarquia deve ser percebida de maneira sutil.

Não utilizar azul ou outras cores fortes para diferenciar superfícies.

---

# 4. Cores

Utilizar tokens centralizados.

Nenhum componente deve definir manualmente cores de identidade.

Estrutura conceitual:

```text
Background
Foreground

Card
Card Foreground

Muted
Muted Foreground

Border
Border Subtle

Primary
Primary Foreground

Secondary
Secondary Foreground

Accent
Accent Foreground

Destructive
Destructive Foreground

Success
Success Foreground

Warning
Warning Foreground

Info
Info Foreground
```

Os componentes devem utilizar os tokens definidos pelo tema.

Evitar:

```tsx
bg-[#123456]
text-[#abcdef]
border-[#123456]
```

espalhados pelo projeto.

Quando uma cor fizer parte da identidade, ela deve existir como token.

---

# 5. Accent

O Agendamento utiliza um verde discreto como principal cor de identidade.

Direção conceitual:

```text
Accent
#00D084
```

O valor final pode ser ajustado durante a implementação para garantir contraste e acessibilidade.

O verde NÃO deve dominar a interface.

Ele deve funcionar como uma espécie de sinal visual.

Usos apropriados:

- ação principal;
- item ativo;
- foco;
- seleção;
- disponibilidade;
- confirmação;
- indicadores importantes;
- elementos interativos relevantes;
- pequenos detalhes de identidade.

Evitar:

```text
fundo verde em grandes áreas;
cards verdes;
gradientes verdes;
glow verde permanente;
texto verde em excesso;
bordas verdes em tudo.
```

O usuário deve perceber o verde principalmente quando existe algo importante acontecendo.

A maior parte da interface continua neutra.

---

# 6. Azul e outras cores

Azul NÃO é a cor principal da identidade do Agendamento.

Azul pode ser utilizado quando possuir significado semântico, por exemplo:

- informação;
- links;
- estados informativos;
- elementos que precisem de diferenciação semântica.

Não utilizar azul como:

- cor padrão dos botões;
- cor padrão dos links internos quando isso conflitar com a identidade;
- cor dominante do dashboard;
- fundo de superfícies;
- identidade visual geral.

Outras cores devem possuir função semântica.

Exemplo:

```text
Success → verde
Warning → amarelo/âmbar
Destructive → vermelho
Info → azul
```

Cores sem função semântica ou de identidade devem ser evitadas.

---

# 7. Tipografia

A tipografia é parte importante da identidade.

Utilizar uma família tipográfica principal consistente e contemporânea.

A hierarquia deve ser clara:

```text
Display
H1
H2
H3
Body
Small
Caption
```

Títulos podem possuir peso e tamanho suficientes para criar personalidade sem depender de efeitos visuais.

Evitar títulos gigantes em todas as páginas.

O contraste entre tamanhos, pesos e espaço deve criar hierarquia.

Elementos técnicos podem utilizar uma fonte monoespaçada de maneira pontual.

Exemplos:

- horários;
- IDs;
- códigos;
- pequenos indicadores;
- dados técnicos;
- valores específicos.

Não transformar toda a interface em uma tela de terminal.

---

# 8. Espaço negativo

Espaço vazio é parte ativa do design.

Não preencher automaticamente áreas vazias com:

- cards;
- gráficos;
- textos;
- ícones;
- indicadores;
- métricas;
- decoração.

Uma página pode possuir uma área vazia intencionalmente.

O espaço deve ajudar a separar:

```text
contexto
↓
informação
↓
ação
```

e não simplesmente ocupar espaço.

---

# 9. Espaçamento

Utilizar o sistema de espaçamento do Tailwind e tokens consistentes.

Preferir progressões previsíveis:

```text
4
8
12
16
20
24
32
40
48
64
```

Evitar valores aleatórios como:

```text
13px
17px
23px
37px
```

quando não houver motivo específico.

Espaçamento deve ser utilizado para criar ritmo visual.

---

# 10. Radius

Utilizar bordas levemente arredondadas.

A interface não deve parecer:

```text
100% quadrada
```

nem:

```text
tudo virou uma pílula
```

O radius deve ser proporcional ao elemento.

Elementos maiores podem possuir radius moderado.

Elementos pequenos devem possuir radius menor.

Pills são reservadas principalmente para:

- badges;
- status;
- filtros;
- pequenas categorias;
- controles específicos.

Não utilizar radius exagerado como recurso para deixar a interface "bonita".

---

# 11. Sombras e elevação

A interface deve depender principalmente de:

- contraste;
- superfície;
- borda;
- espaçamento.

Sombras devem ser discretas.

Utilizar elevação maior somente quando um elemento realmente estiver acima da interface:

- modal;
- dropdown;
- popover;
- menu;
- elemento flutuante.

Evitar:

```text
glow;
neon;
sombras coloridas;
sombras muito fortes.
```

Especialmente no dark mode.

---

# 12. Bordas

Bordas devem ser sutis.

Direção:

```text
Background
↓
Surface
↓
Border Subtle
↓
Border
```

Não colocar borda em absolutamente tudo.

Bordas devem ajudar a estruturar a interface, não desenhar uma caixa em volta de cada elemento.

---

# 13. Cards

Cards devem representar uma unidade real de informação ou ação.

Um card pode conter:

```text
Header
Content
Footer
```

Mas nem toda informação deve estar dentro de um card.

Preferir composição aberta quando isso produzir melhor hierarquia.

Exemplo:

```text
Título

Informações relacionadas

────────────────────

Lista
```

pode ser melhor do que:

```text
┌────────────────────┐
│ Título             │
│                    │
│ Lista              │
└────────────────────┘
```

O uso de cards deve ser intencional.

Não criar cards simplesmente porque o componente Card existe.

---

# 14. Botões

Categorias:

```text
Primary
Secondary
Outline
Ghost
Destructive
Icon
```

O botão primário representa a ação principal daquele contexto.

Exemplo:

```text
+ Novo agendamento
```

Não colocar vários botões primários competindo pela atenção.

Botões devem possuir aparência sólida e simples.

Evitar gradientes, glow e efeitos decorativos.

---

# 15. Inputs

Inputs devem possuir:

- label;
- estado normal;
- foco;
- erro;
- disabled;
- placeholder quando necessário.

O foco deve possuir uma indicação clara e consistente com a identidade visual.

Mensagens de erro devem permanecer próximas ao campo.

Não depender somente de mudança de cor para comunicar erro.

---

# 16. Dialogs

Dialogs devem ser utilizados para:

- criação;
- edição;
- confirmação;
- informações contextuais.

Não utilizar dialogs para fluxos enormes quando uma página dedicada for mais adequada.

Dialogs devem possuir:

- hierarquia clara;
- espaço interno adequado;
- contraste suficiente;
- ações facilmente identificáveis.

---

# 17. Dropdowns

Utilizar dropdowns para ações relacionadas.

Exemplo:

```text
Agendamento
    ⋮
    ├── Editar
    ├── Reagendar
    ├── Cancelar
    └── Ver detalhes
```

Não esconder ações críticas sem necessidade.

---

# 18. Sidebar

Desktop utiliza Sidebar.

A Sidebar deve ser recolhível.

Estado expandido:

```text
┌─────────────────────┐
│ Logo                │
│                     │
│ Dashboard           │
│ Agendamentos        │
│ Calendário          │
│ Clientes            │
│ Serviços            │
│ Estúdios            │
│                     │
│                     │
│ Usuário             │
└─────────────────────┘
```

Estado recolhido:

```text
┌──────┐
│ Logo │
│      │
│  ◉   │
│  ◉   │
│  ◉   │
│  ◉   │
│  ◉   │
│      │
│  ◉   │
└──────┘
```

Quando recolhida:

- utilizar apenas ícones;
- manter indicação clara do item ativo;
- utilizar tooltip quando necessário;
- manter áreas de toque confortáveis;
- preservar a mesma linguagem visual da versão expandida.

A Sidebar não deve parecer um painel separado da aplicação.

Ela faz parte do App Shell.

---

# 19. Mobile Navigation

No mobile, utilizar Floating Bottom Navigation.

Visual:

```text
      ╭──────────────────────╮
      │ Home  Agenda  +  ⋯   │
      ╰──────────────────────╯
```

Características:

- não tocar diretamente nas bordas;
- possuir margem lateral;
- possuir margem inferior;
- possuir radius elevado;
- possuir elevação sutil;
- possuir área de toque confortável;
- item ativo claramente identificável;
- respeitar safe area.

A navegação deve parecer realmente flutuante.

Não deve parecer uma barra tradicional grudada no rodapé.

---

# 20. App Shell

A aplicação deve possuir um shell consistente.

Desktop:

```text
Sidebar | Main Content
```

Mobile:

```text
Main Content

     +

Floating Bottom Navigation
```

Todas as páginas devem compartilhar esse padrão.

A identidade deve permanecer consistente mesmo quando o conteúdo da página mudar completamente.

---

# 21. Page Header

Páginas devem possuir cabeçalho consistente.

Exemplo:

```text
Agendamentos

Gerencie os agendamentos da operação.

                         + Novo agendamento
```

Evitar cabeçalhos excessivamente altos.

O título deve possuir presença visual suficiente sem precisar de decoração.

---

# 22. Estados da interface

Toda tela que carrega dados deve considerar:

## Loading

Usar skeleton ou indicador apropriado.

Skeletons devem respeitar a estrutura real do conteúdo.

Evitar skeletons exageradamente animados.

## Empty

Explicar o que está vazio e, quando possível, oferecer uma ação.

Exemplo:

```text
Nenhum agendamento encontrado.

Crie o primeiro agendamento para começar.

[ Novo agendamento ]
```

## Error

Explicar o problema de maneira compreensível.

## Success

Dar feedback sem interromper desnecessariamente o fluxo.

---

# 23. Calendário

O calendário é um dos elementos centrais do produto.

Deve possuir identidade própria.

Não deve parecer simplesmente um calendário genérico importado de uma biblioteca.

A estrutura funcional pode utilizar bibliotecas de apoio quando necessário, mas a camada visual deve ser controlada pelo projeto.

---

# 24. Arquitetura visual do calendário

```text
Calendar

├── CalendarHeader
├── MonthView
├── WeekView
└── DayView
```

Componentes compartilhados:

```text
TimeGrid
TimeColumn
ResourceColumn
CalendarEvent
CurrentTimeIndicator
CalendarToolbar
```

A aparência dos componentes deve seguir os tokens do sistema.

---

# 25. Calendário mensal

A visualização mensal deve priorizar:

- visão geral;
- quantidade de compromissos;
- dias;
- eventos resumidos;
- navegação temporal.

Eventos devem ser resumidos para evitar poluição visual.

A grade deve possuir bastante espaço para respirar.

Não transformar cada célula em um pequeno dashboard.

---

# 26. Calendário diário

A visualização diária deve ser detalhada.

Quando houver recursos como estúdios:

```text
             Estúdio A      Estúdio B      Estúdio C

08:00           │              │              │

09:00           │   João       │              │

                │              │   Maria      │

10:00   Ana     │              │              │

11:00           │              │   Lucas      │
```

O eixo vertical representa tempo.

As colunas representam recursos.

A interface deve priorizar legibilidade e percepção espacial.

---

# 27. Eventos

Eventos devem representar visualmente:

- horário;
- duração;
- título;
- informação principal;
- status;
- recurso.

Quanto menor o evento, menos informação deve ser mostrada.

Não tentar colocar todos os detalhes dentro de um bloco de 30 minutos.

A densidade da informação deve se adaptar ao espaço disponível.

---

# 28. Duração

A altura do evento deve refletir sua duração sempre que possível.

Exemplo:

```text
30 min  → bloco menor
60 min  → bloco médio
120 min → bloco maior
```

Isso transforma o calendário em uma representação espacial real da agenda.

---

# 29. Status de eventos

Status devem possuir diferenciação visual consistente.

Exemplos:

```text
Agendado
Confirmado
Em andamento
Concluído
Cancelado
Bloqueado
```

Não depender somente de cor.

Quando possível, combinar:

- cor;
- texto;
- ícone;
- padrão visual;
- intensidade da superfície.

A cor deve reforçar o significado, não ser o único significado.

---

# 30. Indicador de horário atual

Em visualizações de tempo, pode existir uma linha indicando o horário atual.

Exemplo:

```text
10:00 ─────────────────────────

             ● Agora
```

Deve ser discreta.

Não deve dominar visualmente a agenda.

---

# 31. Interações do calendário

Quando apropriado:

- clique em horário → iniciar criação;
- clique em evento → abrir detalhes;
- navegação → mudar período;
- arrastar → somente se houver necessidade real;
- redimensionar → somente se a regra de negócio permitir.

Não adicionar drag-and-drop apenas porque é visualmente interessante.

Toda interação deve corresponder a uma necessidade real do produto.

---

# 32. Responsividade do calendário

No mobile, não tentar reproduzir literalmente o calendário desktop.

Priorizar:

```text
Mobile

├── agenda diária
├── lista de eventos
└── seleção de recurso
```

quando a grade completa não for utilizável.

O objetivo é preservar a função, não necessariamente a mesma composição visual.

---

# 33. Ícones

Utilizar uma biblioteca de ícones consistente.

Ícones devem:

- reforçar significado;
- possuir tamanho consistente;
- possuir área de toque adequada quando interativos.

Não usar ícones apenas para preencher espaço.

Não adicionar ícone quando um texto já comunica claramente a ação e o ícone não acrescenta informação.

---

# 34. Microinterações

Utilizar pequenas transições para:

- hover;
- focus;
- abertura;
- fechamento;
- mudança de estado;
- navegação.

As microinterações devem reforçar a sensação de qualidade.

Evitar:

- animações constantes;
- elementos pulando;
- efeitos exagerados;
- transições longas;
- glow;
- partículas;
- efeitos decorativos.

---

# 35. Motion

As animações devem ser rápidas e discretas.

Preferir transições que pareçam naturais.

Respeitar:

```css
prefers-reduced-motion
```

Usuários que solicitarem redução de movimento não devem receber animações desnecessárias.

---

# 36. Acessibilidade

Todos os componentes interativos devem considerar:

- foco;
- teclado;
- aria-label quando necessário;
- contraste;
- tamanho de toque;
- mensagens de erro;
- estados disabled;
- semântica HTML.

Não utilizar somente cor para comunicar estado.

---

# 37. Mobile First

Ao criar componentes, considerar:

```text
Mobile
↓
Tablet
↓
Desktop
```

Isso não significa que desktop tenha menos recursos.

Significa que cada componente deve possuir uma estratégia clara para telas pequenas.

---

# 38. Reutilização

Componentes devem ser reutilizados quando possuem:

- mesma função;
- mesma semântica;
- mesmo padrão visual.

Exemplo:

```text
Button
```

deve continuar sendo Button.

Não criar:

```text
PrimaryActionButton
SaveButton
CreateButton
NewAppointmentButton
```

se todos forem apenas variações artificiais do mesmo componente.

---

# 39. Anti-template

O projeto não deve parecer um template SaaS comprado.

Evitar especialmente:

- dashboards cheios de métricas sem necessidade;
- cards para absolutamente tudo;
- gráficos decorativos;
- gradientes aleatórios;
- glassmorphism excessivo;
- sombras fortes;
- glow;
- neon;
- excesso de badges;
- excesso de ícones;
- excesso de bordas;
- excesso de radius;
- textos genéricos;
- azul como identidade dominante.

Também evitar a estética conhecida como:

```text
"dark mode + blue primary + rounded cards"
```

O fato de uma interface ser moderna não significa que ela precise seguir esse padrão.

A identidade do Agendamento deve vir da composição, tipografia, contraste, espaço e detalhes funcionais.

---

# 40. Direção estética

Ao criar uma nova interface, priorizar nesta ordem:

```text
1. Hierarquia
2. Espaçamento
3. Tipografia
4. Composição
5. Contraste
6. Funcionalidade
7. Cor
8. Decoração
```

Cor e efeitos nunca devem tentar compensar uma composição ruim.

Uma tela bem projetada deve continuar funcionando visualmente mesmo se o accent for removido.

---

# 41. Consistência

Quando um padrão visual for estabelecido, reutilizá-lo.

Exemplo:

Se páginas utilizam:

```text
PageHeader

Título
Descrição
Ação principal
```

não criar uma versão completamente diferente em outra página sem motivo.

A consistência deve existir tanto nos componentes quanto na linguagem visual.

---

# 42. Regra para novos componentes

Antes de criar um novo componente:

```text
1. Existe algo equivalente?

       ↓

      Sim

       ↓

Reutilizar/adaptar

       Não

       ↓

2. O componente será reutilizado?

       ↓

      Sim

       ↓

Criar componente

       Não

       ↓

3. Pode permanecer local?
```

Nem tudo precisa virar componente global.

Abstração deve resolver repetição real.

---

# 43. Regras para IA

Ao gerar ou modificar interfaces:

- consultar este documento;
- consultar `AGENTS.md`;
- consultar `PRODUCT.md` quando a decisão envolver produto;
- reutilizar tokens;
- reutilizar componentes;
- investigar componentes existentes antes de criar novos;
- manter espaçamento consistente;
- manter hierarquia visual;
- não inventar cores;
- não inventar estilos isolados;
- não adicionar efeitos gratuitamente;
- não transformar elementos em cards sem necessidade;
- não utilizar azul como identidade principal;
- utilizar o verde de identidade com moderação;
- preservar espaço negativo;
- manter a linguagem visual existente;
- considerar mobile;
- considerar acessibilidade.

Se houver dúvida entre criar algo novo e reutilizar algo existente, investigar o projeto primeiro.

---

# 44. Processo de validação visual

Antes de considerar uma nova interface aprovada, verificar:

```text
A interface parece pertencer ao Agendamento?

        ↓

A interface parece diferente de um template SaaS genérico?

        ↓

A hierarquia funciona sem depender de cores?

        ↓

O verde está sendo usado como sinal e não como decoração?

        ↓

Existe espaço negativo suficiente?

        ↓

Os cards realmente possuem função?

        ↓

Existe algum efeito visual que poderia ser removido sem perder informação?

        ↓

A composição continua interessante sem gradientes ou glow?

        ↓

Mobile possui uma estratégia própria?

        ↓

O resultado parece parte da mesma família visual do produto?
```

Se alguma resposta for negativa, revisar antes de adicionar mais elementos.

---

# 45. Checklist visual

Antes de considerar uma interface concluída:

- [ ] A hierarquia está clara?
- [ ] O componente segue os tokens?
- [ ] Existe algum componente reutilizável?
- [ ] O espaçamento está consistente?
- [ ] A tipografia está consistente?
- [ ] As ações principais estão claras?
- [ ] Loading foi considerado?
- [ ] Empty state foi considerado?
- [ ] Error state foi considerado?
- [ ] Mobile foi considerado?
- [ ] Teclado/foco foram considerados?
- [ ] As animações são necessárias?
- [ ] Existe algum elemento decorativo sem função?
- [ ] Existe excesso de cards?
- [ ] Existe excesso de bordas?
- [ ] Existe excesso de radius?
- [ ] Existe excesso de ícones?
- [ ] Existe excesso de verde?
- [ ] O azul está sendo usado apenas quando possui função?
- [ ] A composição funciona sem efeitos?
- [ ] A interface possui espaço negativo suficiente?
- [ ] A página parece pertencer ao mesmo produto?
- [ ] A página evita a estética genérica de SaaS?

---

# 46. Regra final

O Agendamento deve parecer um único produto.

Não importa quantas páginas, componentes ou funcionalidades forem adicionados.

O usuário deve sentir que está sempre dentro da mesma aplicação.

A interface pode evoluir.

A identidade não deve se fragmentar.

O objetivo não é criar uma interface chamativa.

O objetivo é criar uma interface que, mesmo sendo minimalista, tenha personalidade suficiente para ser reconhecida como **Agendamento**.
