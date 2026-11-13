import type { BuildEvent, Stage } from "@/types/build";

export interface StageTiming {
  startedAt: number | null;
  endedAt: number | null;
}

export type StageTimes = Record<Stage, StageTiming>;

const STAGES: readonly Stage[] = ["pm", "engineer", "sandbox"] as const;

export function initialStageTimes(): StageTimes {
  return {
    pm: { startedAt: null, endedAt: null },
    engineer: { startedAt: null, endedAt: null },
    sandbox: { startedAt: null, endedAt: null },
  };
}

/**
 * 纯函数 reducer：把一条 SSE 事件 fold 进 stage 计时表。
 *
 * 规则：
 * - `status {stage}`：结束所有仍在 in-flight 的 stage（写入 endedAt=now），
 *   然后开启新 stage（若之前没记 startedAt，写入 now）。重复收到同一 stage 不会重置 startedAt。
 * - `done` / `error`：把仍在 in-flight 的最后一个 stage 收尾（error 场景 endedAt 同样写，
 *   UI 靠 hasError 判断是否显示红色）。
 * - 其他事件（prd_delta / code_delta / preview_url）不影响计时。
 */
export function applyFrameForTiming(
  prev: StageTimes,
  event: BuildEvent,
  now: number,
): StageTimes {
  if (event.type === "status") {
    const next: StageTimes = { ...prev };
    for (const s of STAGES) {
      if (next[s].startedAt !== null && next[s].endedAt === null) {
        next[s] = { ...next[s], endedAt: now };
      }
    }
    const target = event.stage;
    next[target] = {
      startedAt: next[target].startedAt ?? now,
      endedAt: null,
    };
    return next;
  }
  if (event.type === "done" || event.type === "error") {
    const next: StageTimes = { ...prev };
    for (const s of STAGES) {
      if (next[s].startedAt !== null && next[s].endedAt === null) {
        next[s] = { ...next[s], endedAt: now };
      }
    }
    return next;
  }
  return prev;
}

/** 单段耗时；startedAt / endedAt 缺一返回 null。 */
export function stageDuration(t: StageTiming, now = Date.now()): number | null {
  if (t.startedAt === null) return null;
  return (t.endedAt ?? now) - t.startedAt;
}

/** 毫秒格式化成 `1.4s` / `480ms` / `1m23s`。 */
export function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}m${s.toString().padStart(2, "0")}s`;
}

export { STAGES };
