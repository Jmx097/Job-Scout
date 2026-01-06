"""
FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, resume, jobs, scoring, settings, metrics, profiles
from app.models.database import init_db
from app.core.config import settings as app_settings
from app.services.scheduler import job_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    await init_db()
    job_scheduler.start()
    yield
    # Shutdown
    job_scheduler.shutdown()


app = FastAPI(
    title="Job Scout API",
    description="AI-powered job search engine backend",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(scoring.router, prefix="/api/openai", tags=["openai"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])
app.include_router(profiles.router, prefix="/api/profiles", tags=["profiles"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "0.1.0"}
