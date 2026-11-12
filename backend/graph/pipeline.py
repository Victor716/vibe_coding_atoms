"""构建流水线：把 LangGraph 输出翻译成 SSE 事件流。

M1：先做 Hello-SSE（不接 LangGraph/沙箱），三帧即可让前端跑通。
M2：切换到 get_graph().astream(...)，旁路推 delta。
M3：接入 tools/sandbox.py 拿 preview_url。
M4：按 config.sandbox_default_level 走降级链。
"""
from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from schemas import DoneEvent, DeltaEvent, ErrorEvent, PreviewUrlEvent, StatusEvent

STAGE_PM = "pm"
STAGE_ENGINEER = "engineer"
STAGE_SANDBOX = "sandbox"


@dataclass(frozen=True)
class PipelineEvent:
    type: str            # status / prd_delta / code_delta / preview_url / error / done
    payload: dict[str, object]

    @classmethod
    def status(cls, stage: str) -> "PipelineEvent":
        return cls("status", StatusEvent(stage=stage).model_dump())  # type: ignore[arg-type]

    @classmethod
    def prd_delta(cls, text: str) -> "PipelineEvent":
        return cls("prd_delta", DeltaEvent(text=text).model_dump())

    @classmethod
    def code_delta(cls, text: str) -> "PipelineEvent":
        return cls("code_delta", DeltaEvent(text=text).model_dump())

    @classmethod
    def preview_url(cls, url: str) -> "PipelineEvent":
        return cls("preview_url", PreviewUrlEvent(url=url).model_dump())

    @classmethod
    def error(cls, message: str) -> "PipelineEvent":
        return cls("error", ErrorEvent(message=message).model_dump())

    @classmethod
    def done(cls) -> "PipelineEvent":
        return cls("done", DoneEvent().model_dump())


async def run_pipeline(session_id: str, db: AsyncSession) -> AsyncIterator[PipelineEvent]:
    """M1 Hello-SSE：status → prd_delta → done，间隔 100ms 让浏览器观察。

    M2 会替换为：
        graph = get_graph()
        async for chunk in graph.astream({...}, stream_mode="updates"):
            ...
    """
    yield PipelineEvent.status(STAGE_PM)
    await asyncio.sleep(0.1)
    yield PipelineEvent.prd_delta(f"[hello-sse] session={session_id} 就绪，等待 M2 接入 LangGraph。")
    await asyncio.sleep(0.1)
    yield PipelineEvent.done()
