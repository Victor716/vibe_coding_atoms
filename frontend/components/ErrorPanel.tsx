"use client";

import type { BuildEvent } from "@/types/build";

interface Props {
  events: BuildEvent[];
  onRetry: () => void;
}

/** 从事件流里取最后一条 error.message；不存在时返回 null。 */
export function pickLastError(events: BuildEvent[]): string | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (e.type === "error") return e.message;
  }
  return null;
}

/** hasError=true 时挂；覆盖 SSE error 事件 + 前端 fetch 层错误。 */
export function ErrorPanel({ events, onRetry }: Props) {
  const message = pickLastError(events);
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex flex-col gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground"
        >
          !
        </span>
        <span className="font-medium">构建失败</span>
      </div>
      <pre className="whitespace-pre-wrap break-words rounded bg-card/60 p-2 text-xs">
        {message}
      </pre>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-white hover:bg-destructive/80"
        >
          重试
        </button>
        <span className="self-center text-[11px] opacity-70">
          若问题持续，请检查后端 health 或 Ollama 状态
        </span>
      </div>
    </div>
  );
}
