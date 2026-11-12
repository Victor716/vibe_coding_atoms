"""sandbox-agent：~100 行 FastAPI mini-PaaS（对应 docs/architecture.md §沙箱方案）。

M3 起接管真实 Docker 部署：nginx:alpine + bind-mount 单文件 HTML + 端口池。
`ENABLE_DOCKER=false` 时退化为纯端口分配 + 内存会话表，允许 backend 在无 Docker
环境（本地 / CI）跑通整链，前端自动走 L2 srcDoc 降级。
"""
from __future__ import annotations

import os
import shutil
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from pydantic_settings import BaseSettings

from port_pool import PortPool


class Settings(BaseSettings):
    port_start: int = 10000
    port_end: int = 10100
    sandbox_image: str = "nginx:alpine"
    workdir: str = "./workdir"
    container_prefix: str = "vibe-sbx-"
    enable_docker: bool = os.getenv("ENABLE_DOCKER", "false").lower() == "true"


settings = Settings()
pool = PortPool(settings.port_start, settings.port_end)


@dataclass
class _Session:
    workdir: Path
    port: int
    container_id: str | None = None
    extra: dict[str, object] = field(default_factory=dict)


# session_id → Session
_SESSIONS: dict[str, _Session] = {}

app = FastAPI(title="sandbox-agent", version="0.1.0")

# Docker client 走懒加载：ENABLE_DOCKER=false 时不 import 依赖
_docker_client = None


def _client():  # type: ignore[no-untyped-def]
    global _docker_client
    if _docker_client is None:
        import docker  # noqa: WPS433 - 延迟 import，允许 CI/无 Docker 环境不装 daemon
        _docker_client = docker.from_env()
    return _docker_client


class SessionResp(BaseModel):
    session_id: str
    port: int


class StartResp(BaseModel):
    session_id: str
    port: int
    status: Literal["ok", "pending-docker"]
    container_id: str | None = None


@app.get("/health")
async def health() -> dict[str, object]:
    return {
        "ok": True,
        "capacity": pool.capacity,
        "used": len(pool.snapshot()),
        "docker_enabled": settings.enable_docker,
    }


@app.post("/sessions", response_model=SessionResp, status_code=201)
async def create_session() -> SessionResp:
    sid = f"sbx_{uuid.uuid4().hex}"
    port = pool.allocate(sid)
    if port is None:
        raise HTTPException(status_code=503, detail="sandbox_full")
    workdir = Path(settings.workdir) / sid
    workdir.mkdir(parents=True, exist_ok=True)
    _SESSIONS[sid] = _Session(workdir=workdir, port=port)
    return SessionResp(session_id=sid, port=port)


@app.put("/sessions/{session_id}/code")
async def upload_code(session_id: str, request: Request) -> dict[str, str]:
    sess = _SESSIONS.get(session_id)
    if sess is None:
        raise HTTPException(status_code=404, detail="session not found")
    body = await request.body()
    (sess.workdir / "index.html").write_bytes(body)
    return {"status": "ok"}


@app.post("/sessions/{session_id}/start", response_model=StartResp)
async def start(session_id: str) -> StartResp:
    sess = _SESSIONS.get(session_id)
    if sess is None:
        raise HTTPException(status_code=404, detail="session not found")

    if not settings.enable_docker:
        # 无 Docker 环境：backend 会看到 pending-docker → 走 L2 srcDoc
        return StartResp(session_id=session_id, port=sess.port, status="pending-docker")

    if sess.container_id is None:
        try:
            container = _client().containers.run(
                image=settings.sandbox_image,
                name=f"{settings.container_prefix}{session_id}",
                detach=True,
                ports={"80/tcp": sess.port},
                volumes={str(sess.workdir.resolve()): {"bind": "/usr/share/nginx/html", "mode": "ro"}},
                restart_policy={"Name": "unless-stopped"},
            )
            sess.container_id = container.id
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"docker_run_failed: {exc}") from exc
    return StartResp(
        session_id=session_id,
        port=sess.port,
        status="ok",
        container_id=sess.container_id,
    )


@app.delete("/sessions/{session_id}")
async def release(session_id: str) -> dict[str, str]:
    sess = _SESSIONS.pop(session_id, None)
    if sess is None:
        # 幂等：已释放也返回 ok
        return {"status": "released"}

    if sess.container_id and settings.enable_docker:
        try:
            container = _client().containers.get(sess.container_id)
            container.stop(timeout=1)
            container.remove(force=True)
        except Exception:  # noqa: BLE001, S110 - 清理失败不阻塞端口释放
            pass

    pool.release(session_id)
    shutil.rmtree(sess.workdir, ignore_errors=True)
    return {"status": "released"}


@app.get("/sessions")
async def list_sessions() -> dict[str, object]:
    return {
        "sessions": pool.snapshot(),
        "capacity": pool.capacity,
        "docker_enabled": settings.enable_docker,
    }
