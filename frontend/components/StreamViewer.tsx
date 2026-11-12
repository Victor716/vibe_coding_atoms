"use client";

import { collectText } from "@/components/StageStatus";
import type { BuildEvent } from "@/types/build";

interface Props {
  events: BuildEvent[];
}

export function StreamViewer({ events }: Props) {
  const prd = collectText(events, "prd_delta");
  const code = collectText(events, "code_delta");

  return (
    <div className="grid grid-rows-2 gap-3">
      <Panel title="PRD（PM 节点）">
        <pre className="whitespace-pre-wrap break-words text-xs">{prd || "等待 PM 输出…"}</pre>
      </Panel>
      <Panel title="Code（Engineer 节点）">
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-relaxed">
          {code || "等待 Engineer 输出…"}
        </pre>
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-lg border bg-white p-3">
      <h3 className="text-xs font-semibold text-neutral-500">{title}</h3>
      <div className="min-h-[8rem] rounded bg-neutral-50 p-3">{children}</div>
    </section>
  );
}
