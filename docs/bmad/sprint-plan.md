---
stepsCompleted:
  ["sprint-definition", "backlog-prioritization", "capacity-planning"]
inputDocuments:
  ["docs/bmad/epics-and-stories.md", "docs/bmad/implementation-readiness.md"]
workflowType: "sprint-planning"
lastStep: 4
---

# Sprint Plan - Job Scout

**Sprint Master:** BMAD SM Workflow  
**Date:** 2026-01-05  
**Sprint Duration:** 1 week

---

## Current State Assessment

| Category          | Status          |
| ----------------- | --------------- |
| MVP Features      | ✅ Implemented  |
| Authentication    | ✅ Working      |
| Job Scraping      | ✅ Working      |
| AI Scoring        | ✅ Working      |
| Scheduling        | ✅ Working      |
| Production Deploy | ⚠️ Not deployed |
| E2E Testing       | ⚠️ Minimal      |

**Assessment:** Core MVP is complete. Sprint focus should be on **production deployment and polish**.

---

## Sprint Goal

> **Deploy Job Scout to production and ensure production-readiness.**

---

## Sprint Backlog

### 🎯 Priority 1: Production Deployment

| ID  | Task                                    | Est. | Owner | Status |
| --- | --------------------------------------- | ---- | ----- | ------ |
| D1  | Set up Vercel project for frontend      | 1h   | Dev   | ⬜     |
| D2  | Configure Vercel environment variables  | 30m  | Dev   | ⬜     |
| D3  | Set up Railway project for backend      | 1h   | Dev   | ⬜     |
| D4  | Configure Railway environment variables | 30m  | Dev   | ⬜     |
| D5  | Obtain Clerk production keys            | 30m  | Dev   | ⬜     |
| D6  | Configure CORS for production           | 30m  | Dev   | ⬜     |
| D7  | Verify end-to-end production flow       | 1h   | QA    | ⬜     |

**Subtotal:** ~5h

---

### 🎯 Priority 2: Production Hardening

| ID  | Task                                   | Est. | Owner | Status |
| --- | -------------------------------------- | ---- | ----- | ------ |
| H1  | Add error tracking (Sentry or similar) | 2h   | Dev   | ⬜     |
| H2  | Configure health check endpoints       | 30m  | Dev   | ⬜     |
| H3  | Add request logging                    | 1h   | Dev   | ⬜     |
| H4  | Review and fix TypeScript errors       | 1h   | Dev   | ⬜     |
| H5  | Review and fix Python linting issues   | 1h   | Dev   | ⬜     |

**Subtotal:** ~5.5h

---

### 🎯 Priority 3: Testing

| ID  | Task                                  | Est. | Owner | Status |
| --- | ------------------------------------- | ---- | ----- | ------ |
| T1  | Run existing frontend tests           | 30m  | QA    | ⬜     |
| T2  | Run existing backend tests            | 30m  | QA    | ⬜     |
| T3  | Manual E2E test: onboarding flow      | 1h   | QA    | ⬜     |
| T4  | Manual E2E test: job search + scoring | 1h   | QA    | ⬜     |
| T5  | Manual E2E test: scheduling           | 30m  | QA    | ⬜     |

**Subtotal:** ~3.5h

---

### 🎯 Priority 4: Documentation Polish

| ID  | Task                               | Est. | Owner | Status |
| --- | ---------------------------------- | ---- | ----- | ------ |
| P1  | Update README with production URLs | 30m  | Dev   | ⬜     |
| P2  | Create deployment runbook          | 1h   | Dev   | ⬜     |
| P3  | Document environment variables     | 30m  | Dev   | ⬜     |

**Subtotal:** ~2h

---

## Sprint Capacity

| Role      | Available Hours | Allocated |
| --------- | --------------- | --------- |
| Dev       | 16h             | 14h       |
| QA        | 8h              | 5h        |
| **Total** | **24h**         | **19h**   |

**Buffer:** 5h for unknowns

---

## Definition of Done (Sprint)

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Production environment variables configured
- [ ] Clerk production keys active
- [ ] CORS locked to production domain
- [ ] Health checks passing
- [ ] E2E manual tests passing
- [ ] README updated with production URLs

---

## Risks & Mitigations

| Risk                      | Probability | Impact | Mitigation                      |
| ------------------------- | ----------- | ------ | ------------------------------- |
| Vercel build fails        | Low         | High   | Fix TypeScript errors first     |
| Railway deployment issues | Medium      | High   | Test Docker build locally first |
| Clerk config issues       | Low         | Medium | Verify keys before deploy       |
| python-jobspy rate limits | Medium      | Low    | Use with caution, add backoff   |

---

## Sprint Ceremonies

| Ceremony      | Date       | Duration |
| ------------- | ---------- | -------- |
| Sprint Start  | 2026-01-06 | 30m      |
| Daily Standup | Daily      | 15m      |
| Sprint Review | 2026-01-12 | 1h       |
| Retrospective | 2026-01-12 | 30m      |

---

## Task Priority Order

Execute in this order for maximum value:

1. **D1-D6:** Production deployment setup
2. **H4-H5:** Fix linting issues (blocks clean deploy)
3. **D7:** Verify production flow
4. **H1-H3:** Production hardening
5. **T1-T5:** Testing
6. **P1-P3:** Documentation

---

## Quick Start

```bash
# 1. Deploy Frontend (Vercel)
cd apps/web
vercel --prod

# 2. Deploy Backend (Railway)
# Use Railway CLI or GitHub integration

# 3. Verify
curl https://your-api.railway.app/health
```
