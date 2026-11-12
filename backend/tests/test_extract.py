"""extract_code 单测：对应 docs/build-pipeline.md §代码提取容错。"""
from __future__ import annotations

import pytest

from tools.extract import extract_code


def test_empty() -> None:
    assert extract_code("") == ""


def test_standard_html_block() -> None:
    raw = "这是我的实现：\n```html\n<!DOCTYPE html><html><body>hi</body></html>\n```\n完毕"
    assert extract_code(raw) == "<!DOCTYPE html><html><body>hi</body></html>"


def test_uppercase_html_tag() -> None:
    raw = "```HTML\n<h1>x</h1>\n```"
    assert extract_code(raw) == "<h1>x</h1>"


def test_fallback_any_block_with_html_hint() -> None:
    # 模型只打了 ``` 没写语言，但块内是 HTML
    raw = "输出：\n```\n<!DOCTYPE html>\n<html></html>\n```\n解释文字"
    out = extract_code(raw)
    assert out.startswith("<!DOCTYPE html>")


def test_fallback_bare_html_no_fence() -> None:
    raw = "<!DOCTYPE html><html><body></body></html>"
    assert extract_code(raw) == raw


def test_fallback_non_code_returns_stripped() -> None:
    raw = "  模型没按格式，随便写了一段说明  "
    assert extract_code(raw) == "模型没按格式，随便写了一段说明"


@pytest.mark.parametrize(
    "raw, expected_start",
    [
        ("```html\n<html></html>\n```", "<html>"),
        ("```\n<html></html>\n```", "<html>"),
        ("<html></html>", "<html>"),
    ],
)
def test_three_paths_all_hit(raw: str, expected_start: str) -> None:
    assert extract_code(raw).startswith(expected_start)
