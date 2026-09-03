from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.iam.guards import require_login, require_perm
from app.models.portal import Integration

router = APIRouter(prefix="/api/v1/integrations", tags=["integrations"])


@router.get("")
async def list_integrations(
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_login),
) -> list[dict]:
    rows = (await session.scalars(select(Integration).order_by(Integration.id))).all()
    return [row.payload for row in rows]


@router.get("/{integration_id}")
async def get_integration(
    integration_id: str,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_login),
) -> dict:
    row = await session.get(Integration, integration_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Integration not found")
    return row.payload


@router.put("/{integration_id}")
async def upsert_integration(
    integration_id: str,
    body: dict,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_perm("integrations.manage")),
) -> dict:
    payload = {**body, "id": integration_id}
    row = await session.get(Integration, integration_id)
    if row is None:
        session.add(Integration(id=integration_id, payload=payload))
    else:
        row.payload = payload
    await session.commit()
    return payload


@router.delete("/{integration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_integration(
    integration_id: str,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_perm("integrations.manage")),
) -> None:
    row = await session.get(Integration, integration_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Integration not found")
    await session.delete(row)
    await session.commit()
