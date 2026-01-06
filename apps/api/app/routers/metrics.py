"""
Metrics and analytics router.
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.database import get_db, Job, SearchRun, Profile
from app.models.schemas import DashboardStats, SystemHealth, SearchRunResponse, ApiResponse
from app.core.auth import get_current_user_id
from app.core.security import key_store
from app.services.scheduler import job_scheduler


router = APIRouter()


# Scoring weights for display
SCORING_FORMULA = {
    "weights": {
        "skill_match": {"weight": 0.35, "description": "How well your skills match the job requirements"},
        "experience_level": {"weight": 0.20, "description": "Years of experience alignment"},
        "location_match": {"weight": 0.15, "description": "Remote/location preference fit"},
        "salary_fit": {"weight": 0.15, "description": "Salary within your target range"},
        "company_signals": {"weight": 0.10, "description": "Company reputation and culture signals"},
        "recency": {"weight": 0.05, "description": "How recently the job was posted"},
    },
    "tiers": {
        "A": {"min_score": 0.85, "label": "Excellent Match", "description": "Strong fit - apply immediately"},
        "B": {"min_score": 0.70, "label": "Good Match", "description": "Worth applying - solid opportunity"},
        "C": {"min_score": 0.50, "label": "Fair Match", "description": "Consider applying - some gaps"},
        "D": {"min_score": 0.00, "label": "Low Match", "description": "Not recommended - significant gaps"},
    },
}


@router.get("/overview", response_model=ApiResponse)
async def get_overview(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard statistics overview."""
    # Count jobs by status
    status_counts = {}
    for status in ["new", "applied", "saved", "hidden"]:
        result = await db.execute(
            select(func.count()).select_from(Job).where(
                Job.user_id == user_id, Job.status == status
            )
        )
        status_counts[status] = result.scalar() or 0
    
    total_jobs = sum(status_counts.values())
    
    # Calculate average score
    result = await db.execute(
        select(func.avg(Job.score)).where(
            Job.user_id == user_id, Job.score.isnot(None)
        )
    )
    avg_score = result.scalar() or 0.0
    
    # Count tiers
    tier_distribution = {}
    for tier in ["A", "B", "C", "D"]:
        result = await db.execute(
            select(func.count()).select_from(Job).where(
                Job.user_id == user_id, Job.tier == tier
            )
        )
        tier_distribution[tier] = result.scalar() or 0
    
    # Interview likelihood (based on tier A+B applied ratio)
    high_tier_applied = 0
    if status_counts["applied"] > 0:
        result = await db.execute(
            select(func.count()).select_from(Job).where(
                Job.user_id == user_id,
                Job.status == "applied",
                Job.tier.in_(["A", "B"])
            )
        )
        high_tier_applied = result.scalar() or 0
    
    interview_likelihood = (
        (high_tier_applied / status_counts["applied"] * 100)
        if status_counts["applied"] > 0 else 0
    )
    
    stats = DashboardStats(
        total_jobs=total_jobs,
        applied_count=status_counts["applied"],
        saved_count=status_counts["saved"],
        hidden_count=status_counts["hidden"],
        new_count=status_counts["new"],
        average_score=round(avg_score, 2),
        interview_likelihood=round(interview_likelihood, 1),
        tier_distribution=tier_distribution,
    )
    
    return ApiResponse(success=True, data=stats)


@router.get("/scoring", response_model=ApiResponse)
async def get_scoring_formula():
    """Get the scoring formula with weights for transparency."""
    return ApiResponse(success=True, data=SCORING_FORMULA)


@router.get("/health", response_model=ApiResponse)
async def get_system_health(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get system health status."""
    # Get last search run
    result = await db.execute(
        select(SearchRun)
        .where(SearchRun.user_id == user_id)
        .order_by(SearchRun.started_at.desc())
        .limit(1)
    )
    last_run = result.scalar_one_or_none()
    
    # Calculate data freshness
    if last_run and last_run.completed_at:
        freshness = (datetime.utcnow() - last_run.completed_at).days
    else:
        freshness = -1  # No data
    
    # Estimate API usage (tokens used in last 24h)
    yesterday = datetime.utcnow() - timedelta(hours=24)
    result = await db.execute(
        select(func.sum(SearchRun.api_tokens_used)).where(
            SearchRun.user_id == user_id,
            SearchRun.started_at >= yesterday
        )
    )
    api_usage = result.scalar() or 0
    
    # Get next scheduled run from active profile
    result = await db.execute(
        select(Profile).where(Profile.user_id == user_id, Profile.is_active.is_(True)).limit(1)
    )
    active_profile = result.scalar_one_or_none()
    next_run = None
    if active_profile:
        next_run = job_scheduler.get_next_run(user_id, active_profile.id)
    
    health = SystemHealth(
        last_search_run=SearchRunResponse.model_validate(last_run) if last_run else None,
        next_scheduled_run=next_run,
        api_key_active=key_store.has_key(user_id),
        estimated_api_usage=api_usage,
        data_freshness_days=freshness,
    )
    
    return ApiResponse(success=True, data=health)
