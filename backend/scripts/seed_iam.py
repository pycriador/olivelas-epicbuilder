"""Seed IAM schema: permissions, system groups/roles, and bootstrap admin."""

from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.config import get_settings  # noqa: E402
from app.db.session import create_engine, create_session_factory, dispose_engine  # noqa: E402
from app.iam.service import ensure_seed  # noqa: E402


async def main() -> None:
    settings = get_settings()
    admin_email = os.environ.get("IAM_ADMIN_EMAIL", settings.iam_admin_email)
    admin_username = os.environ.get("IAM_ADMIN_USERNAME", settings.iam_admin_username)
    admin_password = os.environ.get("IAM_ADMIN_PASSWORD", settings.iam_admin_password)

    engine = create_engine(settings.resolved_database_url, schema=settings.db_schema)
    session_factory = create_session_factory(engine)
    try:
        async with session_factory() as session:
            user = await ensure_seed(
                session,
                admin_email=admin_email,
                admin_username=admin_username,
                admin_password=admin_password,
            )
            print(
                f"IAM seed OK — admin user id={user.id} email={user.email} username={user.username}"
            )
    finally:
        await dispose_engine()


if __name__ == "__main__":
    asyncio.run(main())
