"""SQLModel 表：唯一实体 BuildSession。"""
from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from sqlmodel import Field, SQLModel


def new_uuid() -> str:
    return f"bld_{uuid4().hex}"


def utcnow() -> datetime:
    return datetime.now(UTC)


class BuildSession(SQLModel, table=True):
    __tablename__ = "build_session"

    id: str = Field(primary_key=True, default_factory=new_uuid)
    prompt: str = Field(index=True)
    mode: str = Field(default="standard")            # standard / plan（A 决策：仅记录）
    status: str = Field(default="pending", index=True)  # pending / running / done / failed
    prd: str | None = None
    code: str | None = None
    preview_url: str | None = None
    error: str | None = None
    created_at: datetime = Field(default_factory=utcnow)
