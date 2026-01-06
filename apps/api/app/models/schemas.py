"""
Pydantic schemas for API request/response validation.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field


# ============================================
# User & Auth Schemas
# ============================================

class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    id: str  # Clerk user ID


class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# Resume Schemas
# ============================================

class WorkExperience(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    current: bool = False
    description: str = ""
    highlights: List[str] = []


class Education(BaseModel):
    institution: str
    degree: str
    field: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    gpa: Optional[str] = None


class ResumeData(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = []
    experience: List[WorkExperience] = []
    education: List[Education] = []
    certifications: List[str] = []
    languages: List[str] = []


class ResumeVerifyRequest(BaseModel):
    resume_data: ResumeData


# ============================================
# Profile Schemas
# ============================================

class SearchConfig(BaseModel):
    sources: List[str] = ["indeed", "linkedin", "glassdoor"]
    search_terms: List[str] = []
    locations: List[str] = []
    remote_only: bool = False
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    exclude_keywords: List[str] = []
    exclude_senior: bool = False
    exclude_international: bool = False


class ProfileBase(BaseModel):
    name: str
    search_config: Optional[SearchConfig] = None
    schedule_interval: str = "manual"


class ProfileCreate(ProfileBase):
    resume_data: Optional[ResumeData] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    resume_data: Optional[ResumeData] = None
    search_config: Optional[SearchConfig] = None
    schedule_interval: Optional[str] = None
    is_active: Optional[bool] = None


class ProfileListResponse(BaseModel):
    id: int
    name: str
    is_active: bool
    schedule_interval: str
    has_resume: bool
    has_search_config: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ProfileResponse(ProfileBase):
    id: int
    user_id: str
    resume_data: Optional[Dict[str, Any]] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================
# Job Schemas
# ============================================

class ScoringBreakdown(BaseModel):
    skill_match: float
    experience_level: float
    location_match: float
    salary_fit: float
    company_signals: float
    recency: float
    total: float
    tier: str
    matched_skills: List[str]
    missing_skills: List[str]
    explanation: str


class JobBase(BaseModel):
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    description: Optional[str] = None
    url: Optional[str] = None
    source: Optional[str] = None


class JobResponse(JobBase):
    id: int
    user_id: str
    profile_id: Optional[int] = None
    external_id: Optional[str] = None
    score: Optional[float] = None
    tier: Optional[str] = None
    matched_skills: Optional[List[str]] = None
    scoring_breakdown: Optional[ScoringBreakdown] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class JobStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(new|applied|saved|hidden)$")


class JobsQueryParams(BaseModel):
    page: int = 1
    page_size: int = 20
    status: Optional[str] = None
    source: Optional[str] = None
    tier: Optional[str] = None
    min_score: Optional[float] = None
    sort_by: str = "score"
    sort_order: str = "desc"
    search: Optional[str] = None


# ============================================
# OpenAI Key Schemas
# ============================================

class OpenAIKeyValidate(BaseModel):
    key: str


class OpenAIKeyStatus(BaseModel):
    active: bool
    message: Optional[str] = None


# ============================================
# Settings Schemas
# ============================================

class SettingsBase(BaseModel):
    auto_purge_days: int = 30
    privacy_mode: bool = False
    export_format: str = "json"


class SettingsUpdate(BaseModel):
    auto_purge_days: Optional[int] = None
    privacy_mode: Optional[bool] = None
    export_format: Optional[str] = None


class SettingsResponse(SettingsBase):
    user_id: str

    class Config:
        from_attributes = True


# ============================================
# Metrics Schemas
# ============================================

class DashboardStats(BaseModel):
    total_jobs: int
    applied_count: int
    saved_count: int
    hidden_count: int
    new_count: int
    average_score: float
    interview_likelihood: float
    tier_distribution: Dict[str, int]


class SearchRunResponse(BaseModel):
    id: int
    profile_id: Optional[int]
    started_at: datetime
    completed_at: Optional[datetime]
    status: str
    jobs_found: int
    jobs_scored: int
    error_message: Optional[str]
    api_tokens_used: int

    class Config:
        from_attributes = True


class SystemHealth(BaseModel):
    last_search_run: Optional[SearchRunResponse] = None
    next_scheduled_run: Optional[datetime] = None
    api_key_active: bool
    estimated_api_usage: int
    data_freshness_days: int


# ============================================
# API Response Wrappers
# ============================================

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None


class PaginatedResponse(ApiResponse):
    total: int = 0
    page: int = 1
    page_size: int = 20
    total_pages: int = 0
