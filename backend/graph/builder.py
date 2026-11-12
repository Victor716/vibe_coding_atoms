"""LangGraph 图编译（全局单例，禁止每请求重建 —— 后端规范 §AI 编排）。"""
from __future__ import annotations

from functools import lru_cache

from langgraph.graph import END, START, StateGraph

from graph.nodes import engineer_node, pm_node, sandbox_node
from graph.state import BuildState


def build_graph():  # type: ignore[no-untyped-def]
    """最小状态图：START → pm → engineer → sandbox → END。不加条件边/checkpoint。"""
    builder = StateGraph(BuildState)
    builder.add_node("pm", pm_node)
    builder.add_node("engineer", engineer_node)
    builder.add_node("sandbox", sandbox_node)
    builder.add_edge(START, "pm")
    builder.add_edge("pm", "engineer")
    builder.add_edge("engineer", "sandbox")
    builder.add_edge("sandbox", END)
    return builder.compile()


@lru_cache(maxsize=1)
def get_graph():  # type: ignore[no-untyped-def]
    return build_graph()
