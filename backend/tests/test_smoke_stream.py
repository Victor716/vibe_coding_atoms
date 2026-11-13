"""M2/M3 端到端契约测试：POST 建会话 → GET stream 观察
status / prd_delta / code_delta / preview_url / done。

LLM 由 conftest 里的 fake_stream 替身驱动；sandbox.deploy 由 fake_deploy 替身驱动。
"""
from __future__ import annotations

import json

import pytest
from httpx import AsyncClient


async def _collect_sse(
    client: AsyncClient, sid: str, *, force: bool = False
) -> list[tuple[str, dict]]:
    events: list[tuple[str, dict]] = []
    url = f"/api/builds/{sid}/stream" + ("?force=true" if force else "")
    async with client.stream("GET", url) as resp:
        assert resp.status_code == 200
        current: str | None = None
        async for raw in resp.aiter_lines():
            line = raw.strip()
            if line.startswith("event:"):
                current = line.split(":", 1)[1].strip()
            elif line.startswith("data:") and current is not None:
                events.append((current, json.loads(line.split(":", 1)[1].strip())))
                current = None
    return events


async def test_create_build_returns_id(client: AsyncClient) -> None:
    r = await client.post("/api/builds", json={"prompt": "hello", "mode": "standard"})
    assert r.status_code == 201
    sid = r.json()["id"]
    assert sid.startswith("bld_")

    r2 = await client.get(f"/api/builds/{sid}")
    assert r2.status_code == 200
    assert r2.json()["status"] == "pending"


async def test_stream_full_pipeline(client: AsyncClient) -> None:
    r = await client.post("/api/builds", json={"prompt": "ping"})
    sid = r.json()["id"]

    events = await _collect_sse(client, sid)
    types = [t for t, _ in events]

    # 事件顺序：status(pm) → prd_delta → status(engineer) → code_delta
    #             → status(sandbox) → preview_url → done
    assert "status" in types
    assert "prd_delta" in types
    assert "code_delta" in types
    assert "preview_url" in types
    assert types[-1] == "done"

    stages = [p["stage"] for t, p in events if t == "status"]
    assert stages == ["pm", "engineer", "sandbox"]


async def test_stream_persists_prd_code_and_preview(client: AsyncClient) -> None:
    r = await client.post("/api/builds", json={"prompt": "snake"})
    sid = r.json()["id"]
    await _collect_sse(client, sid)

    detail = (await client.get(f"/api/builds/{sid}")).json()
    assert detail["status"] == "done"
    assert "PRD" in detail["prd"]
    # extract_code 应剥掉 ```html 围栏，DB 里存的是干净 HTML
    assert detail["code"].startswith("<!DOCTYPE html>")
    assert "```" not in detail["code"]
    # M3：preview_url 也从最终 state 回写
    assert detail["preview_url"] == "http://localhost:10001"


async def test_stream_falls_back_to_srcdoc_when_sandbox_returns_none(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """L2 降级：sandbox.deploy 返 None → SSE 上不出现 preview_url → done 照旧。"""

    async def _none(code: str) -> tuple[str, str] | None:  # noqa: ARG001
        return None

    monkeypatch.setattr("tools.sandbox.deploy", _none)

    r = await client.post("/api/builds", json={"prompt": "ping"})
    sid = r.json()["id"]
    events = await _collect_sse(client, sid)
    types = [t for t, _ in events]

    assert "preview_url" not in types
    assert types[-1] == "done"

    detail = (await client.get(f"/api/builds/{sid}")).json()
    assert detail["status"] == "done"
    assert detail["preview_url"] is None


async def test_stream_404(client: AsyncClient) -> None:
    r = await client.get("/api/builds/nope/stream")
    assert r.status_code == 404


async def test_done_session_stream_replays_without_llm(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """P0-#2：done 会话默认 GET /stream 应走回放，不能再调 LLM。"""
    # 先真跑一次（conftest 默认 fake_stream 会推进）
    r = await client.post("/api/builds", json={"prompt": "ping"})
    sid = r.json()["id"]
    await _collect_sse(client, sid)

    # 把 llm_stream 换成“只要被调就写黑”版本
    calls: list[str] = []

    async def _spy(
        *, system: str, user: str, on_delta=None  # type: ignore[no-untyped-def]
    ) -> str:
        calls.append(system[:16])
        return "SHOULD_NOT_APPEAR"

    monkeypatch.setattr("graph.nodes.llm_stream", _spy)

    events = await _collect_sse(client, sid)
    assert calls == [], "done 回放不应触发 llm_stream"

    types = [t for t, _ in events]
    # 回放事件序列与首次 pipeline 同构（但 prd/code 均一次性推）
    assert "prd_delta" in types
    assert "code_delta" in types
    assert types[-1] == "done"

    # 回放里 prd/code 直接就是 DB 里的内容
    prd_text = "".join(p["text"] for t, p in events if t == "prd_delta")
    code_text = "".join(p["text"] for t, p in events if t == "code_delta")
    detail = (await client.get(f"/api/builds/{sid}")).json()
    assert prd_text == detail["prd"]
    assert code_text == detail["code"]
    assert "SHOULD_NOT_APPEAR" not in prd_text
    assert "SHOULD_NOT_APPEAR" not in code_text


async def test_force_true_ignores_done_and_reruns(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """P0-#2：?force=true 时后端无视 done 强制重跑 pipeline。"""
    r = await client.post("/api/builds", json={"prompt": "ping"})
    sid = r.json()["id"]
    await _collect_sse(client, sid)

    calls: list[str] = []

    async def _spy(
        *, system: str, user: str, on_delta=None  # type: ignore[no-untyped-def]
    ) -> str:
        calls.append(system[:16])
        # 直接返回空内容 → extract_code("") == ""，DB 里 code 会变空
        return ""

    monkeypatch.setattr("graph.nodes.llm_stream", _spy)

    await _collect_sse(client, sid, force=True)
    # pm + engineer 各 once → 2 次
    assert len(calls) == 2
