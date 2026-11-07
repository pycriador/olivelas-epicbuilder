from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.iam.catalog import (
    ADMIN_GROUP,
    ADMIN_ROLE,
    EDITOR_PERMISSION_CODES,
    EDITORS_GROUP,
    EDITORS_ROLE,
    PERMISSIONS,
)
from app.iam.models import (
    AuditLog,
    Group,
    GroupRole,
    Permission,
    Role,
    RolePermission,
    Session,
    User,
    UserGroup,
)
from app.iam.security import hash_password


async def ensure_seed(
    session: AsyncSession,
    *,
    admin_email: str,
    admin_username: str,
    admin_password: str,
) -> User:
    """Idempotent seed: permissions, system groups/roles, bootstrap admin user."""
    perm_by_code: dict[str, Permission] = {}
    for code, name, category, description in PERMISSIONS:
        existing = await session.scalar(select(Permission).where(Permission.code == code))
        if existing:
            perm_by_code[code] = existing
            continue
        row = Permission(
            id=str(uuid4()),
            code=code,
            name=name,
            category=category,
            description=description,
        )
        session.add(row)
        perm_by_code[code] = row

    admin_role = await session.scalar(select(Role).where(Role.name == ADMIN_ROLE))
    if not admin_role:
        admin_role = Role(
            id=str(uuid4()),
            name=ADMIN_ROLE,
            description="Acesso total ao sistema",
            priority=1,
            is_system=True,
        )
        session.add(admin_role)
    editors_role = await session.scalar(select(Role).where(Role.name == EDITORS_ROLE))
    if not editors_role:
        editors_role = Role(
            id=str(uuid4()),
            name=EDITORS_ROLE,
            description="Edita conteúdo do portal sem administração IAM crítica",
            priority=50,
            is_system=True,
        )
        session.add(editors_role)
    await session.flush()

    # Role → permissions
    for perm in perm_by_code.values():
        link = await session.scalar(
            select(RolePermission).where(
                RolePermission.role_id == admin_role.id,
                RolePermission.permission_id == perm.id,
            )
        )
        if not link:
            session.add(RolePermission(role_id=admin_role.id, permission_id=perm.id))

    for code in EDITOR_PERMISSION_CODES:
        perm = perm_by_code.get(code)
        if not perm:
            continue
        link = await session.scalar(
            select(RolePermission).where(
                RolePermission.role_id == editors_role.id,
                RolePermission.permission_id == perm.id,
            )
        )
        if not link:
            session.add(RolePermission(role_id=editors_role.id, permission_id=perm.id))

    admin_group = await session.scalar(select(Group).where(Group.name == ADMIN_GROUP))
    if not admin_group:
        admin_group = Group(
            id=str(uuid4()),
            name=ADMIN_GROUP,
            description="Grupo com acesso total",
            color="#191F23",
            icon="crown",
            is_system=True,
        )
        session.add(admin_group)
    editors_group = await session.scalar(select(Group).where(Group.name == EDITORS_GROUP))
    if not editors_group:
        editors_group = Group(
            id=str(uuid4()),
            name=EDITORS_GROUP,
            description="Editores de conteúdo do portal",
            color="#FF774A",
            icon="edit",
            is_system=True,
        )
        session.add(editors_group)
    await session.flush()

    for group, role in ((admin_group, admin_role), (editors_group, editors_role)):
        link = await session.scalar(
            select(GroupRole).where(GroupRole.group_id == group.id, GroupRole.role_id == role.id)
        )
        if not link:
            session.add(GroupRole(group_id=group.id, role_id=role.id))

    user = await session.scalar(select(User).where(User.email == admin_email.lower()))
    if not user:
        user = User(
            id=str(uuid4()),
            first_name="Admin",
            last_name="Olivelas",
            username=admin_username,
            email=admin_email.lower(),
            password_hash=hash_password(admin_password),
            status="active",
            primary_group_id=admin_group.id,
            email_verified=True,
            must_change_password=True,
        )
        session.add(user)
        await session.flush()
        session.add(UserGroup(user_id=user.id, group_id=admin_group.id))

    await session.commit()
    return user


async def load_user_permissions(session: AsyncSession, user: User) -> tuple[set[str], bool]:
    """Resolve permissions for a user.

    If ``user.groups`` (with roles/permissions) is already eager-loaded, reuse it
    to avoid an extra round-trip — critical on list endpoints.
    """
    from sqlalchemy import inspect as sa_inspect

    insp = sa_inspect(user)
    if "groups" not in insp.unloaded:
        return permissions_from_loaded_user(user)

    result = await session.execute(
        select(User)
        .where(User.id == user.id)
        .options(
            selectinload(User.groups)
            .selectinload(Group.roles)
            .selectinload(Role.permissions)
        )
    )
    loaded = result.scalar_one()
    return permissions_from_loaded_user(loaded)


def permissions_from_loaded_user(user: User) -> tuple[set[str], bool]:
    """Compute permission codes from an already-loaded user→groups→roles graph."""
    codes: set[str] = set()
    is_admin = False
    for group in user.groups:
        if group.status != "active":
            continue
        if group.name == ADMIN_GROUP:
            is_admin = True
        for role in group.roles:
            if role.status != "active":
                continue
            if role.name == ADMIN_ROLE:
                is_admin = True
            for perm in role.permissions:
                codes.add(perm.code)
    if is_admin:
        codes = {code for code, *_ in PERMISSIONS}
    return codes, is_admin


async def write_audit(
    session: AsyncSession,
    *,
    action: str,
    user_id: str | None = None,
    resource_type: str = "",
    resource_id: str = "",
    ip_address: str = "",
    user_agent: str = "",
    before: dict | None = None,
    after: dict | None = None,
) -> None:
    session.add(
        AuditLog(
            id=str(uuid4()),
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent[:512],
            before=before,
            after=after,
            created_at=datetime.now(UTC),
        )
    )


async def get_user_by_login(session: AsyncSession, login: str) -> User | None:
    value = login.strip().lower()
    stmt = (
        select(User)
        .where((User.email == value) | (User.username == login.strip()))
        .options(
            selectinload(User.groups)
            .selectinload(Group.roles)
            .selectinload(Role.permissions)
        )
    )
    return await session.scalar(stmt)


async def get_session_by_refresh_hash(session: AsyncSession, token_hash: str) -> Session | None:
    return await session.scalar(
        select(Session).where(Session.refresh_token_hash == token_hash, Session.revoked.is_(False))
    )
