---
title: "Histórico do Projeto — AIOPS App Model"
status: "DRAFT"
owner: "aiops-app-model"
created: "2026-08-19"
updated: "2026-08-19"
version: "1.0"
---

# AIOPS App Model — Descrição completa do projeto e histórico de decisões

> Language: pt-BR
>
> Status: DRAFT — registro consolidado de tudo o que foi construído e ajustado via chat.
>
> Objetivo deste documento: servir de referência única para reimplementar/expor as
> funcionalidades descritas aqui como **botões e ações na interface**.

---

## 1. Visão geral

AIOPS App Model (nome anterior: "AI Portal — Loft") é o portal interno de IA da Loft.
Ele reúne, num único lugar:

- projetos de IA em andamento e concluídos (cases),
- responsáveis por cada projeto (dados vindos do Jira),
- mapa de áreas e pessoas (AI Map),
- métricas de impacto,
- catálogo de ferramentas e integrações,
- fluxos administrativos de criação/edição de conteúdo,
- sincronização automática de status reports no Confluence.

**Migração, não redesign.** O produto original foi reconstruído nesta stack sem
reinterpretar funcionalidades.

### Stack obrigatória

| Camada | Tecnologia |
| --- | --- |
| Framework | TanStack Start (`@tanstack/react-start`) + TanStack Router (file routes) |
| UI | React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Radix), Lucide React |
| Dados/estado | React Query, hooks React, `localStorage` (`src/lib/content-store.ts`) |
| Gráficos | Recharts |
| Build | Vite |
| Servidor | Server functions (`createServerFn`) + rotas de API em `src/routes/api/` |

### Regras permanentes

- **Sem Supabase / Lovable Cloud.** Persistência de conteúdo é client-side (`localStorage`).
- Integrações externas (Jira, Confluence, Gemini) são chamadas apenas de código
  server-only (`*.server.ts`), com credenciais em variáveis de ambiente.
- Código em inglês; copy de UI em português brasileiro.
- Modelo Gemini fixo: `gemini-3.1-flash-lite` (`GEMINI_MODEL`).

---

## 2. Identidade visual

| Token | Hex |
| --- | --- |
| Primário | `#ff774a` |
| Primário escuro | `#d94616` |
| Verde profundo | `#115644` |
| Texto escuro | `#25302c` |
| Verde claro | `#cee79e` |
| Neutro / bordas | `#ebebeb` |

Cores convertidas para OKLCH como tokens semânticos em `src/styles.css`.

Estética: corporativa premium, fundo claro, cards com borda fina, sombras discretas,
cantos arredondados, microinterações de 150–250 ms.

Utilitários criados:

- `hero-aurora` — banner com gradiente verde profundo → laranja suave.
- `canvas-panel` — painel branco elevado (cantos 2.25rem) que **sobrepõe** o banner,
  com sombra reforçada para deixar evidente a sobreposição.
- Sobreposição equivalente na divisória entre sidebar e conteúdo.
- Regra recorrente de layout: abas e cards de atalho ficam **centralizados exatamente
  na linha final do banner** (deslocamento negativo, ex. `-mt-10`).

---

## 3. Layout global

- **Sidebar recolhível** com grupo principal + grupo **"Adicionar"** (itens de
  administração foram mesclados; o rótulo "Administração" foi removido).
- **Topbar**: busca global, avatar e atalho do Command Palette (⌘K / Ctrl+K).
  O botão "AI Assistant" foi removido da sidebar.
- Estruturas globais preparadas: breadcrumbs, toasts, skeleton loading, empty states,
  command palette.
- Componentes base: `PageHeader`, `EmptyState`, `PageSkeleton`, `PageShell`,
  `SegmentedTabs` (abas estilo balão), `SectionHeading`.

---

## 4. Rotas

### Portal

| Rota | Página |
| --- | --- |
| `/` | Home |
| `/cases` | Projetos (abas Em andamento / Concluídos) |
| `/cases/$id` | Detalhe do projeto |
| `/ferramentas`, `/ferramentas/$id` | Ferramentas |
| `/biblioteca` | Biblioteca (redireciona para Home) |
| `/mapa` | AI Map (abas Áreas / Responsáveis) |
| `/impacto` | Impacto |
| `/busca` | Busca global |
| `/assistente` | AI Assistant |

### Administração

| Rota | Página |
| --- | --- |
| `/admin/adicionar-case` | Adicionar Projeto (importação do Jira) |
| `/admin/adicionar-areas` | Adicionar Áreas |
| `/admin/integracoes` | Integrações (abas Todas / Adicionar) + diagnóstico |

### API

| Rota | Função |
| --- | --- |
| `/api/jira-attachment` | Proxy de anexos do Jira |
| `/api/jira-avatar` | Proxy de avatares do Jira (com upscale de qualidade) |

**Removidos ao longo do projeto:** AI Hub, "Quero automatizar algo",
"Tenho uma ideia", "Adicionar conteúdo", Academy/Templates como navegação principal.

---

## 5. Funcionalidades implementadas (candidatas a botões)

Esta seção é a base para expor as ações como botões na interface.

### 5.1 Importar projeto do Jira
- **Onde:** `/admin/adicionar-case` → `JiraImportPanel`.
- **Entrada:** URL de épico **ou** URL/chave de projeto do Jira.
- **Fluxo:** coleta o escopo no Jira (`collectJiraScope`) → organiza com Gemini
  (`organizeWithGemini`) → monta o rascunho do case (`buildCaseFromJira`).
- **Saída:** Problema, Solução, Etapa atual, Status atual, Etapa seguinte, Resultados,
  galeria de anexos (imagens/vídeos), responsável e status do Jira.
- **Regras:**
  - Problema e Solução vêm com contexto ampliado.
  - **Resultados só aparecem se houver métricas** (número/valor concreto); caso
    contrário `semMetricas: true`.
  - **Responsável:** prioriza o assignee do épico; se o link for de projeto (sem épico
    raiz) ou o épico não tiver assignee, usa o responsável mais recorrente nas issues.
- **UI:** modal central de progresso (`JiraImportLoading`).

### 5.2 Publicar / editar projeto
- Salva o conteúdo localmente (`content-store` + `localStorage`) — **sem backend**.
- Ao publicar ou editar, dispara automaticamente a sincronização com o Confluence.
- Prévia ao vivo (`CaseLivePreview`) mostra todas as seções, inclusive as novas
  (Etapa atual / Status atual / Etapa seguinte) com placeholders quando vazias, e o
  responsável no topo e na coluna lateral.

### 5.3 Atualizar do Jira (status report quinzenal)
- **Onde:** botão na página do case (`/cases/$id`).
- Reexecuta a importação a partir do `jiraEpicKey` persistido, abre o modal de
  carregamento, atualiza o conteúdo, grava histórico de atualizações e ressincroniza
  o Confluence.

### 5.4 Sincronizar com o Confluence
- **Escopo restrito** à pasta raiz `Status Projetos AIOps`
  (`CONFLUENCE_STATUS_FOLDER_ID`, id `6105464844`) e a tudo dentro dela.
- **Regra:** procura, dentro da pasta raiz, a subpasta com o **e-mail do responsável
  do épico**. Se não existir, cria. Dentro dela cria/atualiza a página com o **nome do
  projeto** e o conteúdo completo do projeto, incluindo imagens com seus nomes.
- Toda edição ou atualização do projeto reflete imediatamente no Confluence.
- O modal de progresso informa explicitamente que a página de status está sendo criada.
- Implementação: `src/lib/confluence.server.ts`, `src/lib/confluence-sync.ts`,
  server function `$syncCaseToConfluence`.

### 5.5 Excluir projeto
- Exclui localmente **e** remove a página correspondente no Confluence, dentro da
  pasta do e-mail do responsável (`deleteCaseFromConfluence` / `$deleteCaseFromConfluence`).
- Disponível na página do case e na tela de administração.

### 5.6 Diagnóstico de integrações
- **Onde:** `/admin/integracoes`.
- Testa Jira (`/rest/api/3/myself`), Confluence (lista de spaces) e Gemini (prompt
  "responda apenas: ok"), retornando `ok` + detalhe por integração
  (`integrationsStatus`).

### 5.7 Adicionar integração
- Aba "Adicionar" em `/admin/integracoes`.
- Upload do logo com **remoção automática de fundo** via Canvas
  (`src/lib/remove-logo-bg.ts`).
- Seleção de **categorias** em um picker com busca, multiseleção e criação de nova
  categoria (`CategoriaPicker`). O campo "Para que serve" foi removido.

### 5.8 Responsáveis (pessoas do Jira)
- Nome, e-mail e foto vindos do Jira, servidos por `/api/jira-avatar`.
- **Foto em toda parte** onde há nome de responsável: capa e cabeçalho dos cards,
  AI Map, balões, seção "Projetos por responsáveis".
- Clique em qualquer foto abre **modal central com a imagem ampliada em alta
  resolução** (upscale para 512px, `src/lib/responsaveis.ts`).
- Home: seção **"Projetos por responsáveis"** (substituiu "Cases mais acessados"),
  em ordem alfabética, com nome, e-mail, foto e quantidade de projetos — sem limite
  de itens.
- Dados de exemplo: 4 responsáveis mock (`src/data/cases.ts`).

### 5.9 Navegação e filtros
- `/cases`: abas **Em andamento** / **Concluídos** — a aba Concluídos usa o status
  real do Jira. Filtro lateral por responsável.
- `/mapa`: abas **Áreas** / **Responsáveis**, com fotos e vista alfabética.
- Cards de projeto totalmente clicáveis (qualquer ponto do card), com botão
  "Ver case" em tonalidade cinza do sistema.

### 5.10 Home
- Banner sem busca e sem badge "Loft - IA"; logo maior; descrição:
  "Acompanhe tudo o que estamos construindo, responsáveis e que etapa está cada projeto".
- Cards de atalho centralizados na linha final do banner; card "Explorar cases"
  renomeado para **"Todos os projetos"**; card de Integração trocado de posição com
  o de Impacto.
- Seções removidas: "Tem algo repetitivo no seu trabalho?", "Explore o AI Hub".
- Seção "Integrações já realizadas" mantida abaixo de "Projetos por responsáveis".

---

## 6. Variáveis de ambiente

| Variável | Uso |
| --- | --- |
| `JIRA_BASE_URL` | Base da instância Atlassian |
| `JIRA_EMAIL` | Usuário da API Atlassian |
| `JIRA_API_TOKEN` | Token da API Atlassian |
| `CONFLUENCE_STATUS_FOLDER_ID` | Pasta raiz "Status Projetos AIOps" (`6105464844`) |
| `GEMINI_API_KEY` | Chave da API Gemini |
| `GEMINI_MODEL` | Sempre `gemini-3.1-flash-lite` |
| `VITE_API_URL` | Presente em `.env.example`; uso neste deploy é **Unknown** |

- **Preview local:** lidas do `.env` / `.env.local`.
- **Site publicado:** o `.env` não é enviado; as mesmas chaves foram cadastradas como
  **segredos de runtime** e lidas via `process.env`.

---

## 7. Correções pontuais feitas via chat

| Problema | Correção |
| --- | --- |
| Erro de hidratação nos Breadcrumbs | Render ajustado para SSR |
| Erro de hidratação em `usePortalContent` | Montagem correta após SSR |
| "Publicar case" apontando para `localhost:8000` | Publicação passou a salvar localmente |
| "Credenciais Atlassian ausentes" no preview | `node:fs` importado estaticamente + caminho absoluto do `.env` |
| "Credenciais Atlassian ausentes" no publicado | Leitura via `process.env` + cadastro de segredos de runtime |
| Avatares borrados | Regex de upscale para 512px em múltiplos padrões de URL do Jira |
| Avatares não carregando | Domínios permitidos ampliados no proxy |
| Responsável ausente após importar | Fallback pelo assignee mais recorrente + render na prévia e no formulário |
| `jiraStatus` não persistia | Persistência corrigida |
| Faixa cinza abaixo dos resultados na Home | Remoção do `pb-24` do container externo |
| Erros de tipo em `AdminCatalogActionsDialog` | Tipos corrigidos |

---

## 8. Renomeações aplicadas

| De | Para |
| --- | --- |
| AI Portal — Loft | AIOPS App Model |
| O que já temos | Projetos |
| Cases de Sucesso | Projetos em andamento |
| Explorar cases | Todos os projetos |
| Adicionar projeto / Adicionar Case | Adicionar Projeto |
| Cases mais acessados | Projetos por responsáveis |

> Renomear o repositório no GitHub/Lovable (`aiops/central`, sem numeração) é uma ação
> manual do usuário no painel da plataforma — não é feita pelo código.

---

## 9. Limitações conhecidas

| Limitação | Impacto |
| --- | --- |
| Conteúdo em `localStorage` | Catálogo não é compartilhado entre usuários/dispositivos |
| Sem autenticação | Rotas de administração são acessíveis por URL |
| Escrita no Confluence restrita a uma pasta | Fora da pasta raiz nada é criado/alterado |
| `VITE_API_URL` | Não há evidência de backend FastAPI ativo neste deploy |

---

## 10. Arquivos-chave

| Área | Caminho |
| --- | --- |
| Rotas | `src/routes/` |
| Dados seed | `src/data/` |
| Persistência de conteúdo | `src/lib/content-store.ts` |
| Clientes Jira/Confluence/Gemini | `src/lib/integrations.server.ts`, `src/lib/confluence.server.ts`, `src/lib/jira-import.server.ts`, `src/lib/jira-case.server.ts` |
| Server functions | `src/lib/integrations.functions.ts` |
| Sincronização Confluence | `src/lib/confluence-sync.ts` |
| Responsáveis / avatares | `src/lib/responsaveis.ts`, `src/components/portal/ResponsavelAvatar.tsx` |
| Remoção de fundo de logo | `src/lib/remove-logo-bg.ts` |
| Admin | `src/components/admin/` |
| Tokens visuais | `src/styles.css` |
