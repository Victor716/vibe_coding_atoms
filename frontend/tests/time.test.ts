import { describe, expect, it } from "vitest";

import { relativeTime } from "@/lib/time";

const NOW = Date.parse("2026-11-13T12:00:00.000Z");

describe("relativeTime", () => {
  it("无效 ISO → 破折号", () => {
    expect(relativeTime("not-a-date", NOW)).toBe("—");
    expect(relativeTime("", NOW)).toBe("—");
  });

  it("<30s → 刚刚", () => {
    expect(relativeTime(new Date(NOW - 15_000).toISOString(), NOW)).toBe("刚刚");
  });

  it("30–59s → N 秒前", () => {
    expect(relativeTime(new Date(NOW - 45_000).toISOString(), NOW)).toBe("45 秒前");
  });

  it("<60min → N 分钟前", () => {
    expect(relativeTime(new Date(NOW - 3 * 60_000).toISOString(), NOW)).toBe("3 分钟前");
  });

  it("<24h → N 小时前", () => {
    expect(relativeTime(new Date(NOW - 5 * 3_600_000).toISOString(), NOW)).toBe("5 小时前");
  });

  it("<7d → N 天前", () => {
    expect(relativeTime(new Date(NOW - 6 * 86_400_000).toISOString(), NOW)).toBe("6 天前");
  });

  it("≥7d → 日期", () => {
    const iso = new Date(NOW - 30 * 86_400_000).toISOString();
    expect(relativeTime(iso, NOW)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("未来时间戳 → 刚刚（不做绝对值）", () => {
    expect(relativeTime(new Date(NOW + 5_000).toISOString(), NOW)).toBe("刚刚");
  });
});
