---
title: "AI Context"
status: "DRAFT"
owner: "aiops-app-model"
updated: "2026-08-19"
---

# AI Context

> Language: EN | [Português (pt-BR)](../pt-BR/ai-context.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

**Primary AI entry point** for the AIOps App Model repository. Load linked documents progressively — do not assume undocumented behavior.

## What this system is

AIOps App Model is Loft's internal AI portal: discover AI projects (cases), explore integrations, view impact metrics, and administer content via Jira/Confluence-assisted workflows. Evidence: `src/components/layout/AppSidebar.tsx`, `.lovable/plan/ai-portal-loft-2026-08-08.md`.

## Stack (Confirmed)

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start (`@tanstack/react-start`) |
| UI | React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Radix) |
| Routing | TanStack Router — file-based routes in `src/routes/` |
| Build | Vite 8, Nitro (Lovable deploy target) |
| Client state | React hooks + `localStorage` (`src/lib/content-store.ts`) |
| Server-side | TanStack Start server functions (`createServerFn`) and API route handlers |

## Commands

```sh
npm i
npm run dev      # local development
npm run build    # production build
npm run lint     # ESLint
npm run format   # Prettier
```

## Documentation map (Day 0)

| Question | Document |
| --- | --- |
| Purpose and scope | [project-overview.md](project-overview.md) |
| External systems | [architecture/system-context.md](architecture/system-context.md) |
| Internal structure | [architecture/overview.md](architecture/overview.md) |
| URL → page map | [application/routes.md](application/routes.md) |
| Local setup | [operations/local-development.md](operations/local-development.md) |
| Loft infra publish | [operations/loft-infra-publish.md](operations/loft-infra-publish.md) |

## Key source locations

| Area | Path |
| --- | --- |
| Routes | `src/routes/` |
| Static seed data | `src/data/` |
| Content persistence | `src/lib/content-store.ts` |
| Jira / Confluence / Gemini | `src/lib/integrations.server.ts`, `*.server.ts` |
| Server functions | `src/lib/integrations.functions.ts` |
| SSR error wrapper | `src/server.ts`, `src/start.ts` |
| Environment variables | `.env.example` |

## Boundaries for AI agents

**Always**

- Classify claims as Confirmed / Inferred / Unknown / Proposed ([evidence model](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/evidence-model.md)).
- Keep code artifacts in English; user-facing UI copy in Brazilian Portuguese.
- Never put secrets, API tokens, or PII in documentation or commits.

**Ask first**

- Changing authentication or authorization (implemented locally; ask before switching to corporate SSO or changing permission model).
- Promoting documentation status to `ACCEPTED`.
- Breaking server function contracts or Confluence write scope.

**Never**

- Invent SLOs, owners, on-call rotations, or production URLs without evidence.
- Assume a separate FastAPI backend is active — `VITE_API_URL` exists in `.env.example` but is **Unknown** whether it is used in this deployment.

## Integrations (summary)

| System | Role | Config |
| --- | --- | --- |
| Jira | Import project/case data | `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` |
| Confluence | Sync status reports to a scoped folder | `CONFLUENCE_STATUS_FOLDER_ID` + same Atlassian credentials |
| Google Gemini | Organize Jira scope into case drafts | `GEMINI_API_KEY`, `GEMINI_MODEL` |

Details: Phase 2 docs under `docs/*/integrations/` (not yet written).

## Related documents

- [project-overview.md](project-overview.md)
- [manifest.yaml](manifest.yaml)
- [Documentation standard](https://github.com/loft-br/aiops-documentation)
