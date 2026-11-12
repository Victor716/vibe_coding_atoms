# 前端编码规范（Next.js 14 + TypeScript + Tailwind）

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**对齐 Airbnb / Vercel React 最佳实践**

[命名规范](#-命名规范) • [组件规范](#-组件规范) • [API 调用](#-api-调用规范) • [流式渲染](#-流式渲染规范)

</div>

---

## 📋 目录

- [前端编码规范（Next.js 14 + TypeScript + Tailwind）](#前端编码规范nextjs-14--typescript--tailwind)
  - [📋 目录](#-目录)
  - [🎯 总则](#-总则)
  - [📁 目录与文件规范](#-目录与文件规范)
  - [🔤 命名规范](#-命名规范)
  - [🧩 组件规范](#-组件规范)
    - [Server / Client 组件边界](#server--client-组件边界)
    - [组件编写规则](#组件编写规则)
  - [🎨 样式与 Tailwind 规范](#-样式与-tailwind-规范)
  - [🌐 API 调用规范](#-api-调用规范)
    - [唯一出口原则](#唯一出口原则)
    - [错误处理](#错误处理)
  - [📡 流式渲染规范](#-流式渲染规范)
    - [SSE 消费封装为 Hook](#sse-消费封装为-hook)
    - [流式渲染规则](#流式渲染规则)
  - [🧪 类型与接口规范](#-类型与接口规范)
    - [契约共享](#契约共享)
  - [⚠️ 禁止事项](#️-禁止事项)
  - [✅ 检查清单](#-检查清单)

---

## 🎯 总则

1. **TypeScript 严格模式**，禁止 `any`（第三方库无类型时显式声明结构）
2. **Server Component 优先**，只在需要交互/Hook 处加 `"use client"`
3. **单一数据源**：后端契约类型是唯一真相，前端不重新定义
4. **AI 生成友好**：文件 ≤200 行，导出单一职责，AI 修改时上下文最小化

---

## 📁 目录与文件规范

```
components/     # 仅放可复用组件，一组件一文件
app/            # 路由与页面，页面组件保持薄（逻辑下沉到 components/）
lib/            # 纯函数工具与 API 封装（无副作用依赖）
types/          # 与后端共享的契约类型（禁止放组件 Props 类型以外的业务类型）
hooks/          # 自定义 Hook，useXxx.ts 命名
```

- 文件命名：组件用 `PascalCase.tsx`，工具/Hook 用 `kebab-case.ts`
- 目录深度 ≤3 层，超过即考虑拆分或平铺

---

## 🔤 命名规范

| 类别 | 规则 | 示例 |
|------|------|------|
| 组件 | PascalCase | `PromptInput`, `StreamViewer` |
| 函数/变量 | camelCase | `parseEvent`, `buildId` |
| 常量 | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 自定义 Hook | use + PascalCase | `useBuildStream` |
| 布尔值 | is/has/should 前缀 | `isStreaming`, `hasError` |
| 事件处理 | handle + 动作 | `handleSubmit`, `handleRetry` |
| 类型 | PascalCase，无 I/T 前缀 | `BuildEvent`, `Session` |

---

## 🧩 组件规范

### Server / Client 组件边界

```tsx
// ✅ 默认 Server Component：数据获取、无交互
export default async function BuildPage({ params }: { params: { id: string } }) {
  const session = await getSession(params.id);   // 服务端直接调后端
  return <BuildClient initial={session} />;
}
```

```tsx
"use client";   // ✅ 仅交互组件声明，且声明放第一行
import { useState } from "react";

// ✅ 受控输入：state + 显式事件类型
export function PromptInput({ onSubmit }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
    </form>
  );
}
```

### 组件编写规则

- Props 类型就近声明：`interface Props { ... }`，不导出（除非复用）
- 组件 ≤100 行为宜，超过优先拆分而非加注释硬撑
- 条件渲染用 `&&` / 三元，禁止嵌套超 2 层的三元
- 列表渲染必须提供稳定 `key`，禁止用 index 作为 key（静态列表除外）

---

## 🎨 样式与 Tailwind 规范

- **只使用 Tailwind 工具类**，禁止内联 `style={{}}`（动态值除外）
- 禁止 `@apply` 封装自定义类（shadcn/ui 生成的组件文件除外）
- 颜色/圆角/间距一律用 Tailwind token，不写魔法数字：`rounded-lg` ✅ / `rounded-[7px]` ❌
- 布局优先 flex/grid，禁止用 `<br>`、空 div 撑高度
- 响应式前缀移动优先：`className="p-4 md:p-8"`

```tsx
// ✅ 推荐：语义化 + 响应式
<div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:p-6">
```

---

## 🌐 API 调用规范

### 唯一出口原则

所有后端调用必须经过 `lib/api.ts`，页面组件禁止散落 `fetch`：

```typescript
// lib/api.ts —— 前后端契约的唯一封装点
import type { BuildSession, BuildEvent } from "@/types/build";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export async function createBuild(prompt: string): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/api/builds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, mode: "standard" }),
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}
```

### 错误处理

```typescript
// 统一错误类型
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// 调用处：区分网络错 / 业务错
try {
  const { id } = await createBuild(prompt);
} catch (err) {
  if (err instanceof ApiError) {
    // 业务错误：展示 err.message
  } else {
    // 网络错误：展示「连接失败，请检查后端」+ 降级按钮
  }
}
```

---

## 📡 流式渲染规范

### SSE 消费封装为 Hook

```typescript
// hooks/use-build-stream.ts
"use client";
import { useEffect, useRef, useState } from "react";
import { parseEvent, type BuildEvent } from "@/lib/events";

export function useBuildStream(sessionId: string) {
  const [events, setEvents] = useState<BuildEvent[]>([]);
  const [stage, setStage] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      const res = await fetch(`/api/builds/${sessionId}/stream`, {
        signal: ctrl.signal,
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      // 使用 eventsource-parser 按 event/data 双行解析（SSE 多行帧）
      // 解析后调用 setEvents(prev => [...prev, parseEvent(msg)])
    })();

    return () => ctrl.abort();   // ✅ 组件卸载必须断开流
  }, [sessionId]);

  return { events, stage };
}
```

### 流式渲染规则

- SSE 解析用 `eventsource-parser` 库，**禁止手写正则解析**（多行 data 帧必踩坑）
- 增量文本渲染用分栏组件（PRD 栏 / 代码栏），按 `event.type` 路由
- AbortController 清理必须存在于每一个开流的 Effect
- iframe 预览地址变更时才重载 `<iframe key={url}>`，防止流式更新导致闪烁

---

## 🧪 类型与接口规范

### 契约共享

```typescript
// types/build.ts —— 与后端 pydantic 模型一一对应
export interface BuildSession {
  id: string;
  prompt: string;
  mode: "standard" | "plan";
  status: "pending" | "running" | "done" | "failed";
  prd: string | null;
  code: string | null;
  preview_url: string | null;
  error: string | null;
  created_at: string;
}
```

- 字段名与后端完全一致（snake_case），不做前端私有映射层
- 时间一律 ISO 字符串，展示层用 `date-fns` 格式化

---

## ⚠️ 禁止事项

| 禁止 | 理由 |
|------|------|
| ❌ `any` / `@ts-ignore` 静默错误 | 契约漂移会在运行时爆炸 |
| ❌ 页面组件内直接 `fetch` 后端 | 绕过唯一出口，契约无法收口 |
| ❌ 在 Server Component 用 Hook / 事件 | 边界混乱，AI 修改易出错 |
| ❌ `useEffect` 里不清理订阅/流 | 内存泄漏与重复请求 |
| ❌ 魔法字符串事件名散落各处 | 必须用 `BuildEvent` 联合类型 |
| ❌ 超过 2 层嵌套三元 | 用早期返回或拆分组件 |

---

## ✅ 检查清单

- [ ] `tsc --strict` 零报错、零 `any`
- [ ] 所有 API 调用收口在 `lib/api.ts`
- [ ] SSE 使用成熟解析库 + AbortController 清理
- [ ] Client Component 仅在必要时声明，且 `"use client"` 为第一行
- [ ] 组件 Props 类型就近声明、事件处理函数 handle 前缀
- [ ] 无内联样式、无魔法数字、无 index key

---

<div align="center">

**Server Component 优先，契约唯一出口，流必可断**

[⬆ 返回顶部](#前端编码规范nextjs-14--typescript--tailwind)

**最后更新：2026-11-07**

</div>