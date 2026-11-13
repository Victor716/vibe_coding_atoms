import { describe, expect, it } from "vitest";

import { extractCode } from "@/lib/extract";

describe("extractCode", () => {
  it("空输入返回空串", () => {
    expect(extractCode("")).toBe("");
  });

  it("标准 ```html 代码块", () => {
    const raw = "这是我的实现：\n```html\n<!DOCTYPE html><html><body>hi</body></html>\n```\n完毕";
    expect(extractCode(raw)).toBe("<!DOCTYPE html><html><body>hi</body></html>");
  });

  it("大写 HTML 标签围栏", () => {
    expect(extractCode("```HTML\n<h1>x</h1>\n```")).toBe("<h1>x</h1>");
  });

  it("兜底：任意 ``` 块 + 内层像 HTML", () => {
    const raw = "输出：\n```\n<!DOCTYPE html>\n<html></html>\n```";
    expect(extractCode(raw)).toBe("<!DOCTYPE html>\n<html></html>");
  });

  it("兜底：裸 HTML 无围栏", () => {
    const raw = "<!DOCTYPE html>\n<html><body>hi</body></html>";
    expect(extractCode(raw)).toBe(raw);
  });

  it("最外层兜底：无 HTML 特征则原样 strip", () => {
    expect(extractCode("  hello  ")).toBe("hello");
  });
});
