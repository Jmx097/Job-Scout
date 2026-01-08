"""
Application configuration using pydantic-settings.
"""
import json
from typing import Any
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/jobscout.db"
    
    # Encryption
    ENCRYPTION_KEY: str = ""
    
    # Clerk
    CLERK_SECRET_KEY: str = ""
    CLERK_ISSUER: str = ""  # e.g., https://your-app.clerk.accounts.dev
    
    # CORS
    CORS_ORIGINS: Any = ["http://localhost:3000"]
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from JSON array string or comma-separated list."""
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            v = v.strip()
            # Try JSON array format first: ["https://example.com"]
            if v.startswith("["):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            # Fall back to comma-separated: https://example.com,https://other.com
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return ["http://localhost:3000"]
    
    # OpenAI Key TTL (hours)
    OPENAI_KEY_TTL_HOURS: int = 24
    
    # JobSpy
    JOBSPY_PROXY_URL: str = ""
    JOBSPY_MAX_RETRIES: int = 3
    JOBSPY_BACKOFF_BASE: float = 2.0
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
