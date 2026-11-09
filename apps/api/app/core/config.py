from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Qurio API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # PostgreSQL Sandbox (Docker Isolated Instance)
    SANDBOX_DB_HOST: str = "localhost"
    SANDBOX_DB_PORT: int = 5433
    SANDBOX_DB_NAME: str = "ecommerce_sandbox"
    SANDBOX_DB_USER: str = "readonly_student"
    SANDBOX_DB_PASSWORD: str = "student_safe_pass"
    SANDBOX_STATEMENT_TIMEOUT_MS: int = 2000
    SANDBOX_MAX_CONNECTIONS: int = 20
    SANDBOX_MAX_ROWS: int = 1000

    # Supabase (App DB & Auth)
    SUPABASE_URL: str = Field(default="https://bfvgqxfzftumwrleacof.supabase.co", description="Supabase Project URL")
    SUPABASE_ANON_KEY: str = Field(default="", description="Supabase Anon/Public Key")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="", description="Supabase Service Role Key (Admin)")
    SUPABASE_JWT_AUDIENCE: str = "authenticated"
    SUPABASE_JWT_SECRET: str = Field(default="", description="Optional symmetric secret for HMAC / local tests")

    @property
    def SUPABASE_JWKS_URL(self) -> str:
        return f"{self.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"

    @property
    def SUPABASE_JWT_ISSUER(self) -> str:
        return f"{self.SUPABASE_URL.rstrip('/')}/auth/v1"

    # Rate Limiting & Concurrency Guard
    RATE_LIMIT_GUEST_PER_MINUTE: int = 20
    RATE_LIMIT_AUTH_PER_MINUTE: int = 120
    MAX_CONCURRENT_QUERIES: int = 10

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
