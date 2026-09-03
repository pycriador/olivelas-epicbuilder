---
title: "RDS first steps"
status: "DRAFT"
owner: "aiops-app-model"
created: "2026-08-19"
updated: "2026-08-19"
version: "1.0"
---

# RDS first steps — AIOps App Model API

> Language: EN | [Português (pt-BR)](../../pt-BR/backend/rds-first-steps.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

First milestone for the AIOps App Model backend: connect FastAPI to PostgreSQL on AWS RDS and expose health probes.

This document is structured for later publication in `loft-br/aiops-documentation`.

## Goal

| Item | Target |
| --- | --- |
| Milestone | Verify RDS connectivity from the API |
| Code location | `backend/app/db/session.py`, `backend/app/routers/health.py` |
| Success signal | `GET /api/health/db` returns `200` with `"database": "connected"` |

## Prerequisites

| Requirement | Notes |
| --- | --- |
| Local Python env | [local-setup.md](local-setup.md) — `.venv`, `requirements.txt`, `uv sync` |
| Python 3.12+ | AIOps backend standard |
| uv | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| RDS PostgreSQL instance | Host, port, database, user, password from infra team |
| Network access | Security group / VPN allowing your IP or cluster → RDS |

## Configuration

Never commit credentials. Use environment variables only.

### Option A — single URL (recommended)

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST.rds.amazonaws.com:5432/DATABASE
```

Copy from `backend/.env.example` to `backend/.env`, or set the same variable in the repository root `.env`.

### Option B — discrete fields

```env
DB_HOST=HOST.rds.amazonaws.com
DB_PORT=5432
DB_NAME=aiops_app_model
DB_USER=app_user
DB_PASSWORD=***
```

The settings loader builds `postgresql+asyncpg://…` at runtime (`backend/app/config.py`).

## Local setup

```sh
cd backend
uv sync
cp .env.example .env
# fill DATABASE_URL
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend default API base: `VITE_API_URL=http://localhost:8000` (root `.env.example`).

## Verify connectivity

```sh
curl -s http://localhost:8000/api/health/db | jq .
# Expected: {"status":"ok","database":"connected"}
```

Failure returns `503` with a JSON detail payload — check security groups, credentials, and SSL requirements for your RDS instance.

## Architecture (current)

```mermaid
flowchart LR
  API[FastAPI app.main] --> Engine[SQLAlchemy async engine]
  Engine --> RDS[(PostgreSQL RDS)]
  Probe[GET /api/health/db] --> API
```

| Component | Responsibility |
| --- | --- |
| `app/config.py` | Load `DATABASE_URL` or DB_* from env |
| `app/db/session.py` | Engine, pool, `SELECT 1` probe |
| `app/routers/health.py` | Liveness and DB health routes |
| `app/main.py` | Lifespan: create/dispose engine |

## Out of scope (this milestone)

| Item | Status |
| --- | --- |
| Migrations (Alembic) | Not implemented |
| Domain models / tables | Not implemented |
| Auth | Not implemented |
| Vault / k8s secrets wiring | Document in infra phase |

## Next steps (planned)

1. Define initial schema (portal content off `localStorage`).
2. Add Alembic migrations.
3. Wire frontend reads/writes to the API.
4. Publish this doc to `aiops-documentation` under `docs/*/aiops-apps/` or a dedicated AIOps App Model section.

## Related

- [README.md](README.md)
- [../architecture/overview.md](../architecture/overview.md)
- [AIOps backend stack (standard)](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/aiops-apps/backend-stack.md)
