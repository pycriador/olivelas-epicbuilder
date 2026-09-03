from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.config import get_env_settings, get_settings
from app.db.session import create_engine, dispose_engine, get_session_factory
from app.iam.routers_admin import router as iam_admin_router
from app.iam.routers_auth import router as iam_auth_router
from app.routers import areas, cases, external_integrations, gallery, health, hub, integrations, portal
from app.routers.settings import router as settings_router
from app.settings_store import reload_overrides


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=()",
        )
        return response


@asynccontextmanager
async def lifespan(_app: FastAPI):
    env = get_env_settings()
    create_engine(env.resolved_database_url, schema=env.db_schema)
    factory = get_session_factory()
    if factory is not None:
        async with factory() as session:
            try:
                await reload_overrides(session)
            except Exception:
                # Table may not exist yet before migration 004
                pass
    yield
    await dispose_engine()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(SecurityHeadersMiddleware)
    app.include_router(health.router)
    app.include_router(health.api_router)
    app.include_router(iam_auth_router)
    app.include_router(iam_admin_router)
    app.include_router(settings_router)
    app.include_router(external_integrations.router)
    app.include_router(gallery.router)
    app.include_router(portal.router)
    app.include_router(cases.router)
    app.include_router(areas.router)
    app.include_router(integrations.router)
    app.include_router(hub.router)
    return app


app = create_app()
