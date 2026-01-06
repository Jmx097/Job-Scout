"""
Resume upload and parsing router.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.database import get_db, Profile
from app.models.schemas import ResumeVerifyRequest, ApiResponse
from app.core.auth import get_current_user_id
from app.services.resume_parser import parse_resume
from app.core.security import encryptor


router = APIRouter()


# Temporary storage for parsed resume during verification flow
_parsed_resumes: dict[str, dict] = {}


@router.post("/upload", response_model=ApiResponse)
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    """
    Upload and parse a resume file (PDF, DOCX, or TXT).
    Returns parsed fields for user verification.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Validate file type
    allowed_extensions = {".pdf", ".docx", ".doc", ".txt"}
    ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}",
        )
    
    # Read file content
    content = await file.read()
    
    try:
        # Parse resume
        parsed_data = await parse_resume(content, ext)
        
        # Store temporarily for verification step
        _parsed_resumes[user_id] = parsed_data
        
        return ApiResponse(success=True, data=parsed_data)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")


@router.get("/parsed", response_model=ApiResponse)
async def get_parsed_resume(
    user_id: str = Depends(get_current_user_id),
):
    """Get the currently parsed resume data for verification."""
    if user_id not in _parsed_resumes:
        raise HTTPException(status_code=404, detail="No parsed resume found. Please upload first.")
    
    return ApiResponse(success=True, data=_parsed_resumes[user_id])


@router.put("/verify", response_model=ApiResponse)
async def verify_resume(
    request: ResumeVerifyRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Save verified resume data to a profile.
    Creates a new default profile or updates existing.
    """
    # Encrypt the resume data
    resume_dict = request.resume_data.model_dump()
    encrypted_data = encryptor.encrypt(resume_dict)
    
    # Check for existing default profile
    result = await db.execute(
        select(Profile).where(Profile.user_id == user_id, Profile.name == "Default")
    )
    profile = result.scalar_one_or_none()
    
    if profile:
        # Update existing profile
        profile.resume_data = encrypted_data
    else:
        # Create new profile
        profile = Profile(
            user_id=user_id,
            name="Default",
            resume_data=encrypted_data,
        )
        db.add(profile)
    
    await db.flush()
    
    # Clear temporary storage
    _parsed_resumes.pop(user_id, None)
    
    return ApiResponse(success=True, data={"profile_id": profile.id})
