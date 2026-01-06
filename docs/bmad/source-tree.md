# Job Scout - Source Tree

## Repository Structure

```
job-scout/
├── 📁 apps/                      # Application code
│   ├── 📁 api/                   # Python/FastAPI backend
│   │   ├── 📁 app/
│   │   │   ├── 📁 core/          # Config, security, utilities
│   │   │   │   ├── config.py     # Environment settings (Pydantic)
│   │   │   │   └── security.py   # Clerk JWT verification
│   │   │   ├── 📁 models/        # Data layer
│   │   │   │   ├── database.py   # SQLAlchemy models + async init
│   │   │   │   └── schemas.py    # Pydantic request/response
│   │   │   ├── 📁 routers/       # API endpoints (7 modules)
│   │   │   │   ├── auth.py       # /auth/* endpoints
│   │   │   │   ├── jobs.py       # /jobs/* CRUD + search
│   │   │   │   ├── metrics.py    # /metrics/* analytics
│   │   │   │   ├── profiles.py   # /profiles/* management
│   │   │   │   ├── resume.py     # /resume/* upload/parse
│   │   │   │   ├── scoring.py    # /scoring/* AI scoring
│   │   │   │   └── settings.py   # /settings/* preferences
│   │   │   ├── 📁 services/      # Business logic (5 modules)
│   │   │   │   ├── encryption.py # Fernet AES-256
│   │   │   │   ├── job_scraper.py# python-jobspy wrapper
│   │   │   │   ├── resume_parser.py # PDF/DOCX parsing
│   │   │   │   ├── scheduler.py  # APScheduler jobs
│   │   │   │   └── scoring.py    # OpenAI scoring logic
│   │   │   └── main.py           # FastAPI app entry point
│   │   └── requirements.txt      # Python dependencies
│   │
│   └── 📁 web/                   # Next.js 14 frontend
│       ├── 📁 app/               # App Router pages
│       │   ├── 📁 (dashboard)/   # Dashboard route group
│       │   │   └── 📁 metrics/   # Metrics tab page
│       │   ├── 📁 app/           # Main app pages
│       │   │   └── 📁 dashboard/ # Dashboard page
│       │   ├── 📁 onboarding/    # 3-step onboarding
│       │   │   ├── 📁 api-key/   # Step 3
│       │   │   └── 📁 config/    # Step 2
│       │   ├── 📁 sign-in/       # Clerk auth
│       │   ├── 📁 sign-up/       # Clerk auth
│       │   ├── globals.css       # TailwindCSS globals
│       │   ├── layout.tsx        # Root layout
│       │   └── page.tsx          # Landing page
│       ├── 📁 components/        # React components
│       │   ├── 📁 dashboard/     # Dashboard components
│       │   │   ├── FilterBar.tsx
│       │   │   └── StatsOverview.tsx
│       │   ├── 📁 jobs/          # Job listing components
│       │   ├── 📁 onboarding/    # Onboarding components
│       │   ├── 📁 ui/            # Radix primitives (6 components)
│       │   │   ├── button.tsx
│       │   │   ├── dialog.tsx
│       │   │   ├── input.tsx
│       │   │   └── ...
│       │   └── ProfileSelector.tsx
│       ├── 📁 lib/               # Utilities
│       │   └── utils.ts          # cn() and helpers
│       ├── middleware.ts         # Clerk auth middleware
│       ├── package.json          # Node dependencies
│       └── tsconfig.json         # TypeScript config
│
├── 📁 docs/                      # Documentation
│   ├── 📁 bmad/                  # BMAD-generated docs
│   │   ├── index.md              # Documentation index
│   │   ├── project-overview.md   # Project overview
│   │   ├── architecture.md       # System architecture
│   │   ├── api-contracts.md      # API documentation
│   │   └── data-models.md        # Database schema
│   └── deployment.md             # Deployment guide
│
├── 📁 packages/                  # Shared code (monorepo)
│   └── 📁 shared/                # Shared TypeScript types
│
├── 📁 _bmad/                     # BMAD Method framework
│   ├── 📁 core/                  # BMad Core engine
│   ├── 📁 modules/               # BMad modules (BMM, BMB, etc.)
│   └── 📁 utility/               # Shared utilities
│
├── .env.example                  # Environment template
├── docker-compose.yml            # Docker configuration
└── README.md                     # Project README
```

---

## Entry Points

| Part | Entry Point               | Command                |
| ---- | ------------------------- | ---------------------- |
| Web  | `apps/web/app/layout.tsx` | `npm run dev`          |
| API  | `apps/api/app/main.py`    | `uvicorn app.main:app` |

## Critical Directories

| Directory                | Purpose                   |
| ------------------------ | ------------------------- |
| `apps/api/app/routers/`  | All API endpoints         |
| `apps/api/app/services/` | Business logic            |
| `apps/web/app/`          | All pages and routes      |
| `apps/web/components/`   | Reusable React components |
| `docs/bmad/`             | Project documentation     |
