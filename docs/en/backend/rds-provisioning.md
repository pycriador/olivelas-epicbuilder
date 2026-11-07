---
title: "RDS provisioning"
status: "DRAFT"
owner: "olivelas"
created: "2026-08-19"
updated: "2026-11-07"
version: "1.0"
---

# RDS provisioning — Olivelas App Model

> Language: EN | [Português (pt-BR)](../../pt-BR/backend/rds-provisioning.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

Guide to provision a dedicated PostgreSQL database, application user, and schema on the shared Olivelas RDS instance. Structured for later inclusion in `loft-br/aiops-documentation`.

## Overview

| Artifact | Value | Classification |
| --- | --- | --- |
| RDS host | From infra (`DB_HOST`) | Confirmed |
| Admin role | `postgres` (bootstrap only) | Confirmed |
| Application database | `aiops_app_model` | Confirmed |
| Application role | `aiops_app_model_app` | Confirmed |
| Application schema | `portal` | Confirmed |

**Principle:** admin credentials bootstrap infrastructure; the API runtime uses a least-privilege app role stored in `backend/.env` (never committed).

## Credential model

| File | Purpose | Committed? |
| --- | --- | --- |
| Repository root `.env` | RDS **admin** credentials (`DB_HOST`, `DB_USER=postgres`, …) | No |
| `backend/.env` | **Application** credentials (`aiops_app_model_app`, `DATABASE_URL`) | No |
| `backend/.env.example` | Variable names only | Yes |

## Step 1 — Admin credentials

Place admin credentials in the repository root `.env` (used only for provisioning and migrations):

```env
DB_HOST=your-rds-host
DB_PORT=5432
DB_NAME=aiops
DB_USER=postgres
DB_PASSWORD=***
```

## Step 2 — Provision database, user, and schema

```sh
cd backend
set -a && source ../.env && set +a
uv run python scripts/provision_rds.py
```

Script: `backend/scripts/provision_rds.py`

Actions performed:

1. `CREATE DATABASE aiops_app_model` (if missing)
2. `CREATE ROLE aiops_app_model_app` with generated password (if missing)
3. `CREATE SCHEMA portal`
4. Grants: `CONNECT` on database, `USAGE/CREATE` on schema, default privileges on future tables
5. Writes `backend/.env` with app credentials (`chmod 600`)

Options:

| Flag | Default | Description |
| --- | --- | --- |
| `--database` | `aiops_app_model` | Database name |
| `--app-user` | `aiops_app_model_app` | Application role |
| `--schema` | `portal` | Application schema |
| `--no-write-env` | off | Print password instead of writing `backend/.env` |

## Step 3 — Run migrations (admin)

Migrations run with **admin** credentials; runtime uses the app role.

```sh
uv run python scripts/run_migrations.py
```

Script sets `MIGRATION_DATABASE_URL` from root `.env` targeting database `aiops_app_model`.

Alembic revision: `backend/alembic/versions/001_initial_portal_schema.py`

## Step 4 — Grant privileges on migrated tables

```sh
uv run python scripts/grant_app_privileges.py
```

Grants `SELECT/INSERT/UPDATE/DELETE` on all tables in schema `portal` to `aiops_app_model_app`.

## Step 5 — Verify

```sh
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
curl -s http://localhost:8000/api/health/db
curl -s http://localhost:8000/api/v1/portal/snapshot
```

Expected DB health:

```json
{"status":"ok","database":"connected"}
```

## Troubleshooting

| Error | Cause | Action |
| --- | --- | --- |
| `permission denied for database` / `CREATE SCHEMA "iam"` | Migrations run as app role | Use `uv run python scripts/run_migrations.py` (admin from root `.env`), then `grant_app_privileges.py` |
| `must be able to SET ROLE` | RDS admin lacks superuser | Use schema grants (current script) instead of `AUTHORIZATION` |
| `permission denied for schema portal` | App role missing grants | Re-run `grant_app_privileges.py` |
| `ModuleNotFoundError: psycopg` | Migration driver missing | `uv sync --group dev` |
| `503` on `/api/health/db` | Wrong `backend/.env` or network | Verify app credentials and security groups |

## Security notes

- Rotate app password by re-running `provision_rds.py` (updates role password).
- Never commit root `.env` or `backend/.env`.
- In Kubernetes, map secrets via Vault / runtime secrets — not Git.

## Related

- [rds-first-steps.md](rds-first-steps.md)
- [schema-and-api.md](schema-and-api.md)
- [AIOps backend stack (standard)](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/aiops-apps/backend-stack.md)
