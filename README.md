# vibe_coding · AI 应用构建平台（Atoms 复刻）

用自然语言描述需求 → LangGraph 双节点（PM + Engineer）生成单文件 HTML → ECS Docker 沙箱 → iframe 实时预览。

一条端到端链路跑通即证明架构，不追求全量复刻。

## 三块代码

| 目录 | 语言/框架 | 角色 |
|------|-----------|------|
| `frontend/` | Next.js 14 (App Router) + TS + Tailwind 3 | 仪表盘 / 构建会话页 / SSE 流式渲染 / iframe 预览 |
| `backend/`  | FastAPI + LangGraph + SQLModel(async) | 会话 CRUD、SSE、LangGraph 编排、Ollama 调用、沙箱调度 |
| `sandbox/`  | FastAPI + Docker SDK（本机或 ECS） | 端口池 10000–10100、容器生命周期、`preview_url` 分配 |

## 文档索引（`docs/`）

- [`docs/architecture.md`](docs/architecture.md) — 全栈架构设计（**主依据**）
- [`docs/backend-standard.md`](docs/backend-standard.md) — 后端编码规范
- [`docs/frontend-standard.md`](docs/frontend-standard.md) — 前端编码规范
- [`docs/build-pipeline.md`](docs/build-pipeline.md) — 构建流水线设计

## 快速开始

```bash
# 1) 起本地 Ollama 并拉一个 coding 模型
ollama pull qwen3:8b
ollama serve                # 默认 http://localhost:11434

# 2) 安装依赖（Makefile 会分别调用 pnpm / uv）
make install

# 3) （可选）M3 真沙箱需要本地 Docker Desktop 已启动，且拉下 nginx:alpine
docker pull nginx:alpine

# 4) 并行起 backend(:8000) + sandbox-agent(:9000) + frontend(:3000)
#    需要真 Docker 部署时：ENABLE_DOCKER=true make dev
make dev

# 5) 冒烟：POST → SSE 事件流 → done
make smoke
```

## 契约

前后端字段名保持一致（snake_case），改动必须同步：

- `backend/schemas.py` ↔ `frontend/types/build.ts`
- SSE 事件：`status` / `prd_delta` / `code_delta` / `preview_url` / `error` / `done`

## 关键决策（M0 冻结）

| 维度 | 决策 |
|------|------|
| 数据层 | SQLModel + `sqlite+aiosqlite` + `AsyncSession`（后端规范强制） |
| LLM | 本地 Ollama（OpenAI 兼容 `/v1`）；默认 `qwen3:8b` |
| Python | `>=3.11`，允许 3.13；不锁定 `.python-version`，优先使用系统 Python |
| 沙箱 | `nginx:alpine` + 单文件 HTML 挂载；端口池 **10000–10100**（101 槽） |
| CORS | FastAPI 侧配置；前端直连 `NEXT_PUBLIC_API_BASE`，**不引入 Next proxy** |
| Mode | `standard / plan` 仅作记录字段，链路相同（默认都跑 PM + Engineer） |
| 降级 | L0 ECS → L1 本地 Docker → L2 srcDoc → L3 顺序两 LLM 调用 |
| CI | GitHub Actions 双 job（backend: ruff/mypy/pytest；frontend: tsc/eslint/vitest/build） |

## 里程碑

| M | 目标 | 状态 |
|---|------|------|
| M0 | 契约冻结 | ✅ |
| M1 | 骨架 + Hello SSE（0:30 checkpoint） | ✅ |
| M2 | LangGraph 双节点产出 `code` | ✅ 已接 Ollama |
| M3 | 沙箱部署返回 `preview_url` | ✅ 已接 Docker SDK，需 `ENABLE_DOCKER=true` 启用 |
| M4 | 三级降级可切换 | UI 已占位，待手动切换器 |
| M5 | 历史回放 + UI 打磨 | 待完善 |

## 目录

```
vibe_coding/
├── docs/           # 架构与三份规范
├── frontend/       # Next.js 14
├── backend/        # FastAPI + LangGraph
├── sandbox/        # ECS/本地 Docker agent
├── deploy/         # docker-compose、ECS 初始化
├── scripts/        # dev / smoke / prewarm
├── .github/        # CI
├── Makefile
└── README.md
```
