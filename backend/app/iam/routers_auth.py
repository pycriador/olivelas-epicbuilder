from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.session import get_db_session
from app.iam.deps import AuthContext, get_current_user
from app.iam.models import PasswordResetToken, Session, User
from app.iam.schemas import (
    ChangePasswordRequest,
    FirstAccessRequest,
    ForgotPasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserPublic,
)
from app.iam.security import (
    create_access_token,
    hash_password,
    hash_token,
    new_token,
    parse_user_agent,
    verify_password,
)
from app.iam.service import get_session_by_refresh_hash, get_user_by_login, load_user_permissions, write_audit

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

REFRESH_COOKIE = "refresh_token"
ACCESS_COOKIE = "access_token"


def _client_meta(request: Request) -> tuple[str, str, str, str]:
    ip = request.client.host if request.client else ""
    ua = request.headers.get("user-agent", "")
    browser, os_name = parse_user_agent(ua)
    return ip, ua, browser, os_name


def _set_auth_cookies(
    response: Response,
    *,
    access_token: str,
    refresh_token: str,
    remember_me: bool,
) -> None:
    settings = get_settings()
    refresh_max_age = (
        settings.jwt_refresh_remember_days * 86400
        if remember_me
        else settings.jwt_refresh_ttl_days * 86400
    )
    common = {
        "httponly": True,
        "secure": settings.cookie_secure,
        "samesite": settings.cookie_samesite,
        "path": "/",
    }
    response.set_cookie(
        ACCESS_COOKIE,
        access_token,
        max_age=settings.jwt_access_ttl_minutes * 60,
        **common,
    )
    response.set_cookie(
        REFRESH_COOKIE,
        refresh_token,
        max_age=refresh_max_age,
        **common,
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_COOKIE, path="/")
    response.delete_cookie(REFRESH_COOKIE, path="/")


def user_to_public(user: User, permissions: set[str], is_admin: bool) -> UserPublic:
    return UserPublic(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        username=user.username,
        email=user.email,
        photo_url=user.photo_url,
        status=user.status,
        primary_group_id=user.primary_group_id,
        locale=user.locale,
        timezone=user.timezone,
        must_change_password=user.must_change_password,
        email_verified=user.email_verified,
        groups=[g.name for g in user.groups],
        permissions=sorted(permissions),
        is_admin=is_admin,
        last_login_at=user.last_login_at,
        created_at=user.created_at,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    settings = get_settings()
    ip, ua, browser, os_name = _client_meta(request)
    user = await get_user_by_login(session, body.login)
    if not user:
        await write_audit(
            session,
            action="auth.login_failed",
            ip_address=ip,
            user_agent=ua,
            after={"login": body.login},
        )
        await session.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if user.locked_until and user.locked_until.replace(tzinfo=UTC) > datetime.now(UTC):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account temporarily locked")

    if user.status in {"disabled", "blocked", "deleted"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account unavailable")

    if not verify_password(user.password_hash, body.password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= settings.login_max_attempts:
            user.locked_until = datetime.now(UTC) + timedelta(minutes=settings.login_lockout_minutes)
            user.failed_login_attempts = 0
        await write_audit(
            session,
            action="auth.login_failed",
            user_id=user.id,
            ip_address=ip,
            user_agent=ua,
        )
        await session.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.now(UTC)

    refresh = new_token()
    refresh_days = (
        settings.jwt_refresh_remember_days if body.remember_me else settings.jwt_refresh_ttl_days
    )
    session_row = Session(
        id=str(uuid4()),
        user_id=user.id,
        refresh_token_hash=hash_token(refresh),
        ip_address=ip,
        user_agent=ua[:512],
        browser=browser,
        os=os_name,
        remember_me=body.remember_me,
        expires_at=datetime.now(UTC) + timedelta(days=refresh_days),
    )
    session.add(session_row)
    permissions, is_admin = await load_user_permissions(session, user)
    access = create_access_token(
        user_id=user.id,
        session_id=session_row.id,
        permissions=sorted(permissions),
        is_admin=is_admin,
    )
    await write_audit(
        session,
        action="auth.login",
        user_id=user.id,
        ip_address=ip,
        user_agent=ua,
        resource_type="session",
        resource_id=session_row.id,
    )
    await session.commit()
    _set_auth_cookies(response, access_token=access, refresh_token=refresh, remember_me=body.remember_me)
    return TokenResponse(
        access_token=access,
        expires_in=settings.jwt_access_ttl_minutes * 60,
        must_change_password=user.must_change_password,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    settings = get_settings()
    raw = request.cookies.get(REFRESH_COOKIE)
    if not raw:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

    row = await get_session_by_refresh_hash(session, hash_token(raw))
    if not row or row.expires_at.replace(tzinfo=UTC) < datetime.now(UTC):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh expired")

    user = await session.get(User, row.user_id)
    if not user or user.status not in {"active"}:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User unavailable")

    # Rotate refresh token
    new_refresh = new_token()
    row.refresh_token_hash = hash_token(new_refresh)
    row.last_seen_at = datetime.now(UTC)
    permissions, is_admin = await load_user_permissions(session, user)
    access = create_access_token(
        user_id=user.id,
        session_id=row.id,
        permissions=sorted(permissions),
        is_admin=is_admin,
    )
    await write_audit(
        session,
        action="auth.refresh",
        user_id=user.id,
        resource_type="session",
        resource_id=row.id,
        ip_address=request.client.host if request.client else "",
        user_agent=request.headers.get("user-agent", ""),
    )
    await session.commit()
    _set_auth_cookies(
        response,
        access_token=access,
        refresh_token=new_refresh,
        remember_me=row.remember_me,
    )
    return TokenResponse(
        access_token=access,
        expires_in=settings.jwt_access_ttl_minutes * 60,
        must_change_password=user.must_change_password,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    response: Response,
    auth: AuthContext = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    row = await session.get(Session, auth.session_id)
    if row:
        row.revoked = True
    await write_audit(
        session,
        action="auth.logout",
        user_id=auth.user.id,
        resource_type="session",
        resource_id=auth.session_id,
        ip_address=request.client.host if request.client else "",
        user_agent=request.headers.get("user-agent", ""),
    )
    await session.commit()
    _clear_auth_cookies(response)


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
async def logout_all(
    request: Request,
    response: Response,
    auth: AuthContext = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    rows = (await session.scalars(select(Session).where(Session.user_id == auth.user.id))).all()
    for row in rows:
        row.revoked = True
    await write_audit(
        session,
        action="auth.logout_all",
        user_id=auth.user.id,
        ip_address=request.client.host if request.client else "",
        user_agent=request.headers.get("user-agent", ""),
    )
    await session.commit()
    _clear_auth_cookies(response)


@router.get("/me", response_model=UserPublic)
async def me(
    auth: AuthContext = Depends(get_current_user),
) -> UserPublic:
    return user_to_public(auth.user, auth.permissions, auth.is_admin)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    body: ChangePasswordRequest,
    request: Request,
    auth: AuthContext = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    user = await session.get(User, auth.user.id)
    assert user is not None
    if not verify_password(user.password_hash, body.current_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password invalid")
    user.password_hash = hash_password(body.new_password)
    user.must_change_password = False
    await write_audit(
        session,
        action="auth.password_change",
        user_id=user.id,
        ip_address=request.client.host if request.client else "",
        user_agent=request.headers.get("user-agent", ""),
    )
    await session.commit()


@router.post("/first-access", status_code=status.HTTP_204_NO_CONTENT)
async def first_access(
    body: FirstAccessRequest,
    request: Request,
    auth: AuthContext = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    user = await session.get(User, auth.user.id)
    assert user is not None
    if not user.must_change_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not required")
    user.password_hash = hash_password(body.new_password)
    user.must_change_password = False
    await write_audit(
        session,
        action="auth.first_access",
        user_id=user.id,
        ip_address=request.client.host if request.client else "",
        user_agent=request.headers.get("user-agent", ""),
    )
    await session.commit()


@router.post("/forgot-password")
async def forgot_password(
    body: ForgotPasswordRequest,
    request: Request,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, str]:
    """Always returns ok; token returned only in non-production for local testing."""
    settings = get_settings()
    user = await session.scalar(select(User).where(User.email == str(body.email).lower()))
    raw = None
    if user:
        raw = new_token()
        session.add(
            PasswordResetToken(
                id=str(uuid4()),
                user_id=user.id,
                token_hash=hash_token(raw),
                expires_at=datetime.now(UTC) + timedelta(hours=2),
            )
        )
        await write_audit(
            session,
            action="auth.forgot_password",
            user_id=user.id,
            ip_address=request.client.host if request.client else "",
            user_agent=request.headers.get("user-agent", ""),
        )
        await session.commit()
    payload = {"status": "ok", "message": "If the email exists, a reset link was generated."}
    if raw and settings.expose_dev_tokens:
        payload["reset_token"] = raw
    return payload


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
async def reset_password(
    body: ResetPasswordRequest,
    request: Request,
    session: AsyncSession = Depends(get_db_session),
) -> None:
    token_row = await session.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == hash_token(body.token),
            PasswordResetToken.used_at.is_(None),
        )
    )
    if not token_row or token_row.expires_at.replace(tzinfo=UTC) < datetime.now(UTC):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")
    user = await session.get(User, token_row.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
    user.password_hash = hash_password(body.new_password)
    user.must_change_password = False
    token_row.used_at = datetime.now(UTC)
    # Revoke all sessions
    for row in (await session.scalars(select(Session).where(Session.user_id == user.id))).all():
        row.revoked = True
    await write_audit(
        session,
        action="auth.password_reset",
        user_id=user.id,
        ip_address=request.client.host if request.client else "",
        user_agent=request.headers.get("user-agent", ""),
    )
    await session.commit()
