"""Optional auth gates so local tests can set REQUIRE_AUTH=false."""

from __future__ import annotations

from fastapi import Cookie, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.session import get_db_session
from app.iam.deps import AuthContext, bearer_scheme, get_current_user


async def require_login(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    access_token_cookie: str | None = Cookie(default=None, alias="access_token"),
    session: AsyncSession = Depends(get_db_session),
) -> AuthContext | None:
    if not get_settings().require_auth:
        return None
    return await get_current_user(request, credentials, access_token_cookie, session)


def require_perm(*codes: str):
    async def _dep(
        request: Request,
        credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
        access_token_cookie: str | None = Cookie(default=None, alias="access_token"),
        session: AsyncSession = Depends(get_db_session),
    ) -> AuthContext | None:
        if not get_settings().require_auth:
            return None
        auth = await get_current_user(request, credentials, access_token_cookie, session)
        if auth.is_admin or any(auth.has(c) for c in codes):
            return auth
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    return _dep
