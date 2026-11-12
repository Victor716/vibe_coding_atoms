"""LangGraph 状态定义（TypedDict）。"""
from __future__ import annotations

from typing import TypedDict


class BuildState(TypedDict, total=False):
    session_id: str
    prompt: str
    mode: str              # "standard" | "plan"（A 决策：仅记录）
    prd: str
    code: str
    stage: str             # "pm" | "engineer" | "sandbox"
    preview_url: str | None
    error: str | None
