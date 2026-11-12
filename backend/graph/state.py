"""LangGraph 状态定义（TypedDict）。

`emit` 是流水线注入的旁路回调，节点用它把 delta / status 事件推到 SSE 队列；
不在 state 里存 DB session 或 SDK client，保持节点"纯函数 + 显式副作用"。
"""
from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import TypedDict

# 事件发射器：(event_type, payload_dict) -> await None
EventEmitter = Callable[[str, dict], Awaitable[None]]


class BuildState(TypedDict, total=False):
    session_id: str
    prompt: str
    mode: str              # "standard" | "plan"（A 决策：仅记录）
    prd: str
    code: str
    stage: str             # "pm" | "engineer" | "sandbox"
    preview_url: str | None
    error: str | None
    emit: EventEmitter
