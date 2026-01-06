"""
OpenAI-based job scoring service.
"""
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import Job, Profile, SearchRun
from app.core.security import encryptor


# Scoring weights
WEIGHTS = {
    "skill_match": 0.35,
    "experience_level": 0.20,
    "location_match": 0.15,
    "salary_fit": 0.15,
    "company_signals": 0.10,
    "recency": 0.05,
}


def calculate_tier(score: float) -> str:
    """Calculate tier based on score."""
    if score >= 0.85:
        return "A"
    if score >= 0.70:
        return "B"
    if score >= 0.50:
        return "C"
    return "D"


async def score_jobs(
    jobs: List[Dict[str, Any]],
    profile: Profile,
    openai_key: str,
    db: AsyncSession,
    user_id: str,
) -> List[Job]:
    """
    Score a list of jobs against a user profile using OpenAI.
    Returns list of scored Job objects.
    """
    if not jobs:
        return []
    
    # Create search run record
    search_run = SearchRun(
        user_id=user_id,
        profile_id=profile.id,
        status="running",
        jobs_found=len(jobs),
    )
    db.add(search_run)
    await db.flush()
    
    # Decrypt resume data
    resume_data = {}
    if profile.resume_data:
        try:
            resume_data = encryptor.decrypt(profile.resume_data)
        except Exception:
            pass
    
    client = AsyncOpenAI(api_key=openai_key)
    scored_jobs = []
    total_tokens = 0
    
    for job_data in jobs:
        try:
            score_result = await _score_single_job(client, job_data, resume_data, profile.search_config)
            total_tokens += score_result.get("tokens_used", 0)
            
            # Create Job record
            job = Job(
                user_id=user_id,
                profile_id=profile.id,
                external_id=job_data.get("external_id"),
                title=job_data.get("title"),
                company=job_data.get("company"),
                location=job_data.get("location"),
                salary_min=job_data.get("salary_min"),
                salary_max=job_data.get("salary_max"),
                description=job_data.get("description"),
                url=job_data.get("url"),
                source=job_data.get("source"),
                score=score_result.get("total_score"),
                tier=score_result.get("tier"),
                matched_skills=score_result.get("matched_skills", []),
                scoring_breakdown=score_result.get("breakdown"),
                status="new",
            )
            db.add(job)
            scored_jobs.append(job)
            
        except Exception as e:
            print(f"Error scoring job {job_data.get('title')}: {e}")
            continue
    
    # Update search run
    search_run.status = "completed"
    search_run.completed_at = datetime.utcnow()
    search_run.jobs_scored = len(scored_jobs)
    search_run.api_tokens_used = total_tokens
    
    await db.flush()
    
    return scored_jobs


async def _score_single_job(
    client: AsyncOpenAI,
    job_data: Dict[str, Any],
    resume_data: Dict[str, Any],
    search_config: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    """Score a single job against the resume."""
    
    # Build the prompt
    resume_skills = resume_data.get("skills", [])
    resume_summary = resume_data.get("summary", "")
    resume_experience = resume_data.get("experience", [])
    
    prompt = f"""Analyze how well this job matches the candidate's profile.

CANDIDATE PROFILE:
Skills: {', '.join(resume_skills)}
Summary: {resume_summary}
Experience: {len(resume_experience)} positions

JOB POSTING:
Title: {job_data.get('title')}
Company: {job_data.get('company')}
Location: {job_data.get('location')}
Salary: ${job_data.get('salary_min', 'N/A')} - ${job_data.get('salary_max', 'N/A')}
Description: {(job_data.get('description') or '')[:2000]}

Score each dimension from 0.0 to 1.0:
1. skill_match: How well do the candidate's skills match the job requirements?
2. experience_level: Does the experience level align?
3. location_match: Is the location/remote situation a good fit?
4. salary_fit: Is the salary competitive for the role?
5. company_signals: Any positive/negative company signals?
6. recency: Is this a recently posted position?

Also list:
- matched_skills: Skills from the candidate that match the job
- missing_skills: Important skills the candidate lacks
- explanation: Brief explanation of the match quality

Respond in JSON format only."""

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a job matching analyst. Respond only with valid JSON."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=1000,
    )
    
    tokens_used = response.usage.total_tokens if response.usage else 0
    
    # Parse response
    try:
        content = response.choices[0].message.content
        # Clean up potential markdown formatting
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        result = json.loads(content)
        
        # Calculate weighted total
        breakdown = {
            "skill_match": float(result.get("skill_match", 0.5)),
            "experience_level": float(result.get("experience_level", 0.5)),
            "location_match": float(result.get("location_match", 0.5)),
            "salary_fit": float(result.get("salary_fit", 0.5)),
            "company_signals": float(result.get("company_signals", 0.5)),
            "recency": float(result.get("recency", 0.5)),
        }
        
        total_score = sum(
            breakdown[key] * WEIGHTS[key]
            for key in WEIGHTS
        )
        
        return {
            "total_score": round(total_score, 3),
            "tier": calculate_tier(total_score),
            "matched_skills": result.get("matched_skills", []),
            "missing_skills": result.get("missing_skills", []),
            "breakdown": {
                **breakdown,
                "total": round(total_score, 3),
                "tier": calculate_tier(total_score),
                "matched_skills": result.get("matched_skills", []),
                "missing_skills": result.get("missing_skills", []),
                "explanation": result.get("explanation", ""),
            },
            "tokens_used": tokens_used,
        }
        
    except (json.JSONDecodeError, KeyError) as e:
        # Return default scores on parse error
        return {
            "total_score": 0.5,
            "tier": "C",
            "matched_skills": [],
            "missing_skills": [],
            "breakdown": {
                "skill_match": 0.5,
                "experience_level": 0.5,
                "location_match": 0.5,
                "salary_fit": 0.5,
                "company_signals": 0.5,
                "recency": 0.5,
                "total": 0.5,
                "tier": "C",
                "matched_skills": [],
                "missing_skills": [],
                "explanation": f"Could not parse scoring response: {e}",
            },
            "tokens_used": tokens_used,
        }
