import os
import sys
from collections.abc import AsyncIterator
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault("REQUIRE_AUTH", "false")
os.environ.setdefault("JWT_SECRET", "test-secret")


@pytest.fixture
def app():
    from app.config import clear_settings_cache
    from app.db.session import get_db_session
    from app.main import create_app

    clear_settings_cache()

    with patch("app.main.get_settings") as get_settings_main:
        settings = MagicMock()
        settings.app_name = "test"
        settings.cors_origin_list = ["http://localhost:5173"]
        settings.resolved_database_url = "postgresql+asyncpg://test:test@localhost:5432/test"
        settings.db_schema = "portal"
        settings.require_auth = False
        settings.jwt_secret = "test-secret"
        settings.jwt_algorithm = "HS256"
        settings.jwt_access_ttl_minutes = 15
        settings.jwt_refresh_ttl_days = 7
        settings.jwt_refresh_remember_days = 30
        settings.cookie_secure = False
        settings.cookie_samesite = "lax"
        settings.settings_encryption_key = ""
        get_settings_main.return_value = settings
        with patch("app.config.get_settings", return_value=settings):
            with patch("app.config.get_env_settings", return_value=settings):
                with patch("app.iam.guards.get_settings", return_value=settings):
                    with patch("app.main.get_env_settings", return_value=settings):
                        with patch("app.main.create_engine") as create_engine:
                            create_engine.return_value = object()
                            with patch("app.main.dispose_engine", new_callable=AsyncMock):
                                with patch("app.main.reload_overrides", new_callable=AsyncMock):
                                    test_app = create_app()

                                    async def override_db() -> AsyncIterator[AsyncMock]:
                                        yield AsyncMock()

                                    test_app.dependency_overrides[get_db_session] = override_db
                                    yield test_app
                                    test_app.dependency_overrides.clear()
    clear_settings_cache()
