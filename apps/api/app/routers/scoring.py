"""
OpenAI key validation and session management router.
"""
from fastapi import APIRouter, Depends, HTTPException
from openai import AsyncOpenAI

from app.models.schemas import OpenAIKeyValidate, OpenAIKeyStatus, ApiResponse
from app.routers.auth import get_current_user_id
from app.core.security import key_store


router = APIRouter()


@router.post("/validate", response_model=ApiResponse)
async def validate_key(
    request: OpenAIKeyValidate,
    user_id: str = Depends(get_current_user_id),
):
    """
    Validate an OpenAI API key and store it in session.
    Key is stored in memory only, never persisted to database.
    """
    key = request.key.strip()
    
    if not key.startswith("sk-"):
        raise HTTPException(status_code=400, detail="Invalid key format")
    
    try:
        # Test the key with a simple API call
        client = AsyncOpenAI(api_key=key)
        
        # Make a minimal API call to validate
        await client.models.list()
        
        # Store key in session (memory only)
        key_store.store(user_id, key)
        
        return ApiResponse(
            success=True,
            data=OpenAIKeyStatus(active=True, message="Key validated successfully"),
        )
    
    except Exception as e:
        error_msg = str(e)
        if "invalid_api_key" in error_msg.lower():
            raise HTTPException(status_code=400, detail="Invalid API key")
        if "rate_limit" in error_msg.lower():
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        raise HTTPException(status_code=400, detail=f"Key validation failed: {error_msg}")


@router.delete("/clear", response_model=ApiResponse)
async def clear_key(
    user_id: str = Depends(get_current_user_id),
):
    """Clear the stored OpenAI key from session."""
    key_store.clear(user_id)
    return ApiResponse(success=True, data={"message": "Key cleared"})


@router.get("/status", response_model=ApiResponse)
async def get_key_status(
    user_id: str = Depends(get_current_user_id),
):
    """Check if an OpenAI key is active in the current session."""
    is_active = key_store.has_key(user_id)
    
    return ApiResponse(
        success=True,
        data=OpenAIKeyStatus(
            active=is_active,
            message="Key is active" if is_active else "No key in session. Please enter your OpenAI key.",
        ),
    )
