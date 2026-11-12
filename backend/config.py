"""配置：唯一读取环境变量的入口（后端规范 §配置与日志）。"""
from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ---- LLM (Ollama OpenAI-compatible) ----
    llm_base_url: str = Field(default="http://localhost:11434/v1")
    llm_api_key: str = Field(default="ollama")
    llm_model: str = Field(default="qwen2.5-coder:7b")
    llm_stream: bool = Field(default=True)

    # ---- Sandbox ----
    sandbox_base_url: str = Field(default="http://localhost:9000")
    sandbox_public_host: str = Field(default="localhost")
    sandbox_port_start: int = Field(default=10000)
    sandbox_port_end: int = Field(default=10100)
    sandbox_image: str = Field(default="nginx:alpine")
    sandbox_fallback_local: bool = Field(default=True)
    sandbox_default_level: str = Field(default="L0")  # L0 / L1 / L2 / L3

    # ---- DB ----
    database_url: str = Field(default="sqlite+aiosqlite:///./app.db")

    # ---- CORS ----
    cors_origins: str = Field(default="http://localhost:3000")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def port_slots(self) -> int:
        return self.sandbox_port_end - self.sandbox_port_start + 1


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """FastAPI Depends 用；进程内单例。"""
    return Settings()
