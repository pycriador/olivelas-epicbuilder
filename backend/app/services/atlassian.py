"""Atlassian (Jira + Confluence) HTTP client."""

from __future__ import annotations

import base64
from typing import Any

import httpx

from app.config import Settings, get_settings
from app.http.ssl import http_ssl_verify


class AtlassianConfigError(Exception):
    pass


def _settings() -> Settings:
    return get_settings()


def assert_atlassian_config(settings: Settings | None = None) -> None:
    cfg = settings or _settings()
    missing = [
        name
        for name, value in (
            ("JIRA_BASE_URL", cfg.jira_base_url),
            ("JIRA_EMAIL", cfg.jira_email),
            ("JIRA_API_TOKEN", cfg.jira_api_token),
        )
        if not str(value).strip()
    ]
    if missing:
        raise AtlassianConfigError(
            "Missing Atlassian credentials: "
            + ", ".join(missing)
            + ". Set them in the repository root .env or backend .env."
        )


def _auth_header(settings: Settings) -> str:
    token = base64.b64encode(
        f"{settings.jira_email}:{settings.jira_api_token}".encode()
    ).decode()
    return f"Basic {token}"


def _resolve_url(path: str, settings: Settings) -> str:
    if path.startswith("http://") or path.startswith("https://"):
        return path
    return f"{settings.atlassian_base_url}{path}"


async def atlassian_fetch(
    path: str,
    *,
    settings: Settings | None = None,
    method: str = "GET",
    headers: dict[str, str] | None = None,
    content: bytes | None = None,
    data: dict[str, str] | None = None,
    files: dict[str, tuple[str, bytes, str]] | None = None,
    json_body: Any | None = None,
) -> httpx.Response:
    cfg = settings or _settings()
    assert_atlassian_config(cfg)
    url = _resolve_url(path, cfg)
    merged_headers = {
        "Authorization": _auth_header(cfg),
        "Accept": "application/json",
        **(headers or {}),
    }
    async with httpx.AsyncClient(
        timeout=120.0,
        verify=http_ssl_verify(),
        follow_redirects=True,
    ) as client:
        return await client.request(
            method,
            url,
            headers=merged_headers,
            content=content,
            data=data,
            files=files,
            json=json_body,
        )


async def atlassian_json(
    path: str,
    *,
    settings: Settings | None = None,
    method: str = "GET",
    headers: dict[str, str] | None = None,
    json_body: Any | None = None,
) -> Any:
    response = await atlassian_fetch(
        path,
        settings=settings,
        method=method,
        headers=headers,
        json_body=json_body,
    )
    if not response.is_success:
        body = response.text[:300]
        raise RuntimeError(
            f"Atlassian {response.status_code} on {path}: {body or response.reason_phrase}"
        )
    if not response.content:
        return {}
    return response.json()
