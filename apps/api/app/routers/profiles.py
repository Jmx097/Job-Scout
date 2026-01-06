"""
Profile CRUD router with encryption and export.
"""
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.database import get_db, Profile
from app.models.schemas import (
    ProfileCreate, ProfileUpdate, ApiResponse
)
from app.core.auth import get_current_user_id
from app.core.security import encryptor


router = APIRouter()


@router.get("", response_model=ApiResponse)
async def list_profiles(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List all profiles for the current user."""
    result = await db.execute(
        select(Profile)
        .where(Profile.user_id == user_id)
        .order_by(Profile.created_at.desc())
    )
    profiles = result.scalars().all()
    
    # Build response without decrypting resume data
    profile_list = []
    for p in profiles:
        profile_list.append({
            "id": p.id,
            "name": p.name,
            "is_active": p.is_active,
            "schedule_interval": p.schedule_interval,
            "has_resume": bool(p.resume_data),
            "has_search_config": bool(p.search_config),
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "updated_at": p.updated_at.isoformat() if p.updated_at else None,
        })
    
    return ApiResponse(success=True, data=profile_list)


@router.post("", response_model=ApiResponse)
async def create_profile(
    profile: ProfileCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a new profile with optional resume data."""
    # Encrypt resume data if provided
    encrypted_resume = None
    if profile.resume_data:
        encrypted_resume = encryptor.encrypt(profile.resume_data.model_dump())
    
    new_profile = Profile(
        user_id=user_id,
        name=profile.name,
        resume_data=encrypted_resume,
        search_config=profile.search_config.model_dump() if profile.search_config else None,
        schedule_interval=profile.schedule_interval or "manual",
    )
    db.add(new_profile)
    await db.flush()
    
    return ApiResponse(success=True, data={"id": new_profile.id, "name": new_profile.name})


@router.get("/{profile_id}", response_model=ApiResponse)
async def get_profile(
    profile_id: int,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific profile with decrypted resume data."""
    result = await db.execute(
        select(Profile).where(Profile.id == profile_id, Profile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Decrypt resume data
    resume_data = None
    if profile.resume_data:
        try:
            resume_data = encryptor.decrypt(profile.resume_data)
        except Exception:
            resume_data = None
    
    return ApiResponse(success=True, data={
        "id": profile.id,
        "name": profile.name,
        "resume_data": resume_data,
        "search_config": profile.search_config,
        "schedule_interval": profile.schedule_interval,
        "is_active": profile.is_active,
        "created_at": profile.created_at.isoformat() if profile.created_at else None,
        "updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
    })


@router.put("/{profile_id}", response_model=ApiResponse)
async def update_profile(
    profile_id: int,
    updates: ProfileUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update a profile."""
    result = await db.execute(
        select(Profile).where(Profile.id == profile_id, Profile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Update fields
    if updates.name is not None:
        profile.name = updates.name
    
    if updates.resume_data is not None:
        profile.resume_data = encryptor.encrypt(updates.resume_data.model_dump())
    
    if updates.search_config is not None:
        profile.search_config = updates.search_config.model_dump()
    
    if updates.schedule_interval is not None:
        profile.schedule_interval = updates.schedule_interval
    
    if updates.is_active is not None:
        profile.is_active = updates.is_active
    
    profile.updated_at = datetime.utcnow()
    await db.flush()
    
    return ApiResponse(success=True, data={"id": profile.id, "name": profile.name})


@router.delete("/{profile_id}", response_model=ApiResponse)
async def delete_profile(
    profile_id: int,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a profile."""
    result = await db.execute(
        select(Profile).where(Profile.id == profile_id, Profile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    await db.delete(profile)
    await db.flush()
    
    return ApiResponse(success=True, data={"deleted": True})


@router.get("/{profile_id}/export")
async def export_profile(
    profile_id: int,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Export profile as JSON download."""
    result = await db.execute(
        select(Profile).where(Profile.id == profile_id, Profile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Decrypt resume data
    resume_data = None
    if profile.resume_data:
        try:
            resume_data = encryptor.decrypt(profile.resume_data)
        except Exception:
            resume_data = None
    
    export_data = {
        "name": profile.name,
        "resume": resume_data,
        "search_config": profile.search_config,
        "exported_at": datetime.utcnow().isoformat(),
    }
    
    content = json.dumps(export_data, indent=2)
    filename = f"profile_{profile.name.lower().replace(' ', '_')}_{datetime.utcnow().strftime('%Y%m%d')}.json"
    
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
