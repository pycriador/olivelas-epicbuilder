"""External integrations: Jira, Confluence, Gemini, and media proxies."""

from __future__ import annotations

import re
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.session import get_db_session
from app.iam.guards import require_login, require_perm
from app.schemas.integrations import (
    ConfluenceDeleteRequest,
    ConfluenceSyncRequest,
    JiraImportRequest,
    JiraIssuesSearchRequest,
)
from app.services.atlassian import atlassian_fetch
from app.services.confluence_sync import (
    delete_case_from_confluence,
    list_confluence_spaces,
    sync_case_to_confluence,
)
from app.services.jira_case import (
    build_case_from_jira,
    integrations_status,
    list_project_issues,
)

router = APIRouter(tags=["external-integrations"])

ALLOWED_AVATAR_SUFFIXES = (
    "atlassian.net",
    "atlassian.com",
    "atl-paas.net",
    "gravatar.com",
    "googleusercontent.com",
)


def _upscale_avatar_url(url: str) -> str:
    url = re.sub(
        r"(\b|=)(16|24|32|48|64|128)x(16|24|32|48|64|128)\b",
        r"\g<1>512x512",
        url,
    )
    url = re.sub(r"([?&](?:size|width|height|s|w|h)=)\d+", r"\g<1>512", url, flags=re.I)
    url = re.sub(
        r"([?&]size=)(x?small|medium|large|xlarge)\b",
        r"\g<1>xxlarge",
        url,
        flags=re.I,
    )
    return re.sub(r"/(16|24|32|48|64|128)(?=$|\?)", "/512", url)


def _host_allowed(host: str) -> bool:
    host = host.lower()
    return any(host == suffix or host.endswith(f".{suffix}") for suffix in ALLOWED_AVATAR_SUFFIXES)


@router.get("/api/v1/diagnostics/integrations")
async def get_integrations_status(
    _auth=Depends(require_perm("integrations.view")),
) -> dict[str, dict[str, str | bool]]:
    return await integrations_status()


@router.get("/api/v1/confluence/spaces")
async def get_confluence_spaces(
    limit: int = Query(default=50, ge=1, le=100),
    _auth=Depends(require_perm("integrations.view")),
) -> list[dict[str, str]]:
    return await list_confluence_spaces(limit)


@router.post("/api/v1/jira/issues/search")
async def post_jira_issues_search(
    body: JiraIssuesSearchRequest,
    _auth=Depends(require_perm("cases.create", "cases.edit")),
) -> list[dict[str, str]]:
    try:
        return await list_project_issues(body.query, body.limit or 25)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/api/v1/jira/import")
async def post_jira_import(
    body: JiraImportRequest,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_perm("cases.create", "cases.edit")),
) -> dict:
    try:
        return await build_case_from_jira(session, body.projectUrl, body.availableIntegrations)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/api/v1/confluence/sync-case")
async def post_confluence_sync_case(
    body: ConfluenceSyncRequest,
    _auth=Depends(require_perm("cases.publish")),
) -> dict:
    try:
        return await sync_case_to_confluence(body.as_payload())
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/api/v1/confluence/delete-case")
async def post_confluence_delete_case(
    body: ConfluenceDeleteRequest,
    _auth=Depends(require_perm("cases.delete")),
) -> dict:
    try:
        return await delete_case_from_confluence(body.nome, body.responsavelEmail)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/api/jira-avatar")
async def get_jira_avatar(
    u: str = Query(..., min_length=1),
    _auth=Depends(require_login),
) -> Response:
    settings = get_settings()
    base = settings.atlassian_base_url
    try:
        target = urlparse(u if u.startswith("http") else f"{base}{u if u.startswith('/') else '/' + u}")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Bad request") from exc

    if not target.netloc:
        raise HTTPException(status_code=400, detail="Bad request")
    if not _host_allowed(target.netloc):
        raise HTTPException(status_code=403, detail="Forbidden")

    upscale_target = _upscale_avatar_url(u if u.startswith("http") else str(target.geturl()))
    parsed_up = urlparse(upscale_target if upscale_target.startswith("http") else f"{base}{upscale_target}")
    same_site = parsed_up.netloc.lower() == urlparse(base).netloc.lower()

    if same_site:
        path = parsed_up.path + (f"?{parsed_up.query}" if parsed_up.query else "")
        upstream = await atlassian_fetch(path, headers={"Accept": "image/*"})
    else:
        import httpx

        from app.http.ssl import http_ssl_verify

        async with httpx.AsyncClient(timeout=30.0, verify=http_ssl_verify()) as client:
            upstream = await client.get(
                upscale_target,
                headers={"Accept": "image/*"},
            )

    if not upstream.is_success or not upstream.content:
        raise HTTPException(status_code=upstream.status_code or 502, detail="Avatar unavailable")

    return Response(
        content=upstream.content,
        media_type=upstream.headers.get("content-type", "image/png"),
        headers={"Cache-Control": "private, max-age=86400"},
    )


@router.get("/api/jira-attachment")
async def get_jira_attachment(
    id: str = Query(..., min_length=1),  # noqa: A002
    _auth=Depends(require_login),
) -> Response:
    if not re.fullmatch(r"\d+", id):
        raise HTTPException(status_code=400, detail="Bad request")
    upstream = await atlassian_fetch(
        f"/rest/api/3/attachment/content/{id}",
        headers={"Accept": "*/*"},
    )
    if not upstream.is_success or not upstream.content:
        raise HTTPException(status_code=upstream.status_code or 502, detail="Attachment unavailable")
    return Response(
        content=upstream.content,
        media_type=upstream.headers.get("content-type", "application/octet-stream"),
        headers={"Cache-Control": "private, max-age=300"},
    )
