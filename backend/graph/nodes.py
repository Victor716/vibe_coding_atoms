"""LangGraph 节点：纯函数式，delta / status 通过 state.emit 旁路推到队列。

节点内部**不直接调 SDK**，全部经 tools.llm.llm_stream；prompt 走 prompts/*。
"""
from __future__ import annotations

from typing import Any

from graph.state import BuildState
from prompts.engineer import ENGINEER_SYSTEM, ENGINEER_USER
from prompts.pm import PM_SYSTEM, PM_USER
from tools import sandbox as sandbox_tool
from tools.extract import extract_code
from tools.llm import llm_stream
from tools.sandbox import SandboxError


async def pm_node(state: BuildState) -> dict[str, Any]:
    """PM：把模糊需求转成极简 PRD；每个 token 推 prd_delta。"""
    emit = state["emit"]
    await emit("status", {"stage": "pm"})

    async def on_delta(text: str) -> None:
        await emit("prd_delta", {"text": text})

    prd = await llm_stream(
        system=PM_SYSTEM,
        user=PM_USER.format(prompt=state["prompt"]),
        on_delta=on_delta,
    )
    return {"prd": prd, "stage": "engineer"}


async def engineer_node(state: BuildState) -> dict[str, Any]:
    """Engineer：以 PRD 为输入产出单文件 HTML；每个 token 推 code_delta。

    LLM 输出走 extract_code 容错，`code_delta` 事件里推的是**原始 token**（含 ``` 包裹，
    保证前端流式渲染所见即模型所说）；最终 state["code"] 存的是干净 HTML，供沙箱/回放用。
    """
    emit = state["emit"]
    await emit("status", {"stage": "engineer"})

    async def on_delta(text: str) -> None:
        await emit("code_delta", {"text": text})

    raw = await llm_stream(
        system=ENGINEER_SYSTEM,
        user=ENGINEER_USER.format(prd=state.get("prd", "")),
        on_delta=on_delta,
    )
    return {"code": extract_code(raw), "stage": "sandbox"}


async def sandbox_node(state: BuildState) -> dict[str, Any]:
    """Sandbox：将 Engineer产出的 HTML 部署到 nginx 容器，推 preview_url。

    - sandbox 服务正常 + Docker 可用 → emit preview_url，前端走 L0/L1 iframe
    - sandbox 报 pending-docker 或 部署失败 → 不 emit preview_url，前端自动降级 L2 srcDoc
    """
    emit = state["emit"]
    await emit("status", {"stage": "sandbox"})

    code = state.get("code") or ""
    if not code:
        return {"preview_url": None}

    try:
        result = await sandbox_tool.deploy(code)
    except SandboxError:
        # 部署失败不阻断主链路，前端会看到无 preview_url → 自动降级到 L2 srcDoc
        return {"preview_url": None}

    if result is None:
        return {"preview_url": None}

    _sid, url = result
    await emit("preview_url", {"url": url})
    return {"preview_url": url}
