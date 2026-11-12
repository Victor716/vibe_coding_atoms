"""数据层：AsyncEngine + get_db()。所有查询走 AsyncSession（后端规范 §数据层）。"""
from __future__ import annotations

from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from config import get_settings

_settings = get_settings()

engine = create_async_engine(_settings.database_url, echo=False, future=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def init_db() -> None:
    """lifespan 调用；考试场景手工建表，不上 Alembic。"""
    from models import BuildSession  # noqa: F401  确保模型已注册

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session
