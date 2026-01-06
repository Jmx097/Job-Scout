"""
User settings router.
"""
import json
import csv
from io import StringIO
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.database import get_db, Setting, Job, Profile, SearchRun
from app.models.schemas import SettingsUpdate, SettingsResponse, ApiResponse
from app.core.auth import get_current_user_id


router = APIRouter()


@router.get("", response_model=ApiResponse)
async def get_settings(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get user settings."""
    result = await db.execute(select(Setting).where(Setting.user_id == user_id))
    settings = result.scalar_one_or_none()
    
    if not settings:
        # Create default settings
        settings = Setting(user_id=user_id)
        db.add(settings)
        await db.flush()
    
    return ApiResponse(success=True, data=SettingsResponse.model_validate(settings))


@router.put("", response_model=ApiResponse)
async def update_settings(
    update: SettingsUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update user settings."""
    result = await db.execute(select(Setting).where(Setting.user_id == user_id))
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = Setting(user_id=user_id)
        db.add(settings)
    
    if update.auto_purge_days is not None:
        settings.auto_purge_days = update.auto_purge_days
    if update.privacy_mode is not None:
        settings.privacy_mode = update.privacy_mode
    if update.export_format is not None:
        settings.export_format = update.export_format
    
    await db.flush()
    
    return ApiResponse(success=True, data=SettingsResponse.model_validate(settings))


@router.post("/purge", response_model=ApiResponse)
async def purge_data(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    confirm: bool = False,
):
    """
    Purge all user data. Requires confirm=true.
    This action cannot be undone.
    """
    if not confirm:
        raise HTTPException(
            status_code=400,
            detail="Data purge requires confirmation. Set confirm=true to proceed.",
        )
    
    # Delete all user data (cascades are set up in models)
    await db.execute(delete(Job).where(Job.user_id == user_id))
    await db.execute(delete(SearchRun).where(SearchRun.user_id == user_id))
    await db.execute(delete(Profile).where(Profile.user_id == user_id))
    
    return ApiResponse(success=True, data={"message": "All data purged successfully"})


@router.get("/export")
async def export_data(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
    format: str = "json",
):
    """Export all user data as JSON or CSV."""
    # Get all jobs
    result = await db.execute(select(Job).where(Job.user_id == user_id))
    jobs = result.scalars().all()
    
    # Get profiles
    result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    profiles = result.scalars().all()
    
    if format == "csv":
        # Export jobs as CSV
        output = StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            "ID", "Title", "Company", "Location", "Salary Min", "Salary Max",
            "Score", "Tier", "Status", "Source", "URL", "Created At"
        ])
        
        # Data rows
        for job in jobs:
            writer.writerow([
                job.id, job.title, job.company, job.location,
                job.salary_min, job.salary_max, job.score, job.tier,
                job.status, job.source, job.url, job.created_at.isoformat()
            ])
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=job_scout_export.csv"},
        )
    
    else:
        # Export as JSON
        data = {
            "exported_at": datetime.utcnow().isoformat(),
            "profiles": [
                {
                    "id": p.id,
                    "name": p.name,
                    "schedule_interval": p.schedule_interval,
                    "is_active": p.is_active,
                }
                for p in profiles
            ],
            "jobs": [
                {
                    "id": j.id,
                    "title": j.title,
                    "company": j.company,
                    "location": j.location,
                    "salary_min": j.salary_min,
                    "salary_max": j.salary_max,
                    "score": j.score,
                    "tier": j.tier,
                    "matched_skills": j.matched_skills,
                    "status": j.status,
                    "source": j.source,
                    "url": j.url,
                    "created_at": j.created_at.isoformat(),
                }
                for j in jobs
            ],
        }
        
        return StreamingResponse(
            iter([json.dumps(data, indent=2)]),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=job_scout_export.json"},
        )
