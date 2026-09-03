from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.schemas.portal import PortalSnapshot


@pytest.mark.asyncio
async def test_portal_snapshot_get(app):
    snapshot = PortalSnapshot(cases=[{"id": "c1", "nome": "Test"}], areas=["Engenharia"])
    with patch("app.routers.portal.load_portal_snapshot", new_callable=AsyncMock, return_value=snapshot):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/portal/snapshot")
    assert response.status_code == 200
    body = response.json()
    assert body["cases"][0]["id"] == "c1"
    assert body["areas"] == ["Engenharia"]
