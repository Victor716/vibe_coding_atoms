import { describe, expect, it } from "vitest";

import {
  applyFrameForTiming,
  formatDuration,
  initialStageTimes,
  stageDuration,
} from "@/lib/stage-timing";
import type { BuildEvent } from "@/types/build";

describe("applyFrameForTiming", () => {
  it("status(pm) 只启动 pm 计时", () => {
    const t = applyFrameForTiming(initialStageTimes(), { type: "status", stage: "pm" }, 1000);
    expect(t.pm).toEqual({ startedAt: 1000, endedAt: null });
    expect(t.engineer.startedAt).toBeNull();
    expect(t.sandbox.startedAt).toBeNull();
  });

  it("status(engineer) 结束 pm，开启 engineer", () => {
    let t = applyFrameForTiming(initialStageTimes(), { type: "status", stage: "pm" }, 1000);
    t = applyFrameForTiming(t, { type: "status", stage: "engineer" }, 2500);
    expect(t.pm).toEqual({ startedAt: 1000, endedAt: 2500 });
    expect(t.engineer).toEqual({ startedAt: 2500, endedAt: null });
  });

  it("delta / preview_url 事件不影响计时", () => {
    const base = applyFrameForTiming(initialStageTimes(), { type: "status", stage: "pm" }, 100);
    const e1: BuildEvent = { type: "prd_delta", text: "hi" };
    const e2: BuildEvent = { type: "preview_url", url: "http://x" };
    expect(applyFrameForTiming(base, e1, 9999)).toBe(base);
    expect(applyFrameForTiming(base, e2, 9999)).toBe(base);
  });

  it("done 收尾最后一个 in-flight stage", () => {
    let t = applyFrameForTiming(initialStageTimes(), { type: "status", stage: "pm" }, 1000);
    t = applyFrameForTiming(t, { type: "status", stage: "engineer" }, 2000);
    t = applyFrameForTiming(t, { type: "status", stage: "sandbox" }, 3000);
    t = applyFrameForTiming(t, { type: "done" }, 4000);
    expect(t.pm.endedAt).toBe(2000);
    expect(t.engineer.endedAt).toBe(3000);
    expect(t.sandbox.endedAt).toBe(4000);
  });

  it("error 也收尾，方便 UI 显示红色耗时", () => {
    let t = applyFrameForTiming(initialStageTimes(), { type: "status", stage: "pm" }, 100);
    t = applyFrameForTiming(t, { type: "status", stage: "engineer" }, 200);
    t = applyFrameForTiming(t, { type: "error", message: "boom" }, 900);
    expect(t.engineer.endedAt).toBe(900);
  });

  it("重复收到同一 status 不会重置 startedAt", () => {
    let t = applyFrameForTiming(initialStageTimes(), { type: "status", stage: "pm" }, 100);
    t = applyFrameForTiming(t, { type: "status", stage: "pm" }, 500);
    expect(t.pm.startedAt).toBe(100);
    expect(t.pm.endedAt).toBeNull();
  });
});

describe("stageDuration", () => {
  it("未开始返回 null", () => {
    expect(stageDuration({ startedAt: null, endedAt: null }, 1000)).toBeNull();
  });

  it("进行中用外部 now 兜底", () => {
    expect(stageDuration({ startedAt: 100, endedAt: null }, 550)).toBe(450);
  });

  it("已结束用 endedAt", () => {
    expect(stageDuration({ startedAt: 100, endedAt: 800 }, 99_999)).toBe(700);
  });
});

describe("formatDuration", () => {
  it("null → 破折号", () => {
    expect(formatDuration(null)).toBe("—");
  });
  it("<1s → ms", () => {
    expect(formatDuration(480)).toBe("480ms");
  });
  it("<1min → 秒", () => {
    expect(formatDuration(1400)).toBe("1.4s");
    expect(formatDuration(32_500)).toBe("32.5s");
  });
  it("≥1min → 分秒", () => {
    expect(formatDuration(83_000)).toBe("1m23s");
  });
});
