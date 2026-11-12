"""sandbox-agent HTTP 客户端。

M3 起接管部署。对外只暴露：
- `ping()`：探活
- `deploy(code)`：一把梭 create→upload→start，返回 preview_url；
  `None` 代表 sandbox 走 pending-docker（L2 降级）
- `release(session_id)`：清理容器 + 端口

异常时抛 `SandboxError`，节点层捕获后按降级链走。
"""
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
        r = await c.put(
            f"/sessions/{session_id}/code",
            content=html.encode("utf-8"),
            headers={"Content-Type": "text/html"},
        )
        r.raise_for_status()


async def start(session_id: str) -> dict[str, object]:
    """POST /sessions/{id}/start → {status, port, container_id?}。"""
    s = get_settings()
    async with httpx.AsyncClient(base_url=s.sandbox_base_url, timeout=60) as c:
        r = await c.post(f"/sessions/{session_id}/start")
        r.raise_for_status()
        return r.json()  # type: ignore[no-any-return]


async def release(session_id: str) -> None:
    """DELETE /sessions/{id}：停容器 + 释放端口。幂等，异常吞掉不阻塞主链路。"""
    s = get_settings()
    try:
        async with httpx.AsyncClient(base_url=s.sandbox_base_url, timeout=10) as c:
            await c.delete(f"/sessions/{session_id}")
    except Exception:  # noqa: BLE001
        pass


async def deploy(code: str) -> tuple[str, str] | None:
    """一次性部署：create → upload → start。

    返回 `(session_id, preview_url)`；若 sandbox 报 pending-docker（ENABLE_DOCKER=false），
    返回 `None` 让上层走 L2 srcDoc 降级。异常统一转 SandboxError。
    """
    s = get_settings()
    sid: str | None = None
    try:
        sess = await create_session()
        sid = str(sess["session_id"])
        await upload_code(sid, code)
        result = await start(sid)
        if result.get("status") != "ok":
            # pending-docker：立刻回收端口 + workdir，让上层降级
            await release(sid)
            return None
        port = int(str(result["port"]))
        return sid, f"http://{s.sandbox_public_host}:{port}"
    except httpx.HTTPStatusError as exc:
        if sid is not None:
            await release(sid)
        raise SandboxError(f"sandbox http {exc.response.status_code}: {exc.response.text}") from exc
    except Exception as exc:  # noqa: BLE001
        if sid is not None:
            await release(sid)
        raise SandboxError(f"sandbox deploy failed: {exc}") from exc


async def ping() -> bool:
    s = get_settings()
    try:
        async with httpx.AsyncClient(base_url=s.sandbox_base_url, timeout=3) as c:
            r = await c.get("/health")
            return r.status_code == 200
    except Exception:  # noqa: BLE001
        return False
