# Job Scout - Project Overview

## Executive Summary

Job Scout is an AI-powered job search engine that helps users find relevant jobs by:

1. Parsing and analyzing their resume
2. Scraping jobs from multiple sources (LinkedIn, Indeed, Glassdoor, ZipRecruiter)
3. Using GPT-4o Mini to score and rank jobs against their profile
4. Providing transparent analytics on scoring and job sources

## Business Context

**Problem:** Job seekers waste time on irrelevant listings and lack insight into why certain jobs match their profile.

**Solution:** Automated job discovery with AI-powered relevance scoring and transparent metrics.

**Target Users:** Job seekers who want intelligent, personalized job recommendations.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Job Scout MVP                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐         ┌──────────────────────────┐  │
│  │     Web Frontend     │         │      API Backend         │  │
│  │     (Next.js 14)     │◄───────►│      (FastAPI)           │  │
│  │                      │  REST   │                          │  │
│  │  • React 18          │         │  • SQLAlchemy/SQLite     │  │
│  │  • TailwindCSS       │         │  • Clerk Auth            │  │
│  │  • Radix UI          │         │  • OpenAI Integration    │  │
│  │  • Clerk Auth        │         │  • python-jobspy         │  │
│  │  • TanStack Query    │         │  • APScheduler           │  │
│  └──────────────────────┘         └──────────────────────────┘  │
│                                              │                   │
│                                              ▼                   │
│                                   ┌──────────────────────┐      │
│                                   │   External Services  │      │
│                                   │  • OpenAI API        │      │
│                                   │  • Job Boards        │      │
│                                   │  • Clerk Auth        │      │
│                                   └──────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend (apps/web/)

| Category          | Technology                   | Version |
| ----------------- | ---------------------------- | ------- |
| Framework         | Next.js                      | 14.1.0  |
| Language          | TypeScript                   | 5.3.x   |
| UI Library        | React                        | 18.2.x  |
| Component Library | Radix UI                     | Various |
| Styling           | TailwindCSS                  | 3.4.x   |
| State Management  | TanStack Query               | 5.17.x  |
| Authentication    | Clerk                        | 5.0.x   |
| Charts            | Recharts                     | 2.10.x  |
| Testing           | Jest + React Testing Library | 29.7.x  |

### Backend (apps/api/)

| Category       | Technology                         | Version |
| -------------- | ---------------------------------- | ------- |
| Framework      | FastAPI                            | 0.109.x |
| Language       | Python                             | 3.11+   |
| ORM            | SQLAlchemy                         | 2.0.x   |
| Database       | SQLite (aiosqlite)                 | N/A     |
| Authentication | PyJWT + python-jose                | 2.8.x   |
| Job Scraping   | python-jobspy                      | 1.1.x   |
| Resume Parsing | jsonify-resume, python-docx, pypdf | Various |
| AI             | OpenAI SDK                         | 1.10.x  |
| Scheduling     | APScheduler                        | 3.10.x  |
| Security       | cryptography (Fernet)              | 41.x    |
| Testing        | pytest + pytest-asyncio            | 7.4.x   |

---

## Key Features

### 1. Onboarding Flow (3-Step)

- **Step 1:** Resume Upload - Parse PDF/DOCX to extract skills and experience
- **Step 2:** Search Configuration - Job title, location, remote preferences
- **Step 3:** API Key Setup - User provides their own OpenAI API key

### 2. Job Discovery

- Multi-source scraping via python-jobspy
- Sources: LinkedIn, Indeed, Glassdoor, ZipRecruiter
- Configurable search parameters
- Scheduled auto-refresh (1h, 3h, 6h, 12h, 24h intervals)

### 3. AI-Powered Scoring

- GPT-4o Mini analyzes job descriptions against user profile
- Scoring formula based on skills match, experience alignment, preferences
- Tier classification: Excellent (85+), Strong (70-84), Good (50-69), Consider (<50)

### 4. Analytics Dashboard

- Tier distribution visualization
- Source effectiveness metrics
- Top companies hiring
- Scoring transparency (see exactly why jobs scored as they did)

### 5. Privacy & Security

- OpenAI keys stored in session only (never persisted)
- Resume data encrypted with Fernet (AES-256)
- Multi-tenant isolation via user ID scoping
- Clerk-based authentication

---

## User Flows

### Primary Flow: Job Discovery

1. User signs up/logs in via Clerk
2. Uploads resume → parsed and encrypted
3. Configures search preferences
4. Provides OpenAI API key (session-only)
5. System scrapes jobs from configured sources
6. AI scores each job against user profile
7. User views ranked job list with transparency metrics
8. User can export jobs as CSV

### Automation Flow

1. User sets schedule interval (1h-24h)
2. APScheduler triggers job search at intervals
3. New jobs scored and added to dashboard
4. Old jobs (>30 days) automatically purged
