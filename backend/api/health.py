"""健康检查。"""
from __future__ import annotations

from fastapi import APIRouter

from schemas import HealthResponse
from tools import llm, sandbox

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    ok_sandbox = await sandbox.ping()
    ok_llm = await llm.ping()
    return HealthResponse(ok=ok_sandbox and ok_llm, sandbox=ok_sandbox, llm=ok_llm)
