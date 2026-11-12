"""LLM 输出代码块提取，两级容错。对应 docs/build-pipeline.md §代码提取容错。

策略：
1. 优先匹配 ```html / ```HTML 代码块
2. 兜底：任意 ``` 代码块 + 首行含 <!DOCTYPE 或 <html
3. 再兜底：整段 strip 后本身就是 html
4. 最外层兜底：原样返回（去空白）
"""
from __future__ import annotations

import re

_HTML_BLOCK = re.compile(r"```(?:html|HTML)\s*\n(.*?)```", re.DOTALL)
_ANY_BLOCK = re.compile(r"```[^\n]*\n(.*?)```", re.DOTALL)
_LIKE_HTML = re.compile(r"<\s*(!DOCTYPE|html)", re.IGNORECASE)


def extract_code(raw: str) -> str:
    if not raw:
        return ""
    m = _HTML_BLOCK.search(raw)
    if m:
        return m.group(1).strip()
    for m in _ANY_BLOCK.finditer(raw):
        body = m.group(1)
        if _LIKE_HTML.search(body):
            return body.strip()
    stripped = raw.strip()
    if _LIKE_HTML.search(stripped[:200]):
        return stripped
    return stripped
