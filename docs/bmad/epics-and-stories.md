---
stepsCompleted: ["epic-breakdown", "story-definition", "acceptance-criteria"]
inputDocuments: ["docs/bmad/PRD.md", "docs/bmad/system-architecture.md"]
workflowType: "epics-and-stories"
lastStep: 6
---

# Epics and User Stories - Job Scout

**Author:** BMAD PM Workflow  
**Date:** 2026-01-05  
**Version:** 1.0

---

## Epic Overview

| Epic | Name                    | Priority | Stories | Status      |
| ---- | ----------------------- | -------- | ------- | ----------- |
| E1   | User Authentication     | P0       | 3       | ✅ Complete |
| E2   | Resume Management       | P0       | 4       | ✅ Complete |
| E3   | Profile Management      | P0       | 5       | ✅ Complete |
| E4   | Job Discovery           | P0       | 6       | ✅ Complete |
| E5   | AI Scoring              | P0       | 5       | ✅ Complete |
| E6   | Scheduling & Automation | P1       | 4       | ✅ Complete |
| E7   | Analytics & Metrics     | P1       | 4       | ✅ Complete |
| E8   | Settings & Preferences  | P2       | 3       | ✅ Complete |

---

## E1: User Authentication

> **Goal:** Enable secure user sign-up, sign-in, and session management via Clerk.

### E1-S1: User Sign-Up

**As a** new user  
**I want to** create an account  
**So that** I can access Job Scout features

**Acceptance Criteria:**

- [ ] Clerk sign-up flow integrated
- [ ] Email verification supported
- [ ] User record created in database on first login
- [ ] Redirect to onboarding after sign-up

**Files:** `apps/web/app/sign-up/`, `apps/api/app/routers/auth.py`

---

### E1-S2: User Sign-In

**As a** returning user  
**I want to** log into my account  
**So that** I can access my saved data

**Acceptance Criteria:**

- [ ] Clerk sign-in flow integrated
- [ ] Session persists across browser sessions
- [ ] Redirect to dashboard after sign-in

**Files:** `apps/web/app/sign-in/`, `apps/web/middleware.ts`

---

### E1-S3: JWT Verification

**As a** system  
**I want to** verify JWT tokens on every API request  
**So that** only authenticated users access protected resources

**Acceptance Criteria:**

- [ ] Authorization header required on all protected endpoints
- [ ] Invalid tokens return 401 Unauthorized
- [ ] User ID extracted from token for multi-tenant isolation

**Files:** `apps/api/app/core/auth.py`

---

## E2: Resume Management

> **Goal:** Allow users to upload, parse, and manage their resume.

### E2-S1: Resume Upload

**As a** user  
**I want to** upload my resume (PDF/DOCX)  
**So that** the system can understand my qualifications

**Acceptance Criteria:**

- [ ] Drag-and-drop file upload
- [ ] PDF and DOCX formats supported
- [ ] File size limit enforced (10MB)
- [ ] Upload progress indicator

**Files:** `apps/web/app/onboarding/resume/`, `apps/api/app/routers/resume.py`

---

### E2-S2: Resume Parsing

**As a** system  
**I want to** extract structured data from resumes  
**So that** I can match users to jobs

**Acceptance Criteria:**

- [ ] Extract: name, email, phone, location, summary
- [ ] Extract: skills, experience, education, certifications
- [ ] Handle parsing errors gracefully
- [ ] Return structured JSON response

**Files:** `apps/api/app/services/resume_parser.py`

---

### E2-S3: Resume Encryption

**As a** system  
**I want to** encrypt resume data at rest  
**So that** user PII is protected

**Acceptance Criteria:**

- [ ] Fernet (AES-256) encryption for resume_data field
- [ ] Encryption key stored in environment variable
- [ ] Decrypt on read, encrypt on write

**Files:** `apps/api/app/core/security.py`

---

### E2-S4: Resume Verification

**As a** user  
**I want to** review parsed resume data  
**So that** I can correct any parsing errors

**Acceptance Criteria:**

- [ ] Display parsed data in editable form
- [ ] Allow corrections before saving
- [ ] Confirm button to proceed

**Files:** `apps/web/app/onboarding/resume/`

---

## E3: Profile Management

> **Goal:** Allow users to create and manage multiple search profiles.

### E3-S1: Create Profile

**As a** user  
**I want to** create a search profile  
**So that** I can save my job search preferences

**Acceptance Criteria:**

- [ ] Profile name required
- [ ] Search config attached to profile
- [ ] First profile auto-activated

**Files:** `apps/api/app/routers/profiles.py`

---

### E3-S2: Search Configuration

**As a** user  
**I want to** configure my search preferences  
**So that** I get relevant job results

**Acceptance Criteria:**

- [ ] Set search terms (job titles)
- [ ] Set locations
- [ ] Select sources (Indeed, LinkedIn, Glassdoor, ZipRecruiter)
- [ ] Toggle remote-only filter
- [ ] Set salary range (optional)
- [ ] Exclude keywords (optional)

**Files:** `apps/web/app/onboarding/config/`, `apps/api/app/models/schemas.py`

---

### E3-S3: Profile Switching

**As a** user  
**I want to** switch between profiles  
**So that** I can manage multiple job searches

**Acceptance Criteria:**

- [ ] Profile selector in header
- [ ] Active profile indicator
- [ ] Jobs filtered by active profile

**Files:** `apps/web/components/ProfileSelector.tsx`

---

### E3-S4: Update Profile

**As a** user  
**I want to** edit my profile settings  
**So that** I can refine my search criteria

**Acceptance Criteria:**

- [ ] Edit form pre-populated with current values
- [ ] Validation on save
- [ ] Success feedback

**Files:** `apps/web/app/(dashboard)/settings/`

---

### E3-S5: Delete Profile

**As a** user  
**I want to** delete a profile  
**So that** I can remove outdated searches

**Acceptance Criteria:**

- [ ] Confirmation dialog
- [ ] Cascade delete associated jobs
- [ ] Cannot delete last profile

**Files:** `apps/api/app/routers/profiles.py`

---

## E4: Job Discovery

> **Goal:** Scrape, store, and display job listings from multiple sources.

### E4-S1: Trigger Job Search

**As a** user  
**I want to** trigger a job search  
**So that** I can discover new opportunities

**Acceptance Criteria:**

- [ ] Search button on dashboard
- [ ] Loading state during search
- [ ] Display count of jobs found

**Files:** `apps/web/app/(dashboard)/page.tsx`, `apps/api/app/routers/jobs.py`

---

### E4-S2: Job Scraping

**As a** system  
**I want to** scrape jobs from configured sources  
**So that** users have fresh listings

**Acceptance Criteria:**

- [ ] Use python-jobspy for multi-source scraping
- [ ] Extract: title, company, location, salary, description, URL
- [ ] Deduplicate by external_id
- [ ] Handle scraping errors gracefully

**Files:** `apps/api/app/services/job_scraper.py`

---

### E4-S3: Job Listing Display

**As a** user  
**I want to** view my job listings  
**So that** I can find opportunities

**Acceptance Criteria:**

- [ ] Card-based layout
- [ ] Show: title, company, location, salary, score, tier
- [ ] Pagination (20 per page)
- [ ] Empty state when no jobs

**Files:** `apps/web/components/jobs/JobCard.tsx`

---

### E4-S4: Job Filtering

**As a** user  
**I want to** filter jobs  
**So that** I can focus on specific criteria

**Acceptance Criteria:**

- [ ] Filter by tier (A/B/C/D)
- [ ] Filter by source
- [ ] Filter by status (new, applied, saved, hidden)
- [ ] Search by title/company

**Files:** `apps/web/components/dashboard/FilterBar.tsx`

---

### E4-S5: Job Status Management

**As a** user  
**I want to** update job status  
**So that** I can track my applications

**Acceptance Criteria:**

- [ ] Mark as applied
- [ ] Save for later
- [ ] Hide from view
- [ ] Status persisted to database

**Files:** `apps/api/app/routers/jobs.py`

---

### E4-S6: Job Export

**As a** user  
**I want to** export jobs as CSV  
**So that** I can track applications externally

**Acceptance Criteria:**

- [ ] Export button on dashboard
- [ ] CSV includes all job fields
- [ ] Filename includes date

**Files:** `apps/api/app/routers/jobs.py`

---

## E5: AI Scoring

> **Goal:** Score jobs against user profile using GPT-4o Mini.

### E5-S1: API Key Entry

**As a** user  
**I want to** provide my OpenAI API key  
**So that** jobs can be scored

**Acceptance Criteria:**

- [ ] Masked input field
- [ ] Validation before save
- [ ] Session-only storage (never persisted)
- [ ] Clear key option

**Files:** `apps/web/app/onboarding/api-key/`, `apps/api/app/core/security.py`

---

### E5-S2: API Key Validation

**As a** system  
**I want to** validate OpenAI API keys  
**So that** invalid keys are rejected

**Acceptance Criteria:**

- [ ] Test API call on submit
- [ ] Error message for invalid keys
- [ ] Success indicator for valid keys

**Files:** `apps/api/app/routers/scoring.py`

---

### E5-S3: Job Scoring

**As a** system  
**I want to** score jobs using GPT-4o Mini  
**So that** users see relevance rankings

**Acceptance Criteria:**

- [ ] Use weighted scoring formula
- [ ] Score 6 factors: skill_match, experience, location, salary, company, recency
- [ ] Calculate total score (0-100)
- [ ] Assign tier (A/B/C/D)

**Files:** `apps/api/app/services/scorer.py`

---

### E5-S4: Score Display

**As a** user  
**I want to** see job scores  
**So that** I can prioritize my applications

**Acceptance Criteria:**

- [ ] Score bar visualization
- [ ] Tier badge (color-coded)
- [ ] Matched skills chips

**Files:** `apps/web/components/jobs/JobCard.tsx`

---

### E5-S5: Score Transparency

**As a** user  
**I want to** see score breakdown  
**So that** I understand why jobs ranked as they did

**Acceptance Criteria:**

- [ ] Detail modal with breakdown
- [ ] Show each factor score
- [ ] Show matched/missing skills
- [ ] Show AI explanation

**Files:** `apps/web/components/jobs/JobDetailModal.tsx`

---

## E6: Scheduling & Automation

> **Goal:** Enable automatic job searches at configured intervals.

### E6-S1: Schedule Configuration

**As a** user  
**I want to** set a search schedule  
**So that** I don't have to manually search

**Acceptance Criteria:**

- [ ] Interval options: manual, 1h, 3h, 6h, 12h, 24h
- [ ] Per-profile setting
- [ ] Immediate effect on save

**Files:** `apps/web/app/(dashboard)/settings/`

---

### E6-S2: Scheduled Execution

**As a** system  
**I want to** run searches at scheduled intervals  
**So that** users have fresh jobs

**Acceptance Criteria:**

- [ ] APScheduler triggers at interval
- [ ] Scrape and score (if key available)
- [ ] Skip scoring if no key (mark as "needs_key")
- [ ] Log search run results

**Files:** `apps/api/app/services/scheduler.py`

---

### E6-S3: Next Run Display

**As a** user  
**I want to** see when the next search will run  
**So that** I know when to expect new jobs

**Acceptance Criteria:**

- [ ] Display next run time on dashboard
- [ ] Relative time format ("in 2 hours")

**Files:** `apps/web/app/(dashboard)/page.tsx`

---

### E6-S4: Auto-Purge

**As a** system  
**I want to** delete old jobs automatically  
**So that** the database stays clean

**Acceptance Criteria:**

- [ ] Purge jobs older than N days (default 30)
- [ ] Configurable per user
- [ ] Run daily

**Files:** `apps/api/app/services/scheduler.py`

---

## E7: Analytics & Metrics

> **Goal:** Provide insights into job search performance.

### E7-S1: Dashboard Stats

**As a** user  
**I want to** see job search statistics  
**So that** I can track my progress

**Acceptance Criteria:**

- [ ] Total jobs count
- [ ] Count by status (new, applied, saved, hidden)
- [ ] Average score

**Files:** `apps/web/components/dashboard/StatsOverview.tsx`

---

### E7-S2: Tier Distribution

**As a** user  
**I want to** see tier distribution  
**So that** I understand job quality

**Acceptance Criteria:**

- [ ] Pie/bar chart of tier counts
- [ ] Color-coded by tier

**Files:** `apps/web/app/(dashboard)/metrics/`

---

### E7-S3: Source Effectiveness

**As a** user  
**I want to** see which sources perform best  
**So that** I can focus my search

**Acceptance Criteria:**

- [ ] Jobs per source chart
- [ ] Average score per source

**Files:** `apps/api/app/routers/metrics.py`

---

### E7-S4: System Health

**As a** user  
**I want to** see system health  
**So that** I know everything is working

**Acceptance Criteria:**

- [ ] Last search run time
- [ ] Next scheduled run
- [ ] API key status
- [ ] Estimated API usage

**Files:** `apps/api/app/routers/metrics.py`

---

## E8: Settings & Preferences

> **Goal:** Allow users to customize their experience.

### E8-S1: Purge Settings

**As a** user  
**I want to** configure auto-purge  
**So that** I control data retention

**Acceptance Criteria:**

- [ ] Input for purge days (7-90)
- [ ] Default 30 days

**Files:** `apps/web/app/(dashboard)/settings/`

---

### E8-S2: Export Preferences

**As a** user  
**I want to** set export format  
**So that** exports match my needs

**Acceptance Criteria:**

- [ ] Format options: CSV, JSON
- [ ] Default CSV

**Files:** `apps/api/app/routers/settings.py`

---

### E8-S3: Privacy Mode

**As a** user  
**I want to** enable privacy mode  
**So that** sensitive data is hidden

**Acceptance Criteria:**

- [ ] Toggle in settings
- [ ] Mask salary, company details when enabled

**Files:** `apps/api/app/models/schemas.py`

---

## Story Summary

| Epic               | Stories | Story Points (Est.) |
| ------------------ | ------- | ------------------- |
| E1: Authentication | 3       | 8                   |
| E2: Resume         | 4       | 13                  |
| E3: Profile        | 5       | 13                  |
| E4: Job Discovery  | 6       | 21                  |
| E5: AI Scoring     | 5       | 21                  |
| E6: Scheduling     | 4       | 13                  |
| E7: Analytics      | 4       | 13                  |
| E8: Settings       | 3       | 5                   |
| **Total**          | **34**  | **107**             |

---

## Implementation Priority

**Sprint 1 (MVP Core):**

- E1: Authentication (all)
- E2: Resume Management (all)
- E3: Profile Management (S1-S3)

**Sprint 2 (Job Discovery):**

- E4: Job Discovery (all)
- E5: AI Scoring (all)

**Sprint 3 (Automation):**

- E3: Profile Management (S4-S5)
- E6: Scheduling (all)

**Sprint 4 (Polish):**

- E7: Analytics (all)
- E8: Settings (all)
