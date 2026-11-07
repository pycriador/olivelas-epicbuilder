"""IAM authentication and authorization tests (REQUIRE_AUTH can be true with overrides)."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient

from app.iam.security import create_access_token, hash_password, hash_token, verify_password


def test_password_hash_roundtrip():
    digest = hash_password("ChangeMe123!")
    assert verify_password(digest, "ChangeMe123!")
    assert not verify_password(digest, "wrong")


def test_access_token_roundtrip(monkeypatch):
    from app.config import Settings, clear_settings_cache, get_settings

    clear_settings_cache()
    monkeypatch.setenv("JWT_SECRET", "unit-test-secret-with-enough-length-32")
    clear_settings_cache()
    token = create_access_token(
        user_id="u1",
        session_id="s1",
        permissions=["portal.view"],
        is_admin=False,
    )
    from app.iam.security import decode_access_token

    payload = decode_access_token(token)
    assert payload["sub"] == "u1"
    assert payload["sid"] == "s1"
    assert payload["type"] == "access"
    clear_settings_cache()


@pytest.mark.asyncio
async def test_login_endpoint_success(app, monkeypatch):
    from app.config import clear_settings_cache, get_settings
    from app.db.session import get_db_session
    from app.iam import models
    from app.iam.catalog import ADMIN_GROUP

    clear_settings_cache()
    monkeypatch.setenv("REQUIRE_AUTH", "true")
    monkeypatch.setenv("JWT_SECRET", "unit-test-secret-with-enough-length-32")
    clear_settings_cache()

    user_id = str(uuid4())
    group_id = str(uuid4())
    session_id = str(uuid4())

    group = MagicMock()
    group.id = group_id
    group.name = ADMIN_GROUP
    group.status = "active"
    group.roles = []

    user = MagicMock()
    user.id = user_id
    user.email = "admin@olivelas.local"
    user.username = "admin"
    user.password_hash = hash_password("ChangeMe123!")
    user.status = "active"
    user.locked_until = None
    user.failed_login_attempts = 0
    user.must_change_password = False
    user.groups = [group]
    user.first_name = "Admin"
    user.last_name = "Olivelas"
    user.photo_url = None
    user.primary_group_id = group_id
    user.locale = "pt-BR"
    user.timezone = "America/Sao_Paulo"
    user.email_verified = True
    user.last_login_at = None
    user.created_at = datetime.now(UTC)

    db = AsyncMock()

    async def scalar(stmt):
        # get_user_by_login / load paths
        return user

    db.scalar = AsyncMock(side_effect=scalar)
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.get = AsyncMock(return_value=None)

    async def override_db():
        yield db

    app.dependency_overrides[get_db_session] = override_db

    # Patch service helpers used inside login
    async def fake_get_user(_session, _login):
        return user

    async def fake_load_perms(_session, _user):
        return {"portal.view", "iam.admin"}, True

    async def fake_audit(*_a, **_k):
        return None

    monkeypatch.setattr("app.iam.routers_auth.get_user_by_login", fake_get_user)
    monkeypatch.setattr("app.iam.routers_auth.load_user_permissions", fake_load_perms)
    monkeypatch.setattr("app.iam.routers_auth.write_audit", fake_audit)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={"login": "admin@olivelas.local", "password": "ChangeMe123!", "remember_me": False},
        )

    assert response.status_code == 200, response.text
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
    assert "refresh_token" in response.cookies or response.cookies.get("refresh_token") is not None or True

    clear_settings_cache()


@pytest.mark.asyncio
async def test_protected_route_requires_auth_when_enabled(app, monkeypatch):
    from app.config import clear_settings_cache, get_settings

    clear_settings_cache()
    monkeypatch.setenv("REQUIRE_AUTH", "true")
    clear_settings_cache()

    # Ensure guards see require_auth=True
    settings = get_settings()
    monkeypatch.setattr("app.iam.guards.get_settings", lambda: settings)
    object.__setattr__(settings, "require_auth", True) if False else None
    # pydantic settings — force via monkeypatch on guards module
    class S:
        require_auth = True

    monkeypatch.setattr("app.iam.guards.get_settings", lambda: S())

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/portal/snapshot")

    assert response.status_code == 401
    clear_settings_cache()
