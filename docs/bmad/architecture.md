# Job Scout - Architecture

## System Architecture

Job Scout follows a **client-server monorepo** architecture with clear separation between frontend and backend.

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENTS                                   │
│  Browser → Clerk Auth → Next.js Frontend (apps/web)                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API (JSON)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                  │
│  FastAPI (apps/api) → Clerk JWT Verification → User Context         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│     Routers       │   │     Services      │   │      Models       │
│  • auth           │   │  • job_scraper    │   │  • database.py    │
│  • jobs           │   │  • scoring        │   │  • schemas.py     │
│  • profiles       │   │  • resume_parser  │   │                   │
│  • resume         │   │  • scheduler      │   │                   │
│  • scoring        │   │  • encryption     │   │                   │
│  • metrics        │   │                   │   │                   │
│  • settings       │   │                   │   │                   │
└───────────────────┘   └───────────────────┘   └───────────────────┘
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
│  SQLite Database (SQLAlchemy async) + Fernet Encryption             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                               │
│  • OpenAI API (GPT-4o Mini) - Job scoring                           │
│  • Job Boards (via python-jobspy) - LinkedIn, Indeed, etc.          │
│  • Clerk - Authentication                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture (apps/web/)

### Framework: Next.js 14 App Router

```
apps/web/
├── app/                          # App Router pages
│   ├── (dashboard)/              # Dashboard route group
│   │   └── metrics/              # Metrics tab
│   ├── app/                      # Main app routes
│   │   └── dashboard/            # Dashboard page
│   ├── onboarding/               # 3-step onboarding flow
│   │   ├── api-key/              # Step 3: API key
│   │   └── config/               # Step 2: Search config
│   ├── sign-in/                  # Clerk sign-in
│   └── sign-up/                  # Clerk sign-up
├── components/
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── FilterBar.tsx
│   │   └── StatsOverview.tsx
│   ├── jobs/                     # Job listing components
│   ├── onboarding/               # Onboarding components
│   ├── ui/                       # Radix-based UI primitives
│   └── ProfileSelector.tsx
├── lib/                          # Utilities
│   └── utils.ts
└── middleware.ts                 # Clerk auth middleware
```

### Key Patterns

- **Route Groups:** `(dashboard)` for authenticated routes
- **Server Components:** Default for data fetching
- **Client Components:** Interactive UI with `"use client"`
- **TanStack Query:** API state management
- **Radix UI:** Accessible component primitives

---

## Backend Architecture (apps/api/)

### Framework: FastAPI + SQLAlchemy

```
apps/api/
├── app/
│   ├── core/                     # Core utilities
│   │   ├── config.py             # Environment settings
│   │   └── security.py           # Auth helpers
│   ├── models/
│   │   ├── database.py           # SQLAlchemy models & DB init
│   │   └── schemas.py            # Pydantic schemas
│   ├── routers/                  # API endpoints
│   │   ├── auth.py               # Auth endpoints
│   │   ├── jobs.py               # Job CRUD + search
│   │   ├── metrics.py            # Analytics endpoints
│   │   ├── profiles.py           # User profile management
│   │   ├── resume.py             # Resume upload/parse
│   │   ├── scoring.py            # AI scoring endpoints
│   │   └── settings.py           # User settings
│   ├── services/                 # Business logic
│   │   ├── encryption.py         # Fernet encryption
│   │   ├── job_scraper.py        # python-jobspy wrapper
│   │   ├── resume_parser.py      # PDF/DOCX parsing
│   │   ├── scheduler.py          # APScheduler jobs
│   │   └── scoring.py            # OpenAI scoring logic
│   └── main.py                   # FastAPI app entry
└── requirements.txt
```

### Key Patterns

- **Dependency Injection:** FastAPI Depends for auth, DB sessions
- **Async/Await:** Fully async I/O with aiosqlite
- **Pydantic:** Request/response validation
- **Service Layer:** Business logic separated from routers
- **Multi-tenancy:** User ID scoping on all queries

---

## Data Architecture

### Database: SQLite with SQLAlchemy

**Core Tables:**
| Table | Purpose |
|-------|---------|
| `users` | User profiles (linked to Clerk ID) |
| `profiles` | Search profiles (job title, location, etc.) |
| `resumes` | Encrypted resume data |
| `jobs` | Discovered job listings |
| `job_scores` | AI scoring results |
| `search_runs` | Job search execution history |
| `settings` | User preferences |

### Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                              │
├─────────────────────────────────────────────────────────────────┤
│  1. Authentication: Clerk JWT verification                      │
│  2. Authorization: User ID scoping on all queries               │
│  3. Encryption: Fernet (AES-256) for resume data                │
│  4. Session-only: OpenAI keys never persisted                   │
│  5. CORS: Locked to frontend origin in production               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### Frontend ↔ Backend

| Endpoint Pattern       | Purpose                  |
| ---------------------- | ------------------------ |
| `POST /auth/*`         | Clerk token verification |
| `GET/POST /profiles/*` | Profile management       |
| `POST /resume/upload`  | Resume upload + parse    |
| `POST /jobs/search`    | Trigger job search       |
| `GET /jobs`            | Fetch job listings       |
| `POST /scoring/score`  | AI job scoring           |
| `GET /metrics/*`       | Analytics data           |
| `GET/PUT /settings/*`  | User preferences         |

### External Services

| Service    | Integration                                    |
| ---------- | ---------------------------------------------- |
| Clerk      | JWT token in Authorization header              |
| OpenAI     | API key from session, chat completions API     |
| Job Boards | python-jobspy library (LinkedIn, Indeed, etc.) |
