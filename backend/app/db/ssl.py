"""PostgreSQL TLS helpers for asyncpg (runtime) and psycopg (migrations)."""

from __future__ import annotations

import os
import ssl
from pathlib import Path
from urllib.parse import quote_plus

from app.config import Settings, get_settings


def _settings() -> Settings:
    return get_settings()


def db_ssl_mode() -> str:
    mode = _settings().db_sslmode.strip().lower()
    if mode:
        return mode
    return (os.environ.get("DB_SSLMODE") or os.environ.get("DB_SSL_MODE") or "require").strip().lower()


def db_ssl_root_cert() -> str | None:
    root = _settings().db_ssl_root_cert
    if root and Path(root).expanduser().is_file():
        return str(Path(root).expanduser())
    for key in ("DB_SSL_ROOT_CERT", "PGSSLROOTCERT"):
        path = os.environ.get(key)
        if path and Path(path).expanduser().is_file():
            return str(Path(path).expanduser())
    return None


def db_ssl_insecure() -> bool:
    return _settings().skip_tls_verify


def _asyncpg_ssl_context() -> bool | ssl.SSLContext:
    mode = db_ssl_mode()
    if mode in ("disable", "off", "false", "allow"):
        return False

    root = db_ssl_root_cert()
    if root:
        return ssl.create_default_context(cafile=root)

    if db_ssl_insecure() or mode == "require":
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return ctx

    return True


def asyncpg_connect_kwargs() -> dict[str, object]:
    ssl_value = _asyncpg_ssl_context()
    if ssl_value is False:
        return {"ssl": False}
    return {"ssl": ssl_value}


def psycopg_ssl_query() -> str:
    mode = db_ssl_mode()
    if mode in ("disable", "off", "false", "allow"):
        return "sslmode=disable"

    if db_ssl_insecure():
        return "sslmode=require"

    root = db_ssl_root_cert()
    if root:
        if mode in ("verify-full", "verify-ca"):
            return f"sslmode={mode}&sslrootcert={quote_plus(root)}"
        return f"sslmode=verify-full&sslrootcert={quote_plus(root)}"

    if mode == "require":
        return "sslmode=require"

    return f"sslmode={mode}"
