---
stepsCompleted:
  ["system-design", "api-architecture", "data-architecture", "integration"]
inputDocuments: ["docs/bmad/PRD.md", "docs/bmad/architecture.md"]
workflowType: "architecture"
lastStep: 8
---

# System Architecture Document - Job Scout

**Author:** BMAD Architecture Workflow  
**Date:** 2026-01-05  
**Version:** 1.0

---

## 1. Architecture Overview

### 1.1 System Context

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              JOB SCOUT SYSTEM                                │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────┐   │
│  │   Browser   │────▶│  Next.js    │────▶│       FastAPI Backend       │   │
│  │   Client    │     │  Frontend   │     │                              │   │
│  └─────────────┘     └─────────────┘     └──────────┬──────────────────┘   │
│                                                      │                       │
│                      ┌───────────────────────────────┼───────────────────┐  │
│                      ▼                               ▼                   ▼  │
│             ┌─────────────┐              ┌─────────────┐       ┌──────────┐ │
│             │    Clerk    │              │   OpenAI    │       │  SQLite  │ │
│             │    Auth     │              │    API      │       │    DB    │ │
│             └─────────────┘              └─────────────┘       └──────────┘ │
│                                                                              │
│             ┌──────────────────────────────────────────────────────────────┐│
│             │                     JOB SOURCES                               ││
│             │  LinkedIn  │  Indeed  │  Glassdoor  │  ZipRecruiter          ││
│             └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer      | Technology          | Justification                      |
| ---------- | ------------------- | ---------------------------------- |
| Frontend   | Next.js 14          | App Router, RSC, TypeScript        |
| UI         | Radix + TailwindCSS | Accessible premises, utility-first |
| State      | TanStack Query      | Server state caching               |
| Auth       | Clerk               | Managed auth, JWT tokens           |
| API        | FastAPI             | Async, type hints, auto docs       |
| ORM        | SQLAlchemy 2.0      | Async support, declarative         |
| DB         | SQLite + aiosqlite  | Simple, embedded, portable         |
| AI         | OpenAI GPT-4o Mini  | Cost-effective, fast inference     |
| Scraping   | python-jobspy       | Multi-source job aggregation       |
| Scheduling | APScheduler         | In-process async scheduler         |
| Encryption | Fernet (AES-256)    | Symmetric encryption for PII       |

---

## 2. Component Architecture

### 2.1 Frontend Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 14 App                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │   Clerk Auth     │  │  TanStack Query  │  │   UI Library   │ │
│  │   Provider       │  │    Provider      │  │   (Radix)      │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬────────┘ │
│           │                     │                    │          │
│  ┌────────┴─────────────────────┴────────────────────┴────────┐ │
│  │                        Pages                                │ │
│  │  ┌─────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐ │ │
│  │  │ Landing │  │ Onboarding│  │ Dashboard│  │   Modals    │ │ │
│  │  └─────────┘  └───────────┘  └──────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     Components                               │ │
│  │  JobCard │ FilterBar │ StatsOverview │ ProfileSelector      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Backend Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        FastAPI App                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                       Routers                              │  │
│  │  auth │ resume │ profiles │ jobs │ scoring │ metrics │    │  │
│  │                                            settings        │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
│                            │                                    │
│  ┌─────────────────────────┴─────────────────────────────────┐  │
│  │                       Services                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │  │
│  │  │ job_scraper  │  │    scorer    │  │   resume_parser  │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘ │  │
│  │  ┌──────────────┐  ┌──────────────────────────────────────┤ │  │
│  │  │  scheduler   │  │           security                   │ │  │
│  │  └──────────────┘  └──────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                       Models                               │  │
│  │  User │ Profile │ Job │ SearchRun │ Settings              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Architecture

### 3.1 Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    User     │       │   Profile    │       │     Job     │
│─────────────│       │──────────────│       │─────────────│
│ id (PK)     │──┐    │ id (PK)      │──┐    │ id (PK)     │
│ clerk_id    │  └───▶│ user_id (FK) │  └───▶│ profile_id  │
│ email       │       │ name         │       │ title       │
│ created_at  │       │ resume_data  │       │ company     │
└─────────────┘       │ search_config│       │ score       │
                      │ schedule     │       │ tier        │
                      │ is_active    │       │ status      │
                      └──────────────┘       └─────────────┘
                             │                      │
                             │                      │
                      ┌──────┴──────┐        ┌──────┴──────┐
                      │  SearchRun  │        │ (scoring    │
                      │─────────────│        │  breakdown) │
                      │ profile_id  │        └─────────────┘
                      │ status      │
                      │ jobs_found  │
                      │ jobs_scored │
                      └─────────────┘
```

### 3.2 Data Flow

```
Resume Upload:
┌────────┐    ┌─────────┐    ┌───────────┐    ┌──────────┐    ┌────────┐
│ Upload │───▶│  Parse  │───▶│  Encrypt  │───▶│  Store   │───▶│ Return │
│ PDF    │    │ Content │    │  (Fernet) │    │  in DB   │    │ Parsed │
└────────┘    └─────────┘    └───────────┘    └──────────┘    └────────┘

Job Search:
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Trigger │───▶│ Scrape  │───▶│  Score  │───▶│  Store  │───▶│ Return  │
│ Search  │    │  Jobs   │    │ (GPT-4) │    │   Jobs  │    │ Results │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

---

## 4. AI Scoring Algorithm

### 4.1 Scoring Formula

The scoring system uses a **weighted multi-factor model**:

```
Total Score = Σ (Factor_i × Weight_i)
```

**Weights:**
| Factor | Weight | Description |
|--------|--------|-------------|
| skill_match | 35% | Skills overlap between resume and job |
| experience_level | 20% | Experience alignment |
| location_match | 15% | Location/remote fit |
| salary_fit | 15% | Salary competitiveness |
| company_signals | 10% | Company reputation signals |
| recency | 5% | Job posting freshness |

### 4.2 Tier Classification

| Tier | Score Range | Label     | Color  |
| ---- | ----------- | --------- | ------ |
| A    | 85-100      | Excellent | Green  |
| B    | 70-84       | Strong    | Blue   |
| C    | 50-69       | Good      | Yellow |
| D    | 0-49        | Consider  | Red    |

### 4.3 Scoring Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    GPT-4o Mini Scoring                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input:                                                          │
│  ┌──────────────────┐    ┌─────────────────────────────────────┐│
│  │ Resume Data      │    │ Job Posting                         ││
│  │ - Skills         │    │ - Title, Company                    ││
│  │ - Summary        │    │ - Description                       ││
│  │ - Experience     │    │ - Location, Salary                  ││
│  └──────────────────┘    └─────────────────────────────────────┘│
│                                                                  │
│  Prompt → GPT-4o Mini → JSON Response                           │
│                                                                  │
│  Output:                                                         │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ {                                                            ││
│  │   "skill_match": 0.85,                                       ││
│  │   "experience_level": 0.75,                                  ││
│  │   "matched_skills": ["Python", "React"],                     ││
│  │   "missing_skills": ["Kubernetes"],                          ││
│  │   "explanation": "Strong match due to..."                    ││
│  │ }                                                            ││
│  └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Scheduling Architecture

### 5.1 APScheduler Configuration

```python
JobScheduler:
├── AsyncIOScheduler (UTC timezone)
├── MemoryJobStore (in-process)
└── IntervalTrigger (per-profile)

Intervals:
├── manual → No scheduling
├── 1h  → 3600 seconds
├── 3h  → 10800 seconds
├── 6h  → 21600 seconds
├── 12h → 43200 seconds
└── 24h → 86400 seconds
```

### 5.2 Scheduled Job Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Scheduler  │───▶│ Get Profile │───▶│ Check API   │───▶│   Scrape    │
│  Triggers   │    │ from DB     │    │    Key      │    │    Jobs     │
└─────────────┘    └─────────────┘    └──────┬──────┘    └──────┬──────┘
                                             │                  │
                            ┌────────────────┴────┐             │
                            ▼                     ▼             │
                   ┌─────────────┐       ┌─────────────┐        │
                   │  No Key:    │       │  Has Key:   │◀───────┘
                   │ "needs_key" │       │   Score     │
                   └─────────────┘       └─────────────┘
```

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │───▶│  Clerk   │───▶│   JWT    │───▶│  FastAPI │
│  Login   │    │  Auth    │    │  Token   │    │  Verify  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### 6.2 Data Protection

| Data Type       | Protection Method                        |
| --------------- | ---------------------------------------- |
| Resume Content  | Fernet AES-256 encryption                |
| OpenAI API Keys | Session-only storage (never persisted)   |
| User Data       | Multi-tenant isolation (user_id scoping) |
| API Tokens      | Clerk JWT verification                   |

### 6.3 Key Store (Session-Only)

```python
key_store = {}  # In-memory only

# Store (session start)
key_store[user_id] = encrypted_key

# Retrieve (for scoring)
key = key_store.get(user_id)

# Clear (session end or explicit)
del key_store[user_id]
```

---

## 7. Integration Points

### 7.1 External Service Dependencies

| Service    | Purpose        | Failure Handling                              |
| ---------- | -------------- | --------------------------------------------- |
| Clerk      | Authentication | Reject requests                               |
| OpenAI     | Job scoring    | Mark as "needs_key", continue without scoring |
| Job Boards | Job scraping   | Log error, return partial results             |

### 7.2 API Rate Limiting

| Service    | Rate Limit  | Strategy                |
| ---------- | ----------- | ----------------------- |
| OpenAI     | Token-based | Batch jobs, track usage |
| Job Boards | Varies      | python-jobspy handles   |

---

## 8. Deployment Architecture

### 8.1 Production Topology

```
┌──────────────────────────────────────────────────────────────────┐
│                          PRODUCTION                               │
│                                                                   │
│  ┌────────────────────┐         ┌─────────────────────────────┐  │
│  │      VERCEL        │         │         RAILWAY             │  │
│  │  ┌──────────────┐  │         │  ┌───────────────────────┐  │  │
│  │  │  Next.js 14  │  │  REST   │  │    FastAPI + Uvicorn  │  │  │
│  │  │  Frontend    │──┼─────────┼─▶│    SQLite (volume)    │  │  │
│  │  └──────────────┘  │         │  │    APScheduler        │  │  │
│  └────────────────────┘         │  └───────────────────────┘  │  │
│                                  └─────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────┐         ┌─────────────────────────────┐  │
│  │       CLERK        │         │        OPENAI               │  │
│  │  Managed Auth      │         │        GPT-4o Mini          │  │
│  └────────────────────┘         └─────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 8.2 Environment Variables

**Frontend (Vercel):**

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_API_URL
```

**Backend (Railway):**

```
DATABASE_URL
ENCRYPTION_KEY
CLERK_SECRET_KEY
CORS_ORIGINS
```

---

## 9. Scalability Considerations

### 9.1 Current Limitations

| Constraint          | Impact          | Mitigation                         |
| ------------------- | --------------- | ---------------------------------- |
| SQLite              | Single-writer   | OK for single-user/low-concurrency |
| In-memory scheduler | Lost on restart | Re-schedule on startup             |
| Session key store   | Not distributed | Single-instance deployment         |

### 9.2 Future Scaling Path

| Phase   | Change             | Benefit                   |
| ------- | ------------------ | ------------------------- |
| Phase 1 | PostgreSQL         | Multi-connection support  |
| Phase 2 | Redis              | Distributed session store |
| Phase 3 | Celery             | Distributed task queue    |
| Phase 4 | Horizontal scaling | Multiple API instances    |

---

## 10. Decision Log

| Decision                     | Rationale                 | Alternatives Considered                   |
| ---------------------------- | ------------------------- | ----------------------------------------- |
| SQLite instead of PostgreSQL | Simplicity for MVP        | PostgreSQL overkill for single-user       |
| Session-only API key storage | Security requirement      | DB encryption (less secure)               |
| APScheduler in-process       | Simple, no infrastructure | Celery (complex), cron (limited)          |
| GPT-4o Mini                  | Cost-effective, fast      | GPT-4 (expensive), Claude (different API) |
| Fernet for encryption        | Python stdlib, simple     | NaCl (overkill), custom (error-prone)     |
