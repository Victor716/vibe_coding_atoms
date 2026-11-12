"""LLM 客户端：走 Ollama 的 OpenAI 兼容 /v1 协议。

节点层通过 `llm_stream(...)` 使用，SDK 细节禁止渗透到 graph/nodes.py。
"""
from __future__ import annotations

from collections.abc import Awaitable, Callable
from functools import lru_cache

from openai import AsyncOpenAI

from config import get_settings


@lru_cache(maxsize=1)
def _client() -> AsyncOpenAI:
    s = get_settings()
    return AsyncOpenAI(base_url=s.llm_base_url, api_key=s.llm_api_key)


async def llm_stream(
    *,
    system: str,
    user: str,
    on_delta: Callable[[str], Awaitable[None]] | None = None,
) -> str:
    """流式对话，累积返回全文；on_delta 每 token 回调一次。"""
    s = get_settings()
    chunks: list[str] = []
    stream = await _client().chat.completions.create(
        model=s.llm_model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        stream=True,
        temperature=0.3,
    )
    async for piece in stream:  # type: ignore[union-attr]
        delta = (piece.choices[0].delta.content or "") if piece.choices else ""
        if not delta:
            continue
        chunks.append(delta)
        if on_delta is not None:
            await on_delta(delta)
    return "".join(chunks)


async def ping() -> bool:
    """健康检查用：给 /api/health 判断 LLM 是否可达。"""
    try:
        await _client().models.list()  # type: ignore[misc]
        return True
    except Exception:  # noqa: BLE001 - 探活本身允许吞异常
        return False
