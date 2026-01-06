"""
Background job scheduler using APScheduler.
Handles automatic job searches at configured intervals.
"""
from datetime import datetime, timedelta
from typing import Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.jobstores.memory import MemoryJobStore
from sqlalchemy import select, delete

from app.models.database import async_session, Profile, Job, SearchRun
from app.services.job_scraper import scrape_jobs
from app.services.scorer import score_jobs
from app.core.security import key_store


# Interval mapping in seconds
INTERVALS = {
    "manual": None,
    "1h": 3600,
    "3h": 10800,
    "6h": 21600,
    "12h": 43200,
    "24h": 86400,
}


class JobScheduler:
    """Manages scheduled job searches for all users."""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler(
            jobstores={"default": MemoryJobStore()},
            timezone="UTC",
        )
        self._started = False
    
    def start(self):
        """Start the scheduler."""
        if not self._started:
            self.scheduler.start()
            self._started = True
    
    def shutdown(self):
        """Shutdown the scheduler."""
        if self._started:
            self.scheduler.shutdown(wait=False)
            self._started = False
    
    def schedule_profile(self, user_id: str, profile_id: int, interval: str):
        """Schedule or update a profile's search interval."""
        job_id = f"search_{user_id}_{profile_id}"
        
        # Remove existing job if any
        if self.scheduler.get_job(job_id):
            self.scheduler.remove_job(job_id)
        
        # Don't schedule if manual
        if interval == "manual" or interval not in INTERVALS:
            return
        
        seconds = INTERVALS[interval]
        if seconds:
            self.scheduler.add_job(
                run_scheduled_search,
                IntervalTrigger(seconds=seconds),
                id=job_id,
                args=[user_id, profile_id],
                replace_existing=True,
                next_run_time=datetime.utcnow() + timedelta(seconds=seconds),
            )
    
    def unschedule_profile(self, user_id: str, profile_id: int):
        """Remove a profile's scheduled job."""
        job_id = f"search_{user_id}_{profile_id}"
        if self.scheduler.get_job(job_id):
            self.scheduler.remove_job(job_id)
    
    def get_next_run(self, user_id: str, profile_id: int) -> Optional[datetime]:
        """Get the next scheduled run time for a profile."""
        job_id = f"search_{user_id}_{profile_id}"
        job = self.scheduler.get_job(job_id)
        if job:
            return job.next_run_time
        return None


async def run_scheduled_search(user_id: str, profile_id: int):
    """Execute a scheduled search for a profile."""
    async with async_session() as db:
        try:
            # Get profile
            result = await db.execute(
                select(Profile).where(Profile.id == profile_id, Profile.user_id == user_id)
            )
            profile = result.scalar_one_or_none()
            
            if not profile or not profile.search_config:
                return
            
            # Check for OpenAI key
            openai_key = key_store.get(user_id)
            
            # Create search run record
            search_run = SearchRun(
                user_id=user_id,
                profile_id=profile_id,
                status="running",
            )
            db.add(search_run)
            await db.flush()
            
            try:
                # Scrape jobs
                raw_jobs = await scrape_jobs(profile.search_config)
                search_run.jobs_found = len(raw_jobs)
                
                if not openai_key:
                    # No key - mark as needs_key, skip scoring
                    search_run.status = "needs_key"
                    search_run.error_message = "OpenAI key not available - scoring skipped"
                    search_run.completed_at = datetime.utcnow()
                else:
                    # Score jobs
                    scored_jobs = await score_jobs(raw_jobs, profile, openai_key, db, user_id)
                    search_run.jobs_scored = len(scored_jobs)
                    search_run.status = "completed"
                    search_run.completed_at = datetime.utcnow()
                
                await db.commit()
                
            except Exception as e:
                search_run.status = "failed"
                search_run.error_message = str(e)[:500]
                search_run.completed_at = datetime.utcnow()
                await db.commit()
                
        except Exception as e:
            print(f"Scheduled search failed for {user_id}/{profile_id}: {e}")


async def purge_old_jobs(user_id: str, days: int = 30):
    """Delete jobs older than the specified number of days."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    
    async with async_session() as db:
        result = await db.execute(
            delete(Job).where(
                Job.user_id == user_id,
                Job.created_at < cutoff
            ).returning(Job.id)
        )
        deleted_ids = result.scalars().all()
        await db.commit()
        return len(deleted_ids)


# Global scheduler instance
job_scheduler = JobScheduler()
