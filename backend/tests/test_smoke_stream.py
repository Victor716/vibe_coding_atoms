"""M1 Hello-SSE 契约测试：POST 建会话 → GET stream 收 3 帧。"""
from __future__ import annotations

import json

from httpx import AsyncClient


async def test_create_build_returns_id(client: AsyncClient) -> None:
    r = await client.post(
        "/api/builds",
        json={"prompt": "hello", "mode": "standard"},
    )
    assert r.status_code == 201
    sid = r.json()["id"]
    assert sid.startswith("bld_")

    r2 = await client.get(f"/api/builds/{sid}")
    assert r2.status_code == 200
    body = r2.json()
    assert body["prompt"] == "hello"
    assert body["status"] == "pending"


async def test_stream_hello(client: AsyncClient) -> None:
    r = await client.post("/api/builds", json={"prompt": "ping"})
    sid = r.json()["id"]

    events: list[tuple[str, dict[str, object]]] = []
    async with client.stream("GET", f"/api/builds/{sid}/stream") as resp:
        assert resp.status_code == 200
        current_event: str | None = None
        async for raw in resp.aiter_lines():
            line = raw.strip()
            if line.startswith("event:"):
                current_event = line.split(":", 1)[1].strip()
            elif line.startswith("data:") and current_event is not None:
                payload = json.loads(line.split(":", 1)[1].strip())
                events.append((current_event, payload))
                current_event = None

    types = [t for t, _ in events]
    assert "status" in types
    assert "prd_delta" in types
    assert types[-1] == "done"


async def test_stream_404(client: AsyncClient) -> None:
    r = await client.get("/api/builds/nope/stream")
    assert r.status_code == 404
