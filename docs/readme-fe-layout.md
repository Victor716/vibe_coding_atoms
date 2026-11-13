# 前端布局规范（App Shell · 侧边栏 · 发现页）

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn--ui-latest-black)]()

**对齐 Atoms 控制台的 App Shell 布局：一次定义，全站继承**

[App Shell 设计](#-app-shell-总体设计) • [目录结构](#-目录结构) • [组件职责](#-布局组件职责) • [发现页布局](#-发现页布局)

</div>

---

## 📋 目录

- [前端布局规范（App Shell · 侧边栏 · 发现页）](#前端布局规范app-shell--侧边栏--发现页)
  - [📋 目录](#-目录)
  - [🎯 设计目标](#-设计目标)
  - [🏗️ App Shell 总体设计](#️-app-shell-总体设计)
    - [布局分层（对照 Atoms 实测结构）](#布局分层对照-atoms-实测结构)
    - [页面路由映射](#页面路由映射)
  - [📁 目录结构](#-目录结构)
  - [🧩 布局组件职责](#-布局组件职责)
    - [App Shell（`app/(dashboard)/layout.tsx`）](#app-shellappdashboardlayouttsx)
    - [组件边界划分](#组件边界划分)
  - [🔍 发现页布局](#-发现页布局)
    - [页面组装（Server Component 主体）](#页面组装server-component-主体)
    - [作品卡片（对照 Atoms 实测字段）](#作品卡片对照-atoms-实测字段)
    - [Mock 数据契约](#mock-数据契约)
  - [🎨 样式约定](#-样式约定)
  - [⚠️ 禁止事项](#️-禁止事项)
  - [✅ 检查清单](#-检查清单)

---

## 🎯 设计目标

1. **外壳只写一次**：侧边栏、促销横幅等全局元素通过 Route Group + `layout.tsx` 共享，业务页面零重复
2. **Server Component 优先**：内容页默认服务端渲染，仅交互组件声明 `"use client"`
3. **Mock 数据、真组件**：发现页数据用静态数组，但卡片组件按真实 API 契约设计 Props

---

## 🏗️ App Shell 总体设计

### 布局分层（对照 Atoms 实测结构）

```
┌──────────────────────────────────────────────────────────┐
│ 🎁 促销横幅（可关闭，localStorage 记忆关闭状态）          │
├──────────┬───────────────────────────────────────────────┤
│          │  内容区头部（按页面变化）                     │
│ 侧边栏   │  ┌─────────────┐ ┌─────────────────────────┐ │
│ (固定)   │  │ Tabs        │ │ 分类标签条 / 排序 / 筛选  │ │
│          │  └─────────────┘ └─────────────────────────┘ │
│ ·工作区  │                                               │
│ ·导航    │  内容区主体（业务页面）                       │
│ ·文件夹  │  ┌─────────────────────────────────────────┐ │
│ ·最近    │  │ 仪表盘输入框 / 发现卡片流 / 构建会话      │ │
│ ·设置    │  └─────────────────────────────────────────┘ │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

### 页面路由映射

| 路由 | 页面 | 布局差异 |
|------|------|----------|
| `/` | 仪表盘 | 中央输入框 + Agent 头像条 |
| `/discover` | 发现页 | Tabs + 分类标签条 + 卡片流 |
| `/build/[id]` | 构建会话页 | 无标签条，全宽流式视图 |
| `/templates` | 模板页 | 复用发现页布局 |

> 💡 **设计说明**：`/discover` 与 `/templates` 共用同一套「标签条 + 卡片流」布局，仅数据源不同——一个组件两种用法。

---

## 📁 目录结构

```
frontend/
├── app/
│   ├── (dashboard)/                  # ✅ 路由组：共享 App Shell
│   │   ├── layout.tsx                  # App Shell：横幅 + 侧边栏 + 内容区
│   │   ├── page.tsx                    # 仪表盘
│   │   ├── discover/
│   │   │   └── page.tsx                # 发现页（Server Component）
│   │   ├── templates/
│   │   │   └── page.tsx                # 模板页（复用发现布局）
│   │   └── build/
│   │       └── [id]/
│   │           └── page.tsx            # 构建会话页
│   └── api/
│       └── proxy/
│           └── route.ts                # SSE 转发层
├── components/
│   ├── layout/                         # ✅ 布局组件（本规范核心）
│   │   ├── app-shell.tsx               # 组合容器：横幅 + 侧栏 + main
│   │   ├── promo-banner.tsx            # 促销横幅（Client，可关闭）
│   │   ├── sidebar.tsx                 # 侧边栏（Client，导航 + 折叠）
│   │   ├── sidebar-nav.tsx             # 导航分组（游戏/视频/项目…）
│   │   └── sidebar-recent.tsx          # 最近项目列表
│   ├── discover/                       # ✅ 发现页组件
│   │   ├── discover-tabs.tsx           # 发现/模板 Tabs（Client）
│   │   ├── category-chips.tsx         # 分类标签条（Client，横向滚动）
│   │   ├── sort-filter.tsx            # 已保存/最新 + 筛选下拉（Client）
│   │   ├── discover-card.tsx          # 作品卡片（Server 可用）
│   │   └── discover-grid.tsx          # 卡片流容器（Server Component）
│   ├── build/                          # 构建链路组件（已有）
│   │   ├── prompt-input.tsx
│   │   ├── stream-viewer.tsx
│   │   └── preview-frame.tsx
│   ├── ui/                             # shadcn/ui 原始组件
│   └── ...
├── lib/
│   ├── mock/
│   │   └── discover.ts                 # 发现页 mock 数据（含类型）
│   ├── api.ts
│   └── events.ts
└── types/
    └── build.ts                        # 契约类型（与后端对齐）
```

---

## 🧩 布局组件职责

### App Shell（`app/(dashboard)/layout.tsx`）

```tsx
// ✅ Server Component：只做组合，不持有交互状态
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx
// components/layout/app-shell.tsx
import { PromoBanner } from "./promo-banner";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PromoBanner />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

### 组件边界划分

| 组件 | 边界 | 理由 |
|------|:----:|------|
| `app-shell.tsx` | Server | 纯布局组合，无状态 |
| `promo-banner.tsx` | Client | 有关闭交互 + localStorage |
| `sidebar.tsx` | Client | 导航点击、折叠、hover 菜单 |
| `discover-grid.tsx` | Server | 只负责渲染传入的卡片数组 |
| `discover-card.tsx` | Server 可用 | 纯展示，点击用 `<Link>` 即可 |
| `category-chips.tsx` | Client | 横向滚动、选中态、scrollIntoView |
| `discover-tabs.tsx` | Client | 选中切换（或直接用 shadcn Tabs） |

> ⚠️ **原则**：能拆成 Server 的子组件就拆——侧边栏整体是 Client，但「最近项目列表」若无交互可保持 Server，减少客户端 bundle。

---

## 🔍 发现页布局

### 页面组装（Server Component 主体）

```tsx
// app/(dashboard)/discover/page.tsx
import { DiscoverTabs } from "@/components/discover/discover-tabs";
import { CategoryChips } from "@/components/discover/category-chips";
import { DiscoverGrid } from "@/components/discover/discover-grid";
import { MOCK_DISCOVER_ITEMS } from "@/lib/mock/discover";

export default function DiscoverPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <DiscoverTabs />                        {/* Client：切换 /discover 与 /templates */}
      <CategoryChips categories={CATEGORIES} /> {/* Client：横向滚动标签条 */}
      <DiscoverGrid items={MOCK_DISCOVER_ITEMS} /> {/* Server：卡片流 */}
    </div>
  );
}
```

### 作品卡片（对照 Atoms 实测字段）

```tsx
// components/discover/discover-card.tsx
import Link from "next/link";

interface DiscoverCardProps {
  item: {
    id: string;
    title: string;        // 作品标题（用户 prompt 摘要）
    author: string;       // 作者名
    author_avatar?: string;
    likes: number;        // 点赞数（84 / 1.1K 展示层格式化）
    preview_image?: string;
  };
}

export function DiscoverCard({ item }: DiscoverCardProps) {
  return (
    <Link
      href={`/build/${item.id}`}
      className="flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-accent"
    >
      {item.preview_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.preview_image} alt="" className="rounded-md" />
      )}
      <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{item.author}</span>
        <span>·</span>
        <span>♥ {formatLikes(item.likes)}</span>  {/* 57 / 1.1K */}
      </div>
    </Link>
  );
}

function formatLikes(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}
```

### Mock 数据契约

```typescript
// lib/mock/discover.ts —— 字段对齐未来真实 API，换数据源零改动
export interface DiscoverItem {
  id: string;
  title: string;
  author: string;
  author_avatar?: string;
  likes: number;
  category: string;      // "游戏" | "网站" | "生产力" ...
  preview_image?: string;
  created_at: string;    // ISO 字符串
}

export const MOCK_DISCOVER_ITEMS: DiscoverItem[] = [
  {
    id: "atoms_lubd74g7",
    title: "设计一款音游，采用《斯普拉遁3》的经典音乐…",
    author: "Atoms_LUBD74G7",
    likes: 84,
    category: "游戏",
    created_at: "2026-11-07T10:00:00Z",
  },
  // ... 更多 mock 项
];
```

---

## 🎨 样式约定

| 元素 | 约定 |
|------|------|
| 侧边栏宽度 | `w-60`（240px），`border-r` 分隔 |
| 内容区 | `max-w-6xl mx-auto p-6`，卡片流用 `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` |
| 分类标签条 | 横向滚动 `overflow-x-auto` + 隐藏滚动条，选中项 `bg-primary` |
| 促销横幅 | 高度 `h-10`，关闭状态存 `localStorage("promo-hidden")` |
| 卡片 hover | `hover:bg-accent` + 图片轻微放大 `hover:scale-[1.02]` |

---

## ⚠️ 禁止事项

| 禁止 | 理由 |
|------|------|
| ❌ 在每个页面重复写侧边栏 JSX | 必须用 `(dashboard)/layout.tsx` 继承 |
| ❌ 把交互状态塞进 App Shell 层 | 壳层无状态，交互下沉到 Client 子组件 |
| ❌ 发现页数据直接 fetch 外部 API | mock 数据从 `lib/mock/` 导入，保持 Server Component |
| ❌ 卡片里用 `<div onClick>` 跳转 | 用 `<Link>`，保住 SSR 与预取 |
| ❌ 侧边栏用绝对定位 + margin 补偿 | 用 flex 布局，天然自适应 |

---

## ✅ 检查清单

- [ ] `(dashboard)/layout.tsx` 存在，侧边栏与横幅只此一处定义
- [ ] 侧边栏 Client、内容页 Server 的边界无倒挂
- [ ] 发现页卡片字段与 mock 类型对齐真实 API 契约
- [ ] 促销横幅关闭状态刷新后保持
- [ ] 卡片流在 sm / lg 断点分别为 2 / 3 列
- [ ] `/discover` 与 `/templates` 复用同一布局组件

---

<div align="center">

**壳只写一次，交互下沉，Mock 对齐契约**

[⬆ 返回顶部](#前端布局规范app-shell--侧边栏--发现页)


</div>