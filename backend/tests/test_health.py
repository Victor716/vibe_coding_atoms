from __future__ import annotations

from httpx import AsyncClient


async def test_health_ok(client: AsyncClient) -> None:
    r = await client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert body["sandbox"] is True
    assert body["llm"] is True
