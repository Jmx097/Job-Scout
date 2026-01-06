"""
SQLAlchemy database models and setup.
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    """Base class for all models."""
    pass


class User(Base):
    """User model - synced from Clerk."""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)  # Clerk user ID
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    profiles = relationship("Profile", back_populates="user", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")
    search_runs = relationship("SearchRun", back_populates="user", cascade="all, delete-orphan")
    setting = relationship("Setting", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Profile(Base):
    """User profile with resume data and search configuration."""
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    resume_data = Column(Text, nullable=True)  # Encrypted JSON
    search_config = Column(JSON, nullable=True)  # {sources, terms, locations, salary, exclusions}
    schedule_interval = Column(String, default="manual")  # manual|1h|3h|6h|12h|24h
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="profiles")
    jobs = relationship("Job", back_populates="profile")
    search_runs = relationship("SearchRun", back_populates="profile")


class Job(Base):
    """Scraped job listing with scoring."""
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=True)
    external_id = Column(String, nullable=True)  # Job board ID
    title = Column(String, nullable=False)
    company = Column(String, nullable=True)
    location = Column(String, nullable=True)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    url = Column(String, nullable=True)
    source = Column(String, nullable=True)  # indeed, linkedin, etc.
    
    # Scoring
    score = Column(Float, nullable=True)
    tier = Column(String, nullable=True)  # A, B, C, D
    matched_skills = Column(JSON, nullable=True)  # ["Python", "React", ...]
    scoring_breakdown = Column(JSON, nullable=True)  # Full breakdown
    
    # User interaction
    status = Column(String, default="new")  # new, applied, saved, hidden
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="jobs")
    profile = relationship("Profile", back_populates="jobs")


class SearchRun(Base):
    """Record of a job search execution."""
    __tablename__ = "search_runs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String, default="running")  # running, completed, failed
    jobs_found = Column(Integer, default=0)
    jobs_scored = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    api_tokens_used = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="search_runs")
    profile = relationship("Profile", back_populates="search_runs")


class Setting(Base):
    """User settings."""
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    auto_purge_days = Column(Integer, default=30)  # 0 = disabled
    privacy_mode = Column(Boolean, default=False)
    export_format = Column(String, default="json")  # json, csv
    
    # Relationships
    user = relationship("User", back_populates="setting")


# Database engine and session
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    """Dependency to get database session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
