---
title: "Local Development"
status: "DRAFT"
owner: "olivelas"
created: "2026-08-19"
updated: "2026-11-07"
version: "1.0"
---

# Local Development

> Language: EN | [Português (pt-BR)](../pt-BR/operations/local-development.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

## Active development branch

Backend persistence and external integrations (Jira, Confluence, Gemini) are developed on branch **`v0.1`**. Do not merge to `main` until the milestone is validated. Check out with:

```sh
git checkout v0.1
```

## Prerequisites

| Requirement | Version / notes |
| --- | --- |
| Node.js | Compatible with Vite 8 / React 19 (LTS recommended) |
| npm | Bundled with Node |
| Python | 3.12+ (backend only) — see [backend local setup](../backend/local-setup.md) |
| Git | Clone `https://github.com/pycriador/olivelas-epicbuilder` |

## Quick start (frontend)

```sh
git clone https://github.com/pycriador/olivelas-epicbuilder.git
cd olivelas-epicbuilder
npm i
cp .env.example .env
# Edit .env: VITE_API_URL, Jira/Gemini if needed
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173` — **Inferred**, port may vary).

## Quick start (frontend + backend)

```sh
# Terminal 1 — backend (see ../backend/local-setup.md)
cd backend
uv sync --group dev
cp .env.example .env
uv run uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend (repository root)
cp .env.example .env   # set VITE_API_URL=http://localhost:8000
npm run dev
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite dev server with TanStack Start |
| `npm run build` | Production build (Nitro via Lovable config) |
| `npm run build:dev` | Development mode build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

Source: `package.json`.

## Environment variables

Copy `.env.example` to `.env`. **Never commit `.env`.**

| Variable | Required for | Description |
| --- | --- | --- |
| `VITE_API_URL` | Portal content | FastAPI base URL (default: `http://localhost:8000`) |
| `JIRA_BASE_URL` | Jira + Confluence | Atlassian site URL (e.g. `https://your-org.atlassian.net`) |
| `JIRA_EMAIL` | Jira + Confluence | Atlassian account email |
| `JIRA_API_TOKEN` | Jira + Confluence | API token from Atlassian account settings |
| `GEMINI_API_KEY` | Jira import pipeline | Google AI Studio API key |
| `GEMINI_MODEL` | Jira import pipeline | Model id (default: `gemini-3.1-flash-lite`) |
| `CONFLUENCE_STATUS_FOLDER_ID` | Confluence sync | Root folder id for status pages (default in example: `6105464844`) |
| `DB_*` (root `.env`) | RDS bootstrap only | Admin credentials for `backend/scripts/provision_rds.py` |

Backend runtime uses `backend/.env` (application role). See [backend local setup](../backend/local-setup.md).

Integration credentials (`JIRA_*`, `GEMINI_*`, `CONFLUENCE_STATUS_FOLDER_ID`) are read by the **FastAPI backend** (`backend/app/config.py`). The frontend only needs `VITE_API_URL`.

## Feature availability without credentials

| Feature | Works offline / without `.env`? |
| --- | --- |
| Browse portal pages | Partial — needs API or session cache; shows offline banner if API down |
| Edit portal content | No — persists to FastAPI snapshot API |
| Jira import, Confluence sync, integration status | No — requires Atlassian + Gemini credentials |
| Jira attachment/avatar proxy | No |

## Lovable workflow

This repository syncs with [Lovable](https://lovable.dev). Pushed commits appear in the Lovable editor. Avoid force-pushing or rewriting published Git history — see `AGENTS.md`.

For hosted preview/production, configure the same environment variables as **runtime secrets** in Lovable (not in Git).

## Troubleshooting

| Symptom | Likely cause | Action |
| --- | --- | --- |
| Offline banner on portal | Backend not running | Start uvicorn; check `VITE_API_URL` |
| Import fails with missing credentials | Empty `.env` | Fill Atlassian + Gemini variables |
| Confluence write fails | Wrong folder id or permissions | Verify `CONFLUENCE_STATUS_FOLDER_ID` and token scopes |
| Empty portal after fresh install | RDS not provisioned / no data | Run RDS provisioning; add content via admin |
| SSR 500 HTML error page | Server function throw | Check terminal logs; `src/lib/error-capture.ts` |

## Related Documentation

| Document | Path |
| --- | --- |
| Backend local setup | [../backend/local-setup.md](../backend/local-setup.md) |
| AI context | [../ai-context.md](../ai-context.md) |
| Routes | [../application/routes.md](../application/routes.md) |
| Project overview | [../project-overview.md](../project-overview.md) |
