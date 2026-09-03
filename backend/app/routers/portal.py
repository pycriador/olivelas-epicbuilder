from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.iam.guards import require_login, require_perm
from app.schemas.portal import PortalSnapshot
from app.services.portal import load_portal_snapshot, replace_portal_snapshot

router = APIRouter(prefix="/api/v1/portal", tags=["portal"])


@router.get("/snapshot")
async def get_portal_snapshot(
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_login),
) -> PortalSnapshot:
    return await load_portal_snapshot(session)


@router.put("/snapshot")
async def put_portal_snapshot(
    snapshot: PortalSnapshot,
    session: AsyncSession = Depends(get_db_session),
    _auth=Depends(require_perm("cases.publish", "cases.edit")),
) -> PortalSnapshot:
    await replace_portal_snapshot(session, snapshot)
    await session.commit()
    return snapshot
