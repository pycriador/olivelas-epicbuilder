#!/usr/bin/env python3
"""Grant table privileges to the application role after migrations."""

from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

import asyncpg
from dotenv import dotenv_values

from app.db.ssl import asyncpg_connect_kwargs


def _strip_password(value: str) -> str:
    value = value.strip()
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        return value[1:-1]
    return value


async def _grant_schema(conn: asyncpg.Connection, schema: str, app_user: str) -> None:
    await conn.execute(f'GRANT USAGE, CREATE ON SCHEMA "{schema}" TO {app_user}')
    await conn.execute(
        f'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "{schema}" TO {app_user}'
    )
    await conn.execute(
        f'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "{schema}" TO {app_user}'
    )
    await conn.execute(
        f'ALTER DEFAULT PRIVILEGES IN SCHEMA "{schema}" '
        f"GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO {app_user}"
    )
    await conn.execute(
        f'ALTER DEFAULT PRIVILEGES IN SCHEMA "{schema}" '
        f"GRANT USAGE, SELECT ON SEQUENCES TO {app_user}"
    )


async def main() -> None:
    backend_root = BACKEND_ROOT
    repo_root = backend_root.parent
    root_env = dotenv_values(repo_root / ".env")
    backend_env = dotenv_values(backend_root / ".env")

    database = backend_env.get("DB_NAME") or os.environ.get("APP_DATABASE_NAME", "aiops_app_model")
    schema = backend_env.get("DB_SCHEMA") or os.environ.get("DB_SCHEMA", "portal")
    app_user = backend_env.get("DB_USER") or os.environ.get("APP_DB_USER", "aiops_app_model_app")

    host = root_env.get("DB_HOST")
    port = int(root_env.get("DB_PORT") or 5432)
    admin_user = root_env.get("DB_USER")
    admin_password = _strip_password(str(root_env.get("DB_PASSWORD")))
    if not host or not admin_user or not root_env.get("DB_PASSWORD"):
        raise SystemExit("Missing DB_HOST, DB_USER, or DB_PASSWORD in repository root .env (admin)")

    conn = await asyncpg.connect(
        host=str(host),
        port=port,
        user=str(admin_user),
        password=admin_password,
        database=str(database),
        timeout=30,
        **asyncpg_connect_kwargs(),
    )
    try:
        await _grant_schema(conn, str(schema), str(app_user))

        iam_exists = await conn.fetchval(
            "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'iam'"
        )
        if iam_exists:
            await _grant_schema(conn, "iam", str(app_user))
            await conn.execute(
                f'ALTER ROLE {app_user} SET search_path TO "{schema}", iam, public'
            )
            print(f"granted privileges on schemas {schema}+iam to {app_user}")
        else:
            await conn.execute(
                f'ALTER ROLE {app_user} SET search_path TO "{schema}", public'
            )
            print(
                f"granted privileges on schema {schema} to {app_user} "
                "(schema iam not found yet — run migrations first)"
            )
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
