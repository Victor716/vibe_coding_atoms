"""pytest 共享 fixture：临时 SQLite + httpx AsyncClient + 屏蔽外网 ping。"""
from __future__ import annotations

import json
import os
from collections.abc import AsyncIterator

import pytest
import respx
from httpx import ASGITransport, AsyncClient

# 切到内存 SQLite，且禁用 sandbox/llm 真实网络
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["SANDBOX_BASE_URL"] = "http://sandbox.test"
os.environ["LLM_BASE_URL"] = "http://llm.test/v1"


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    # 确保 env 生效再导入 config/db
    from db import engine, init_db
    from main import app

    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    await engine.dispose()


@pytest.fixture(autouse=True)
def _stub_external() -> AsyncIterator[None]:
    """默认 mock 掉 sandbox/llm 的探活，测试聚焦本地逻辑。"""
    with respx.mock(assert_all_called=False) as m:
        m.get("http://sandbox.test/health").respond(200, json={"ok": True})
        m.get("http://llm.test/v1/models").respond(200, json={"data": []})
        yield
