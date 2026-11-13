import { describe, expect, it } from "vitest";

import { pickLastError } from "@/components/ErrorPanel";
import type { BuildEvent } from "@/types/build";

describe("pickLastError", () => {
  it("无 error 事件 → null", () => {
    const events: BuildEvent[] = [
      { type: "status", stage: "pm" },
      { type: "prd_delta", text: "hi" },
      { type: "done" },
    ];
    expect(pickLastError(events)).toBeNull();
  });

  it("单条 error → 返回其 message", () => {
    const events: BuildEvent[] = [{ type: "error", message: "boom" }];
    expect(pickLastError(events)).toBe("boom");
  });

  it("多条 error → 取最后一条", () => {
    const events: BuildEvent[] = [
      { type: "error", message: "first" },
      { type: "status", stage: "engineer" },
      { type: "error", message: "second" },
      { type: "done" },
    ];
    expect(pickLastError(events)).toBe("second");
  });

  it("空事件流 → null", () => {
    expect(pickLastError([])).toBeNull();
  });
});
