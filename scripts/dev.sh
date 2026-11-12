#!/usr/bin/env bash
# 并行起 backend + sandbox + frontend；Ctrl+C 一并退出
set -euo pipefail
cd "$(dirname "$0")/.."

cleanup() { jobs -p | xargs -r kill; }
trap cleanup EXIT INT TERM

( cd backend  && uv run uvicorn main:app --reload --port 8000 ) &
( cd sandbox  && uv run uvicorn main:app --reload --port 9000 ) &
( cd frontend && pnpm dev ) &

wait -n
exit $?
