# frontend/

Next.js 14 App Router + TypeScript strict + Tailwind 3。

## 结构

```
app/
  layout.tsx                 # 根布局（Tailwind + 字体 + 顶部标题栏）
  page.tsx                   # 仪表盘：PromptInput → 建会话 → 跳转 build/[id]
  build/[id]/page.tsx        # Server Component 拉初值 + Client 挂 use-build-stream
  globals.css                # Tailwind base + 少量 CSS token

components/
  PromptInput.tsx            # 受控输入 + 模式选择（standard / plan，仅记录）
  StreamViewer.tsx           # 双栏：PRD / Code（按 BuildEvent.type 路由）
  PreviewFrame.tsx           # iframe + srcDoc 降级；key=url 防闪烁
  StageStatus.tsx            # 当前 stage 徽章（pm / engineer / sandbox）

hooks/
  use-build-stream.ts        # 唯一 SSE 消费 Hook（eventsource-parser + AbortController）

lib/
  api.ts                     # 后端调用唯一出口（禁止页面散写 fetch）
  events.ts                  # BuildEvent 联合类型 + parseEvent
  utils.ts                   # cn() 等

types/
  build.ts                   # 与 backend/schemas.py 一一对应（M0 冻结）
```

## 契约

- 字段名与后端完全一致（snake_case），不做前端映射层
- 事件名穷举：`status / prd_delta / code_delta / preview_url / error / done`
- 修改 `types/build.ts` 必须同步 `backend/schemas.py`

## 本地跑

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev
```

## 说明

- **不使用 Next proxy**（Q8 决策）：浏览器直连后端，SSE 在 Network 面板原生可读；CORS 由 FastAPI 中间件解决。
- shadcn/ui 骨架阶段未初始化；M2 之前只补 `button / card / input / tabs / badge` 五个组件。
- 代码高亮 M5 之前用 `<pre>` + Tailwind；后续再评估 `shiki`。
