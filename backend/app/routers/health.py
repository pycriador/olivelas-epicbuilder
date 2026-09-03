from fastapi import APIRouter, HTTPException, status

from app.db.session import check_db_connection

router = APIRouter(tags=["health"])
api_router = APIRouter(prefix="/api", tags=["health"])


def _liveness_payload() -> dict[str, str]:
    return {"status": "ok"}


async def _db_health_payload() -> dict[str, str]:
    try:
        await check_db_connection()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "error", "database": "unavailable", "reason": str(exc)},
        ) from exc
    return {"status": "ok", "database": "connected"}


@router.get("/health")
async def health_liveness() -> dict[str, str]:
    return _liveness_payload()


@router.get("/health/db")
async def health_db() -> dict[str, str]:
    return await _db_health_payload()


@api_router.get("/health")
async def api_health_liveness() -> dict[str, str]:
    return _liveness_payload()


@api_router.get("/health/db")
async def api_health_db() -> dict[str, str]:
    return await _db_health_payload()
