---
id: REF-AIOPS-APPS-008
title: AIOps backend creation guide
type: Reference
status: DRAFT
owner: aiops
created: 2026-08-19
updated: 2026-08-19
authority: Verified
classification: Confirmed
tags:
  - aiops-apps
  - backend
  - guide
  - fastapi
  - rds
related:
  - aiops-apps/overview.md
  - aiops-apps/backend-stack.md
  - aiops-apps/security.md
  - loft-infra/checklist-novo-servico.md
---

# AIOps backend creation guide

> Language: EN | [Português (pt-BR)](../../pt-BR/aiops-apps/backend-creation-guide.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0
>
> Authority: Verified

**Purpose:** a practical guide for teams bootstrapping an AIOps backend — not a fixed standard. Use it as a checklist and starting point; adapt names, routes, and schema to your product.

**Reference implementation:** [loft-br/aiops-app-model](https://github.com/loft-br/aiops-app-model) (`backend/` folder, August 2026).

**Related Loft docs (authoritative for stack choice):**

- [AIOps apps overview](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/aiops-apps/overview.md)
- [Backend stack families](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/aiops-apps/backend-stack.md)
- [New service checklist](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/loft-infra/checklist-novo-servico.md) — deploy, not scaffold

---

## What this guide covers

| Topic | In scope | Out of scope |
| --- | --- | --- |
| Monorepo `backend/` layout | Yes | Kotlin/Spring services |
| FastAPI + PostgreSQL (Family B) | Yes | Flask bots (Family A) |
| Local `.venv`, `requirements.txt`, `uv` | Yes | Production Kubernetes manifests |
| RDS bootstrap (admin vs app role) | Yes | Terraform for RDS |
| Health probes, REST API shape | Yes | AuthN/Z product design |
| Frontend → API connection | Yes | Full Copan UI patterns |
| Tests and common errors | Yes | Datadog instrumentation details |

---

## Example stack (AIOps App Model)

This is **one validated example**, not the only allowed stack.

| Layer | Example choice | Notes |
| --- | --- | --- |
| Language | Python 3.12+ | Loft AIOps Family B |
| Framework | FastAPI + uvicorn | Async-first |
| Package manager | [uv](https://docs.astral.sh/uv/) | Also export `requirements.txt` for pip users |
| ORM | SQLAlchemy 2 async + asyncpg | Runtime driver |
| Migrations | Alembic | Admin connection via `psycopg` in scripts |
| Database | AWS RDS PostgreSQL | Dedicated DB + schema per app |
| Repo layout | `backend/` in monorepo | Next to TanStack Start frontend |
| Frontend API | `fetch` → `/api/v1/...` | `VITE_API_URL` env var |

---

## Suggested folder layout

```text
backend/
├── app/
│   ├── main.py              # FastAPI factory + CORS + routers
│   ├── config.py            # pydantic-settings (DATABASE_URL, CORS, …)
│   ├── db/
│   │   ├── base.py
│   │   └── session.py       # async engine + get_db_session
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic request/response
│   ├── routers/             # health, portal, cases, …
│   └── services/            # business logic (load/save snapshot)
├── alembic/
│   └── versions/
├── scripts/
│   ├── provision_rds.py     # CREATE DB, role, schema (admin)
│   ├── run_migrations.py    # alembic upgrade (admin)
│   └── grant_app_privileges.py
├── tests/
├── pyproject.toml           # source of truth (uv)
├── uv.lock
├── requirements.txt         # pip export (production)
├── requirements-dev.txt     # pip export (+ pytest, ruff)
├── .env.example
└── README.md
```

Example templates: [examples/](examples/README.md).

---

## Phase 1 — Local Python environment

### Option A — uv (recommended)

```sh
cd backend
uv sync --group dev
```

Creates `backend/.venv/` (gitignored) and installs locked deps from `uv.lock`.

### Option B — venv + pip

```sh
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

### Regenerate `requirements.txt`

When `pyproject.toml` changes:

```sh
cd backend
uv export --format requirements-txt --no-hashes --no-dev -o requirements.txt
uv export --format requirements-txt --no-hashes --group dev -o requirements-dev.txt
```

**Tip:** commit `pyproject.toml`, `uv.lock`, and both requirements files together.

---

## Phase 2 — Configuration and secrets

### Two `.env` files (recommended pattern)

| File | Role | Committed? |
| --- | --- | --- |
| Repository root `.env` | RDS **admin** + frontend (`VITE_API_URL`, Jira, …) | Never |
| `backend/.env` | **Application** role (`DATABASE_URL`, `CORS_ORIGINS`) | Never |
| `.env.example`, `backend/.env.example` | Variable names only | Yes |

Examples: [root.env.example](examples/root.env.example), [backend.env.example](examples/backend.env.example).

### CORS (common pitfall)

Include every dev port your frontend uses. Vite/Lovable may bind to **8080**, not 5173:

```env
CORS_ORIGINS=http://localhost:5173,http://localhost:8080,http://localhost:3000,http://127.0.0.1:8080
```

If CORS is wrong, the browser shows `Failed to fetch` and the UI may display an offline banner even when `curl` works.

---

## Phase 3 — RDS bootstrap

**Principle:** admin credentials provision infrastructure; the API runs with a least-privilege app role.

| Artifact | AIOps App Model example | Your app |
| --- | --- | --- |
| Database | `aiops_app_model` | `my_app_db` |
| App role | `aiops_app_model_app` | `my_app_user` |
| Schema | `portal` | `app` |

### Steps

```sh
# 1. Admin creds in repository root .env
cd backend
set -a && source ../.env && set +a

# 2. Provision DB, user, schema → writes backend/.env
uv run python scripts/provision_rds.py

# 3. Migrations (admin)
uv run python scripts/run_migrations.py

# 4. Grant table access to app role
uv run python scripts/grant_app_privileges.py
```

### Verify connectivity

```sh
uv run uvicorn app.main:app --reload --port 8000
curl -s http://localhost:8000/api/health/db
# {"status":"ok","database":"connected"}
```

Detailed RDS doc (adopter): [aiops-app-model docs — rds-provisioning](https://github.com/loft-br/aiops-app-model/blob/main/docs/en/backend/rds-provisioning.md).

---

## Phase 4 — API design (example)

### Health endpoints (k8s-friendly)

| Path | Purpose |
| --- | --- |
| `GET /health` | Liveness |
| `GET /api/health` | Liveness (API prefix) |
| `GET /health/db` | PostgreSQL connectivity |
| `GET /api/health/db` | Same under `/api` |

### Versioned REST

Prefix: `/api/v1/`

AIOps App Model exposes:

- `GET/PUT /api/v1/portal/snapshot` — bulk sync with frontend store
- CRUD under `/api/v1/cases`, `/areas`, `/integrations`, `/hub`

**Design note:** snapshot PUT is convenient for MVP; consider granular endpoints as traffic and conflict rules grow.

### JSONB documents

Nested frontend types map well to PostgreSQL **JSONB** columns (`payload`), keeping TypeScript shapes stable while SQL handles indexing later if needed.

---

## Phase 5 — Connect the frontend

1. Set in repository root `.env`:

   ```env
   VITE_API_URL=http://localhost:8000
   ```

2. Implement a thin client — example: [portal-api.ts.example](examples/portal-api.ts.example).

3. Replace browser-only persistence (`localStorage` seeds) with API load + debounced PUT.

4. Show an offline banner when `fetch` fails; allow session cache for first paint only.

5. Restart `npm run dev` after changing `VITE_API_*` variables.

```sh
# Terminal 1
cd backend && uv run uvicorn app.main:app --reload --port 8000

# Terminal 2
npm run dev
```

---

## Phase 6 — Testing

```sh
cd backend
uv run pytest
```

Example patterns (AIOps App Model):

- **Health:** real route, mocked DB check optional
- **Portal snapshot:** mock `load_portal_snapshot` service; use `httpx.AsyncClient` + `ASGITransport`
- **DB integration:** optional later with Testcontainers (not required for first milestone)

Minimum gate before opening PR: tests pass + `GET /api/health/db` returns 200 against dev RDS.

---

## Common errors and fixes

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `[Errno 48] Address already in use` | Old uvicorn on :8000 | `lsof -iTCP:8000 -sTCP:LISTEN` → `kill <pid>` |
| Frontend banner "cannot connect" but `curl` works | CORS origin mismatch (e.g. :8080) | Add origin to `CORS_ORIGINS`; restart API |
| `Failed to fetch` in browser | API down or wrong `VITE_API_URL` | Start uvicorn; restart Vite after `.env` change |
| `uv run` removes `.venv` | uv recreates env on sync | Expected with uv; use `uv sync` or activated venv |
| `CREATE ROLE ... PASSWORD $1` fails | asyncpg placeholder in DDL | Inline escaped password in provisioning script |
| `must be able to SET ROLE` | Schema owned by app user | Create schema as admin; GRANT to app role |
| Alembic + asyncpg driver errors | sync migrations prefer psycopg | `run_migrations.py` uses `postgresql+psycopg` admin URL |
| Empty portal after setup | Fresh DB, no seed | Expected — content comes from admin/import, not mocks |
| `command not found: python` | macOS default | Use `python3` or uv-managed Python |

---

## What to customize per app

| Copy as-is | Customize |
| --- | --- |
| Health route pattern | App name, database name, schema |
| Admin vs app credential split | Table names, domain routes |
| Alembic + grant scripts structure | Pydantic schemas, business rules |
| uv + ruff + pytest layout | Auth middleware when product requires it |
| CORS multi-port pattern | Snapshot vs granular API strategy |

---

## Promotion checklist (into aiops-documentation)

When opening a PR to [loft-br/aiops-documentation](https://github.com/loft-br/aiops-documentation):

1. Copy this guide to `docs/en/aiops-apps/backend-creation-guide.md` (+ pt-BR mirror).
2. Copy `docs/en/aiops-apps/examples/` templates.
3. Add row to `aiops-apps/README.md` document table (EN + pt-BR).
4. Register `REF-AIOPS-APPS-008` in both `manifest.yaml` files.
5. Link from `backend-stack.md` as the **how-to** companion.
6. Run `make docs-validate` in aiops-documentation.
7. Set status to `REVIEW` → `ACCEPTED` after squad approval.

Until promoted, the living draft stays in [aiops-app-model `docs/en/aiops-apps/`](../../en/aiops-apps/backend-creation-guide.md).

---

## Related documents

| Document | Location |
| --- | --- |
| Example files | [examples/README.md](examples/README.md) |
| AIOps App Model backend README | [github.com/loft-br/aiops-app-model/backend/README.md](https://github.com/loft-br/aiops-app-model/blob/main/backend/README.md) |
| Local setup (adopter) | [aiops-app-model — local-setup](https://github.com/loft-br/aiops-app-model/blob/main/docs/en/backend/local-setup.md) |
| RDS provisioning (adopter) | [aiops-app-model — rds-provisioning](https://github.com/loft-br/aiops-app-model/blob/main/docs/en/backend/rds-provisioning.md) |
| Schema and API (adopter) | [aiops-app-model — schema-and-api](https://github.com/loft-br/aiops-app-model/blob/main/docs/en/backend/schema-and-api.md) |
