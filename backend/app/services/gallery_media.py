"""Gallery media stored in PostgreSQL (Jira attachments and uploads)."""

from __future__ import annotations

import re

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.portal import GalleryMedia
from app.services.atlassian import atlassian_fetch

MAX_GALLERY_BYTES = 10 * 1024 * 1024  # 10 MiB per item


def gallery_public_url(media_id: str) -> str:
    return f"/api/v1/gallery/{media_id}"


async def fetch_jira_attachment_bytes(attachment_id: str) -> tuple[bytes, str] | None:
    response = await atlassian_fetch(
        f"/rest/api/3/attachment/content/{attachment_id}",
        headers={"Accept": "*/*"},
    )
    if not response.is_success or not response.content:
        return None
    content_type = response.headers.get("content-type", "application/octet-stream")
    return response.content, content_type.split(";")[0].strip()


async def upsert_gallery_media(
    session: AsyncSession,
    *,
    media_id: str,
    content: bytes,
    mime_type: str,
    filename: str = "",
    case_id: str | None = None,
) -> GalleryMedia:
    row = await session.get(GalleryMedia, media_id)
    if row is None:
        row = GalleryMedia(
            id=media_id,
            content=content,
            mime_type=mime_type,
            filename=filename,
            case_id=case_id,
        )
        session.add(row)
    else:
        row.content = content
        row.mime_type = mime_type
        row.filename = filename or row.filename
        if case_id:
            row.case_id = case_id
    await session.flush()
    return row


async def persist_jira_attachment(
    session: AsyncSession,
    *,
    attachment_id: str,
    mime_type: str,
    filename: str = "",
    case_id: str | None = None,
    commit: bool = False,
) -> str | None:
    """Download from Jira, store in RDS, return public API path."""
    existing = await session.get(GalleryMedia, attachment_id)
    if existing is not None:
        if case_id and not existing.case_id:
            existing.case_id = case_id
            await session.flush()
        if commit:
            await session.commit()
        return gallery_public_url(attachment_id)

    fetched = await fetch_jira_attachment_bytes(attachment_id)
    if fetched is None:
        return None
    content, detected_mime = fetched
    if len(content) > MAX_GALLERY_BYTES:
        return None

    await upsert_gallery_media(
        session,
        media_id=attachment_id,
        content=content,
        mime_type=mime_type or detected_mime,
        filename=filename,
        case_id=case_id,
    )
    if commit:
        await session.commit()
    return gallery_public_url(attachment_id)


async def get_gallery_media(session: AsyncSession, media_id: str) -> GalleryMedia | None:
    return await session.get(GalleryMedia, media_id)


async def link_gallery_to_case(session: AsyncSession, media_id: str, case_id: str) -> None:
    row = await session.get(GalleryMedia, media_id)
    if row is not None:
        row.case_id = case_id
        await session.flush()


def extract_attachment_id(url: str) -> str | None:
    if not url:
        return None
    match = re.search(r"/api/v1/gallery/(\d+)", url) or re.search(r"[?&]id=(\d+)", url)
    return match.group(1) if match else None


async def backfill_gallery_items(
    session: AsyncSession,
    *,
    galeria: list[dict],
    case_id: str | None = None,
) -> dict[str, int]:
    """Download and store gallery attachments referenced by case meta."""
    ok = 0
    failed = 0
    seen: set[str] = set()
    for item in galeria:
        if not isinstance(item, dict):
            continue
        attachment_id = extract_attachment_id(str(item.get("url") or ""))
        if not attachment_id or attachment_id in seen:
            continue
        seen.add(attachment_id)
        stored = await persist_jira_attachment(
            session,
            attachment_id=attachment_id,
            mime_type=str(item.get("mimeType") or "application/octet-stream"),
            filename=str(item.get("titulo") or ""),
            case_id=case_id,
            commit=True,
        )
        if stored:
            ok += 1
        else:
            failed += 1
    return {"stored": ok, "failed": failed, "total": len(seen)}
