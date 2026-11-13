/**
 * LLM 输出代码块提取（前端镜像），与 backend/tools/extract.py 4 级容错保持一致。
 *
 * 用途：SSE 流式期间 `code_delta` 推的是模型原始 token（含 ```html 围栏），
 * 而 L2 srcDoc 需要干净 HTML。done 后 `initial.code` 已是服务端 extract 过的，
 * 但流式过程中只能靠这份客户端版本兜住。
 */

const HTML_BLOCK = /```(?:html|HTML)\s*\n([\s\S]*?)```/;
const ANY_BLOCK_RE = /```[^\n]*\n([\s\S]*?)```/g;
const LIKE_HTML = /^\s*<\s*(!DOCTYPE|html)/i;

export function extractCode(raw: string): string {
  if (!raw) return "";

  const htmlBlock = HTML_BLOCK.exec(raw);
  if (htmlBlock) return htmlBlock[1].trim();

  // 重新构造全局正则，避免 exec 状态共享
  for (const m of raw.matchAll(new RegExp(ANY_BLOCK_RE.source, "g"))) {
    const body = m[1] ?? "";
    if (LIKE_HTML.test(body)) return body.trim();
  }

  const stripped = raw.trim();
  if (LIKE_HTML.test(stripped.slice(0, 200))) return stripped;
  return stripped;
}
