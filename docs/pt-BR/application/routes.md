---
title: "Rotas"
status: "DRAFT"
owner: "aiops-app-model"
created: "2026-08-19"
updated: "2026-08-19"
version: "1.0"
---

# Rotas

> Language: [English (EN)](../en/application/routes.md) | Português (pt-BR)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

Roteamento file-based do TanStack Router. Referência de convenções: `src/routes/README.md`. Árvore gerada: `src/routeTree.gen.ts` (não editar manualmente).

## Rotas do portal (sidebar)

| URL | Arquivo | Propósito | Auth |
| --- | --- | --- | --- |
| `/` | `src/routes/index.tsx` | Home — destaques, atalhos, entrada do portal | Nenhum |
| `/cases` | `src/routes/cases.index.tsx` | Listagem de projetos (cases) com filtros | Nenhum |
| `/cases/:id` | `src/routes/cases.$id.tsx` | Detalhe — problema, solução, métricas, relacionados | Nenhum |
| `/mapa` | `src/routes/mapa.tsx` | AI Map — explorar projetos por área | Nenhum |
| `/impacto` | `src/routes/impacto.tsx` | Métricas e gráficos de impacto | Nenhum |
| `/ferramentas` | `src/routes/ferramentas.index.tsx` | Catálogo de integrações | Nenhum |
| `/ferramentas/:id` | `src/routes/ferramentas.$id.tsx` | Detalhe de integração | Nenhum |

## Rotas secundárias do portal

| URL | Arquivo | Propósito | Auth |
| --- | --- | --- | --- |
| `/assistente` | `src/routes/assistente.tsx` | Chat do assistente de IA interno | Nenhum |
| `/busca` | `src/routes/busca.tsx` | Resultados da busca global | Nenhum |
| `/biblioteca` | `src/routes/biblioteca.tsx` | Redireciona para `/` (rota legada) | Nenhum |

## Rotas admin (sidebar “Adicionar”)

| URL | Arquivo | Propósito | Auth |
| --- | --- | --- | --- |
| `/admin/adicionar-case` | `src/routes/admin.adicionar-case.tsx` | Importar/criar case (pipeline Jira) | Nenhum |
| `/admin/adicionar-areas` | `src/routes/admin.adicionar-areas.tsx` | Gerenciar áreas do mapa | Nenhum |
| `/admin/integracoes` | `src/routes/admin.integracoes.tsx` | Diagnóstico de saúde das integrações | Nenhum |

> **Nota de segurança:** rotas admin não possuem guard de autenticação no código atual (Confirmed).

## Rotas API (handlers server)

| URL | Arquivo | Método | Propósito |
| --- | --- | --- | --- |
| `/api/jira-attachment` | `src/routes/api/jira-attachment.ts` | GET | Proxy de conteúdo de anexo Jira (`?id=` numérico) |
| `/api/jira-avatar` | `src/routes/api/jira-avatar.ts` | GET | Proxy de avatar de usuário Jira |

Ambas exigem credenciais Atlassian configuradas no servidor.

## Layout

| Arquivo | Papel |
| --- | --- |
| `src/routes/__root.tsx` | App shell — sidebar, command palette, providers, 404/error boundaries |

## Server functions (não são rotas URL)

Expostas via `createServerFn` em `src/lib/integrations.functions.ts`:

| Export | Método | Uso |
| --- | --- | --- |
| `$integrationsStatus` | GET | Diagnóstico admin de integrações |
| `$listConfluenceSpaces` | GET | Seletor de spaces Confluence |
| `$listJiraIssues` | POST | Busca de issues Jira no import |
| `$importCaseFromJira` | POST | Pipeline completo Jira → Gemini → draft |
| `$syncCaseToConfluence` | POST | Enviar status report ao Confluence |
| `$deleteCaseFromConfluence` | POST | Remover página Confluence de um case |

Detalhes de contrato: Fase 2 — `docs/*/contracts/server-functions.md`.

## Fonte de verdade da navegação

Itens principais da sidebar em `src/components/layout/AppSidebar.tsx`:

- **Principal:** Home, Projetos (`/cases`), AI Map, Impacto, Integrações (`/ferramentas`)
- **Adicionar:** Adicionar Projeto, Adicionar Áreas

## Documentação relacionada

| Documento | Caminho |
| --- | --- |
| Visão geral da arquitetura | [../architecture/overview.md](../architecture/overview.md) |
| Convenções TanStack | `src/routes/README.md` (repositório) |
| Desenvolvimento local | [../operations/local-development.md](../operations/local-development.md) |
