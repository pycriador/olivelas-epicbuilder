from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.iam.guards import require_login, require_perm
from app.models.portal import HubContent

router = APIRouter(prefix="/api/v1/hub", tags=["hub"])


@router.get("")
async def list_hub_content(
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_login),
) -> list[dict]:
    rows = (await session.scalars(select(HubContent).order_by(HubContent.id))).all()
    return [row.payload for row in rows]


@router.get("/{item_id}")
async def get_hub_item(
    item_id: str,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_login),
) -> dict:
    row = await session.get(HubContent, item_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Hub item not found")
    return row.payload


@router.put("/{item_id}")
async def upsert_hub_item(
    item_id: str,
    body: dict,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_perm("cases.edit")),
) -> dict:
    payload = {**body, "id": item_id}
    row = await session.get(HubContent, item_id)
    if row is None:
        session.add(HubContent(id=item_id, payload=payload))
    else:
        row.payload = payload
    await session.commit()
    return payload


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hub_item(
    item_id: str,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_perm("cases.delete")),
) -> None:
    row = await session.get(HubContent, item_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Hub item not found")
    await session.delete(row)
    await session.commit()
