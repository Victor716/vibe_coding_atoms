"use client";

import { cn } from "@/lib/utils";
import type { BuildEvent, Stage } from "@/types/build";

interface Props {
  stage: Stage | null;
  isStreaming: boolean;
  hasError: boolean;
}

const LABEL: Record<Stage, string> = {
  pm: "PM 节点",
  engineer: "Engineer 节点",
  sandbox: "沙箱部署",
};

export function StageStatus({ stage, isStreaming, hasError }: Props) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span
        className={cn(
          "rounded-full px-3 py-1 font-medium",
          isStreaming ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800",
          hasError && "bg-red-100 text-red-800",
        )}
      >
        {hasError ? "错误" : isStreaming ? "构建中" : "已完成"}
      </span>
      {stage && <span className="text-neutral-500">当前：{LABEL[stage]}</span>}
    </div>
  );
}

/** 从事件流中抽取指定事件的文本，方便上层消费。 */
export function collectText(events: BuildEvent[], type: "prd_delta" | "code_delta"): string {
  return events
    .filter((e): e is Extract<BuildEvent, { type: typeof type }> => e.type === type)
    .map((e) => e.text)
    .join("");
}
