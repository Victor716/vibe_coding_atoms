"""FastAPI 入口：CORS + 路由注册 + lifespan 建表。"""
from __future__ import annotations

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import builds, health
from config import get_settings
from db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    await init_db()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="vibe_coding backend",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        # SSE 需要暴露 content-type，避免浏览器拦截
        expose_headers=["Content-Type", "Cache-Control", "Connection"],
    )
    app.include_router(health.router)
    app.include_router(builds.router)
    return app


app = create_app()
