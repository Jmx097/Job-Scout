"""
Jobs router - CRUD and search operations.
"""
from math import ceil
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc
from typing import Optional

from app.models.database import get_db, Job, Profile
from app.models.schemas import (
    JobResponse, JobStatusUpdate, ApiResponse, PaginatedResponse,
)
from app.core.auth import get_current_user_id
from app.services.job_scraper import scrape_jobs
from app.services.scorer import score_jobs
from app.core.security import key_store


router = APIRouter()


@router.get("", response_model=PaginatedResponse)
async def list_jobs(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    source: Optional[str] = None,
    tier: Optional[str] = None,
    min_score: Optional[float] = None,
    sort_by: str = Query("score", regex="^(score|created_at|salary_max)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    search: Optional[str] = None,
):
    """List jobs with pagination, filtering, and sorting."""
    # Base query
    query = select(Job).where(Job.user_id == user_id)
    count_query = select(func.count()).select_from(Job).where(Job.user_id == user_id)
    
    # Apply filters
    if status:
        query = query.where(Job.status == status)
        count_query = count_query.where(Job.status == status)
    
    if source:
        query = query.where(Job.source == source)
        count_query = count_query.where(Job.source == source)
    
    if tier:
        query = query.where(Job.tier == tier)
        count_query = count_query.where(Job.tier == tier)
    
    if min_score is not None:
        query = query.where(Job.score >= min_score)
        count_query = count_query.where(Job.score >= min_score)
    
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (Job.title.ilike(search_filter)) | 
            (Job.company.ilike(search_filter))
        )
        count_query = count_query.where(
            (Job.title.ilike(search_filter)) | 
            (Job.company.ilike(search_filter))
        )
    
    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply sorting
    sort_column = getattr(Job, sort_by)
    order_func = desc if sort_order == "desc" else asc
    query = query.order_by(order_func(sort_column))
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    # Execute query
    result = await db.execute(query)
    jobs = result.scalars().all()
    
    return PaginatedResponse(
        success=True,
        data=[JobResponse.model_validate(job) for job in jobs],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=ceil(total / page_size) if total > 0 else 0,
    )


@router.get("/{job_id}", response_model=ApiResponse)
async def get_job(
    job_id: int,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get a single job with full details."""
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.user_id == user_id)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return ApiResponse(success=True, data=JobResponse.model_validate(job))


@router.put("/{job_id}/status", response_model=ApiResponse)
async def update_job_status(
    job_id: int,
    status_update: JobStatusUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update job status (apply, save, hide)."""
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.user_id == user_id)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.status = status_update.status
    
    return ApiResponse(success=True, data={"status": job.status})


@router.post("/search", response_model=ApiResponse)
async def trigger_search(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    profile_id: Optional[int] = None,
):
    """
    Trigger a manual job search.
    Requires an active OpenAI key in session.
    """
    # Check for OpenAI key
    if not key_store.has_key(user_id):
        raise HTTPException(
            status_code=400,
            detail="OpenAI key required. Please enter your key in settings.",
        )
    
    # Get profile
    if profile_id:
        result = await db.execute(
            select(Profile).where(Profile.id == profile_id, Profile.user_id == user_id)
        )
    else:
        result = await db.execute(
            select(Profile).where(Profile.user_id == user_id, Profile.is_active.is_(True))
        )
    
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="No active profile found")
    
    if not profile.search_config:
        raise HTTPException(status_code=400, detail="Profile has no search configuration")
    
    try:
        # Scrape jobs
        raw_jobs = await scrape_jobs(profile.search_config)
        
        # Score jobs with OpenAI
        openai_key = key_store.get(user_id)
        scored_jobs = await score_jobs(raw_jobs, profile, openai_key, db, user_id)
        
        return ApiResponse(
            success=True,
            data={
                "jobs_found": len(raw_jobs),
                "jobs_scored": len(scored_jobs),
            },
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
