# Deployment Guide

## Prerequisites

- Node.js 18+
- Python 3.11+
- Clerk account (authentication)
- OpenAI API key (for users)

---

## Frontend (Vercel)

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com) and click "New Project"
2. Import your Git repository
3. Select `apps/web` as the root directory

### 2. Environment Variables

Set these in Vercel project settings:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

### 3. Build Settings

- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

### 4. Deploy

Click "Deploy" - Vercel handles the rest.

---

## Backend (Railway)

### 1. Create Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository

### 2. Environment Variables

```env
DATABASE_URL=sqlite:///./data/jobscout.db
ENCRYPTION_KEY=<generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())">
CLERK_ISSUER=https://your-app.clerk.accounts.dev
CORS_ORIGINS=https://your-app.vercel.app
```

### 3. Railway Config

The `apps/api/railway.toml` is pre-configured:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
```

### 4. Volume (Optional)

Create a volume for SQLite persistence:

- Mount path: `/app/data`

---

## Environment Variables Reference

| Variable                            | Required | Description                      |
| ----------------------------------- | -------- | -------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes      | Clerk frontend key               |
| `CLERK_SECRET_KEY`                  | Yes      | Clerk backend key                |
| `CLERK_ISSUER`                      | Yes      | Clerk issuer URL                 |
| `DATABASE_URL`                      | Yes      | SQLite connection string         |
| `ENCRYPTION_KEY`                    | Yes      | Fernet key for resume encryption |
| `CORS_ORIGINS`                      | Yes      | Comma-separated allowed origins  |
| `NEXT_PUBLIC_API_URL`               | Yes      | Backend API URL                  |
| `OPENAI_KEY_TTL_HOURS`              | No       | Key session TTL (default: 24)    |
| `JOBSPY_MAX_RETRIES`                | No       | Scraper retries (default: 3)     |

---

## Security Notes

> [!IMPORTANT] > **Never commit secrets to Git.** Use environment variables in Vercel/Railway.

- **OpenAI keys** are stored in memory only (24h TTL), never persisted to database
- **Resume data** is encrypted at rest using Fernet (AES-256)
- **Clerk** handles all authentication - no password storage
- **CORS** should be restricted to your frontend domain only

---

## Post-Deploy Checklist

- [ ] Verify `/health` returns `{"status": "healthy"}`
- [ ] Test Clerk sign-in flow
- [ ] Upload a test resume
- [ ] Validate OpenAI key
- [ ] Run a job search
- [ ] Check dashboard displays jobs
