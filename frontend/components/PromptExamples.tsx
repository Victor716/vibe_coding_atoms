"use client";

import { cn } from "@/lib/utils";

export interface PromptExample {
  label: string;
  hint: string;
  prompt: string;
}

/** preset 列表；导出方便首页和文档复用。 */
export const PROMPT_EXAMPLES: PromptExample[] = [
  {
    label: "待办清单",
    hint: "增删 + 本地存储",
    prompt: "帮我做一个待办清单，可以新增、勾选完成、删除；数据存 localStorage。",
  },
  {
    label: "贪吃蛇",
    hint: "键盘操控 + 计分",
    prompt: "做一个单页贪吃蛇小游戏，方向键控制，吃到食物加 10 分，撞墙或撞自己结束。",
  },
  {
    label: "个人主页",
    hint: "响应式卡片布局",
    prompt: "生成一个个人主页，包含头像、简介、社交链接、代表作品三张卡片，深色主题。",
  },
  {
    label: "计算器",
    hint: "四则运算 UI",
    prompt: "做一个网页计算器，按钮式布局，支持加减乘除、清除和小数点，显示历史。",
  },
];

interface Props {
  onPick: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
}

/** 首页 preset 芯片：点击把 prompt 填进 textarea，不自动提交。 */
export function PromptExamples({ onPick, disabled, className }: Props) {
  return (
    <div className={cn("flex flex-wrap gap-1.5 px-2 pb-1", className)}>
      {PROMPT_EXAMPLES.map((ex) => (
        <button
          key={ex.label}
          type="button"
          disabled={disabled}
          onClick={() => onPick(ex.prompt)}
          title={ex.prompt}
          className={cn(
            "rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition",
            "hover:border-border hover:bg-muted hover:text-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {ex.label}
        </button>
      ))}
    </div>
  );
}
