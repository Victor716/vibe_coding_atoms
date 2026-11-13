"use client";

import { cn } from "@/lib/utils";

interface Props {
  isStreaming: boolean;
  /** 曾经有过事件（用于决定"重跑"按钮是否可用）。 */
  hasHistory: boolean;
  onAbort: () => void;
  onRestart: () => void;
}

/** 停止 / 重跑 控制条；仅承担交互，状态由父层 hook 提供。 */
export function BuildControls({ isStreaming, hasHistory, onAbort, onRestart }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onAbort}
        disabled={!isStreaming}
        className={cn(
          "rounded-md border px-3 py-1.5 text-xs font-medium transition",
          "border-destructive/30 text-destructive hover:bg-destructive/10",
          "disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent",
        )}
      >
        停止
      </button>
      <button
        type="button"
        onClick={onRestart}
        disabled={isStreaming || !hasHistory}
        className={cn(
          "rounded-md border px-3 py-1.5 text-xs font-medium transition",
          "border-border text-foreground hover:bg-muted",
          "disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent",
        )}
      >
        重跑
      </button>
      {isStreaming && (
        <span className="ml-1 text-[11px] text-muted-foreground">构建进行中，可随时停止</span>
      )}
    </div>
  );
}
