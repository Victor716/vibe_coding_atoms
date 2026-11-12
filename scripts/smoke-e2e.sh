#!/usr/bin/env bash
# 0:30 checkpoint 冒烟：POST → SSE 三帧 → done
# 前置：backend 已运行在 :8000；本脚本只依赖 curl
set -euo pipefail
BASE="${API_BASE:-http://localhost:8000}"

echo "[smoke] healthcheck $BASE/api/health"
curl -sSf "$BASE/api/health" >/dev/null

echo "[smoke] POST /api/builds"
BODY='{"prompt":"ping","mode":"standard"}'
RESP="$(curl -sSf -X POST "$BASE/api/builds" \
        -H 'Content-Type: application/json' \
        --data "$BODY")"
ID="$(printf '%s' "$RESP" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')"
[[ -n "$ID" ]] || { echo "[smoke] missing id in response: $RESP"; exit 1; }
echo "  → session id: $ID"

echo "[smoke] GET /api/builds/$ID/stream (SSE, ${SSE_TIMEOUT:-240}s 超时)"
curl -sSf -N --max-time "${SSE_TIMEOUT:-240}" "$BASE/api/builds/$ID/stream" \
  | tee /tmp/sse.out
grep -q 'event: done' /tmp/sse.out || { echo "[smoke] no done event"; exit 1; }
grep -q 'event: status' /tmp/sse.out || { echo "[smoke] no status event"; exit 1; }

echo "[smoke] PASS"
