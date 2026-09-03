from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.session import get_db_session
from app.models.portal import GalleryMedia


@pytest.mark.asyncio
async def test_gallery_item_serves_stored_bytes(app):
    row = GalleryMedia(
        id="12345",
        content=b"\x89PNG\r\n",
        mime_type="image/png",
        filename="screenshot.png",
    )

    async def override_db():
        session = AsyncMock()
        session.get = AsyncMock(return_value=row)
        yield session

    app.dependency_overrides[get_db_session] = override_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/gallery/12345")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.content == b"\x89PNG\r\n"
    assert response.headers["content-type"] == "image/png"


@pytest.mark.asyncio
async def test_gallery_item_lazy_fetches_from_jira(app):
    row = GalleryMedia(
        id="99999",
        content=b"JPEG",
        mime_type="image/jpeg",
        filename="photo.jpg",
    )

    async def override_db():
        session = AsyncMock()
        session.get = AsyncMock(side_effect=[None, row])
        yield session

    app.dependency_overrides[get_db_session] = override_db
    try:
        with patch(
            "app.routers.gallery.persist_jira_attachment",
            new_callable=AsyncMock,
            return_value="/api/v1/gallery/99999",
        ) as persist:
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                response = await client.get("/api/v1/gallery/99999")
            persist.assert_awaited_once()
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.content == b"JPEG"
