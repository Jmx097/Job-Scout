"""
Job scraping service using JobSpy.
"""
import asyncio
from typing import Dict, Any, List
from jobspy import scrape_jobs as jobspy_scrape

from app.core.config import settings


async def scrape_jobs(search_config: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Scrape jobs using JobSpy based on search configuration.
    Implements retry logic with exponential backoff.
    """
    sources = search_config.get("sources", ["indeed"])
    search_terms = search_config.get("search_terms", [])
    locations = search_config.get("locations", [])
    remote_only = search_config.get("remote_only", False)
    salary_min = search_config.get("salary_min")
    salary_max = search_config.get("salary_max")
    exclude_keywords = search_config.get("exclude_keywords", [])
    exclude_senior = search_config.get("exclude_senior", False)
    exclude_international = search_config.get("exclude_international", False)
    
    all_jobs = []
    
    for term in search_terms or ["software engineer"]:
        for location in locations or ["Remote"]:
            # Run scrape in thread pool to not block async
            jobs = await _scrape_with_retry(
                search_term=term,
                location=location,
                site_names=sources,
                remote_only=remote_only,
            )
            
            # Filter results
            for job in jobs:
                # Skip if matches exclude keywords
                title_lower = job.get("title", "").lower()
                desc_lower = job.get("description", "").lower()
                
                if any(kw.lower() in title_lower or kw.lower() in desc_lower 
                       for kw in exclude_keywords):
                    continue
                
                # Skip senior roles if configured
                if exclude_senior:
                    senior_keywords = ["senior", "lead", "principal", "staff", "director", "vp", "head of"]
                    if any(kw in title_lower for kw in senior_keywords):
                        continue
                
                # Skip international if configured (check for non-US locations)
                if exclude_international:
                    job_location = job.get("location", "").lower()
                    # Simple US check - in production, use proper geolocation
                    us_indicators = ["usa", "united states", "remote"]
                    us_states = ["ca", "ny", "tx", "wa", "fl", "il", "ma", "pa", "ga", "nc"]
                    if not any(ind in job_location for ind in us_indicators + us_states):
                        if job_location and "remote" not in job_location:
                            continue
                
                # Check salary range
                job_salary_min = job.get("min_amount")
                job_salary_max = job.get("max_amount")
                
                if salary_min and job_salary_max and job_salary_max < salary_min:
                    continue
                if salary_max and job_salary_min and job_salary_min > salary_max:
                    continue
                
                all_jobs.append(_normalize_job(job))
    
    return all_jobs


async def _scrape_with_retry(
    search_term: str,
    location: str,
    site_names: List[str],
    remote_only: bool = False,
    max_retries: int = None,
) -> List[Dict[str, Any]]:
    """Scrape with retry and exponential backoff."""
    max_retries = max_retries or settings.JOBSPY_MAX_RETRIES
    backoff_base = settings.JOBSPY_BACKOFF_BASE
    
    for attempt in range(max_retries):
        try:
            # Run in thread pool
            loop = asyncio.get_event_loop()
            jobs_df = await loop.run_in_executor(
                None,
                lambda: jobspy_scrape(
                    site_name=site_names,
                    search_term=search_term,
                    location=location,
                    is_remote=remote_only,
                    results_wanted=50,
                    easy_apply=True,
                    proxy=settings.JOBSPY_PROXY_URL or None,
                ),
            )
            
            # Convert DataFrame to list of dicts
            if jobs_df is not None and not jobs_df.empty:
                return jobs_df.to_dict("records")
            return []
            
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = backoff_base ** attempt
                await asyncio.sleep(wait_time)
            else:
                # Log error and return empty
                print(f"Scraping failed after {max_retries} attempts: {e}")
                return []
    
    return []


def _normalize_job(raw_job: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize job data from JobSpy format."""
    return {
        "external_id": raw_job.get("id") or raw_job.get("job_url"),
        "title": raw_job.get("title", "Unknown Position"),
        "company": raw_job.get("company"),
        "location": raw_job.get("location"),
        "salary_min": raw_job.get("min_amount"),
        "salary_max": raw_job.get("max_amount"),
        "description": raw_job.get("description"),
        "url": raw_job.get("job_url"),
        "source": raw_job.get("site"),
    }
