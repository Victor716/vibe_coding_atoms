"""pytest 共享 fixture：临时 SQLite + httpx AsyncClient + 屏蔽外网 ping + mock llm_stream。"""
from __future__ import annotations

import os
from collections.abc import AsyncIterator, Awaitable, Callable

import pytest
from httpx import ASGITransport, AsyncClient

# 切到内存 SQLite，且禁用 sandbox/llm 真实网络
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["SANDBOX_BASE_URL"] = "http://sandbox.test"
os.environ["LLM_BASE_URL"] = "http://llm.test/v1"


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    from db import engine, init_db
    from main import app

    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    await engine.dispose()


@pytest.fixture(autouse=True)
def _stub_external(monkeypatch: pytest.MonkeyPatch) -> None:
    """将 sandbox / llm 探活固定为 True。

    AsyncOpenAI 自带 httpx 实例，respx 默认不能拦，直接 monkeypatch 更可靠。
    """

    async def _true() -> bool:
        return True

    monkeypatch.setattr("tools.sandbox.ping", _true)
    monkeypatch.setattr("tools.llm.ping", _true)


@pytest.fixture(autouse=True)
def _stub_llm_stream(monkeypatch: pytest.MonkeyPatch) -> None:
    """把 graph.nodes 里的 llm_stream 换成 fake：按 system prompt 判断角色返回固定片段。

    真接 Ollama 时这里可以按需关掉，或改成 respx 打 openai 兼容 endpoint。
    """

    async def fake_stream(
        *,
        system: str,
        user: str,
        on_delta: Callable[[str], Awaitable[None]] | None = None,
    ) -> str:
        is_pm = "产品经理" in system
        if is_pm:
            chunks = ["核心功能：", "极简 PRD。", "交互：", "键盘。"]
        else:
            chunks = [
                "```html\n",
                "<!DOCTYPE html>",
                "<html><body>",
                "<h1>hi</h1>",
                "</body></html>\n",
                "```",
            ]
        for c in chunks:
            if on_delta is not None:
                await on_delta(c)
        return "".join(chunks)

    # nodes.py 用的是 `from tools.llm import llm_stream`，需要 patch 它自己的模块命名空间
    monkeypatch.setattr("graph.nodes.llm_stream", fake_stream)


@pytest.fixture(autouse=True)
def _stub_sandbox_deploy(monkeypatch: pytest.MonkeyPatch) -> None:
    """把 sandbox_tool.deploy 换成 fake，避免单测碰真 Docker。

    默认返回一个假 URL，sandbox_node 会 emit preview_url；
    测试里可以 monkeypatch 这个行返回 None 来演 L2 降级。
    """

    async def fake_deploy(code: str) -> tuple[str, str] | None:  # noqa: ARG001
        return ("sbx_test", "http://localhost:10001")

    monkeypatch.setattr("tools.sandbox.deploy", fake_deploy)
