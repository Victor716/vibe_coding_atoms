"""契约层（API 请求/响应 + SSE 事件），必须与 frontend/types/build.ts 一一对应。

M0 冻结点：字段名 snake_case，联合类型穷举，禁止裸 dict。
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Mode = Literal["standard", "plan"]
Status = Literal["pending", "running", "done", "failed"]
Stage = Literal["pm", "engineer", "sandbox"]
Level = Literal["L0", "L1", "L2", "L3"]


# ---- Build 请求 / 响应 ----
class BuildCreateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=2000)
    mode: Mode = "standard"


class BuildCreateResponse(BaseModel):
    id: str


class BuildSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)   # 允许直接 model_validate(SQLModel ORM)

    id: str
    prompt: str
    mode: Mode
    status: Status
    prd: str | None = None
    code: str | None = None
    preview_url: str | None = None
    error: str | None = None
    created_at: datetime


class BuildListResponse(BaseModel):
    items: list[BuildSessionResponse]


# ---- SSE 事件 payload ----
class StatusEvent(BaseModel):
    stage: Stage


class DeltaEvent(BaseModel):
    text: str


class PreviewUrlEvent(BaseModel):
    url: str


class ErrorEvent(BaseModel):
    message: str


class DoneEvent(BaseModel):
    pass


class HealthResponse(BaseModel):
    ok: bool
    sandbox: bool
    llm: bool = False
    version: str = "0.1.0"
