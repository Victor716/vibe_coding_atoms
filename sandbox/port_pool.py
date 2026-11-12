"""端口池管理：10000–10100，共 101 槽；满则拒绝。"""
from __future__ import annotations

import threading


class PortPool:
    def __init__(self, start: int, end: int) -> None:
        if end < start:
            raise ValueError("end must be >= start")
        self._start = start
        self._end = end
        self._used: dict[str, int] = {}    # session_id → port
        self._lock = threading.Lock()

    @property
    def capacity(self) -> int:
        return self._end - self._start + 1

    def allocate(self, session_id: str) -> int | None:
        with self._lock:
            if session_id in self._used:
                return self._used[session_id]
            taken = set(self._used.values())
            for port in range(self._start, self._end + 1):
                if port not in taken:
                    self._used[session_id] = port
                    return port
            return None

    def release(self, session_id: str) -> None:
        with self._lock:
            self._used.pop(session_id, None)

    def snapshot(self) -> dict[str, int]:
        with self._lock:
            return dict(self._used)
