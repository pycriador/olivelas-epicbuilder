from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.iam.guards import require_login, require_perm
from app.models.portal import Case, CaseMeta
from app.schemas.portal import CaseMetaWrite, CaseWrite
from app.services.gallery_media import backfill_gallery_items

router = APIRouter(prefix="/api/v1/cases", tags=["cases"])


async def _backfill_case_gallery(case_id: str, galeria: list) -> None:
    from app.db.session import _session_factory

    if _session_factory is None:
        return
    async with _session_factory() as session:
        await backfill_gallery_items(session, galeria=galeria, case_id=case_id)


@router.get("")
async def list_cases(
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_login),
) -> list[dict]:
    rows = (await session.scalars(select(Case).order_by(Case.id))).all()
    return [row.payload for row in rows]


@router.get("/{case_id}")
async def get_case(
    case_id: str,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_login),
) -> dict:
    row = await session.get(Case, case_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return row.payload


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_case(
    body: CaseWrite,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_perm("cases.create", "cases.publish")),
) -> dict:
    payload = body.resolved_payload()
    case_id = payload["id"]
    if await session.get(Case, case_id):
        raise HTTPException(status_code=409, detail="Case already exists")
    session.add(Case(id=case_id, payload=payload))
    await session.commit()
    return payload


@router.put("/{case_id}")
async def upsert_case(
    case_id: str,
    body: dict,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_perm("cases.edit", "cases.publish")),
) -> dict:
    payload = {**body, "id": case_id}
    row = await session.get(Case, case_id)
    if row is None:
        session.add(Case(id=case_id, payload=payload))
    else:
        row.payload = payload
    await session.commit()
    return payload


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case(
    case_id: str,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_perm("cases.delete")),
) -> None:
    row = await session.get(Case, case_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Case not found")
    meta = await session.get(CaseMeta, case_id)
    if meta:
        await session.delete(meta)
    await session.delete(row)
    await session.commit()


@router.get("/{case_id}/meta")
async def get_case_meta(
    case_id: str,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_login),
) -> dict:
    row = await session.get(CaseMeta, case_id)
    if row is None:
        return {}
    return row.payload


@router.put("/{case_id}/meta")
async def upsert_case_meta(
    case_id: str,
    body: CaseMetaWrite,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_perm("cases.edit", "cases.publish")),
) -> dict:
    if not await session.get(Case, case_id):
        raise HTTPException(status_code=404, detail="Case not found")
    row = await session.get(CaseMeta, case_id)
    if row is None:
        session.add(CaseMeta(case_id=case_id, payload=body.payload))
    else:
        row.payload = body.payload
    await session.commit()
    galeria = body.payload.get("galeria")
    if isinstance(galeria, list) and galeria:
        background_tasks.add_task(_backfill_case_gallery, case_id, galeria)
    return body.payload
