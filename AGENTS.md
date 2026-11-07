# AGENTS.md

Engineering agent entry — **Olivelas App Model** (standard Olivelas application template). Start at `docs/en/ai-context.md` (pt-BR: `docs/pt-BR/ai-context.md`).

## What this repo is

Template for new Olivelas apps. Component / namespace / host names use the `aiops-app-model*` prefix as placeholders — rename them before production deploy. Never commit `.env` or `backend/.env`.

## Stack

- Framework: TanStack Start + TanStack Router (file routes in `src/routes/`)
- UI: React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- Backend: FastAPI under `backend/`
- Package manager: npm (front) · uv (API)
- Docs: Markdown under `docs/en/` and `docs/pt-BR/` (keep both in sync when both exist)
- Standard reference: https://github.com/loft-br/aiops-documentation

## Commands

- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`
- Docs index: `docs/README.md`

## Boundaries

- Always: classify claims (Confirmed / Inferred / Unknown / Proposed); no secrets or PII in docs; code in English, user-facing UI in Brazilian Portuguese
- Ask first: promoting doc status to `ACCEPTED`; auth changes; breaking server function contracts; Confluence write scope changes; enabling auto-deploy `push:` triggers on the template
- Never: invent owners, SLOs, or production URLs; commit database credentials; assume adopter infra already exists for `aiops-app-model` hosts

## Durable vs scaffold

Product specs and sample portal content are inputs — after forking into a real app, update as-is docs under `docs/` and replace seed data.

## Documentation trail (Day 0)

1. [docs/en/project-overview.md](docs/en/project-overview.md)
2. [docs/en/architecture/system-context.md](docs/en/architecture/system-context.md)
3. [docs/en/architecture/overview.md](docs/en/architecture/overview.md)
4. [docs/en/application/routes.md](docs/en/application/routes.md)
5. [docs/en/operations/local-development.md](docs/en/operations/local-development.md)
6. [docs/en/operations/loft-infra-publish.md](docs/en/operations/loft-infra-publish.md)
