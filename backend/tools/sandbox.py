"""sandbox-agent HTTP 客户端。M3 起接管部署。"""
from __future__ import annotations

import httpx

from config import get_settings


class SandboxError(RuntimeError):
    pass


async def create_session() -> dict[str, object]:
    """POST /sessions → {session_id, port}。"""
    s = get_settings()
    async with httpx.AsyncClient(base_url=s.sandbox_base_url, timeout=10) as c:
        r = await c.post("/sessions")
        r.raise_for_status()
        return r.json()  # type: ignore[no-any-return]


async def upload_code(session_id: str, html: str) -> None:
    """PUT /sessions/{id}/code：单文件 HTML 上传（tar 或直接 raw 由 agent 决定）。"""
    s = get_settings()
    async with httpx.AsyncClient(base_url=s.sandbox_base_url, timeout=30) as c:
        r = await c.put(f"/sessions/{session_id}/code", content=html.encode("utf-8"),
                        headers={"Content-Type": "text/html"})
        r.raise_for_status()


async def start(session_id: str) -> str:
    """POST /sessions/{id}/start → preview_url。"""
    s = get_settings()
    async with httpx.AsyncClient(base_url=s.sandbox_base_url, timeout=60) as c:
        r = await c.post(f"/sessions/{session_id}/start")
        r.raise_for_status()
        data = r.json()
        port = data["port"]
        return f"http://{s.sandbox_public_host}:{port}"


async def ping() -> bool:
    s = get_settings()
    try:
        async with httpx.AsyncClient(base_url=s.sandbox_base_url, timeout=3) as c:
            r = await c.get("/health")
            return r.status_code == 200
    except Exception:  # noqa: BLE001
        return False
