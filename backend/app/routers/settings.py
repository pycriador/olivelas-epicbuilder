"""Admin API for encrypted runtime settings."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.iam.deps import AuthContext, require_permission
from app.iam.service import write_audit
from app.settings_catalog import MANAGED_BY_KEY
from app.settings_store import list_settings_for_api, upsert_settings

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])


class SettingItem(BaseModel):
    key: str
    label: str
    category: str
    description: str
    is_secret: bool
    placeholder: str = ""
    value: str
    has_value: bool
    source: str
    configured_in_db: bool


class SettingsUpdateRequest(BaseModel):
    values: dict[str, str | None] = Field(default_factory=dict)


@router.get("", response_model=list[SettingItem])
async def get_settings_list(
    request: Request,
    reveal: bool = Query(default=False),
    auth: AuthContext = Depends(require_permission("settings.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> list[SettingItem]:
    # Only full admins may reveal secret plaintext
    reveal_secrets = reveal and (auth.is_admin or auth.has("iam.admin"))
    if reveal and not reveal_secrets:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Reveal requires admin")
    items = await list_settings_for_api(session, reveal_secrets=reveal_secrets)
    if reveal_secrets:
        await write_audit(
            session,
            action="settings.reveal",
            user_id=auth.user.id,
            resource_type="runtime_settings",
            ip_address=request.client.host if request.client else "",
            user_agent=request.headers.get("user-agent", ""),
        )
        await session.commit()
    return [SettingItem(**item) for item in items]


@router.put("", response_model=list[SettingItem])
async def put_settings(
    body: SettingsUpdateRequest,
    request: Request,
    auth: AuthContext = Depends(require_permission("settings.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> list[SettingItem]:
    unknown = [key for key in body.values if key not in MANAGED_BY_KEY]
    if unknown:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown setting keys: {', '.join(unknown)}",
        )
    # Ignore masked placeholders submitted by mistake (••••)
    cleaned: dict[str, str | None] = {}
    for key, value in body.values.items():
        if value is None:
            cleaned[key] = None
            continue
        if "•" in value:
            continue  # keep existing
        cleaned[key] = value
    changed = await upsert_settings(session, cleaned, user_id=auth.user.id)
    await write_audit(
        session,
        action="settings.update",
        user_id=auth.user.id,
        resource_type="runtime_settings",
        resource_id=",".join(changed),
        ip_address=request.client.host if request.client else "",
        user_agent=request.headers.get("user-agent", ""),
        after={"keys": changed},
    )
    await session.commit()
    await reload_overrides(session)
    items = await list_settings_for_api(session, reveal_secrets=False)
    return [SettingItem(**item) for item in items]
