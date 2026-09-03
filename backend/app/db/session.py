from collections.abc import AsyncIterator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.db.ssl import asyncpg_connect_kwargs

_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def create_engine(database_url: str, *, schema: str = "portal") -> AsyncEngine:
    global _engine, _session_factory
    _engine = create_async_engine(
        database_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        connect_args={
            "server_settings": {"search_path": f"{schema},iam,public"},
            **asyncpg_connect_kwargs(),
        },
    )
    _session_factory = async_sessionmaker(_engine, expire_on_commit=False)
    return _engine


def create_session_factory(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    global _session_factory
    _session_factory = async_sessionmaker(engine, expire_on_commit=False)
    return _session_factory


def get_session_factory() -> async_sessionmaker[AsyncSession] | None:
    return _session_factory


async def dispose_engine() -> None:
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _session_factory = None


async def check_db_connection() -> None:
    if _engine is None:
        raise RuntimeError("Database engine is not initialized")
    async with _engine.connect() as connection:
        await connection.execute(text("SELECT 1"))


async def get_db_session() -> AsyncIterator[AsyncSession]:
    if _session_factory is None:
        raise RuntimeError("Database session factory is not initialized")
    async with _session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
