---
title: "Contexto para IA"
status: "DRAFT"
owner: "olivelas"
updated: "2026-11-07"
---

# Contexto para IA

> Language: [English (EN)](../en/ai-context.md) | Português (pt-BR)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

**Ponto de entrada principal para agentes de IA** no repositório Olivelas App Model. Carregue os documentos linkados de forma progressiva — não assuma comportamento não documentado.

## O que é este sistema

O Olivelas App Model é o portal interno de IA da Olivelas: descoberta de projetos (cases), integrações, métricas de impacto e fluxos administrativos com Jira e Confluence. Evidência: `src/components/layout/AppSidebar.tsx`, `.lovable/plan/ai-portal-loft-2026-08-08.md`.

## Stack (Confirmed)

| Camada | Tecnologia |
| --- | --- |
| Framework | TanStack Start (`@tanstack/react-start`) |
| UI | React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Radix) |
| Rotas | TanStack Router — file-based em `src/routes/` |
| Build | Vite 8, Nitro (target de deploy Lovable) |
| Estado no cliente | React hooks + `localStorage` (`src/lib/content-store.ts`) |
| Servidor | Server functions TanStack Start (`createServerFn`) e handlers de API |

## Comandos

```sh
npm i
npm run dev      # desenvolvimento local
npm run build    # build de produção
npm run lint     # ESLint
npm run format   # Prettier
```

## Mapa da documentação (Day 0)

| Pergunta | Documento |
| --- | --- |
| Propósito e escopo | [project-overview.md](project-overview.md) |
| Sistemas externos | [architecture/system-context.md](architecture/system-context.md) |
| Estrutura interna | [architecture/overview.md](architecture/overview.md) |
| URL → página | [application/routes.md](application/routes.md) |
| Setup local | [operations/local-development.md](operations/local-development.md) |
| Publicação na infra Olivelas | [operations/loft-infra-publish.md](operations/loft-infra-publish.md) |

## Locais-chave no código

| Área | Caminho |
| --- | --- |
| Rotas | `src/routes/` |
| Dados seed | `src/data/` |
| Persistência de conteúdo | `src/lib/content-store.ts` |
| Jira / Confluence / Gemini | `src/lib/integrations.server.ts`, `*.server.ts` |
| Server functions | `src/lib/integrations.functions.ts` |
| Wrapper SSR de erros | `src/server.ts`, `src/start.ts` |
| Variáveis de ambiente | `.env.example` |

## Limites para agentes de IA

**Sempre**

- Classificar afirmações como Confirmed / Inferred / Unknown / Proposed ([evidence model](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/evidence-model.md)).
- Manter artefatos de código em inglês; copy de UI em português brasileiro.
- Nunca incluir segredos, tokens ou PII em documentação ou commits.

**Perguntar antes**

- Alterar autenticação ou autorização (IAM local implementado; perguntar antes de migrar para SSO corporativo ou mudar o modelo de permissões).
- Promover status de documentação para `ACCEPTED`.
- Quebrar contratos de server functions ou escopo de escrita no Confluence.

**Nunca**

- Inventar SLOs, owners, plantões ou URLs de produção sem evidência.
- Assumir backend FastAPI ativo — `VITE_API_URL` existe em `.env.example`, mas o uso neste deploy é **Unknown**.

## Integrações (resumo)

| Sistema | Papel | Config |
| --- | --- | --- |
| Jira | Importar dados de projetos/cases | `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` |
| Confluence | Sincronizar status reports em pasta delimitada | `CONFLUENCE_STATUS_FOLDER_ID` + mesmas credenciais Atlassian |
| Google Gemini | Organizar escopo Jira em rascunho de case | `GEMINI_API_KEY`, `GEMINI_MODEL` |

Detalhes: Fase 2 em `docs/*/integrations/` (ainda não escrito).

## Documentos relacionados

- [project-overview.md](project-overview.md)
- [manifest.yaml](manifest.yaml)
- [Padrão de documentação](https://github.com/loft-br/aiops-documentation)
