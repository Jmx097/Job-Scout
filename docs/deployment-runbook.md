# Job Scout - Production Deployment Runbook

## Prerequisites

- [Vercel account](https://vercel.com)
- [Railway account](https://railway.app)
- [Clerk account](https://clerk.com) with production instance
- GitHub repository connected to both platforms

---

## 1. Backend Deployment (Railway)

### 1.1 Create Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Select "Deploy from GitHub repo"
3. Choose the Job Scout repository
4. Set root directory: `apps/api`

### 1.2 Configure Build Settings

```
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 1.3 Add Environment Variables

| Variable           | Value                         | Notes                                                                                            |
| ------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`     | `sqlite:///./jobscout.db`     | Use Railway volume for persistence                                                               |
| `ENCRYPTION_KEY`   | `<generate>`                  | Run: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |
| `CLERK_SECRET_KEY` | `sk_live_...`                 | From Clerk production instance                                                                   |
| `CORS_ORIGINS`     | `https://your-app.vercel.app` | Your Vercel production URL                                                                       |

### 1.4 Add Persistent Volume (Optional but Recommended)

1. In Railway project settings, add a Volume
2. Mount path: `/app/data`
3. Update DATABASE_URL: `sqlite:////app/data/jobscout.db`

### 1.5 Get Production URL

After deployment, note your Railway URL:

```
https://job-scout-api-production.up.railway.app
```

---

## 2. Frontend Deployment (Vercel)

### 2.1 Create Vercel Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import GitHub repository
3. Set root directory: `apps/web`
4. Framework preset: Next.js

### 2.2 Add Environment Variables

| Variable                            | Value                                     |
| ----------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...`                             |
| `CLERK_SECRET_KEY`                  | `sk_live_...`                             |
| `NEXT_PUBLIC_API_URL`               | `https://your-railway-url.up.railway.app` |

### 2.3 Deploy

Click "Deploy" - Vercel will build and deploy automatically.

---

## 3. Clerk Production Setup

### 3.1 Create Production Instance

1. In Clerk dashboard, create a new instance
2. Switch to "Production" mode
3. Configure OAuth providers (if using)

### 3.2 Get Production Keys

From the API Keys section:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (pk*live*...)
- `CLERK_SECRET_KEY` (sk*live*...)

### 3.3 Configure Allowed Origins

Add both:

- `https://your-app.vercel.app`
- `https://your-railway-url.up.railway.app`

---

## 4. Post-Deployment Verification

### 4.1 Health Check

```bash
curl https://your-railway-url.up.railway.app/health
# Expected: {"status":"healthy"}
```

### 4.2 E2E Flow Test

1. Visit `https://your-app.vercel.app`
2. Sign up / Sign in
3. Upload resume → Configure search → Add API key
4. Trigger search → Verify jobs appear
5. Check metrics page

---

## 5. Troubleshooting

| Issue             | Solution                                   |
| ----------------- | ------------------------------------------ |
| CORS errors       | Verify `CORS_ORIGINS` includes Vercel URL  |
| Auth failures     | Check Clerk keys match production instance |
| Database errors   | Verify volume mount and DATABASE_URL       |
| API not reachable | Check NEXT_PUBLIC_API_URL in Vercel        |

---

## Quick Commands

```powershell
# Generate encryption key
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Test API locally
curl http://localhost:8000/health

# Verify frontend build
cd apps/web && npm run build
```
