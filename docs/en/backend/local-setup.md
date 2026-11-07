---
title: "Backend local setup"
status: "DRAFT"
owner: "olivelas"
created: "2026-08-19"
updated: "2026-11-07"
version: "1.0"
---

# Backend local setup

> Language: EN | [Português (pt-BR)](../../pt-BR/backend/local-setup.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

How to create the Python virtual environment, install dependencies, and run the FastAPI API locally before connecting to RDS.

## Goal

| Item | Target |
| --- | --- |
| Virtual env | `backend/.venv/` (gitignored) |
| Dependencies | Locked in `uv.lock`; exported to `requirements.txt` |
| Run API | `uvicorn` on `http://localhost:8000` |
| Frontend | Set `VITE_API_URL=http://localhost:8000` in repository root `.env` |

## Prerequisites

| Requirement | Version / notes |
| --- | --- |
| Python | 3.12+ (**Confirmed** — `backend/pyproject.toml`) |
| Package manager | [uv](https://docs.astral.sh/uv/) recommended; `pip` + `venv` also documented |
| Git | Clone `https://github.com/pycriador/olivelas-epicbuilder` |

Install uv (macOS / Linux):

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Project layout (backend)

| Path | Purpose |
| --- | --- |
| `backend/pyproject.toml` | Source of truth for dependencies |
| `backend/uv.lock` | Locked versions (uv) |
| `backend/requirements.txt` | Production deps export (pip-compatible) |
| `backend/requirements-dev.txt` | Production + dev deps (tests, ruff, psycopg) |
| `backend/.venv/` | Local virtual environment (**never commit**) |
| `backend/.env` | Application runtime credentials (**never commit**) |
| `backend/.env.example` | Variable names only |

## Option A — uv (recommended)

uv creates and manages `backend/.venv` automatically.

```sh
cd backend
uv sync --group dev
```

What this does:

1. Downloads Python 3.12 if needed
2. Creates `backend/.venv/`
3. Installs runtime + dev dependencies from `uv.lock`

Verify:

```sh
uv run python --version   # Python 3.12.x
uv run pytest             # 4 tests expected after RDS setup
```

Run the API:

```sh
cp .env.example .env
# Fill DATABASE_URL / DB_* after RDS provisioning (see rds-provisioning.md)

uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open:

- Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/api/health/db`

## Option B — venv + pip

Use this when uv is not available. Requires Python 3.12 installed on the system.

```sh
cd backend
python3.12 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
```

Verify:

```sh
python --version
pytest
```

Run the API (with venv active):

```sh
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment files

| File | Scope | Used by |
| --- | --- | --- |
| Repository root `.env` | Admin RDS credentials + frontend (`VITE_API_URL`, Jira, Gemini) | `scripts/provision_rds.py`, Vite |
| `backend/.env` | Application role (`aiops_app_model_app`) | FastAPI runtime |

Copy templates:

```sh
# Repository root (from monorepo root)
cp .env.example .env

# Backend runtime
cd backend && cp .env.example .env
```

Never commit `.env` files. See [secure handling](../../../AGENTS.md) and `.gitignore`.

## Regenerate requirements.txt

When `pyproject.toml` or `uv.lock` changes, refresh the pip exports:

```sh
cd backend
uv export --format requirements-txt --no-hashes --no-dev -o requirements.txt
uv export --format requirements-txt --no-hashes --group dev -o requirements-dev.txt
```

Commit `requirements.txt`, `requirements-dev.txt`, and `uv.lock` together.

## Connect frontend to local API

In repository root `.env`:

```env
VITE_API_URL=http://localhost:8000
```

Start both processes:

```sh
# Terminal 1
cd backend && uv run uvicorn app.main:app --reload --port 8000

# Terminal 2 (monorepo root)
npm run dev
```

If the backend is down, the portal shows an offline banner and may display cached session data.

## Next steps

| Step | Document |
| --- | --- |
| Provision RDS (first time) | [rds-provisioning.md](rds-provisioning.md) |
| Schema and REST API | [schema-and-api.md](schema-and-api.md) |
| Full local dev (frontend + backend) | [../operations/local-development.md](../operations/local-development.md) |

## Troubleshooting

| Symptom | Likely cause | Action |
| --- | --- | --- |
| `command not found: uv` | uv not installed | Run install script above or use Option B |
| `No module named 'app'` | Wrong working directory | Run commands from `backend/` |
| `database connection failed` | Missing or wrong `backend/.env` | Provision RDS and copy generated credentials |
| Frontend banner "Servidor indisponível" | API not running or wrong `VITE_API_URL` | Start uvicorn; check root `.env` |
| `pip` resolver conflicts | Stale requirements | Regenerate from `uv.lock` (see above) |

## Related

- [README.md](README.md) — backend doc index
- `backend/README.md` — quick reference in the repo
