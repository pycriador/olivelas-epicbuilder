# AIOps App Model

**Standard application template** for Loft AIOps teams. Clone or copy this repository when starting a new AIOps app that follows the shared stack (TanStack Start frontend + FastAPI backend + RDS PostgreSQL) and Loft publish conventions (GitHub Actions → ECR → k8s-apps / ArgoCD → Kong).

> Seeded from the AIOPS Central codebase (GitHub `main`, no runtime credentials). Rename components, hosts, and Vault paths before the first production deploy.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | TanStack Start / Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | FastAPI (Python 3.12), SQLAlchemy async, Alembic, uv |
| Data | AWS RDS PostgreSQL (`portal` schema) |
| Integrations | Jira, Confluence, Google Gemini (optional) |
| Deploy | `loft-br/actions/deploy@deploy/v1.8.0`, `ubuntu-arm`, `linux/arm64`, product `ai-ops` |

As-is docs: [`docs/README.md`](docs/README.md) · overview: [`docs/en/project-overview.md`](docs/en/project-overview.md)

## Template identity (rename before production)

| Concept | Template value | Adopter action |
| --- | --- | --- |
| GitHub repo | `loft-br/aiops-app-model` | New repo name |
| K8s namespace | `aiops-app-model` | Choose app namespace |
| Front component | `aiops-app-model-front` | Rename in workflows + Helm values |
| API component | `aiops-app-model-api` | Rename in workflows + Helm values |
| Published hosts | `deploy/published-hosts.env` | Set corp / Cross URLs |
| Vault KV paths | `cross/ai-ops/aiops-app-model-*` | Create paths + secrets |
| App DB role | `aiops_app_model_app` | Provision on shared RDS |

Deploy workflows default to **`workflow_dispatch` only** so pushing the template does not deploy. Uncomment the `push:` triggers when the adopter is ready.

## What this model includes

- **API as source of truth** — portal snapshot in PostgreSQL (`GET/PUT /api/v1/portal/snapshot`)
- **Jira case import** — Jira → Gemini → draft in admin
- **Gallery media in the database** — attachments in `portal.gallery_media`
- **Confluence sync** — case status pages
- **Configurable TLS** — internal CA / Netskope support for local dev
- **IAM** — local auth (Argon2id + JWT + refresh cookies), RBAC, admin UI at `/admin/iam/*`
- **Loft infra samples** — Dockerfiles, Helm values, Kong route/service drafts, DNS Terragrunt drafts, Vault push helper

## Prerequisites

- Node.js 20+ and npm
- Python 3.12+ and [uv](https://docs.astral.sh/uv/) (recommended)
- Network access to RDS and Atlassian/Gemini credentials (for integrations)

## Quick start (local)

### 1. Clone and configure env

```sh
git clone https://github.com/loft-br/aiops-app-model.git
cd aiops-app-model

cp .env.example .env
# Fill VITE_API_URL, DB_* (RDS admin), JIRA_*, GEMINI_*
```

| File | Purpose |
| --- | --- |
| Root `.env` | RDS admin + frontend (`VITE_API_URL`) + Jira/Gemini credentials |
| `backend/.env` | Application role (`aiops_app_model_app`) — produced by provisioning |

**Never commit** `.env` or `backend/.env`. This repository ships only `*.env.example` files (empty secret values).

### 2. Backend (RDS + API)

Full guides: [`docs/en/backend/local-setup.md`](docs/en/backend/local-setup.md) · [`backend/README.md`](backend/README.md)

```sh
cd backend
uv sync --group dev

# First time (admin credentials in root .env):
set -a && source ../.env && set +a
uv run python scripts/provision_rds.py
uv run python scripts/run_migrations.py
uv run python scripts/grant_app_privileges.py

# Runtime — configure backend/.env (app role)
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health: [http://localhost:8000/health](http://localhost:8000/health) · DB: [http://localhost:8000/health/db](http://localhost:8000/health/db)

Netskope / internal CA in local dev: set `DB_SSL_INSECURE=true` in the root `.env` (and optionally `backend/.env`). Local only.

### 3. Frontend

```sh
# repository root
npm i
# ensure VITE_API_URL=http://localhost:8000 in .env
npm run dev
```

Vite defaults to **http://localhost:8080**. Backend CORS includes that origin.

## API (main routes)

| Method / path | Purpose |
| --- | --- |
| `GET/PUT /api/v1/portal/snapshot` | Full portal snapshot |
| `/api/v1/cases` | Case CRUD |
| `GET /api/v1/gallery/{id}` | Gallery media (bytes in Postgres) |
| `POST /api/v1/gallery/backfill/case/{case_id}` | Re-download attachments for a case |
| `POST /api/v1/jira/import` | Import case from Jira |
| `GET /api/v1/diagnostics/integrations` | Jira / Confluence / Gemini status |
| `/api/jira-avatar`, `/api/jira-attachment` | Atlassian media proxies |

Details: [`docs/en/backend/schema-and-api.md`](docs/en/backend/schema-and-api.md)

## Publish on Loft infra

1. Fill `deploy/published-hosts.env` with the app's corp / Cross hosts.
2. Mirror `deploy/k8s/` into `loft-br/k8s-apps` under the chosen namespace.
3. Create Vault KV paths and push secrets via `scripts/vault/push_secrets.py` (dry-run first).
4. Wire Kong + DNS from the drafts under `deploy/kong/` and `deploy/dns/`.
5. Enable `push:` triggers in `.github/workflows/` when ready to auto-deploy.

Runbook: [`docs/en/operations/loft-infra-publish.md`](docs/en/operations/loft-infra-publish.md)  
Checklist: [aiops-documentation — novo serviço](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/loft-infra/checklist-novo-servico.md)

## License / ownership

Internal Loft AIOps template. Product content in `src/data/` is sample seed data — replace for each new app.
