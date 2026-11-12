# vibe_coding · 顶层入口
# 用法：make <target>，详细见 README.md

.DEFAULT_GOAL := help
SHELL := /bin/bash

BACKEND_DIR  := backend
FRONTEND_DIR := frontend
SANDBOX_DIR  := sandbox

.PHONY: help install dev backend-up frontend-up sandbox-up \
        lint test ci smoke clean prewarm help

help: ## 列出可用目标
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

## ---- 安装 ----
install: install-backend install-sandbox install-frontend ## 三块依赖一起装

install-backend: ## backend uv sync
	@cd $(BACKEND_DIR) && (command -v uv >/dev/null && uv sync || pip install -e ".[dev]")

install-sandbox: ## sandbox uv sync
	@cd $(SANDBOX_DIR) && (command -v uv >/dev/null && uv sync || pip install -e ".[dev]")

install-frontend: ## frontend pnpm install
	@cd $(FRONTEND_DIR) && pnpm install

## ---- 起服务 ----
dev: ## 并行起 backend + sandbox + frontend（Ctrl+C 全部停）
	@bash scripts/dev.sh

backend-up: ## 单起 backend (:8000)
	@cd $(BACKEND_DIR) && uvicorn main:app --reload --port 8000

sandbox-up: ## 单起 sandbox-agent (:9000)
	@cd $(SANDBOX_DIR) && uvicorn main:app --reload --port 9000

frontend-up: ## 单起 frontend (:3000)
	@cd $(FRONTEND_DIR) && pnpm dev

## ---- 质量 ----
lint: lint-backend lint-frontend ## 全量 lint

lint-backend:
	@cd $(BACKEND_DIR) && ruff check . && mypy .

lint-frontend:
	@cd $(FRONTEND_DIR) && pnpm tsc --noEmit && pnpm lint

test: test-backend test-frontend ## 全量测试

test-backend:
	@cd $(BACKEND_DIR) && pytest -q

test-frontend:
	@cd $(FRONTEND_DIR) && pnpm test --run

ci: lint test ## 本地跑一遍 CI 等价目标

smoke: ## 0:30 checkpoint：POST 建会话 → SSE 三帧 → done
	@bash scripts/smoke-e2e.sh

prewarm: ## 提前拉 nginx:alpine，考试当天避免现场 pull
	@bash scripts/prewarm.sh

clean: ## 清理构建产物
	@rm -rf $(FRONTEND_DIR)/.next $(FRONTEND_DIR)/node_modules 2>/dev/null || true
	@find . -type d -name __pycache__ -prune -exec rm -rf {} + 2>/dev/null || true
