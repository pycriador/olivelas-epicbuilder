from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.schemas.portal import PortalSnapshot


@pytest.mark.asyncio
async def test_integrations_status_endpoint(app):
    mocked = {
        "jira": {"ok": True, "detail": "Connected"},
        "confluence": {"ok": True, "detail": "1 spaces: Olivelas"},
        "gemini": {"ok": True, "detail": "ok"},
    }
    with patch(
        "app.routers.external_integrations.integrations_status",
        new_callable=AsyncMock,
        return_value=mocked,
    ):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/diagnostics/integrations")
    assert response.status_code == 200
    assert response.json()["jira"]["ok"] is True


@pytest.mark.asyncio
async def test_portal_snapshot_put(app):
    payload = PortalSnapshot(cases=[{"id": "seed", "nome": "Seed"}], areas=["Produto"])
    with patch(
        "app.routers.portal.replace_portal_snapshot",
        new_callable=AsyncMock,
        return_value=payload,
    ):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.put(
                "/api/v1/portal/snapshot",
                json=payload.model_dump(),
            )
    assert response.status_code == 200
    assert response.json()["cases"][0]["id"] == "seed"
