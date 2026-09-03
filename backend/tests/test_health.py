from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.config import Settings, clear_settings_cache as reset_settings_cache
from app.main import create_app


@pytest.fixture(autouse=True)
def _reset_settings_cache():
    reset_settings_cache()
    yield
    reset_settings_cache()


@pytest.fixture
def test_settings() -> Settings:
    return Settings(
        DATABASE_URL="postgresql+asyncpg://test:test@localhost:5432/test",
        CORS_ORIGINS="http://localhost:5173",
    )


@pytest.fixture
def app(test_settings: Settings):
    with patch("app.main.get_settings", return_value=test_settings):
        with patch("app.main.get_env_settings", return_value=test_settings):
            with patch("app.main.create_engine") as create_engine:
                create_engine.return_value = object()
                with patch("app.main.dispose_engine", new_callable=AsyncMock):
                    with patch("app.main.reload_overrides", new_callable=AsyncMock):
                        yield create_app()


@pytest.mark.asyncio
async def test_health_liveness(app):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_health_db_ok(app):
    with patch("app.routers.health.check_db_connection", new_callable=AsyncMock):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/health/db")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "connected"}


@pytest.mark.asyncio
async def test_health_db_unavailable(app):
    with patch(
        "app.routers.health.check_db_connection",
        new_callable=AsyncMock,
        side_effect=RuntimeError("connection refused"),
    ):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/health/db")
    assert response.status_code == 503
