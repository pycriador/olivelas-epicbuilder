from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.iam.guards import require_login, require_perm
from app.models.portal import Area
from app.schemas.portal import AreaWrite

router = APIRouter(prefix="/api/v1/areas", tags=["areas"])


@router.get("")
async def list_areas(
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_login),
) -> list[str]:
    rows = (await session.scalars(select(Area).order_by(Area.name))).all()
    return [row.name for row in rows]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_area(
    body: AreaWrite,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_perm("areas.manage")),
) -> dict[str, str]:
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Area name is required")
    existing = await session.get(Area, name)
    if existing:
        raise HTTPException(status_code=409, detail="Area already exists")
    session.add(Area(name=name))
    await session.commit()
    return {"name": name}


@router.delete("/{name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_area(
    name: str,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_perm("areas.manage")),
) -> None:
    row = await session.get(Area, name)
    if row is None:
        raise HTTPException(status_code=404, detail="Area not found")
    await session.delete(row)
    await session.commit()
