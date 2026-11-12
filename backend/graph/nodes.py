"""LangGraph 节点：纯函数式，流式旁路。M2 起替换为真实现。"""
from __future__ import annotations

from typing import Any

from graph.state import BuildState


async def pm_node(state: BuildState) -> dict[str, Any]:
    """M2 实现：调 tools.llm.llm_stream，on_delta 旁路推 prd_delta 事件。

    当前为占位，返回固定 PRD，保证 graph.builder 与 pipeline 可编译。
    """
    prd = f"[PM placeholder] {state['prompt'][:80]}"
    return {"prd": prd, "stage": "engineer"}


async def engineer_node(state: BuildState) -> dict[str, Any]:
    """M2 实现：以 PM 输出为输入，调 llm_stream，on_delta 旁路推 code_delta。

    当前为占位，返回单文件 HTML，保证端到端 pipeline 可跑通。
    """
    code = (
        "<!DOCTYPE html><html><body style='font-family:system-ui;padding:24'>"
        f"<h1>Hello from Engineer</h1><p>{state.get('prd', '')}</p>"
        "</body></html>"
    )
    return {"code": code, "stage": "sandbox"}
