# backend/

FastAPI + LangGraph + SQLModel(async) + Ollama。

## 结构

```
main.py           # lifespan: 建表 + 注册路由 + CORS
config.py         # pydantic-settings，唯一读取环境变量处
db.py             # AsyncEngine + get_db()
models.py         # BuildSession（表定义）
schemas.py        # Pydantic 请求/响应（契约，对应 frontend/types/build.ts）
api/
  builds.py       # POST /api/builds / GET /api/builds / GET /{id} / GET /{id}/stream
  health.py       # GET /api/health (含 sandbox ping)
graph/
  state.py        # BuildState TypedDict
  nodes.py        # pm_node / engineer_node（纯函数 + 流式旁路）
  builder.py      # 状态图单例
  pipeline.py     # run_pipeline：图执行 → AsyncIterator[BuildEvent]
tools/
  llm.py          # AsyncOpenAI 客户端封装（走 Ollama /v1）
  sandbox.py      # httpx.AsyncClient 调 sandbox-agent
prompts/
  pm.py           # PM 节点 prompt
  engineer.py     # Engineer 节点 prompt（强制单文件 HTML）
tests/            # pytest + pytest-asyncio + respx（mock Ollama / sandbox）
```

## 现状（M1）

- 契约、DB、config、health、`POST /api/builds`、`GET /api/builds/{id}/stream` 已跑通
- `stream` 当前只吐三帧 `status / prd_delta / done`（**Hello SSE**），M2 接 LangGraph + Ollama
- LangGraph、sandbox 调度、prompt 都在骨架位置，M2/M3 逐个替换实现

## 本地跑

```bash
uv sync --all-extras
cp .env.example .env
uvicorn main:app --reload --port 8000
```

## 自检

```bash
make -C .. lint-backend test-backend smoke
```
