import type { BuildEvent, Stage } from "@/types/build";

export interface SseFrame {
  event: string;
  data: string;
}

const STAGES: readonly Stage[] = ["pm", "engineer", "sandbox"] as const;

function toStage(v: unknown): Stage {
  return STAGES.includes(v as Stage) ? (v as Stage) : "pm";
}

/** 把 SSE 单帧解析成 BuildEvent；未知事件返回 null，让上层忽略。 */
export function parseEvent(frame: SseFrame): BuildEvent | null {
  const { event, data } = frame;
  let payload: Record<string, unknown> = {};
  try {
    payload = data ? (JSON.parse(data) as Record<string, unknown>) : {};
  } catch {
    return { type: "error", message: `bad JSON for event=${event}: ${data}` };
  }

  switch (event) {
    case "status":
      return { type: "status", stage: toStage(payload.stage) };
    case "prd_delta":
      return { type: "prd_delta", text: String(payload.text ?? "") };
    case "code_delta":
      return { type: "code_delta", text: String(payload.text ?? "") };
    case "preview_url":
      return { type: "preview_url", url: String(payload.url ?? "") };
    case "error":
      return { type: "error", message: String(payload.message ?? "unknown error") };
    case "done":
      return { type: "done" };
    default:
      return null;
  }
}
