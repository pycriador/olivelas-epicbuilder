"""IAM admin API routers."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db_session
from app.iam.catalog import ADMIN_GROUP
from app.iam.deps import AuthContext, require_admin, require_permission
from app.iam.models import (
    AuditLog,
    Group,
    GroupRole,
    Invitation,
    Permission,
    Role,
    RolePermission,
    Session,
    Share,
    User,
    UserGroup,
)
from app.iam.routers_auth import user_to_public
from app.iam.schemas import (
    AcceptInvitationRequest,
    AuditLogPublic,
    DashboardStats,
    GroupCreate,
    GroupPublic,
    GroupUpdate,
    InvitationCreate,
    InvitationPublic,
    MatrixUpdate,
    Page,
    PermissionCreate,
    PermissionPublic,
    PermissionUpdate,
    RoleCreate,
    RolePublic,
    RoleUpdate,
    SessionPublic,
    ShareCreate,
    SharePublic,
    UserCreate,
    UserPublic,
    UserUpdate,
)
from app.iam.security import hash_password, hash_token, new_token
from app.iam.service import load_user_permissions, write_audit

router = APIRouter(prefix="/api/v1/iam", tags=["iam"])


def _client_meta(request: Request) -> tuple[str, str]:
    ip = request.client.host if request.client else ""
    ua = request.headers.get("user-agent", "")
    return ip, ua


def _paginate(page: int, page_size: int) -> tuple[int, int]:
    page = max(1, page)
    page_size = min(max(1, page_size), 100)
    return page, page_size


def group_to_public(group: Group) -> GroupPublic:
    return GroupPublic(
        id=group.id,
        name=group.name,
        description=group.description,
        color=group.color,
        icon=group.icon,
        status=group.status,
        is_system=group.is_system,
        role_ids=[r.id for r in group.roles],
        created_at=group.created_at,
    )


def role_to_public(role: Role) -> RolePublic:
    return RolePublic(
        id=role.id,
        name=role.name,
        description=role.description,
        priority=role.priority,
        status=role.status,
        is_system=role.is_system,
        permission_ids=[p.id for p in role.permissions],
        created_at=role.created_at,
    )


def permission_to_public(perm: Permission) -> PermissionPublic:
    return PermissionPublic(
        id=perm.id,
        name=perm.name,
        code=perm.code,
        category=perm.category,
        description=perm.description,
    )


def session_to_public(row: Session, *, current_session_id: str | None = None) -> SessionPublic:
    return SessionPublic(
        id=row.id,
        user_id=row.user_id,
        ip_address=row.ip_address,
        browser=row.browser,
        os=row.os,
        user_agent=row.user_agent,
        remember_me=row.remember_me,
        created_at=row.created_at,
        last_seen_at=row.last_seen_at,
        expires_at=row.expires_at,
        current=bool(current_session_id and row.id == current_session_id),
    )


def audit_to_public(row: AuditLog) -> AuditLogPublic:
    return AuditLogPublic(
        id=row.id,
        user_id=row.user_id,
        action=row.action,
        resource_type=row.resource_type,
        resource_id=row.resource_id,
        ip_address=row.ip_address,
        user_agent=row.user_agent,
        before=row.before,
        after=row.after,
        created_at=row.created_at,
    )


def invitation_to_public(row: Invitation, *, invite_token: str | None = None) -> InvitationPublic:
    return InvitationPublic(
        id=row.id,
        email=row.email,
        group_id=row.group_id,
        status=row.status,
        expires_at=row.expires_at,
        accepted_at=row.accepted_at,
        created_at=row.created_at,
        invite_token=invite_token,
    )


def share_to_public(row: Share) -> SharePublic:
    return SharePublic(
        id=row.id,
        resource_type=row.resource_type,
        resource_id=row.resource_id,
        permission=row.permission,
        grantee_type=row.grantee_type,
        grantee_id=row.grantee_id,
        granted_by=row.granted_by,
        created_at=row.created_at,
    )


async def _load_user(session: AsyncSession, user_id: str) -> User | None:
    return await session.scalar(
        select(User)
        .where(User.id == user_id)
        .options(
            selectinload(User.groups).selectinload(Group.roles).selectinload(Role.permissions)
        )
    )


async def _load_group(session: AsyncSession, group_id: str) -> Group | None:
    return await session.scalar(
        select(Group).where(Group.id == group_id).options(selectinload(Group.roles))
    )


async def _load_role(session: AsyncSession, role_id: str) -> Role | None:
    return await session.scalar(
        select(Role).where(Role.id == role_id).options(selectinload(Role.permissions))
    )


def _user_in_admin_group(user: User) -> bool:
    return any(g.name == ADMIN_GROUP and g.status == "active" for g in user.groups)


async def _count_active_admins(session: AsyncSession) -> int:
    stmt = (
        select(func.count(func.distinct(User.id)))
        .select_from(User)
        .join(UserGroup, UserGroup.user_id == User.id)
        .join(Group, Group.id == UserGroup.group_id)
        .where(
            Group.name == ADMIN_GROUP,
            Group.status == "active",
            User.status == "active",
        )
    )
    return int(await session.scalar(stmt) or 0)


async def _ensure_not_last_admin(session: AsyncSession, user: User) -> None:
    if not _user_in_admin_group(user):
        return
    if await _count_active_admins(session) <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove or disable the last admin",
        )


async def _set_user_groups(
    session: AsyncSession,
    user: User,
    group_ids: list[str],
) -> None:
    existing = (
        await session.scalars(select(UserGroup).where(UserGroup.user_id == user.id))
    ).all()
    for link in existing:
        await session.delete(link)
    await session.flush()
    for gid in dict.fromkeys(group_ids):
        group = await session.get(Group, gid)
        if not group:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Group not found: {gid}")
        session.add(UserGroup(user_id=user.id, group_id=gid))


async def _set_group_roles(session: AsyncSession, group: Group, role_ids: list[str]) -> None:
    existing = (
        await session.scalars(select(GroupRole).where(GroupRole.group_id == group.id))
    ).all()
    for link in existing:
        await session.delete(link)
    await session.flush()
    for rid in dict.fromkeys(role_ids):
        role = await session.get(Role, rid)
        if not role:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Role not found: {rid}")
        session.add(GroupRole(group_id=group.id, role_id=rid))


async def _set_role_permissions(
    session: AsyncSession, role: Role, permission_ids: list[str]
) -> None:
    existing = (
        await session.scalars(select(RolePermission).where(RolePermission.role_id == role.id))
    ).all()
    for link in existing:
        await session.delete(link)
    await session.flush()
    for pid in dict.fromkeys(permission_ids):
        perm = await session.get(Permission, pid)
        if not perm:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=f"Permission not found: {pid}"
            )
        session.add(RolePermission(role_id=role.id, permission_id=pid))


async def _user_public_response(
    session: AsyncSession,
    user: User,
    *,
    include_permissions: bool = True,
) -> UserPublic:
    permissions, is_admin = await load_user_permissions(session, user)
    if not include_permissions:
        # List views only need is_admin / groups — skip shipping the full catalog.
        permissions = set()
    return user_to_public(user, permissions, is_admin)


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    auth: AuthContext = Depends(require_permission("iam.admin", "iam.audit.view")),
    session: AsyncSession = Depends(get_db_session),
) -> DashboardStats:
    users = int(await session.scalar(select(func.count()).select_from(User).where(User.status != "deleted")) or 0)
    groups = int(await session.scalar(select(func.count()).select_from(Group)) or 0)
    permissions = int(await session.scalar(select(func.count()).select_from(Permission)) or 0)
    sessions = int(
        await session.scalar(
            select(func.count()).select_from(Session).where(Session.revoked.is_(False))
        )
        or 0
    )
    pending_invitations = int(
        await session.scalar(
            select(func.count()).select_from(Invitation).where(Invitation.status == "pending")
        )
        or 0
    )
    recent = (
        await session.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(10))
    ).all()
    return DashboardStats(
        users=users,
        groups=groups,
        permissions=permissions,
        sessions=sessions,
        pending_invitations=pending_invitations,
        recent_logs=[audit_to_public(row) for row in recent],
    )


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------


@router.get("/users", response_model=Page)
async def list_users(
    q: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = 1,
    page_size: int = 20,
    auth: AuthContext = Depends(require_permission("iam.users.view", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> Page:
    page, page_size = _paginate(page, page_size)
    stmt = select(User).options(
        selectinload(User.groups).selectinload(Group.roles).selectinload(Role.permissions)
    )
    count_stmt = select(func.count()).select_from(User)
    filters = []
    if status_filter:
        filters.append(User.status == status_filter)
    else:
        filters.append(User.status != "deleted")
    if q:
        like = f"%{q.strip()}%"
        filters.append(
            or_(
                User.email.ilike(like),
                User.username.ilike(like),
                User.first_name.ilike(like),
                User.last_name.ilike(like),
            )
        )
    for f in filters:
        stmt = stmt.where(f)
        count_stmt = count_stmt.where(f)
    total = int(await session.scalar(count_stmt) or 0)
    rows = (
        await session.scalars(
            stmt.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        )
    ).all()
    items: list[UserPublic] = []
    for user in rows:
        items.append(await _user_public_response(session, user, include_permissions=False))
    return Page(items=items, total=total, page=page, page_size=page_size)


@router.get("/users/{user_id}", response_model=UserPublic)
async def get_user(
    user_id: str,
    auth: AuthContext = Depends(require_permission("iam.users.view", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> UserPublic:
    user = await _load_user(session, user_id)
    if not user or user.status == "deleted":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return await _user_public_response(session, user)


@router.post("/users", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreate,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.users.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> UserPublic:
    ip, ua = _client_meta(request)
    email = str(body.email).lower()
    if await session.scalar(select(User).where(or_(User.email == email, User.username == body.username))):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or username already exists")

    group_ids = list(dict.fromkeys(body.group_ids))
    if body.primary_group_id and body.primary_group_id not in group_ids:
        group_ids.append(body.primary_group_id)

    user = User(
        id=str(uuid4()),
        first_name=body.first_name,
        last_name=body.last_name,
        username=body.username,
        email=email,
        password_hash=hash_password(body.password),
        photo_url=body.photo_url,
        status=body.status,
        primary_group_id=body.primary_group_id,
        locale=body.locale,
        timezone=body.timezone,
        must_change_password=body.must_change_password,
        email_verified=False,
    )
    session.add(user)
    await session.flush()
    if group_ids:
        await _set_user_groups(session, user, group_ids)
    await write_audit(
        session,
        action="iam.user.create",
        user_id=auth.user.id,
        resource_type="user",
        resource_id=user.id,
        ip_address=ip,
        user_agent=ua,
        after={"email": user.email, "username": user.username},
    )
    await session.commit()
    loaded = await _load_user(session, user.id)
    assert loaded is not None
    return await _user_public_response(session, loaded)


@router.patch("/users/{user_id}", response_model=UserPublic)
async def update_user(
    user_id: str,
    body: UserUpdate,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.users.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> UserPublic:
    ip, ua = _client_meta(request)
    user = await _load_user(session, user_id)
    if not user or user.status == "deleted":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    before = {
        "email": user.email,
        "username": user.username,
        "status": user.status,
        "group_ids": [g.id for g in user.groups],
    }

    data = body.model_dump(exclude_unset=True)
    new_status = data.get("status")
    if new_status and new_status in {"disabled", "blocked", "deleted"} and new_status != user.status:
        await _ensure_not_last_admin(session, user)

    if "group_ids" in data and data["group_ids"] is not None:
        new_ids = list(data["group_ids"])
        admin_group = await session.scalar(select(Group).where(Group.name == ADMIN_GROUP))
        if admin_group and _user_in_admin_group(user) and admin_group.id not in new_ids:
            await _ensure_not_last_admin(session, user)

    if "email" in data and data["email"] is not None:
        email = str(data["email"]).lower()
        conflict = await session.scalar(
            select(User).where(User.email == email, User.id != user.id)
        )
        if conflict:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
        user.email = email
        data.pop("email")

    if "username" in data and data["username"] is not None:
        conflict = await session.scalar(
            select(User).where(User.username == data["username"], User.id != user.id)
        )
        if conflict:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")

    password = data.pop("password", None)
    group_ids = data.pop("group_ids", None)
    for key, value in data.items():
        setattr(user, key, value)
    if password:
        user.password_hash = hash_password(password)
    if group_ids is not None:
        await _set_user_groups(session, user, group_ids)

    await write_audit(
        session,
        action="iam.user.update",
        user_id=auth.user.id,
        resource_type="user",
        resource_id=user.id,
        ip_address=ip,
        user_agent=ua,
        before=before,
        after={
            "email": user.email,
            "username": user.username,
            "status": user.status,
            "group_ids": group_ids if group_ids is not None else before["group_ids"],
        },
    )
    await session.commit()
    loaded = await _load_user(session, user.id)
    assert loaded is not None
    return await _user_public_response(session, loaded)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.users.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    ip, ua = _client_meta(request)
    user = await _load_user(session, user_id)
    if not user or user.status == "deleted":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await _ensure_not_last_admin(session, user)
    user.status = "deleted"
    for row in (await session.scalars(select(Session).where(Session.user_id == user.id))).all():
        row.revoked = True
    await write_audit(
        session,
        action="iam.user.delete",
        user_id=auth.user.id,
        resource_type="user",
        resource_id=user.id,
        ip_address=ip,
        user_agent=ua,
        before={"status": "active"},
        after={"status": "deleted"},
    )
    await session.commit()


async def _set_user_status(
    *,
    session: AsyncSession,
    auth: AuthContext,
    request: Request,
    user_id: str,
    new_status: str,
    action: str,
) -> UserPublic:
    ip, ua = _client_meta(request)
    user = await _load_user(session, user_id)
    if not user or user.status == "deleted":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if new_status in {"disabled", "blocked"}:
        await _ensure_not_last_admin(session, user)
    before = {"status": user.status}
    user.status = new_status
    if new_status in {"disabled", "blocked"}:
        for row in (await session.scalars(select(Session).where(Session.user_id == user.id))).all():
            row.revoked = True
    if new_status == "active":
        user.locked_until = None
        user.failed_login_attempts = 0
    await write_audit(
        session,
        action=action,
        user_id=auth.user.id,
        resource_type="user",
        resource_id=user.id,
        ip_address=ip,
        user_agent=ua,
        before=before,
        after={"status": new_status},
    )
    await session.commit()
    loaded = await _load_user(session, user.id)
    assert loaded is not None
    return await _user_public_response(session, loaded)


@router.post("/users/{user_id}/activate", response_model=UserPublic)
async def activate_user(
    user_id: str,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.users.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> UserPublic:
    return await _set_user_status(
        session=session,
        auth=auth,
        request=request,
        user_id=user_id,
        new_status="active",
        action="iam.user.activate",
    )


@router.post("/users/{user_id}/deactivate", response_model=UserPublic)
async def deactivate_user(
    user_id: str,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.users.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> UserPublic:
    return await _set_user_status(
        session=session,
        auth=auth,
        request=request,
        user_id=user_id,
        new_status="disabled",
        action="iam.user.deactivate",
    )


@router.post("/users/{user_id}/block", response_model=UserPublic)
async def block_user(
    user_id: str,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.users.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> UserPublic:
    return await _set_user_status(
        session=session,
        auth=auth,
        request=request,
        user_id=user_id,
        new_status="blocked",
        action="iam.user.block",
    )


@router.post("/users/{user_id}/unblock", response_model=UserPublic)
async def unblock_user(
    user_id: str,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.users.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> UserPublic:
    return await _set_user_status(
        session=session,
        auth=auth,
        request=request,
        user_id=user_id,
        new_status="active",
        action="iam.user.unblock",
    )


@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: str,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.users.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    ip, ua = _client_meta(request)
    user = await _load_user(session, user_id)
    if not user or user.status == "deleted":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    temp_password = new_token(12)
    user.password_hash = hash_password(temp_password)
    user.must_change_password = True
    for row in (await session.scalars(select(Session).where(Session.user_id == user.id))).all():
        row.revoked = True
    await write_audit(
        session,
        action="iam.user.reset_password",
        user_id=auth.user.id,
        resource_type="user",
        resource_id=user.id,
        ip_address=ip,
        user_agent=ua,
        after={"must_change_password": True},
    )
    await session.commit()
    return {"user_id": user.id, "temporary_password": temp_password, "must_change_password": True}


# ---------------------------------------------------------------------------
# Groups
# ---------------------------------------------------------------------------


@router.get("/groups", response_model=Page)
async def list_groups(
    page: int = 1,
    page_size: int = 20,
    auth: AuthContext = Depends(require_permission("iam.groups.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> Page:
    page, page_size = _paginate(page, page_size)
    total = int(await session.scalar(select(func.count()).select_from(Group)) or 0)
    rows = (
        await session.scalars(
            select(Group)
            .options(selectinload(Group.roles))
            .order_by(Group.name.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).all()
    return Page(
        items=[group_to_public(g) for g in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/groups", response_model=GroupPublic, status_code=status.HTTP_201_CREATED)
async def create_group(
    body: GroupCreate,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.groups.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> GroupPublic:
    ip, ua = _client_meta(request)
    if await session.scalar(select(Group).where(Group.name == body.name)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Group name already exists")
    group = Group(
        id=str(uuid4()),
        name=body.name,
        description=body.description,
        color=body.color,
        icon=body.icon,
        status=body.status,
        is_system=False,
    )
    session.add(group)
    await session.flush()
    if body.role_ids:
        await _set_group_roles(session, group, body.role_ids)
    await write_audit(
        session,
        action="iam.group.create",
        user_id=auth.user.id,
        resource_type="group",
        resource_id=group.id,
        ip_address=ip,
        user_agent=ua,
        after={"name": group.name},
    )
    await session.commit()
    loaded = await _load_group(session, group.id)
    assert loaded is not None
    return group_to_public(loaded)


@router.patch("/groups/{group_id}", response_model=GroupPublic)
async def update_group(
    group_id: str,
    body: GroupUpdate,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.groups.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> GroupPublic:
    ip, ua = _client_meta(request)
    group = await _load_group(session, group_id)
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    data = body.model_dump(exclude_unset=True)
    if group.name == ADMIN_GROUP:
        if "status" in data and data["status"] not in {None, "active"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot disable the Administrador group",
            )
        if "name" in data and data["name"] != ADMIN_GROUP:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot rename the Administrador group",
            )

    if "name" in data and data["name"] is not None:
        conflict = await session.scalar(
            select(Group).where(Group.name == data["name"], Group.id != group.id)
        )
        if conflict:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Group name already exists")

    role_ids = data.pop("role_ids", None)
    before = {"name": group.name, "status": group.status}
    for key, value in data.items():
        setattr(group, key, value)
    if role_ids is not None:
        await _set_group_roles(session, group, role_ids)

    await write_audit(
        session,
        action="iam.group.update",
        user_id=auth.user.id,
        resource_type="group",
        resource_id=group.id,
        ip_address=ip,
        user_agent=ua,
        before=before,
        after={"name": group.name, "status": group.status},
    )
    await session.commit()
    loaded = await _load_group(session, group.id)
    assert loaded is not None
    return group_to_public(loaded)


@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(
    group_id: str,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.groups.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    ip, ua = _client_meta(request)
    group = await _load_group(session, group_id)
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    if group.is_system or group.name == ADMIN_GROUP:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete system group",
        )
    await write_audit(
        session,
        action="iam.group.delete",
        user_id=auth.user.id,
        resource_type="group",
        resource_id=group.id,
        ip_address=ip,
        user_agent=ua,
        before={"name": group.name},
    )
    await session.delete(group)
    await session.commit()


@router.post("/groups/{group_id}/duplicate", response_model=GroupPublic, status_code=status.HTTP_201_CREATED)
async def duplicate_group(
    group_id: str,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.groups.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> GroupPublic:
    ip, ua = _client_meta(request)
    source = await _load_group(session, group_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    base_name = f"{source.name} (copy)"
    name = base_name
    suffix = 2
    while await session.scalar(select(Group).where(Group.name == name)):
        name = f"{base_name} {suffix}"
        suffix += 1

    group = Group(
        id=str(uuid4()),
        name=name,
        description=source.description,
        color=source.color,
        icon=source.icon,
        status=source.status,
        is_system=False,
    )
    session.add(group)
    await session.flush()
    await _set_group_roles(session, group, [r.id for r in source.roles])
    await write_audit(
        session,
        action="iam.group.duplicate",
        user_id=auth.user.id,
        resource_type="group",
        resource_id=group.id,
        ip_address=ip,
        user_agent=ua,
        after={"name": group.name, "source_id": source.id},
    )
    await session.commit()
    loaded = await _load_group(session, group.id)
    assert loaded is not None
    return group_to_public(loaded)


# ---------------------------------------------------------------------------
# Roles
# ---------------------------------------------------------------------------


@router.get("/roles", response_model=Page)
async def list_roles(
    page: int = 1,
    page_size: int = 20,
    auth: AuthContext = Depends(require_permission("iam.roles.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> Page:
    page, page_size = _paginate(page, page_size)
    total = int(await session.scalar(select(func.count()).select_from(Role)) or 0)
    rows = (
        await session.scalars(
            select(Role)
            .options(selectinload(Role.permissions))
            .order_by(Role.priority.asc(), Role.name.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).all()
    return Page(
        items=[role_to_public(r) for r in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/roles", response_model=RolePublic, status_code=status.HTTP_201_CREATED)
async def create_role(
    body: RoleCreate,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.roles.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> RolePublic:
    ip, ua = _client_meta(request)
    if await session.scalar(select(Role).where(Role.name == body.name)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Role name already exists")
    role = Role(
        id=str(uuid4()),
        name=body.name,
        description=body.description,
        priority=body.priority,
        status=body.status,
        is_system=False,
    )
    session.add(role)
    await session.flush()
    if body.permission_ids:
        await _set_role_permissions(session, role, body.permission_ids)
    await write_audit(
        session,
        action="iam.role.create",
        user_id=auth.user.id,
        resource_type="role",
        resource_id=role.id,
        ip_address=ip,
        user_agent=ua,
        after={"name": role.name},
    )
    await session.commit()
    loaded = await _load_role(session, role.id)
    assert loaded is not None
    return role_to_public(loaded)


@router.patch("/roles/{role_id}", response_model=RolePublic)
async def update_role(
    role_id: str,
    body: RoleUpdate,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.roles.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> RolePublic:
    ip, ua = _client_meta(request)
    role = await _load_role(session, role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    data = body.model_dump(exclude_unset=True)
    if "name" in data and data["name"] is not None:
        conflict = await session.scalar(
            select(Role).where(Role.name == data["name"], Role.id != role.id)
        )
        if conflict:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Role name already exists")

    permission_ids = data.pop("permission_ids", None)
    before = {"name": role.name, "status": role.status}
    for key, value in data.items():
        setattr(role, key, value)
    if permission_ids is not None:
        await _set_role_permissions(session, role, permission_ids)

    await write_audit(
        session,
        action="iam.role.update",
        user_id=auth.user.id,
        resource_type="role",
        resource_id=role.id,
        ip_address=ip,
        user_agent=ua,
        before=before,
        after={"name": role.name, "status": role.status},
    )
    await session.commit()
    loaded = await _load_role(session, role.id)
    assert loaded is not None
    return role_to_public(loaded)


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_id: str,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.roles.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    ip, ua = _client_meta(request)
    role = await _load_role(session, role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    if role.is_system:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete system role")
    await write_audit(
        session,
        action="iam.role.delete",
        user_id=auth.user.id,
        resource_type="role",
        resource_id=role.id,
        ip_address=ip,
        user_agent=ua,
        before={"name": role.name},
    )
    await session.delete(role)
    await session.commit()


@router.put("/roles/{role_id}/permissions", response_model=RolePublic)
async def update_role_permissions(
    role_id: str,
    body: MatrixUpdate,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.roles.manage", "iam.permissions.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> RolePublic:
    ip, ua = _client_meta(request)
    role = await _load_role(session, role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    before_ids = [p.id for p in role.permissions]
    await _set_role_permissions(session, role, body.permission_ids)
    await write_audit(
        session,
        action="iam.role.permissions",
        user_id=auth.user.id,
        resource_type="role",
        resource_id=role.id,
        ip_address=ip,
        user_agent=ua,
        before={"permission_ids": before_ids},
        after={"permission_ids": body.permission_ids},
    )
    await session.commit()
    loaded = await _load_role(session, role.id)
    assert loaded is not None
    return role_to_public(loaded)


# ---------------------------------------------------------------------------
# Permissions
# ---------------------------------------------------------------------------


@router.get("/permissions/matrix")
async def permissions_matrix(
    auth: AuthContext = Depends(require_permission("iam.permissions.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, list[PermissionPublic]]:
    rows = (
        await session.scalars(select(Permission).order_by(Permission.category.asc(), Permission.code.asc()))
    ).all()
    matrix: dict[str, list[PermissionPublic]] = {}
    for perm in rows:
        matrix.setdefault(perm.category, []).append(permission_to_public(perm))
    return matrix


@router.get("/permissions", response_model=Page)
async def list_permissions(
    page: int = 1,
    page_size: int = 20,
    auth: AuthContext = Depends(require_permission("iam.permissions.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> Page:
    page, page_size = _paginate(page, page_size)
    total = int(await session.scalar(select(func.count()).select_from(Permission)) or 0)
    rows = (
        await session.scalars(
            select(Permission)
            .order_by(Permission.category.asc(), Permission.code.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).all()
    return Page(
        items=[permission_to_public(p) for p in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/permissions", response_model=PermissionPublic, status_code=status.HTTP_201_CREATED)
async def create_permission(
    body: PermissionCreate,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    session: AsyncSession = Depends(get_db_session),
) -> PermissionPublic:
    ip, ua = _client_meta(request)
    if await session.scalar(select(Permission).where(Permission.code == body.code)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Permission code already exists")
    perm = Permission(
        id=str(uuid4()),
        name=body.name,
        code=body.code,
        category=body.category,
        description=body.description,
    )
    session.add(perm)
    await write_audit(
        session,
        action="iam.permission.create",
        user_id=auth.user.id,
        resource_type="permission",
        resource_id=perm.id,
        ip_address=ip,
        user_agent=ua,
        after={"code": perm.code},
    )
    await session.commit()
    await session.refresh(perm)
    return permission_to_public(perm)


@router.patch("/permissions/{permission_id}", response_model=PermissionPublic)
async def update_permission(
    permission_id: str,
    body: PermissionUpdate,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    session: AsyncSession = Depends(get_db_session),
) -> PermissionPublic:
    ip, ua = _client_meta(request)
    perm = await session.get(Permission, permission_id)
    if not perm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")
    data = body.model_dump(exclude_unset=True)
    if "code" in data and data["code"] is not None:
        conflict = await session.scalar(
            select(Permission).where(Permission.code == data["code"], Permission.id != perm.id)
        )
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Permission code already exists"
            )
    before = {"code": perm.code, "name": perm.name}
    for key, value in data.items():
        setattr(perm, key, value)
    await write_audit(
        session,
        action="iam.permission.update",
        user_id=auth.user.id,
        resource_type="permission",
        resource_id=perm.id,
        ip_address=ip,
        user_agent=ua,
        before=before,
        after={"code": perm.code, "name": perm.name},
    )
    await session.commit()
    await session.refresh(perm)
    return permission_to_public(perm)


@router.delete("/permissions/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_permission(
    permission_id: str,
    request: Request,
    auth: AuthContext = Depends(require_admin),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    ip, ua = _client_meta(request)
    perm = await session.get(Permission, permission_id)
    if not perm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")
    await write_audit(
        session,
        action="iam.permission.delete",
        user_id=auth.user.id,
        resource_type="permission",
        resource_id=perm.id,
        ip_address=ip,
        user_agent=ua,
        before={"code": perm.code},
    )
    await session.delete(perm)
    await session.commit()


# ---------------------------------------------------------------------------
# Sessions
# ---------------------------------------------------------------------------


@router.get("/sessions", response_model=Page)
async def list_sessions(
    user_id: str | None = None,
    page: int = 1,
    page_size: int = 20,
    auth: AuthContext = Depends(require_permission("iam.sessions.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> Page:
    page, page_size = _paginate(page, page_size)
    stmt = select(Session).where(Session.revoked.is_(False))
    count_stmt = select(func.count()).select_from(Session).where(Session.revoked.is_(False))
    if user_id:
        stmt = stmt.where(Session.user_id == user_id)
        count_stmt = count_stmt.where(Session.user_id == user_id)
    total = int(await session.scalar(count_stmt) or 0)
    rows = (
        await session.scalars(
            stmt.order_by(Session.last_seen_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).all()
    return Page(
        items=[session_to_public(r, current_session_id=auth.session_id) for r in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.delete("/sessions/user/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_user_sessions(
    user_id: str,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.sessions.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    ip, ua = _client_meta(request)
    rows = (await session.scalars(select(Session).where(Session.user_id == user_id))).all()
    for row in rows:
        row.revoked = True
    await write_audit(
        session,
        action="iam.session.revoke_user",
        user_id=auth.user.id,
        resource_type="user",
        resource_id=user_id,
        ip_address=ip,
        user_agent=ua,
        after={"revoked_count": len(rows)},
    )
    await session.commit()


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_session(
    session_id: str,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.sessions.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    ip, ua = _client_meta(request)
    row = await session.get(Session, session_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    row.revoked = True
    await write_audit(
        session,
        action="iam.session.revoke",
        user_id=auth.user.id,
        resource_type="session",
        resource_id=session_id,
        ip_address=ip,
        user_agent=ua,
    )
    await session.commit()


# ---------------------------------------------------------------------------
# Audit logs
# ---------------------------------------------------------------------------


@router.get("/audit-logs", response_model=Page)
async def list_audit_logs(
    q: str | None = None,
    page: int = 1,
    page_size: int = 20,
    auth: AuthContext = Depends(require_permission("iam.audit.view", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> Page:
    page, page_size = _paginate(page, page_size)
    stmt = select(AuditLog)
    count_stmt = select(func.count()).select_from(AuditLog)
    if q:
        like = f"%{q.strip()}%"
        filt = or_(
            AuditLog.action.ilike(like),
            AuditLog.resource_type.ilike(like),
            AuditLog.resource_id.ilike(like),
            AuditLog.ip_address.ilike(like),
        )
        stmt = stmt.where(filt)
        count_stmt = count_stmt.where(filt)
    total = int(await session.scalar(count_stmt) or 0)
    rows = (
        await session.scalars(
            stmt.order_by(AuditLog.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).all()
    return Page(
        items=[audit_to_public(r) for r in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


# ---------------------------------------------------------------------------
# Invitations
# ---------------------------------------------------------------------------


@router.get("/invitations", response_model=Page)
async def list_invitations(
    page: int = 1,
    page_size: int = 20,
    auth: AuthContext = Depends(require_permission("iam.invitations.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> Page:
    page, page_size = _paginate(page, page_size)
    total = int(await session.scalar(select(func.count()).select_from(Invitation)) or 0)
    rows = (
        await session.scalars(
            select(Invitation)
            .order_by(Invitation.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).all()
    return Page(
        items=[invitation_to_public(r) for r in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/invitations", response_model=InvitationPublic, status_code=status.HTTP_201_CREATED)
async def create_invitation(
    body: InvitationCreate,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.invitations.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> InvitationPublic:
    ip, ua = _client_meta(request)
    email = str(body.email).lower()
    if await session.scalar(select(User).where(User.email == email, User.status != "deleted")):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")
    if body.group_id and not await session.get(Group, body.group_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Group not found")

    raw = new_token()
    invite = Invitation(
        id=str(uuid4()),
        email=email,
        group_id=body.group_id,
        invited_by=auth.user.id,
        token_hash=hash_token(raw),
        status="pending",
        expires_at=datetime.now(UTC) + timedelta(hours=body.expires_in_hours),
    )
    session.add(invite)
    await write_audit(
        session,
        action="iam.invitation.create",
        user_id=auth.user.id,
        resource_type="invitation",
        resource_id=invite.id,
        ip_address=ip,
        user_agent=ua,
        after={"email": email, "group_id": body.group_id},
    )
    await session.commit()
    await session.refresh(invite)
    return invitation_to_public(invite, invite_token=raw)


@router.post("/invitations/accept", response_model=UserPublic)
async def accept_invitation(
    body: AcceptInvitationRequest,
    request: Request,
    session: AsyncSession = Depends(get_db_session),
) -> UserPublic:
    """Public endpoint — no authentication required."""
    ip, ua = _client_meta(request)
    invite = await session.scalar(
        select(Invitation).where(
            Invitation.token_hash == hash_token(body.token),
            Invitation.status == "pending",
        )
    )
    if not invite or invite.expires_at.replace(tzinfo=UTC) < datetime.now(UTC):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired invitation")

    email = invite.email.lower()
    if await session.scalar(select(User).where(or_(User.email == email, User.username == body.username))):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or username already exists")

    user = User(
        id=str(uuid4()),
        first_name=body.first_name,
        last_name=body.last_name,
        username=body.username,
        email=email,
        password_hash=hash_password(body.password),
        status="active",
        primary_group_id=invite.group_id,
        email_verified=True,
        must_change_password=False,
    )
    session.add(user)
    await session.flush()
    if invite.group_id:
        session.add(UserGroup(user_id=user.id, group_id=invite.group_id))
    invite.status = "accepted"
    invite.accepted_at = datetime.now(UTC)
    await write_audit(
        session,
        action="iam.invitation.accept",
        user_id=user.id,
        resource_type="invitation",
        resource_id=invite.id,
        ip_address=ip,
        user_agent=ua,
        after={"user_id": user.id},
    )
    await session.commit()
    loaded = await _load_user(session, user.id)
    assert loaded is not None
    return await _user_public_response(session, loaded)


@router.post("/invitations/{invitation_id}/resend", response_model=InvitationPublic)
async def resend_invitation(
    invitation_id: str,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.invitations.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> InvitationPublic:
    ip, ua = _client_meta(request)
    invite = await session.get(Invitation, invitation_id)
    if not invite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    if invite.status not in {"pending", "cancelled"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invitation cannot be resent"
        )
    raw = new_token()
    invite.token_hash = hash_token(raw)
    invite.status = "pending"
    invite.expires_at = datetime.now(UTC) + timedelta(hours=72)
    invite.accepted_at = None
    await write_audit(
        session,
        action="iam.invitation.resend",
        user_id=auth.user.id,
        resource_type="invitation",
        resource_id=invite.id,
        ip_address=ip,
        user_agent=ua,
    )
    await session.commit()
    await session.refresh(invite)
    return invitation_to_public(invite, invite_token=raw)


@router.post("/invitations/{invitation_id}/cancel", response_model=InvitationPublic)
async def cancel_invitation(
    invitation_id: str,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.invitations.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> InvitationPublic:
    ip, ua = _client_meta(request)
    invite = await session.get(Invitation, invitation_id)
    if not invite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    if invite.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending invitations can be cancelled"
        )
    invite.status = "cancelled"
    await write_audit(
        session,
        action="iam.invitation.cancel",
        user_id=auth.user.id,
        resource_type="invitation",
        resource_id=invite.id,
        ip_address=ip,
        user_agent=ua,
    )
    await session.commit()
    await session.refresh(invite)
    return invitation_to_public(invite)


# ---------------------------------------------------------------------------
# Shares
# ---------------------------------------------------------------------------


@router.get("/shares", response_model=Page)
async def list_shares(
    page: int = 1,
    page_size: int = 20,
    auth: AuthContext = Depends(require_permission("iam.shares.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> Page:
    page, page_size = _paginate(page, page_size)
    total = int(await session.scalar(select(func.count()).select_from(Share)) or 0)
    rows = (
        await session.scalars(
            select(Share)
            .order_by(Share.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).all()
    return Page(
        items=[share_to_public(r) for r in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/shares", response_model=SharePublic, status_code=status.HTTP_201_CREATED)
async def create_share(
    body: ShareCreate,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.shares.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> SharePublic:
    ip, ua = _client_meta(request)
    if body.grantee_type == "user":
        grantee = await session.get(User, body.grantee_id)
        if not grantee or grantee.status == "deleted":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Grantee user not found")
    else:
        grantee_group = await session.get(Group, body.grantee_id)
        if not grantee_group:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Grantee group not found")

    share = Share(
        id=str(uuid4()),
        resource_type=body.resource_type,
        resource_id=body.resource_id,
        permission=body.permission,
        grantee_type=body.grantee_type,
        grantee_id=body.grantee_id,
        granted_by=auth.user.id,
    )
    session.add(share)
    await write_audit(
        session,
        action="iam.share.create",
        user_id=auth.user.id,
        resource_type="share",
        resource_id=share.id,
        ip_address=ip,
        user_agent=ua,
        after=body.model_dump(),
    )
    await session.commit()
    await session.refresh(share)
    return share_to_public(share)


@router.delete("/shares/{share_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_share(
    share_id: str,
    request: Request,
    auth: AuthContext = Depends(require_permission("iam.shares.manage", "iam.admin")),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    ip, ua = _client_meta(request)
    share = await session.get(Share, share_id)
    if not share:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Share not found")
    await write_audit(
        session,
        action="iam.share.delete",
        user_id=auth.user.id,
        resource_type="share",
        resource_id=share.id,
        ip_address=ip,
        user_agent=ua,
        before={
            "resource_type": share.resource_type,
            "resource_id": share.resource_id,
            "grantee_id": share.grantee_id,
        },
    )
    await session.delete(share)
    await session.commit()
