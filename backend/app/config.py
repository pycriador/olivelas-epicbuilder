from functools import lru_cache
from pathlib import Path
from urllib.parse import quote_plus

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _env_files() -> tuple[str, ...]:
    backend_root = Path(__file__).resolve().parents[1]
    repo_root = backend_root.parent
    candidates = (
        backend_root / ".env",
        repo_root / ".env",
    )
    return tuple(str(path) for path in candidates if path.is_file())


def _strip_password(value: str) -> str:
    value = value.strip()
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        return value[1:-1]
    return value


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_files(),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "AIOPS App Model API"
    # Include 8080 — Lovable/Vite dev server default in this repo
    cors_origins: str = (
        "http://localhost:5173,"
        "http://localhost:8080,"
        "http://localhost:3000,"
        "http://127.0.0.1:5173,"
        "http://127.0.0.1:8080"
    )

    database_url: str | None = Field(default=None, validation_alias="DATABASE_URL")
    db_host: str | None = None
    db_port: int = 5432
    db_name: str | None = None
    db_user: str | None = None
    db_password: str | None = None
    db_schema: str = "portal"
    db_sslmode: str = Field(default="require", validation_alias="DB_SSLMODE")
    db_ssl_root_cert: str | None = Field(default=None, validation_alias="DB_SSL_ROOT_CERT")
    db_ssl_insecure: bool = Field(default=False, validation_alias="DB_SSL_INSECURE")
    http_ssl_insecure: bool = Field(default=False, validation_alias="HTTP_SSL_INSECURE")
    ssl_insecure: bool = Field(default=False, validation_alias="SSL_INSECURE")

    jira_base_url: str = ""
    jira_email: str = ""
    jira_api_token: str = ""
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.1-flash-lite"
    confluence_status_folder_id: str = "6105464844"

    # --- IAM / JWT ---
    jwt_secret: str = Field(
        default="dev-only-change-me-aiops-app-model-jwt-secret-32b",
        validation_alias="JWT_SECRET",
    )
    jwt_algorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    jwt_access_ttl_minutes: int = Field(default=15, validation_alias="JWT_ACCESS_TTL_MINUTES")
    jwt_refresh_ttl_days: int = Field(default=7, validation_alias="JWT_REFRESH_TTL_DAYS")
    jwt_refresh_remember_days: int = Field(default=30, validation_alias="JWT_REFRESH_REMEMBER_DAYS")
    cookie_secure: bool = Field(default=False, validation_alias="COOKIE_SECURE")
    cookie_samesite: str = Field(default="lax", validation_alias="COOKIE_SAMESITE")
    login_max_attempts: int = Field(default=5, validation_alias="LOGIN_MAX_ATTEMPTS")
    login_lockout_minutes: int = Field(default=15, validation_alias="LOGIN_LOCKOUT_MINUTES")
    expose_dev_tokens: bool = Field(default=True, validation_alias="EXPOSE_DEV_TOKENS")
    iam_admin_email: str = Field(default="admin@loft.local", validation_alias="IAM_ADMIN_EMAIL")
    iam_admin_username: str = Field(default="admin", validation_alias="IAM_ADMIN_USERNAME")
    iam_admin_password: str = Field(default="ChangeMe123!", validation_alias="IAM_ADMIN_PASSWORD")
    require_auth: bool = Field(default=True, validation_alias="REQUIRE_AUTH")
    settings_encryption_key: str = Field(default="", validation_alias="SETTINGS_ENCRYPTION_KEY")

    @property
    def atlassian_base_url(self) -> str:
        return self.jira_base_url.rstrip("/")

    @property
    def gemini_model_name(self) -> str:
        return self.gemini_model.strip() or "gemini-3.1-flash-lite"

    @property
    def resolved_database_url(self) -> str:
        if self.database_url and self.database_url.strip():
            return self.database_url.strip()
        missing = [
            name
            for name, value in (
                ("DB_HOST", self.db_host),
                ("DB_NAME", self.db_name),
                ("DB_USER", self.db_user),
                ("DB_PASSWORD", self.db_password),
            )
            if not value
        ]
        if missing:
            raise ValueError(
                "Database not configured. Set DATABASE_URL or all of: "
                + ", ".join(missing)
            )
        user = quote_plus(str(self.db_user))
        password = quote_plus(_strip_password(str(self.db_password)))
        host = str(self.db_host)
        port = self.db_port
        name = str(self.db_name)
        return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{name}"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def skip_tls_verify(self) -> bool:
        """Local dev only (e.g. Netskope) — disable outbound/server TLS verification."""
        return self.db_ssl_insecure or self.http_ssl_insecure or self.ssl_insecure


@lru_cache
def get_env_settings() -> Settings:
    """Settings loaded only from environment / .env files (no DB overlay)."""
    return Settings()


def get_settings() -> Settings:
    """Effective settings: environment plus encrypted DB overrides when loaded."""
    base = get_env_settings()
    try:
        from app.settings_store import apply_overrides_to

        return apply_overrides_to(base)
    except Exception:
        return base


def clear_settings_cache() -> None:
    get_env_settings.cache_clear()
