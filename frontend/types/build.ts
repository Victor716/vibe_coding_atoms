/**
 * 契约类型：与 backend/schemas.py 一一对应。
 * 修改任一侧必须同步另一侧（M0 冻结点）。
 */
export type Mode = "standard" | "plan";
export type Status = "pending" | "running" | "done" | "failed";
export type Stage = "pm" | "engineer" | "sandbox";
export type Level = "L0" | "L1" | "L2" | "L3";

export interface BuildSession {
  id: string;
  prompt: string;
  mode: Mode;
  status: Status;
  prd: string | null;
  code: string | null;
  preview_url: string | null;
  error: string | null;
  created_at: string; // ISO 8601
}

export interface BuildCreateRequest {
  prompt: string;
  mode?: Mode;
}

export interface BuildCreateResponse {
  id: string;
}

// ---- SSE 事件联合类型 ----
export type BuildEvent =
  | { type: "status"; stage: Stage }
  | { type: "prd_delta"; text: string }
  | { type: "code_delta"; text: string }
  | { type: "preview_url"; url: string }
  | { type: "error"; message: string }
  | { type: "done" };

export interface HealthResponse {
  ok: boolean;
  sandbox: boolean;
  llm: boolean;
  version: string;
}
