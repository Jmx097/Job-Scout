# Job Scout - Project Documentation Index

> Generated: 2026-01-05 | BMAD Document-Project Workflow

## Project Overview

| Property              | Value                     |
| --------------------- | ------------------------- |
| **Name**              | Job Scout MVP             |
| **Type**              | Multi-part Monorepo       |
| **Architecture**      | Client-Server (Web + API) |
| **Primary Languages** | TypeScript, Python        |

## Project Parts

### 🌐 Web Frontend (`apps/web/`)

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI:** React 18 + Radix UI + TailwindCSS
- **Auth:** Clerk
- **State:** TanStack Query

### ⚡ API Backend (`apps/api/`)

- **Framework:** FastAPI
- **Language:** Python 3.11+
- **Database:** SQLAlchemy + SQLite (aiosqlite)
- **Auth:** JWT + Clerk verification
- **AI:** OpenAI integration

---

## Documentation

### Core Documentation

- [Project Overview](./project-overview.md)
- [Architecture](./architecture.md)
- [Source Tree](./source-tree.md)

### Development

- [Development Guide](./development-guide.md)
- [API Contracts](./api-contracts.md)
- [Data Models](./data-models.md)

### Existing Docs

- [README](../README.md) - Quick start and deployment
- [Deployment Guide](./deployment.md)

---

## Quick Start

```bash
# Frontend
cd apps/web && npm install && npm run dev

# Backend
cd apps/api && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Features Summary

- 3-Step Onboarding (Resume → Config → API Key)
- AI-Powered Job Scoring via GPT-4o Mini
- Multi-source Job Scraping (LinkedIn, Indeed, Glassdoor, ZipRecruiter)
- Transparent Metrics Dashboard
- Privacy-first (session-only keys, encrypted resume storage)
