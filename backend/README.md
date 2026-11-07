# Olivelas App Model API

FastAPI backend (Olivelas Family B) with PostgreSQL (RDS) persistence.

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (recommended) or `pip` + `venv`
- RDS admin credentials in repository root `.env` (for first-time provisioning)
- Network access to RDS

Full setup guide: [../docs/en/backend/local-setup.md](../docs/en/backend/local-setup.md) (pt-BR: [../docs/pt-BR/backend/local-setup.md](../docs/pt-BR/backend/local-setup.md))

**Olivelas backend creation guide (for aiops-documentation):** [../docs/en/aiops-apps/backend-creation-guide.md](../docs/en/aiops-apps/backend-creation-guide.md)

## Local environment (first time)

### Option A — uv (recommended)

Creates `backend/.venv/` and installs dependencies from `uv.lock`:

```sh
cd backend
uv sync --group dev
cp .env.example .env   # fill after RDS provisioning
```

### Option B — venv + pip

```sh
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
```

### Regenerate requirements.txt

When dependencies change in `pyproject.toml`:

```sh
uv export --format requirements-txt --no-hashes --no-dev -o requirements.txt
uv export --format requirements-txt --no-hashes --group dev -o requirements-dev.txt
```

## First-time RDS setup

```sh
cd backend
uv sync --group dev
set -a && source ../.env && set +a   # admin credentials
uv run python scripts/provision_rds.py
uv run python scripts/run_migrations.py
uv run python scripts/grant_app_privileges.py
```

Documentation: [../docs/en/backend/rds-provisioning.md](../docs/en/backend/rds-provisioning.md)

## Run API

```sh
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Uses `backend/.env` (application role).

## Health checks

| Path | Purpose |
| --- | --- |
| `GET /health` | Liveness |
| `GET /api/health` | Liveness (API prefix) |
| `GET /health/db` | RDS/PostgreSQL connectivity |
| `GET /api/health/db` | Same under API prefix |

## API (v1)

| Path | Purpose |
| --- | --- |
| `GET/PUT /api/v1/portal/snapshot` | Full portal content snapshot |
| `/api/v1/cases` | Case CRUD (meta save triggers gallery backfill) |
| `GET /api/v1/gallery/{id}` | Serve gallery media from PostgreSQL |
| `POST /api/v1/gallery/backfill/case/{case_id}` | Download missing Jira attachments into RDS |
| `/api/v1/areas` | Area management |
| `/api/v1/integrations` | Integration catalog |
| `/api/v1/hub` | Hub content |
| `/api/v1/diagnostics/integrations` | Jira / Confluence / Gemini diagnostics |
| `/api/v1/jira/import` | Import case from Jira (persists attachments) |
| `/api/jira-avatar` | Jira avatar proxy |
| `/api/jira-attachment` | Legacy Jira attachment proxy |
| `/api/v1/auth/*` | Login, logout, refresh, me, password flows |
| `/api/v1/iam/*` | Users, groups, roles, permissions, sessions, audit, invitations, shares |

Protected routes require JWT when `REQUIRE_AUTH=true` (default). Schema `iam` (migration `003_iam_schema`).

**Migrations must use the admin role** (root `.env`), not `backend/.env` app credentials:

```sh
uv run python scripts/run_migrations.py
uv run python scripts/grant_app_privileges.py
uv run python scripts/seed_iam.py
```

Do **not** run `uv run alembic upgrade head` with the app user — `CREATE SCHEMA iam` will fail with `permission denied for database`.

Jira attachment downloads follow Atlassian CDN redirects (`follow_redirects=True`). Gallery bytes live in `portal.gallery_media` (migration `002_gallery_media`).

Integration credentials live in the repository root `.env` (also read by `backend/app/config.py`).

TLS for local Netskope / internal CA: set `DB_SSL_INSECURE=true` and/or `HTTP_SSL_INSECURE=true` (dev only). See root `.env.example`.

Details: [../docs/en/backend/schema-and-api.md](../docs/en/backend/schema-and-api.md)

## Tests

```sh
uv run pytest
```

## Scripts

| Script | Purpose |
| --- | --- |
| `scripts/provision_rds.py` | Create DB, app user, schema |
| `scripts/run_migrations.py` | Alembic upgrade (admin) |
| `scripts/grant_app_privileges.py` | Grant table access to app role |
| `scripts/seed_iam.py` | Seed IAM permissions, Admin/Editors groups, bootstrap admin |
| `scripts/seed_portal.py` | Seed sample cases when database is empty |
