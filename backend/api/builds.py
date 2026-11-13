"""会话 CRUD + SSE 流。路由层薄：参数校验 + 编排，业务下沉到 services/graph。"""
from __future__ import annotations

import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from sse_starlette.sse import EventSourceResponse

from db import get_db
from graph.pipeline import PipelineEvent, run_pipeline
from models import BuildSession, utcnow
from schemas import (
    BuildCreateRequest,
    BuildCreateResponse,
    BuildListResponse,
    BuildSessionResponse,
)

router = APIRouter(prefix="/api/builds", tags=["builds"])


async def _create_session(db: AsyncSession, prompt: str, mode: str) -> BuildSession:
    row = BuildSession(prompt=prompt, mode=mode, status="pending")
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


async def _get_or_404(db: AsyncSession, session_id: str) -> BuildSession:
    row = await db.get(BuildSession, session_id)
    if row is None:
        raise HTTPException(status_code=404, detail="session not found")
    return row


async def _mark(db: AsyncSession, row: BuildSession, status: str, **fields: object) -> None:
    row.status = status
    for k, v in fields.items():
        setattr(row, k, v)
    await db.commit()


@router.post("", status_code=201, response_model=BuildCreateResponse)
async def create_build(
    req: BuildCreateRequest,
    db: AsyncSession = Depends(get_db),
) -> BuildCreateResponse:
    row = await _create_session(db, req.prompt, req.mode)
    return BuildCreateResponse(id=row.id)


@router.get("", response_model=BuildListResponse)
async def list_builds(
    db: AsyncSession = Depends(get_db),
    limit: int = 20,
) -> BuildListResponse:
    stmt = select(BuildSession).order_by(BuildSession.created_at.desc()).limit(limit)
    res = await db.execute(stmt)
    items = list(res.scalars().all())
    return BuildListResponse(
        items=[BuildSessionResponse.model_validate(x) for x in items]
    )


@router.get("/{session_id}", response_model=BuildSessionResponse)
async def get_build(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> BuildSessionResponse:
    row = await _get_or_404(db, session_id)
    return BuildSessionResponse.model_validate(row)


@router.get("/{session_id}/stream")
async def stream_build(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    force: bool = False,
) -> EventSourceResponse:
    """SSE：

    - pending / running → 真跑 pipeline
    - done 且 force=false → 回放（从 DB 快照合成同构事件，不再调 LLM）
    - failed 且 force=false → error + done
    - force=true → 强制重跑 pipeline（前端“重跑”按钮）
    """
    row = await _get_or_404(db, session_id)

    if not force and row.status == "done":
        async def replay_gen() -> AsyncIterator[dict[str, str]]:
            async for ev in _iter_replay(row):
                yield {"event": ev.type, "data": json.dumps(ev.payload, ensure_ascii=False)}

        return EventSourceResponse(replay_gen())

    if not force and row.status == "failed":
        async def failed_gen() -> AsyncIterator[dict[str, str]]:
            err = PipelineEvent.error(row.error or "build failed")
            yield {"event": err.type, "data": json.dumps(err.payload, ensure_ascii=False)}
            done = PipelineEvent.done()
            yield {"event": done.type, "data": json.dumps(done.payload, ensure_ascii=False)}

        return EventSourceResponse(failed_gen())

    await _mark(db, row, "running")

    async def event_gen() -> AsyncIterator[dict[str, str]]:
        try:
            async for ev in _iter_with_persist(db, session_id):
                yield {"event": ev.type, "data": json.dumps(ev.payload, ensure_ascii=False)}
            await _reload_and_mark(db, session_id, "done")
        except Exception as exc:  # noqa: BLE001 - 流上错误必须转 error 事件
            await _reload_and_mark(db, session_id, "failed", error=str(exc))
            err = PipelineEvent.error(str(exc))
            yield {"event": err.type, "data": json.dumps(err.payload, ensure_ascii=False)}

    return EventSourceResponse(event_gen())


async def _iter_replay(row: BuildSession) -> AsyncIterator[PipelineEvent]:
    """done 会话回放：用 DB 快照合成一份与 pipeline 同构的事件序列。

    前端契约不变：status(prm) → prd_delta → status(engineer) → code_delta
                     → status(sandbox) → [preview_url] → done
    历史 code 已是 extract_code 后的干净 HTML，一次性推 code_delta 即可。
    """
    if row.prd:
        yield PipelineEvent.status("pm")
        yield PipelineEvent.prd_delta(row.prd)
    if row.code:
        yield PipelineEvent.status("engineer")
        yield PipelineEvent.code_delta(row.code)
    yield PipelineEvent.status("sandbox")
    if row.preview_url:
        yield PipelineEvent.preview_url(row.preview_url)
    yield PipelineEvent.done()


async def _iter_with_persist(db: AsyncSession, session_id: str) -> AsyncIterator[PipelineEvent]:
    """M2：持久化已下沉到 pipeline（基于最终 state 一次性写回）。

    路由层不再重复写 prd/code，避免与 extract_code 结果冲突。
    保留本层作为 M3 接 preview_url 事件时的扩展点。
    """
    async for ev in run_pipeline(session_id, db):
        yield ev


async def _append_field(  # pragma: no cover
    db: AsyncSession, session_id: str, field: str, delta: str
) -> None:
    row = await db.get(BuildSession, session_id)
    if row is None:
        return
    setattr(row, field, (getattr(row, field) or "") + delta)
    await db.commit()


async def _patch_field(  # pragma: no cover
    db: AsyncSession, session_id: str, field: str, value: str
) -> None:
    row = await db.get(BuildSession, session_id)
    if row is None:
        return
    setattr(row, field, value)
    await db.commit()


async def _reload_and_mark(
    db: AsyncSession, session_id: str, status: str, **fields: object
) -> None:
    row = await db.get(BuildSession, session_id)
    if row is None:
        return
    row.status = status
    row.created_at = row.created_at  # keep
    for k, v in fields.items():
        setattr(row, k, v)
    await db.commit()


# 保留符号，防止被 lint 报未用；UTC 时间戳用于后续扩展
_ = utcnow
