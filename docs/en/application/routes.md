---
title: "Routes"
status: "DRAFT"
owner: "aiops-app-model"
created: "2026-08-19"
updated: "2026-08-19"
version: "1.0"
---

# Routes

> Language: EN | [Português (pt-BR)](../pt-BR/application/routes.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

TanStack Router file-based routing. Convention reference: `src/routes/README.md`. Generated tree: `src/routeTree.gen.ts` (do not edit manually).

## Portal routes (sidebar)

| URL | File | Purpose | Auth |
| --- | --- | --- | --- |
| `/` | `src/routes/index.tsx` | Home — highlights, shortcuts, portal entry | None |
| `/cases` | `src/routes/cases.index.tsx` | Project (case) listing with filters | None |
| `/cases/:id` | `src/routes/cases.$id.tsx` | Project detail — problem, solution, metrics, related content | None |
| `/mapa` | `src/routes/mapa.tsx` | AI Map — explore projects by area | None |
| `/impacto` | `src/routes/impacto.tsx` | Impact metrics and charts | None |
| `/ferramentas` | `src/routes/ferramentas.index.tsx` | Integrations catalog | None |
| `/ferramentas/:id` | `src/routes/ferramentas.$id.tsx` | Integration detail | None |

## Secondary portal routes

| URL | File | Purpose | Auth |
| --- | --- | --- | --- |
| `/assistente` | `src/routes/assistente.tsx` | Internal AI assistant chat UI | None |
| `/busca` | `src/routes/busca.tsx` | Global search results | None |
| `/biblioteca` | `src/routes/biblioteca.tsx` | Redirects to `/` (legacy route) | None |

## Admin routes (sidebar “Adicionar”)

| URL | File | Purpose | Auth |
| --- | --- | --- | --- |
| `/admin/adicionar-case` | `src/routes/admin.adicionar-case.tsx` | Import/create project case (Jira pipeline) | None |
| `/admin/adicionar-areas` | `src/routes/admin.adicionar-areas.tsx` | Manage area labels for the map | None |
| `/admin/integracoes` | `src/routes/admin.integracoes.tsx` | Integration health diagnostics | None |

> **Security note:** Admin routes have no authentication guard in the current codebase (Confirmed).

## API routes (server handlers)

| URL | File | Method | Purpose |
| --- | --- | --- | --- |
| `/api/jira-attachment` | `src/routes/api/jira-attachment.ts` | GET | Proxy Jira attachment content (`?id=` numeric) |
| `/api/jira-avatar` | `src/routes/api/jira-avatar.ts` | GET | Proxy Jira user avatar |

Both require configured Atlassian credentials on the server.

## Layout

| File | Role |
| --- | --- |
| `src/routes/__root.tsx` | App shell — sidebar, command palette, providers, 404/error boundaries |

## Server functions (not URL routes)

Exposed via TanStack Start `createServerFn` in `src/lib/integrations.functions.ts`:

| Export | Method | Used for |
| --- | --- | --- |
| `$integrationsStatus` | GET | Admin integration diagnostics |
| `$listConfluenceSpaces` | GET | Confluence space picker |
| `$listJiraIssues` | POST | Jira issue search during import |
| `$importCaseFromJira` | POST | Full Jira → Gemini → case draft |
| `$syncCaseToConfluence` | POST | Push status report to Confluence |
| `$deleteCaseFromConfluence` | POST | Remove Confluence page for a case |

Contract details: Phase 2 — `docs/*/contracts/server-functions.md`.

## Navigation source of truth

Primary sidebar items are defined in `src/components/layout/AppSidebar.tsx`:

- **Principal:** Home, Projetos (`/cases`), AI Map, Impacto, Integrações (`/ferramentas`)
- **Adicionar:** Adicionar Projeto, Adicionar Áreas

## Related Documentation

| Document | Path |
| --- | --- |
| Architecture overview | [../architecture/overview.md](../architecture/overview.md) |
| TanStack routing conventions | `src/routes/README.md` (repository) |
| Local development | [../operations/local-development.md](../operations/local-development.md) |
