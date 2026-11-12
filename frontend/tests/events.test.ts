import { describe, expect, it } from "vitest";

import { parseEvent } from "@/lib/events";

describe("parseEvent", () => {
  it("status 事件解析", () => {
    expect(parseEvent({ event: "status", data: JSON.stringify({ stage: "pm" }) })).toEqual({
      type: "status",
      stage: "pm",
    });
  });

  it("非法 stage 回退到 pm", () => {
    const e = parseEvent({ event: "status", data: JSON.stringify({ stage: "weird" }) });
    expect(e).toEqual({ type: "status", stage: "pm" });
  });

  it("prd_delta / code_delta 文本原样透传", () => {
    expect(parseEvent({ event: "prd_delta", data: JSON.stringify({ text: "hi" }) })).toEqual({
      type: "prd_delta",
      text: "hi",
    });
  });

  it("done 事件无 payload", () => {
    expect(parseEvent({ event: "done", data: "{}" })).toEqual({ type: "done" });
  });

  it("未知事件返回 null", () => {
    expect(parseEvent({ event: "unknown", data: "{}" })).toBeNull();
  });

  it("坏 JSON 转成 error 事件", () => {
    const e = parseEvent({ event: "status", data: "{bad" });
    expect(e?.type).toBe("error");
  });
});
