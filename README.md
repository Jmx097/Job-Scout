# Job Scout MVP

AI-powered job search engine with resume parsing, intelligent scoring, and transparent analytics.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (optional)

### Local Development

**1. Clone and install dependencies:**

```bash
# Frontend
cd apps/web
npm install

# Backend
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**2. Configure environment:**

```bash
cp .env.example .env
# Edit .env with your Clerk keys and generate encryption key:
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

**3. Start services:**

```bash
# Terminal 1 - Backend
cd apps/api
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

**4. Open http://localhost:3000**

---

### Docker Compose

```bash
docker-compose up --build
```

---

## 📁 Project Structure

```
job-scout/
├── apps/
│   ├── web/           # Next.js 14 frontend
│   └── api/           # FastAPI backend
├── packages/
│   └── shared/        # Shared TypeScript types
├── docker-compose.yml
└── .env.example
```

---

## 🔐 Security

| Feature      | Implementation                     |
| ------------ | ---------------------------------- |
| OpenAI Key   | Session-only storage (never in DB) |
| Resume Data  | AES-256 encryption at rest         |
| Multi-tenant | User ID scoping on all queries     |
| Auth         | Clerk integration                  |

---

## 🌐 Deployment

### Frontend (Vercel)

1. Connect GitHub repo to Vercel
2. Set root directory: `apps/web`
3. Add environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_API_URL` (Railway backend URL)

### Backend (Railway)

1. Create new project from GitHub
2. Set root directory: `apps/api`
3. Add environment variables:
   - `DATABASE_URL=sqlite:///./data/jobscout.db`
   - `ENCRYPTION_KEY` (generate with Fernet)
   - `CLERK_SECRET_KEY`
   - `CORS_ORIGINS=["https://your-app.vercel.app"]`

---

## 📋 Environment Variables

| Variable                | Description                      | Required   |
| ----------------------- | -------------------------------- | ---------- |
| `CLERK_PUBLISHABLE_KEY` | Clerk public key                 | Yes        |
| `CLERK_SECRET_KEY`      | Clerk secret key                 | Yes        |
| `DATABASE_URL`          | SQLite connection string         | Yes        |
| `ENCRYPTION_KEY`        | Fernet key for resume encryption | Yes        |
| `JOBSPY_PROXY_URL`      | Proxy for job scraping           | No         |
| `CORS_ORIGINS`          | Allowed frontend origins         | Yes (prod) |

---

## 📖 Features

- **3-Step Onboarding**: Resume upload → Search config → API key
- **AI-Powered Scoring**: Jobs scored against your profile using GPT-4o Mini
- **Transparent Metrics**: See exactly how each job was scored
- **Privacy First**: Your data stays encrypted, your API key stays in session

---

## License

MIT
