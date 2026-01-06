---
stepsCompleted: ["extraction", "analysis", "requirements"]
inputDocuments: ["docs/bmad/project-overview.md", "docs/bmad/architecture.md"]
workflowType: "prd"
lastStep: 12
---

# Product Requirements Document - Job Scout

**Author:** BMAD Document Workflow  
**Date:** 2026-01-05  
**Version:** 1.0

---

## 1. Executive Summary

### 1.1 Product Vision

Job Scout is an AI-powered job search engine that helps professionals find relevant job opportunities by automatically scraping, scoring, and ranking jobs from multiple sources against their resume and preferences.

### 1.2 Problem Statement

Job seekers face these challenges:

1. **Information overload** - Hundreds of irrelevant listings across multiple platforms
2. **Time waste** - Manual searching and evaluation is repetitive and exhausting
3. **No personalization** - Generic job boards don't know your skills or preferences
4. **Lack of transparency** - No insight into why some jobs might be better matches

### 1.3 Solution

Job Scout automates the entire job discovery pipeline:

- Parse resume to extract skills, experience, and qualifications
- Configure search preferences (job title, location, remote, sources)
- Scrape jobs from LinkedIn, Indeed, Glassdoor, ZipRecruiter
- Use GPT-4o Mini to score each job against user profile
- Present ranked results with transparent scoring breakdown
- Provide analytics on tier distribution, source effectiveness, and top companies

### 1.4 Target Users

**Primary:** Active job seekers who:

- Have a current resume
- Know their target job title and location preferences
- Want to reduce time spent on job boards
- Are willing to use their own OpenAI API key for scoring

**Secondary:**

- Passive job seekers monitoring opportunities
- Career coaches helping clients with job search

---

## 2. Functional Requirements

### 2.1 Authentication (FR-AUTH)

| ID         | Requirement                                   | Priority | Status         |
| ---------- | --------------------------------------------- | -------- | -------------- |
| FR-AUTH-01 | Users can sign up via Clerk authentication    | P0       | ✅ Implemented |
| FR-AUTH-02 | Users can sign in with existing Clerk account | P0       | ✅ Implemented |
| FR-AUTH-03 | All API endpoints require valid JWT token     | P0       | ✅ Implemented |
| FR-AUTH-04 | User sessions persist across browser sessions | P1       | ✅ Implemented |

### 2.2 Resume Management (FR-RESUME)

| ID           | Requirement                                                                                                              | Priority | Status         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ | -------- | -------------- |
| FR-RESUME-01 | Users can upload resume in PDF format                                                                                    | P0       | ✅ Implemented |
| FR-RESUME-02 | Users can upload resume in DOCX format                                                                                   | P0       | ✅ Implemented |
| FR-RESUME-03 | System parses resume to extract structured data                                                                          | P0       | ✅ Implemented |
| FR-RESUME-04 | Extracted data includes: name, email, phone, location, summary, skills, experience, education, certifications, languages | P0       | ✅ Implemented |
| FR-RESUME-05 | Users can view and verify parsed resume data                                                                             | P1       | ✅ Implemented |
| FR-RESUME-06 | Users can delete their resume                                                                                            | P1       | ✅ Implemented |
| FR-RESUME-07 | Resume data is encrypted at rest                                                                                         | P0       | ✅ Implemented |

### 2.3 Profile Management (FR-PROFILE)

| ID            | Requirement                                              | Priority | Status         |
| ------------- | -------------------------------------------------------- | -------- | -------------- |
| FR-PROFILE-01 | Users can create multiple search profiles                | P0       | ✅ Implemented |
| FR-PROFILE-02 | Each profile has: name, search config, schedule interval | P0       | ✅ Implemented |
| FR-PROFILE-03 | Users can set one profile as active                      | P0       | ✅ Implemented |
| FR-PROFILE-04 | Users can update profile settings                        | P1       | ✅ Implemented |
| FR-PROFILE-05 | Users can delete profiles                                | P1       | ✅ Implemented |

### 2.4 Search Configuration (FR-SEARCH)

| ID           | Requirement                                                              | Priority | Status         |
| ------------ | ------------------------------------------------------------------------ | -------- | -------------- |
| FR-SEARCH-01 | Users can specify job search terms                                       | P0       | ✅ Implemented |
| FR-SEARCH-02 | Users can specify target locations                                       | P0       | ✅ Implemented |
| FR-SEARCH-03 | Users can select job sources (Indeed, LinkedIn, Glassdoor, ZipRecruiter) | P0       | ✅ Implemented |
| FR-SEARCH-04 | Users can enable/disable remote-only filter                              | P1       | ✅ Implemented |
| FR-SEARCH-05 | Users can set salary range preferences                                   | P1       | ✅ Implemented |
| FR-SEARCH-06 | Users can exclude keywords from results                                  | P1       | ✅ Implemented |
| FR-SEARCH-07 | Users can exclude senior-level positions                                 | P2       | ✅ Implemented |
| FR-SEARCH-08 | Users can exclude international positions                                | P2       | ✅ Implemented |

### 2.5 Job Discovery (FR-JOBS)

| ID         | Requirement                                                              | Priority | Status         |
| ---------- | ------------------------------------------------------------------------ | -------- | -------------- |
| FR-JOBS-01 | System scrapes jobs from configured sources                              | P0       | ✅ Implemented |
| FR-JOBS-02 | Jobs include: title, company, location, salary, description, URL, source | P0       | ✅ Implemented |
| FR-JOBS-03 | Users can manually trigger job search                                    | P0       | ✅ Implemented |
| FR-JOBS-04 | Users can view paginated job list                                        | P0       | ✅ Implemented |
| FR-JOBS-05 | Users can filter jobs by status (new, applied, saved, hidden)            | P1       | ✅ Implemented |
| FR-JOBS-06 | Users can filter jobs by source                                          | P1       | ✅ Implemented |
| FR-JOBS-07 | Users can filter jobs by tier                                            | P1       | ✅ Implemented |
| FR-JOBS-08 | Users can filter jobs by minimum score                                   | P1       | ✅ Implemented |
| FR-JOBS-09 | Users can sort jobs by score or date                                     | P1       | ✅ Implemented |
| FR-JOBS-10 | Users can search within job titles/companies                             | P1       | ✅ Implemented |
| FR-JOBS-11 | Users can update job status                                              | P1       | ✅ Implemented |
| FR-JOBS-12 | Users can export jobs as CSV                                             | P2       | ✅ Implemented |

### 2.6 AI Scoring (FR-SCORE)

| ID          | Requirement                                                                                                   | Priority | Status         |
| ----------- | ------------------------------------------------------------------------------------------------------------- | -------- | -------------- |
| FR-SCORE-01 | Users provide their own OpenAI API key                                                                        | P0       | ✅ Implemented |
| FR-SCORE-02 | API key stored in session only (never persisted)                                                              | P0       | ✅ Implemented |
| FR-SCORE-03 | System validates API key before use                                                                           | P0       | ✅ Implemented |
| FR-SCORE-04 | Jobs are scored using GPT-4o Mini                                                                             | P0       | ✅ Implemented |
| FR-SCORE-05 | Scoring compares job description to user profile                                                              | P0       | ✅ Implemented |
| FR-SCORE-06 | Score breakdown includes: skill match, experience level, location match, salary fit, company signals, recency | P0       | ✅ Implemented |
| FR-SCORE-07 | Jobs are classified into tiers: Excellent (85+), Strong (70-84), Good (50-69), Consider (<50)                 | P0       | ✅ Implemented |
| FR-SCORE-08 | Scoring includes matched and missing skills                                                                   | P1       | ✅ Implemented |
| FR-SCORE-09 | Scoring includes human-readable explanation                                                                   | P1       | ✅ Implemented |
| FR-SCORE-10 | If no API key, system marks search as "needs key"                                                             | P1       | ✅ Implemented |

### 2.7 Scheduling & Automation (FR-SCHED)

| ID          | Requirement                                                   | Priority | Status         |
| ----------- | ------------------------------------------------------------- | -------- | -------------- |
| FR-SCHED-01 | Users can set schedule interval: manual, 1h, 3h, 6h, 12h, 24h | P0       | ✅ Implemented |
| FR-SCHED-02 | System automatically runs searches at configured interval     | P0       | ✅ Implemented |
| FR-SCHED-03 | Scheduled searches continue while server is running           | P1       | ✅ Implemented |
| FR-SCHED-04 | Users can see next scheduled run time                         | P1       | ✅ Implemented |

### 2.8 Settings & Preferences (FR-SETTINGS)

| ID             | Requirement                                                  | Priority | Status         |
| -------------- | ------------------------------------------------------------ | -------- | -------------- |
| FR-SETTINGS-01 | Users can configure auto-purge days (default: 30)            | P1       | ✅ Implemented |
| FR-SETTINGS-02 | System automatically deletes jobs older than purge threshold | P1       | ✅ Implemented |
| FR-SETTINGS-03 | Users can enable privacy mode                                | P2       | ✅ Implemented |
| FR-SETTINGS-04 | Users can set export format preference                       | P2       | ✅ Implemented |

### 2.9 Analytics & Metrics (FR-METRICS)

| ID            | Requirement                                 | Priority | Status         |
| ------------- | ------------------------------------------- | -------- | -------------- |
| FR-METRICS-01 | Dashboard shows total jobs count            | P1       | ✅ Implemented |
| FR-METRICS-02 | Dashboard shows count by status             | P1       | ✅ Implemented |
| FR-METRICS-03 | Dashboard shows average score               | P1       | ✅ Implemented |
| FR-METRICS-04 | Dashboard shows tier distribution           | P1       | ✅ Implemented |
| FR-METRICS-05 | Dashboard shows interview likelihood metric | P2       | ✅ Implemented |
| FR-METRICS-06 | System health shows last/next search run    | P1       | ✅ Implemented |
| FR-METRICS-07 | System health shows API key status          | P1       | ✅ Implemented |
| FR-METRICS-08 | System health shows estimated API usage     | P2       | ✅ Implemented |

---

## 3. Non-Functional Requirements

### 3.1 Security (NFR-SEC)

| ID         | Requirement                                      | Priority | Status         |
| ---------- | ------------------------------------------------ | -------- | -------------- |
| NFR-SEC-01 | All API endpoints require authentication         | P0       | ✅ Implemented |
| NFR-SEC-02 | Resume data encrypted with Fernet (AES-256)      | P0       | ✅ Implemented |
| NFR-SEC-03 | OpenAI API keys never stored in database         | P0       | ✅ Implemented |
| NFR-SEC-04 | Multi-tenant isolation via user ID scoping       | P0       | ✅ Implemented |
| NFR-SEC-05 | CORS restricted to allowed origins in production | P0       | ✅ Implemented |
| NFR-SEC-06 | JWT tokens verified with Clerk on every request  | P0       | ✅ Implemented |

### 3.2 Performance (NFR-PERF)

| ID          | Requirement                                   | Priority | Status         |
| ----------- | --------------------------------------------- | -------- | -------------- |
| NFR-PERF-01 | API response time < 500ms for read operations | P1       | ✅ Implemented |
| NFR-PERF-02 | Pagination on all list endpoints              | P1       | ✅ Implemented |
| NFR-PERF-03 | Async database operations                     | P1       | ✅ Implemented |

### 3.3 Reliability (NFR-REL)

| ID         | Requirement                                  | Priority | Status         |
| ---------- | -------------------------------------------- | -------- | -------------- |
| NFR-REL-01 | Health check endpoint for monitoring         | P0       | ✅ Implemented |
| NFR-REL-02 | Graceful scheduler shutdown                  | P1       | ✅ Implemented |
| NFR-REL-03 | Error messages returned in consistent format | P1       | ✅ Implemented |

### 3.4 Usability (NFR-USE)

| ID         | Requirement                           | Priority | Status         |
| ---------- | ------------------------------------- | -------- | -------------- |
| NFR-USE-01 | 3-step onboarding flow                | P0       | ✅ Implemented |
| NFR-USE-02 | Responsive design for mobile/desktop  | P1       | ✅ Implemented |
| NFR-USE-03 | Transparent scoring with explanations | P1       | ✅ Implemented |

### 3.5 Scalability (NFR-SCALE)

| ID           | Requirement                 | Priority | Status         |
| ------------ | --------------------------- | -------- | -------------- |
| NFR-SCALE-01 | Stateless API design        | P1       | ✅ Implemented |
| NFR-SCALE-02 | Database connection pooling | P1       | ✅ Implemented |
| NFR-SCALE-03 | Async I/O operations        | P1       | ✅ Implemented |

---

## 4. User Stories

### Epic 1: User Onboarding

**US-1.1:** As a new user, I want to upload my resume so the system can understand my qualifications.

**US-1.2:** As a new user, I want to configure my job search preferences so I get relevant results.

**US-1.3:** As a new user, I want to provide my OpenAI API key so jobs can be scored.

### Epic 2: Job Discovery

**US-2.1:** As a job seeker, I want to search for jobs matching my profile so I can find relevant opportunities.

**US-2.2:** As a job seeker, I want to see jobs ranked by relevance score so I can focus on the best matches.

**US-2.3:** As a job seeker, I want to filter jobs by tier so I can focus on high-potential matches.

**US-2.4:** As a job seeker, I want to understand why a job scored the way it did so I can trust the recommendations.

### Epic 3: Job Management

**US-3.1:** As a job seeker, I want to mark jobs as applied so I can track my progress.

**US-3.2:** As a job seeker, I want to hide irrelevant jobs so my list stays clean.

**US-3.3:** As a job seeker, I want to export my job list so I can track applications elsewhere.

### Epic 4: Automation

**US-4.1:** As a job seeker, I want automatic job searches so I don't have to manually check every day.

**US-4.2:** As a job seeker, I want old jobs automatically removed so my list stays fresh.

### Epic 5: Analytics

**US-5.1:** As a job seeker, I want to see my job search metrics so I can track my progress.

**US-5.2:** As a job seeker, I want to see which sources are most effective so I can focus my efforts.

---

## 5. Out of Scope (v1.0)

The following are explicitly NOT included in the current MVP:

- Email notifications for new jobs
- Browser push notifications
- Direct job application submission
- Company research integration
- Salary negotiation suggestions
- Interview preparation content
- Resume optimization suggestions
- Multiple user collaboration
- Mobile native apps
- Chrome extension

---

## 6. Success Metrics

| Metric                                | Target          |
| ------------------------------------- | --------------- |
| User onboarding completion rate       | > 70%           |
| Average jobs scored per user          | > 50            |
| User return rate (7-day)              | > 40%           |
| Average session duration              | > 5 minutes     |
| Job application rate (applied status) | > 10% of viewed |

---

## 7. Technical Constraints

1. **User-provided API keys:** Users must provide their own OpenAI API key for scoring
2. **SQLite database:** Single-file database for simplicity
3. **Session-only key storage:** OpenAI keys never persisted
4. **python-jobspy limitations:** Scraping subject to rate limits and site changes
5. **Clerk dependency:** Authentication tied to Clerk service

---

## 8. Dependencies

| Dependency    | Version | Purpose            |
| ------------- | ------- | ------------------ |
| Clerk         | 5.x     | Authentication     |
| OpenAI        | 1.10.x  | AI scoring         |
| python-jobspy | 1.1.x   | Job scraping       |
| FastAPI       | 0.109.x | API framework      |
| Next.js       | 14.x    | Frontend framework |
| SQLAlchemy    | 2.x     | ORM                |
| APScheduler   | 3.10.x  | Job scheduling     |
