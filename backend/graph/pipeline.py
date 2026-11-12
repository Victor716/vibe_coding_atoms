"""构建流水线：驱动 LangGraph 图，把 state.emit 旁路事件翻译成 SSE 流。

M2：真走 graph.ainvoke + asyncio.Queue。M3 会在 engineer 结束后追加 sandbox 部署；
M4 会在此处按 sandbox_default_level 挂上 L0/L1/L2/L3 分支。
"""
from __future__ import annotations

import asyncio
import contextlib
from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession

from graph.builder import get_graph
from graph.state import BuildState
from models import BuildSession
from schemas import DeltaEvent, DoneEvent, ErrorEvent, PreviewUrlEvent, StatusEvent

STAGE_PM = "pm"
STAGE_ENGINEER = "engineer"
STAGE_SANDBOX = "sandbox"

_SENTINEL_END = "__end__"
_SENTINEL_ERR = "__error__"


class PipelineEvent:
    __slots__ = ("type", "payload")

    def __init__(self, type: str, payload: dict[str, object]) -> None:
        self.type = type
        self.payload = payload

    @classmethod
    def status(cls, stage: str) -> PipelineEvent:
        return cls("status", StatusEvent(stage=stage).model_dump())  # type: ignore[arg-type]

    @classmethod
    def prd_delta(cls, text: str) -> PipelineEvent:
        return cls("prd_delta", DeltaEvent(text=text).model_dump())

    @classmethod
    def code_delta(cls, text: str) -> PipelineEvent:
        return cls("code_delta", DeltaEvent(text=text).model_dump())

    @classmethod
    def preview_url(cls, url: str) -> PipelineEvent:
        return cls("preview_url", PreviewUrlEvent(url=url).model_dump())

    @classmethod
    def error(cls, message: str) -> PipelineEvent:
        return cls("error", ErrorEvent(message=message).model_dump())

    @classmethod
    def done(cls) -> PipelineEvent:
        return cls("done", DoneEvent().model_dump())


async def run_pipeline(session_id: str, db: AsyncSession) -> AsyncIterator[PipelineEvent]:
    """从 DB 读 prompt，跑 LangGraph，边跑边把 delta 事件吐给调用方。

    事件顺序（M2）：
      status(pm) → prd_delta* → status(engineer) → code_delta* → done
    M3 起在 done 前会加：status(sandbox) → preview_url。
    """
    row = await db.get(BuildSession, session_id)
    if row is None:
        yield PipelineEvent.error(f"session {session_id} not found")
        return

    queue: asyncio.Queue[tuple[str, dict[str, object]]] = asyncio.Queue()

    async def emit(event: str, payload: dict[str, object]) -> None:
        await queue.put((event, payload))

    initial: BuildState = {
        "session_id": session_id,
        "prompt": row.prompt,
        "mode": row.mode,
        "stage": STAGE_PM,
        "emit": emit,
    }

    async def _worker() -> None:
        try:
            final = await get_graph().ainvoke(initial)
            # 图跑完：把最终 state 里的 prd / code / preview_url 一次性写回 DB。
            # 这样 SSE 上 code_delta 依然是模型原始 token（含 ```html 围栏），
            # 而 DB 里存的是 extract_code 清洗过的干净 HTML，回放/沙箱都用这份。
            row = await db.get(BuildSession, session_id)
            if row is not None and isinstance(final, dict):
                prd = final.get("prd")
                code = final.get("code")
                url = final.get("preview_url")
                if prd is not None:
                    row.prd = prd
                if code is not None:
                    row.code = code
                if url is not None:
                    row.preview_url = url
                await db.commit()
            await queue.put((_SENTINEL_END, {}))
        except Exception as exc:  # noqa: BLE001 - 图执行失败要转 error 事件
            await queue.put((_SENTINEL_ERR, {"message": str(exc)}))

    worker = asyncio.create_task(_worker())

    try:
        while True:
            event_type, payload = await queue.get()
            if event_type == _SENTINEL_END:
                yield PipelineEvent.done()
                return
            if event_type == _SENTINEL_ERR:
                yield PipelineEvent.error(str(payload.get("message", "graph error")))
                return
            yield PipelineEvent(event_type, payload)
    finally:
        if not worker.done():
            worker.cancel()
            with contextlib.suppress(asyncio.CancelledError, Exception):
                await worker
