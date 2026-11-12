# 后端编码规范（FastAPI + Python 3.11）

<div align="center">

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)
[![SQLModel](https://img.shields.io/badge/SQLModel-0.0.22-green)]()

**对齐 Google Python Style Guide 与 FastAPI 官方最佳实践**

[项目结构](#-项目结构) • [类型注解](#-类型注解规范) • [API 设计](#-api-设计规范) • [错误处理](#-错误处理规范)

</div>

---

## 📋 目录

- [后端编码规范（FastAPI + Python 3.11）](#后端编码规范fastapi--python-311)
  - [📋 目录](#-目录)
  - [🎯 总则](#-总则)
  - [📁 项目结构](#-项目结构)
  - [🔤 命名规范](#-命名规范)
  - [📝 类型注解规范](#-类型注解规范)
  - [🌐 API 设计规范](#-api-设计规范)
    - [路由模板](#路由模板)
    - [响应模型](#响应模型)
    - [规则](#规则)
  - [🗄️ 数据层规范](#️-数据层规范)
  - [🧠 AI 编排规范](#-ai-编排规范)
    - [节点编写规则](#节点编写规则)
    - [图编译](#图编译)
  - [⚙️ 配置与日志规范](#️-配置与日志规范)
  - [⚠️ 禁止事项](#️-禁止事项)
  - [✅ 检查清单](#-检查清单)

---

## 🎯 总则

1. **类型注解 100% 覆盖**（Google 风格：公共 API、函数签名、变量必标）
2. **async 优先**：所有路由与 IO 操作使用 `async def`
3. **依赖注入**：数据库会话、配置、工具客户端一律走 FastAPI `Depends`
4. **薄路由厚服务**：路由只做参数校验与编排，业务逻辑在 service / node 层

---

## 📁 项目结构

```
backend/
├── main.py                # 入口：CORS、路由注册、lifespan
├── config.py              # pydantic-settings 配置（唯一读取环境变量处）
├── api/                   # 路由层：无业务逻辑
│   ├── builds.py
│   └── health.py
├── graph/                 # AI 编排层
│   ├── state.py           # BuildState TypedDict
│   ├── nodes.py           # LLM 节点（纯函数式）
│   └── builder.py         # 图编译
├── tools/                 # 工具层：沙箱 / MCP 客户端
│   ├── sandbox.py
│   └── mcp_client.py
├── prompts/               # Prompt 模板（独立文件，便于迭代）
├── models.py              # SQLModel 表
├── db.py                  # 引擎与会话工厂
└── schemas.py             # Pydantic 请求/响应模型（API 契约）
```

---

## 🔤 命名规范

| 类别 | 规则 | 示例 |
|------|------|------|
| 模块/包 | snake_case | `builds.py`, `mcp_client.py` |
| 类 | PascalCase | `BuildSession`, `ApiError` |
| 函数/变量 | snake_case | `create_session`, `preview_url` |
| 常量 | SCREAMING_SNAKE_CASE | `MAX_PORT`, `DEFAULT_MODEL` |
| 私有成员 | 单下划线前缀 | `_extract_code` |
| 布尔值 | 是/否语义动词 | `is_ready`, `has_error` |
| 路由函数 | 动词 + 资源 | `create_build`, `stream_build` |

---

## 📝 类型注解规范

```python
# ✅ 函数签名完整注解，返回值明确
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> BuildSession:
    ...

# ✅ 复杂结构用 TypedDict / Pydantic，不用裸 dict
class BuildState(TypedDict):
    session_id: str
    prompt: str
    prd: str
    preview_url: str | None        # Python 3.10+ 联合语法
    error: str | None

# ✅ 可空与默认值显式表达
def extract_code(raw: str, fallback: str | None = None) -> str:
    ...

# ✅ 生成器/异步迭代器标注
async def run_pipeline(session_id: str) -> AsyncIterator[PipelineEvent]:
    ...
```

- 禁止裸 `dict` / `Any` 穿越函数边界；中间结构用 `TypedDict`
- 外部数据入口（请求体、LLM 输出、沙箱响应）一律 Pydantic 校验

---

## 🌐 API 设计规范

### 路由模板

```python
# api/builds.py
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/api/builds", tags=["builds"])

@router.post("", status_code=201)
async def create_build(
    req: BuildCreateRequest,                    # ✅ Pydantic 请求模型
    db: AsyncSession = Depends(get_db),
) -> BuildCreateResponse:
    """创建构建会话。"""
    try:
        session = await create_session(db, req.prompt, req.mode)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return BuildCreateResponse(id=session.id)
```

### 响应模型

```python
# schemas.py —— 契约层，与前端 types/build.ts 一一对应
from pydantic import BaseModel

class BuildSessionResponse(BaseModel):
    id: str
    prompt: str
    mode: str
    status: str
    prd: str | None = None
    code: str | None = None
    preview_url: str | None = None
    error: str | None = None
    created_at: datetime
```

### 规则

- 请求/响应全部声明 Pydantic 模型，**禁止直接收发裸 dict**
- 错误响应用 `HTTPException` + 统一 `detail` 结构，不裸抛异常
- SSE 路由单独标注，事件 payload 用 Pydantic 模型序列化

---

## 🗄️ 数据层规范

```python
# db.py —— 会话工厂唯一入口
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

engine = create_async_engine("sqlite+aiosqlite:///./app.db")

async def get_db() -> AsyncIterator[AsyncSession]:
    async with AsyncSession(engine) as session:
        yield session
```

```python
# ✅ 模型即表（SQLModel），字段带默认值与约束
class BuildSession(SQLModel, table=True):
    __tablename__ = "build_session"

    id: str = Field(primary_key=True, default_factory=new_uuid)
    status: str = Field(default="pending", index=True)   # ✅ 查询字段建索引
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

- 所有查询走 `AsyncSession`，禁止同步 SQLModel 调用
- 表结构变更直接改模型 + 手工迁移 SQL（考试场景不上 Alembic）

---

## 🧠 AI 编排规范

### 节点编写规则

```python
# graph/nodes.py
from prompts.pm import PM_SYSTEM, PM_USER

async def pm_node(state: BuildState) -> dict[str, Any]:
    """PM 节点：需求 → 需求文档。节点只返回 state 增量。"""
    # ✅ 节点是纯函数：输入 state，返回增量 dict
    # ✅ 流式输出通过回调/队列旁路，不塞进 state
    prd = await llm_stream(
        system=PM_SYSTEM,
        user=PM_USER.format(prompt=state["prompt"]),
        on_delta=lambda t: emit("prd_delta", t),   # 旁路推 SSE
    )
    return {"prd": prd, "stage": "engineer"}
```

- 节点只返回 `state` 增量（`dict`），**禁止在节点内做 IO 副作用之外的操作**
- LLM 调用封装在独立模块，节点内不见 SDK 细节
- Prompt 模板独立文件 + 版本常量，便于 A/B 与回滚

### 图编译

```python
# graph/builder.py —— 全局单例，禁止每次请求重建
_graph = build_graph()

def get_graph():
    return _graph
```

---

## ⚙️ 配置与日志规范

```python
# config.py —— 环境变量唯一入口
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    llm_api_key: str
    llm_model: str = "claude-sonnet-4-20250514"
    sandbox_base_url: str = "http://localhost:9000"
    sandbox_fallback_local: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
```

```python
# ✅ 日志：结构化关键事件，不打印敏感信息
import logging

logger = logging.getLogger("build")

async def create_session(...) -> ...:
    logger.info("build_session_created", extra={"session_id": sid, "mode": mode})
```

- 禁止 `print` 调试残留；日志含 `session_id` 便于全链路追踪
- 密钥只存在于 `.env`，代码库零硬编码

---

## ⚠️ 禁止事项

| 禁止 | 理由 |
|------|------|
| ❌ 路由函数内写业务逻辑 | 无法复用与测试 |
| ❌ 裸 `dict` 作为请求/响应 | 契约无校验，前后端漂移 |
| ❌ 每次请求重新编译 LangGraph 图 | 性能浪费且状态不可控 |
| ❌ 节点内直接调 LLM SDK | Prompt 与编排耦合，无法替换 |
| ❌ `except:` 裸捕获 | 错误被吞，调试地狱 |
| ❌ 同步阻塞调用（requests/time.sleep） | 阻塞事件循环 |

---

## ✅ 检查清单

- [ ] `mypy --strict`（或至少默认严格档）零报错
- [ ] 全部路由声明请求/响应 Pydantic 模型
- [ ] 数据库会话仅经 `Depends(get_db)` 注入
- [ ] LangGraph 图单例，节点无副作用泄漏
- [ ] 环境变量仅经 `config.py` 读取
- [ ] LLM 输出经 `extract_code` 容错与 Pydantic 边界校验

---

<div align="center">

**薄路由、厚服务、强类型、纯节点**

[⬆ 返回顶部](#后端编码规范fastapi--python-311)

**最后更新：2026-11-07**

</div>