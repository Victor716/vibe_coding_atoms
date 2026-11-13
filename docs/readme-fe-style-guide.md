# 前端样式规范 · Atoms Editorial Minimal

> 基于 atoms.dev 游戏页实测 DOM 计算样式提取，非目测。
> 设计哲学：**衬线定调，米灰打底，一蓝点睛，透明阶梯统一灰阶。**

---

## 1 · 色彩系统

### 1.1 灰阶 —— rgb(12,12,12) 透明度阶梯

全站灰阶不使用独立 hex，全部基于同一 `rgb(12,12,12)` 的透明度：

| 层级 | 值 | 用途 |
|---|---|---|
| 标题/正文 | `.95` | `--foreground` |
| 次要文字 | `.8` | `--foreground-secondary` |
| 辅助说明 | `.55` | `--foreground-muted` / `--muted-foreground` |
| 边框 | `.12` | `--border` |
| 轻分隔 | `.06` | `--border-light` |
| 悬浮背景 | `.04` | `--accent` |

### 1.2 底色三层次

| 区域 | 色值 | Tailwind |
|---|---|---|
| 页面主区 | `#f6f6f6` | `bg-background` |
| 侧边栏 | `#f1f1f1` | `bg-sidebar` |
| 卡片/输入 | `#ffffff` | `bg-card` |

### 1.3 品牌色

| Token | 值 | 用途 |
|---|---|---|
| `--brand` / `--primary` | `#4267ff` | 主按钮、链接、选中态、CTA |
| `--brand-dark` | `#425ce1` | hover |
| `--brand-alpha-8` | `rgba(61,99,255,.08)` | 浅蓝底（tag、选中背景） |
| `--ring` | `rgba(66,103,255,.12)` | 焦点环 |

> 品牌蓝仅出现在主按钮、链接、选中态。全站视觉噪音极低。

### 1.4 促销横幅

| 属性 | 值 |
|---|---|
| 背景 | `#a8c5fa`（periwinkle 浅蓝紫） |
| 文字 | `--foreground`（深色） |
| CTA | `bg-brand` 圆角胶囊 + 白字 + → 箭头 |

### 1.5 Dark Mode

| Token | Dark 值 |
|---|---|
| `--background` | `#1a1a1a` |
| `--sidebar` | `#222222` |
| `--card` | `#2a2a2a` |
| `--foreground` | `rgba(245,245,245,.95)` |
| `--border` | `rgba(245,245,245,.12)` |
| `--brand` | `#5b7fff` |

---

## 2 · 字体系统

| 角色 | 字体栈 | 样式 |
|---|---|---|
| 正文/UI | IBM Plex Sans, ui-sans-serif, system-ui | 14-16px, weight 400-500 |
| **页面主标题** | **IBM Plex Serif**, Georgia, serif | 36px, weight 500 |
| 代码 | JetBrains Mono, ui-monospace | — |

```tsx
// 主标题 —— 衬线是灵魂，勿用 sans 替代
<h1 className="font-serif text-3xl font-medium text-foreground md:text-4xl">
  你的下一个产品从这里开始，Victor。
</h1>
```

Google Fonts 引入在 `globals.css` 顶部 `@import`。

---

## 3 · 圆角 & 阴影

| 元素 | 圆角 | 阴影 |
|---|---|---|
| 常规按钮 | `rounded-lg` (8px) | 无 |
| 输入大卡片 | `rounded-card` (24px) | `shadow-sm` |
| 发送键 | `rounded-full` (全圆) | 无 |
| 积分胶囊 | `rounded-full` + border | 无 |
| 侧栏选中 pill | `rounded-lg` | `shadow-sm` |

**阴影策略**：极浅或没有，靠底色对比分层（`#f6f6f6` → `#fff`），非投影。

---

## 4 · 侧边栏结构

```
w-[300px] bg-sidebar border-r border-border
├── Logo 行 (h-14): bg-brand 图标 + "Atoms"
├── 工作区选择器: bg-card border rounded-lg + 品牌蓝圆形首字母
├── 导航 7 项: 线性图标 + 文字
│   选中态: bg-card text-foreground shadow-sm（白底 pill）
│   未选中: text-muted-foreground hover:bg-card/60
├── 最近构建: 11px uppercase 标题 + truncate 条目
└── 底部: 积分额度 bg-card + 用户行 + ThemeToggle
```

---

## 5 · 首页组件

### 5.1 Agent 头像条
- 8 个 48px 圆形 emoji 头像
- 重叠 `-12px` marginLeft
- `ring-2 ring-background` 白色描边分隔

### 5.2 输入卡片
- 外层: `rounded-card border bg-card shadow-sm p-4`
- textarea: 无边框、透明底、placeholder 灰色
- 工具条: `+` 按钮(左) → spacer → "构建 ▾"(右) → 灰色圆形 ↑ 发送键

### 5.3 工具连接条
- `rounded-lg border border-border-light bg-muted/40`
- 左侧闪电图标 + "将你的工具连接到 Atoms"
- 右侧彩色 logo 占位

### 5.4 Examples 芯片
- `rounded-full border bg-muted/50 text-[11px]`
- 位于输入框下方，低调辅助

---

## 6 · 图标

统一使用线性 SVG，`stroke-width: 1.8`，尺寸 18px（侧栏）/ 16px（按钮内）。
推荐 Lucide React 库（stroke 一致）。

---

## 7 · 禁忌清单

- ❌ 不使用 Tailwind 默认 `gray-*` 调色板（灰阶必须走 `rgba(12,12,12,α)` 阶梯）
- ❌ 不给侧栏/卡片加 `shadow-lg` 或 `shadow-xl`（靠底色分层）
- ❌ 不使用 `bg-gradient-*`（Atoms 几乎无渐变）
- ❌ 主标题不用 sans 字体（衬线是灵魂）
- ❌ 品牌蓝不铺大面积背景（仅按钮/链接/选中）
- ❌ 圆角超过 24px 的卡片（与 Editorial Minimal 不符）
