"use client";

import { collectText } from "@/components/StageStatus";
import type { BuildEvent } from "@/types/build";

interface Props {
  events: BuildEvent[];
  isStreaming?: boolean;
}

export function StreamViewer({ events, isStreaming }: Props) {
  const prd = collectText(events, "prd_delta");
  const code = collectText(events, "code_delta");

  return (
    <div className="grid grid-rows-2 gap-3">
      <Panel title="PRD（PM 节点）">
        <pre className={`whitespace-pre-wrap break-words text-xs${isStreaming && !code ? " stream-cursor" : ""}`}>
          {prd || "等待 PM 输出…"}
        </pre>
      </Panel>
      <Panel title="Code（Engineer 节点）">
        <pre className={`max-h-64 overflow-auto font-mono whitespace-pre-wrap break-all text-[11px] leading-relaxed${isStreaming && code ? " stream-cursor" : ""}`}>
          {code || "等待 Engineer 输出…"}
        </pre>
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-lg border bg-card p-3">
      <h3 className="text-xs font-semibold text-muted-foreground">{title}</h3>
      <div className="min-h-[8rem] rounded bg-muted p-3">{children}</div>
    </section>
  );
}
