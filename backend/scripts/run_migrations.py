#!/usr/bin/env python3
"""Run Alembic migrations using RDS admin credentials from the repository root .env."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path
from urllib.parse import quote_plus

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from dotenv import dotenv_values

from app.db.ssl import psycopg_ssl_query


def _strip_password(value: str) -> str:
    value = value.strip()
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        return value[1:-1]
    return value


def main() -> None:
    backend_root = BACKEND_ROOT
    repo_root = backend_root.parent
    root_env = dotenv_values(repo_root / ".env")
    database = os.environ.get("APP_DATABASE_NAME", "aiops_app_model")

    host = root_env.get("DB_HOST") or os.environ.get("DB_HOST")
    port = root_env.get("DB_PORT") or os.environ.get("DB_PORT", "5432")
    user = root_env.get("DB_USER") or os.environ.get("DB_USER")
    password = root_env.get("DB_PASSWORD") or os.environ.get("DB_PASSWORD")
    if not all([host, user, password]):
        raise SystemExit("Missing DB_HOST, DB_USER, or DB_PASSWORD in repository root .env")

    migration_url = (
        f"postgresql+psycopg://{quote_plus(str(user))}:{quote_plus(_strip_password(str(password)))}"
        f"@{host}:{port}/{database}?{psycopg_ssl_query()}"
    )
    env = os.environ.copy()
    env["MIGRATION_DATABASE_URL"] = migration_url
    env["DB_SCHEMA"] = env.get("DB_SCHEMA", "portal")
    print("Running Alembic with admin credentials from repository root .env …")
    print("(Do not use `uv run alembic` with backend/.env app role — CREATE SCHEMA requires admin.)")
    subprocess.run(["uv", "run", "alembic", "upgrade", "head"], cwd=backend_root, env=env, check=True)
    print("Migrations OK. Next: uv run python scripts/grant_app_privileges.py")
    print("Then (IAM): uv run python scripts/seed_iam.py")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as exc:
        sys.exit(exc.returncode)
