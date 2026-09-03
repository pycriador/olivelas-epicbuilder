---
title: "Visão geral do projeto"
status: "DRAFT"
owner: "aiops-app-model"
created: "2026-08-19"
updated: "2026-08-19"
version: "1.0"
---

# AIOPS App Model

> Language: [English (EN)](../en/project-overview.md) | Português (pt-BR)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

## Propósito

O AIOPS App Model é o portal interno da Loft para descobrir, aprender e construir com IA. Consolida cases de projetos de IA, integrações, métricas de impacto e fluxos administrativos conectados ao Jira e Confluence. Evidência: plano de produto `.lovable/plan/ai-portal-loft-2026-08-08.md`, branding em `src/components/layout/AppSidebar.tsx`.

## Problema

Times da Loft precisam de um lugar único para encontrar iniciativas de IA existentes, entender ferramentas e integrações em uso e dar vida a novas ideias — sem caçar páginas dispersas no Confluence e épicos no Jira.

## Escopo

| In scope | Notas | Classificação |
| --- | --- | --- |
| Páginas públicas do portal (Home, Projetos, AI Map, Impacto, Integrações) | Navegação na sidebar em `AppSidebar.tsx` | Confirmed |
| Detalhe de projetos (cases) | `src/routes/cases.$id.tsx` | Confirmed |
| Busca global | `src/routes/busca.tsx`, `src/lib/search.ts` | Confirmed |
| Página do Assistente de IA | `src/routes/assistente.tsx` | Confirmed |
| Admin: adicionar projeto via Jira | `src/routes/admin.adicionar-case.tsx` | Confirmed |
| Admin: gerenciar áreas | `src/routes/admin.adicionar-areas.tsx` | Confirmed |
| Admin: diagnóstico de integrações | `src/routes/admin.integracoes.tsx` | Confirmed |
| Catálogo de conteúdo no cliente | Seed em `src/data/` + overrides em `localStorage` | Confirmed |
| Pipeline Jira → Gemini → rascunho de case | `src/lib/jira-case.server.ts` | Confirmed |
| Sync de status report no Confluence | `src/lib/confluence.server.ts` | Confirmed |
| Rotas proxy de mídia Jira | `/api/jira-attachment`, `/api/jira-avatar` | Confirmed |

## Non-Goals

| Non-goal | Justificativa | Classificação |
| --- | --- | --- |
| Autenticação / autorização de usuário final | Sem guards de auth observados nas rotas ou layout | Confirmed (não implementado) |
| Persistência remota em banco para conteúdo do portal | Conteúdo apenas em `localStorage` do navegador | Confirmed |
| Exposição pública na internet como produto B2C | Portal interno Loft | Inferred |
| Produto completo de AI Academy / Templates (plano original) | `/biblioteca` redireciona para Home; dados de academy podem existir no seed mas não estão na navegação principal | Confirmed / Inferred |

## Usuários / consumidores

| Usuário / consumidor | Necessidade | Classificação |
| --- | --- | --- |
| Colaboradores Loft | Descobrir projetos e integrações de IA | Inferred |
| AIOps / owners de projeto | Publicar e atualizar cases, sync Confluence | Inferred |
| Desenvolvedores do portal | Entender rotas, integrações e setup local | Confirmed |

## Arquitetura

Aplicação única TanStack Start: UI React com SSR, server functions para Atlassian/Gemini e armazenamento local de conteúdo no navegador.

- Contexto: [architecture/system-context.md](architecture/system-context.md)
- Visão geral: [architecture/overview.md](architecture/overview.md)

## Componentes

| Componente | Responsabilidade | Documentação |
| --- | --- | --- |
| UI do portal | Páginas, layout, busca, command palette | [application/routes.md](application/routes.md) |
| Content store | Merge de seed + snapshot `localStorage` | Fase 2 — `application/data-model.md` |
| Camada de integração | Clientes HTTP Jira, Confluence, Gemini | Fase 2 — `integrations/` |
| Fluxos admin | Import de cases, áreas, diagnósticos | [application/routes.md](application/routes.md) |

## Dependências

| Dependência | Tipo | Propósito | Classificação |
| --- | --- | --- | --- |
| TanStack Start / Router / Query | runtime | Framework e roteamento | Confirmed |
| Atlassian Cloud (Jira + Confluence) | externo | Import de cases e páginas de status | Confirmed |
| Google Gemini API | externo | Estruturar escopo Jira em rascunhos | Confirmed |
| `localStorage` do navegador | runtime | Persistir edições do catálogo por browser | Confirmed |
| Plataforma Lovable | operacional | Hosting e sync Git | Confirmed |

## Integrações

| Integração | Direção | Contrato | Documentação |
| --- | --- | --- | --- |
| Jira REST API | outbound | Server functions + rotas `/api/jira-*` | Fase 2 |
| Confluence REST API | outbound | Server functions; escrita limitada à pasta de status | Fase 2 |
| Gemini API | outbound | Apenas server-side via `GEMINI_API_KEY` | Fase 2 |

## Segurança

- Credenciais lidas de variáveis de ambiente (`.env.example`); nunca commitadas.
- Middleware CSRF protege server functions (`src/start.ts`).
- IAM de aplicação implementado (JWT + RBAC no schema `iam`) — ver [security/overview.md](security/overview.md). SSO corporativo Loft permanece **Unknown** / trabalho futuro.
- Detalhes: Fase 2 — `security/overview.md`

## Observabilidade

| Tipo de sinal | Status |
| --- | --- |
| Logging | Partial — `console.error`, reporting Lovable (`src/lib/lovable-error-reporting.ts`) |
| Métricas | Not Documented |
| Tracing | Not Documented |

## Operação

| Cenário | Runbook |
| --- | --- |
| Setup local | [operations/local-development.md](operations/local-development.md) |
| Falha de integrações | Runbook Fase 2 |

## Ambientes

| Ambiente | Propósito | Notas |
| --- | --- | --- |
| Local (`npm run dev`) | Desenvolvimento | Requer `.env` para integrações |
| Preview publicado Lovable | Preview hospedado | Credenciais como secrets de runtime | Inferred |
| URL / owner de produção | Unknown | Preencher na Fase 2 (`operations/service-profile.md`) |

## Limitações conhecidas

| Limitação | Impacto | Classificação |
| --- | --- | --- |
| Conteúdo por browser (`localStorage`) | Catálogo não compartilhado entre usuários/dispositivos | Confirmed |
| Sem autenticação | Rotas admin acessíveis por URL | Confirmed |
| `VITE_API_URL` em `.env.example` | Incerto se backend FastAPI separado está em uso | Unknown |
| Plano original descrevia dados 100% mockados | Código evoluiu com integrações reais Jira/Confluence/Gemini | Confirmed |

## Documentação relacionada

| Documento | Caminho |
| --- | --- |
| Contexto do sistema | [architecture/system-context.md](architecture/system-context.md) |
| Visão geral da arquitetura | [architecture/overview.md](architecture/overview.md) |
| Rotas | [application/routes.md](application/routes.md) |
| Desenvolvimento local | [operations/local-development.md](operations/local-development.md) |
| Contexto para IA | [ai-context.md](ai-context.md) |
