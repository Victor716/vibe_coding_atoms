"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import {
  STAGES,
  formatDuration,
  stageDuration,
  type StageTimes,
} from "@/lib/stage-timing";
import type { Stage } from "@/types/build";

interface Props {
  stageTimes: StageTimes;
  currentStage: Stage | null;
  isStreaming: boolean;
  hasError: boolean;
}

const LABEL: Record<Stage, string> = {
  pm: "PM",
  engineer: "Engineer",
  sandbox: "Sandbox",
};

type PillState = "pending" | "running" | "done" | "failed";

function resolve(state: StageTimes[Stage], stage: Stage, p: Props): PillState {
  if (state.startedAt === null) return "pending";
  if (state.endedAt === null) return "running";
  // 已 endedAt：若整个流因 error 停止且这就是出错时的 currentStage → 红色
  if (p.hasError && !p.isStreaming && p.currentStage === stage) return "failed";
  return "done";
}

/** 三段式进度条：PM → Engineer → Sandbox；in-flight 时每 250ms 刷一次耗时。 */
export function StageTimeline({ stageTimes, currentStage, isStreaming, hasError }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isStreaming) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [isStreaming]);

  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {STAGES.map((s, idx) => {
        const timing = stageTimes[s];
        const pill = resolve(timing, s, { stageTimes, currentStage, isStreaming, hasError });
        const durMs = stageDuration(timing, now);
        return (
          <li key={s} className="flex items-center gap-2">
            {idx > 0 && <span className="text-muted-foreground/40">→</span>}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium",
                pill === "pending" && "border-border text-muted-foreground",
                pill === "running" &&
                  "border-warning/40 bg-warning/10 text-warning animate-pulse",
                pill === "done" && "border-success/30 bg-success/10 text-success",
                pill === "failed" && "border-destructive/30 bg-destructive/10 text-destructive",
              )}
              aria-current={pill === "running" ? "step" : undefined}
            >
              <span>{LABEL[s]}</span>
              <span className="tabular-nums opacity-70">{formatDuration(durMs)}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
