from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime

from fastapi import Cookie, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db_session
from app.iam.catalog import ADMIN_GROUP, ADMIN_ROLE
from app.iam.models import Group, Role, Session, User
from app.iam.security import decode_access_token
from app.iam.service import permissions_from_loaded_user

bearer_scheme = HTTPBearer(auto_error=False)

# Avoid writing last_seen on every authenticated request (admin pages fire many in parallel).
_LAST_SEEN_MIN_INTERVAL_SECONDS = 300


@dataclass
class AuthContext:
    user: User
    session_id: str
    permissions: set[str] = field(default_factory=set)
    is_admin: bool = False

    def has(self, code: str) -> bool:
        return self.is_admin or code in self.permissions


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    access_token_cookie: str | None = Cookie(default=None, alias="access_token"),
    session: AsyncSession = Depends(get_db_session),
) -> AuthContext:
    token = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    elif access_token_cookie:
        token = access_token_cookie
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = decode_access_token(token)
    except InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_id = str(payload.get("sub") or "")
    session_id = str(payload.get("sid") or "")
    if not user_id or not session_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    db_session = await session.get(Session, session_id)
    if (
        not db_session
        or db_session.revoked
        or db_session.user_id != user_id
        or db_session.expires_at.replace(tzinfo=UTC) < datetime.now(UTC)
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

    user = await session.scalar(
        select(User)
        .where(User.id == user_id)
        .options(
            selectinload(User.groups)
            .selectinload(Group.roles)
            .selectinload(Role.permissions)
        )
    )
    if not user or user.status in {"disabled", "deleted"}:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User unavailable")
    if user.status == "blocked" or (
        user.locked_until and user.locked_until.replace(tzinfo=UTC) > datetime.now(UTC)
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User locked")

    # Relationships already eager-loaded — do not re-query.
    permissions, is_admin = permissions_from_loaded_user(user)
    is_admin = (
        is_admin
        or any(g.name == ADMIN_GROUP for g in user.groups)
        or any(r.name == ADMIN_ROLE for g in user.groups for r in g.roles)
    )

    # Throttle last_seen writes; a commit on every /admin request serializes the pool.
    now = datetime.now(UTC)
    last_seen = db_session.last_seen_at
    if last_seen.tzinfo is None:
        last_seen = last_seen.replace(tzinfo=UTC)
    if (now - last_seen).total_seconds() >= _LAST_SEEN_MIN_INTERVAL_SECONDS:
        db_session.last_seen_at = now
        await session.commit()

    request.state.auth = AuthContext(
        user=user,
        session_id=session_id,
        permissions=permissions,
        is_admin=is_admin,
    )
    return request.state.auth


async def get_optional_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    access_token_cookie: str | None = Cookie(default=None, alias="access_token"),
    session: AsyncSession = Depends(get_db_session),
) -> AuthContext | None:
    if not credentials and not access_token_cookie:
        return None
    try:
        return await get_current_user(request, credentials, access_token_cookie, session)
    except HTTPException:
        return None


def require_permission(*codes: str):
    async def _dep(auth: AuthContext = Depends(get_current_user)) -> AuthContext:
        if auth.is_admin:
            return auth
        if not any(auth.has(code) for code in codes):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return auth

    return _dep


def require_admin(auth: AuthContext = Depends(get_current_user)) -> AuthContext:
    if not auth.is_admin and not auth.has("iam.admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin required")
    return auth
