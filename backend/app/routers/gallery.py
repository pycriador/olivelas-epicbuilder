from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.iam.guards import require_login, require_perm
from app.models.portal import CaseMeta
from app.services.gallery_media import (
    backfill_gallery_items,
    get_gallery_media,
    persist_jira_attachment,
)

router = APIRouter(prefix="/api/v1/gallery", tags=["gallery"])


@router.post("/backfill/case/{case_id}")
async def backfill_case_gallery(
    case_id: str,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_perm("cases.edit")),
) -> dict[str, int]:
    row = await session.get(CaseMeta, case_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Case meta not found")
    galeria = (row.payload or {}).get("galeria") or []
    if not isinstance(galeria, list):
        raise HTTPException(status_code=400, detail="Invalid gallery payload")
    return await backfill_gallery_items(session, galeria=galeria, case_id=case_id)


@router.get("/{media_id}")
async def get_gallery_item(
    media_id: str,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_login),
) -> Response:
    row = await get_gallery_media(session, media_id)
    if row is None:
        stored = await persist_jira_attachment(
            session,
            attachment_id=media_id,
            mime_type="application/octet-stream",
            commit=True,
        )
        if stored:
            row = await get_gallery_media(session, media_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Gallery media not found")

    return Response(
        content=row.content,
        media_type=row.mime_type,
        headers={
            "Cache-Control": "public, max-age=86400",
            "Content-Disposition": f'inline; filename="{row.filename or media_id}"',
        },
    )
