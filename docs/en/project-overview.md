---
title: "Project Overview"
status: "DRAFT"
owner: "aiops-app-model"
created: "2026-08-19"
updated: "2026-08-19"
version: "1.0"
---

# AIOps App Model

> Language: EN | [Português (pt-BR)](../pt-BR/project-overview.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

## Purpose

AIOps App Model is Loft's internal portal for discovering, learning about, and building with AI. It consolidates AI project cases, integrations, impact metrics, and administrative workflows that connect to Jira and Confluence. Evidence: product plan `.lovable/plan/ai-portal-loft-2026-08-08.md`, branding in `src/components/layout/AppSidebar.tsx`.

## Problem

Loft teams need a single place to find what AI initiatives already exist, understand tools and integrations in use, and onboard new ideas — without hunting across scattered Confluence pages and Jira epics.

## Scope

| In scope | Notes | Classification |
| --- | --- | --- |
| Public portal pages (Home, Projects, AI Map, Impact, Integrations) | Sidebar navigation in `AppSidebar.tsx` | Confirmed |
| Project (case) detail views | `src/routes/cases.$id.tsx` | Confirmed |
| Global search | `src/routes/busca.tsx`, `src/lib/search.ts` | Confirmed |
| AI Assistant page | `src/routes/assistente.tsx` | Confirmed |
| Admin: add project from Jira | `src/routes/admin.adicionar-case.tsx` | Confirmed |
| Admin: manage areas | `src/routes/admin.adicionar-areas.tsx` | Confirmed |
| Admin: integration diagnostics | `src/routes/admin.integracoes.tsx` | Confirmed |
| Client-side content catalog | Seed in `src/data/` + overrides in `localStorage` | Confirmed |
| Jira → Gemini → case draft pipeline | `src/lib/jira-case.server.ts` | Confirmed |
| Confluence status report sync | `src/lib/confluence.server.ts` | Confirmed |
| Jira media proxy routes | `/api/jira-attachment`, `/api/jira-avatar` | Confirmed |

## Non-Goals

| Non-goal | Rationale | Classification |
| --- | --- | --- |
| End-user authentication / authorization | No auth guards observed in routes or root layout | Confirmed (not implemented) |
| Remote database persistence for portal content | Content stored in browser `localStorage` only | Confirmed |
| Public internet exposure as a customer-facing product | Internal Loft portal | Inferred |
| Full AI Academy / Templates product (original plan) | Routes like `/biblioteca` redirect to Home; academy data may exist in seed files but is not primary navigation today | Confirmed / Inferred |

## Users / Consumers

| User / consumer | Need | Classification |
| --- | --- | --- |
| Loft collaborators | Discover AI projects and integrations | Inferred |
| AIOps / project owners | Publish and update project cases, sync Confluence | Inferred |
| Developers maintaining the portal | Understand routes, integrations, and local setup | Confirmed |

## Architecture

Single TanStack Start application: React UI with SSR, server functions for Atlassian/Gemini calls, and browser-local content storage.

- Context: [architecture/system-context.md](architecture/system-context.md)
- Overview: [architecture/overview.md](architecture/overview.md)

## Components

| Component | Responsibility | Documentation |
| --- | --- | --- |
| Portal UI | Pages, layout, search, command palette | [application/routes.md](application/routes.md) |
| Content store | Merge seed data with `localStorage` snapshots | Phase 2 — `application/data-model.md` |
| Integration layer | Jira, Confluence, Gemini HTTP clients | Phase 2 — `integrations/` |
| Admin workflows | Import cases, manage areas, diagnostics | [application/routes.md](application/routes.md) |

## Dependencies

| Dependency | Type | Purpose | Classification |
| --- | --- | --- | --- |
| TanStack Start / Router / Query | runtime | App framework and routing | Confirmed |
| Atlassian Cloud (Jira + Confluence) | external | Case import and status pages | Confirmed |
| Google Gemini API | external | Structure Jira scope into case drafts | Confirmed |
| Browser `localStorage` | runtime | Persist edited portal content per browser | Confirmed |
| Lovable platform | operational | Hosting and Git sync | Confirmed |

## Integrations

| Integration | Direction | Contract | Documentation |
| --- | --- | --- | --- |
| Jira REST API | outbound | Server functions + `/api/jira-*` routes | Phase 2 |
| Confluence REST API | outbound | Server functions; writes scoped to status folder | Phase 2 |
| Gemini API | outbound | Server-side only via `GEMINI_API_KEY` | Phase 2 |

## Security

- Credentials read from environment variables (`.env.example`); never committed.
- CSRF middleware protects server functions (`src/start.ts`).
- Application IAM is implemented (JWT + RBAC on schema `iam`) — see [security/overview.md](security/overview.md). Treat production IdP/SSO as **Unknown** / future work.
- Details: Phase 2 — `security/overview.md`

## Observability

| Signal type | Status |
| --- | --- |
| Logging | Partial — `console.error`, Lovable error reporting (`src/lib/lovable-error-reporting.ts`) |
| Metrics | Not Documented |
| Tracing | Not Documented |

## Operations

| Scenario | Runbook |
| --- | --- |
| Local setup | [operations/local-development.md](operations/local-development.md) |
| Integration failures | Phase 2 runbook |

## Environments

| Environment | Purpose | Notes |
| --- | --- | --- |
| Local (`npm run dev`) | Development | Requires `.env` for integrations |
| Lovable / published preview | Hosted preview | Credentials as runtime secrets | Inferred |
| Production URL / owner | Unknown | Fill in Phase 2 `operations/service-profile.md` |

## Known Limitations

| Limitation | Impact | Classification |
| --- | --- | --- |
| Content is per-browser (`localStorage`) | No shared catalog across users/devices | Confirmed |
| No authentication | Admin routes are URL-accessible | Confirmed |
| `VITE_API_URL` in `.env.example` | Unclear if a separate FastAPI backend is used | Unknown |
| Original plan described fully mocked data | Codebase now includes real Jira/Confluence/Gemini integrations | Confirmed |

## Related Documentation

| Document | Path |
| --- | --- |
| System context | [architecture/system-context.md](architecture/system-context.md) |
| Architecture overview | [architecture/overview.md](architecture/overview.md) |
| Routes | [application/routes.md](application/routes.md) |
| Local development | [operations/local-development.md](operations/local-development.md) |
| AI context | [ai-context.md](ai-context.md) |
