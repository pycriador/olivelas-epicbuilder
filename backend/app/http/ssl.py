"""Outbound HTTPS settings (httpx) — e.g. Netskope dev bypass."""

from __future__ import annotations


def http_ssl_verify() -> bool:
    """Return False to skip TLS certificate verification (local dev only)."""
    from app.config import get_settings

    return not get_settings().skip_tls_verify
