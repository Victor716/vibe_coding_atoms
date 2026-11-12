import type { BuildCreateResponse, BuildSession, HealthResponse } from "@/types/build";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

/** 前端所有后端调用统一从这里走（前端规范 §API 调用规范）。 */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, text || res.statusText);
  }
  return (await res.json()) as T;
}

export async function createBuild(
  prompt: string,
  mode: "standard" | "plan" = "standard",
): Promise<BuildCreateResponse> {
  const res = await fetch(`${BASE}/api/builds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, mode }),
  });
  return jsonOrThrow<BuildCreateResponse>(res);
}

export async function getBuild(id: string): Promise<BuildSession> {
  const res = await fetch(`${BASE}/api/builds/${id}`, { cache: "no-store" });
  return jsonOrThrow<BuildSession>(res);
}

export async function listBuilds(limit = 20): Promise<BuildSession[]> {
  const res = await fetch(`${BASE}/api/builds?limit=${limit}`, { cache: "no-store" });
  const body = await jsonOrThrow<{ items: BuildSession[] }>(res);
  return body.items;
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE}/api/health`);
  return jsonOrThrow<HealthResponse>(res);
}

/** 拼 SSE URL，交给 use-build-stream 用 fetch + AbortController 打开。 */
export function streamUrl(id: string): string {
  return `${BASE}/api/builds/${id}/stream`;
}
