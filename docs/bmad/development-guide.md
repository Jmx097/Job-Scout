# Job Scout - Development Guide

## Prerequisites

- **Node.js:** 18+
- **Python:** 3.11+
- **npm** or **pnpm**

---

## Quick Setup

### 1. Clone & Install

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

### 2. Environment Variables

```bash
cp .env.example .env
```

**Required:**

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Backend
DATABASE_URL=sqlite:///./data/jobscout.db
ENCRYPTION_KEY=<generate with Fernet.generate_key()>

# Production only
CORS_ORIGINS=["https://your-app.vercel.app"]
```

**Generate Encryption Key:**

```python
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```

### 3. Run Development Servers

```bash
# Terminal 1 - Backend (port 8000)
cd apps/api
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend (port 3000)
cd apps/web
npm run dev
```

**Open:** http://localhost:3000

---

## Development Workflow

### Frontend (Next.js)

```bash
cd apps/web

npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Jest tests
```

### Backend (FastAPI)

```bash
cd apps/api
source venv/bin/activate

uvicorn app.main:app --reload  # Dev server with hot reload
pytest                          # Run tests
pytest --cov                    # With coverage
```

---

## Project Structure Tips

### Adding a New API Endpoint

1. Create router in `apps/api/app/routers/`
2. Add Pydantic schemas in `models/schemas.py`
3. Register router in `main.py`

### Adding a New Page

1. Create folder in `apps/web/app/`
2. Add `page.tsx` in the folder
3. Use route groups `(folder)` for shared layouts

### Adding a UI Component

1. Create in `apps/web/components/ui/`
2. Use Radix primitives for accessibility
3. Style with TailwindCSS

---

## Testing

### Frontend

```bash
npm run test              # All tests
npm run test -- --watch   # Watch mode
```

### Backend

```bash
pytest                    # All tests
pytest -v                 # Verbose
pytest -k "test_name"     # Filter
```

---

## Common Tasks

| Task           | Command                                        |
| -------------- | ---------------------------------------------- |
| Start frontend | `cd apps/web && npm run dev`                   |
| Start backend  | `cd apps/api && uvicorn app.main:app --reload` |
| Lint frontend  | `cd apps/web && npm run lint`                  |
| Test backend   | `cd apps/api && pytest`                        |
| Build frontend | `cd apps/web && npm run build`                 |

---

## Deployment

See [Deployment Guide](./deployment.md) for Vercel (frontend) and Railway (backend) instructions.
