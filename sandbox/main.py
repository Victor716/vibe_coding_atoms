"""sandbox-agent：~100 行 FastAPI mini-PaaS（对应 docs/architecture.md §沙箱方案）。

M3 起接管真实 Docker 部署；当前版本先做端口分配 + 内存会话表，Docker 相关接口以
占位返回，允许 backend 在无 Docker 环境（本地/CI）跑通整链。
"""
from __future__ import annotations

import os
import uuid
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
    enable_docker: bool = os.getenv("ENABLE_DOCKER", "false").lower() == "true"


settings = Settings()
pool = PortPool(settings.port_start, settings.port_end)

# session_id → workdir_path（单 HTML 文件挂载点）
_SESSIONS: dict[str, Path] = {}

app = FastAPI(title="sandbox-agent", version="0.1.0")


class SessionResp(BaseModel):
    session_id: str
    port: int


class StartResp(BaseModel):
    session_id: str
    port: int
    status: Literal["ok", "pending-docker"]


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
    _SESSIONS[sid] = workdir
    return SessionResp(session_id=sid, port=port)


@app.put("/sessions/{session_id}/code")
async def upload_code(session_id: str, request: Request) -> dict[str, str]:
    workdir = _SESSIONS.get(session_id)
    if workdir is None:
        raise HTTPException(status_code=404, detail="session not found")
    body = await request.body()
    (workdir / "index.html").write_bytes(body)
    return {"status": "ok"}


@app.post("/sessions/{session_id}/start", response_model=StartResp)
async def start(session_id: str) -> StartResp:
    port = pool.snapshot().get(session_id)
    if port is None:
        raise HTTPException(status_code=404, detail="session not found")
    if settings.enable_docker:
        # TODO M3：docker run -d -p {port}:80 -v {workdir}:/usr/share/nginx/html:ro nginx:alpine
        return StartResp(session_id=session_id, port=port, status="ok")
    return StartResp(session_id=session_id, port=port, status="pending-docker")


@app.delete("/sessions/{session_id}")
async def release(session_id: str) -> dict[str, str]:
    pool.release(session_id)
    _SESSIONS.pop(session_id, None)
    return {"status": "released"}


@app.get("/sessions")
async def list_sessions() -> dict[str, object]:
    return {"sessions": pool.snapshot(), "capacity": pool.capacity}
