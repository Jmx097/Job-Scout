"""
Authentication router - sync Clerk users to database.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.database import get_db, User, Setting
from app.models.schemas import UserResponse, ApiResponse
from app.core.auth import get_current_user_id


router = APIRouter()


@router.get("/me", response_model=ApiResponse)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get current authenticated user."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return ApiResponse(
        success=True,
        data=UserResponse.model_validate(user),
    )


@router.post("/sync", response_model=ApiResponse)
async def sync_user(
    user_id: str = Depends(get_current_user_id),
    request: Request = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Sync user from Clerk to database.
    Called after sign-in/sign-up from frontend.
    """
    body = await request.json()
    email = body.get("email")
    
    if not email:
        raise HTTPException(status_code=400, detail="Missing email")
    
    # Check if user exists
    result = await db.execute(select(User).where(User.id == user_id))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        # Update email if changed
        if existing_user.email != email:
            existing_user.email = email
        return ApiResponse(success=True, data=UserResponse.model_validate(existing_user))
    
    # Create new user
    new_user = User(id=user_id, email=email)
    db.add(new_user)
    
    # Create default settings
    new_settings = Setting(user_id=user_id)
    db.add(new_settings)
    
    await db.flush()
    
    return ApiResponse(success=True, data=UserResponse.model_validate(new_user))
