# Job Scout - Data Models

## Database: SQLite with SQLAlchemy 2.0

### Entity Relationship

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │     │  profiles   │     │   resumes   │
│─────────────│     │─────────────│     │─────────────│
│ id (PK)     │◄────│ user_id(FK) │     │ user_id(FK) │
│ clerk_id    │     │ id (PK)     │     │ id (PK)     │
│ email       │     │ name        │     │ encrypted   │
│ created_at  │     │ job_title   │     │ parsed_json │
└─────────────┘     │ location    │     └─────────────┘
                    │ remote_pref │
                    │ sources     │
                    │ schedule    │
                    │ is_active   │
                    └──────┬──────┘
                           │
                           │ 1:N
                           ▼
                    ┌─────────────┐     ┌─────────────┐
                    │    jobs     │     │ job_scores  │
                    │─────────────│     │─────────────│
                    │ id (PK)     │◄────│ job_id (FK) │
                    │ profile_id  │     │ id (PK)     │
                    │ title       │     │ score       │
                    │ company     │     │ tier        │
                    │ location    │     │ breakdown   │
                    │ url         │     │ reasoning   │
                    │ description │     └─────────────┘
                    │ source      │
                    │ posted_date │
                    │ status      │
                    └─────────────┘
                           ▲
                           │ N:1
                    ┌──────┴──────┐
                    │ search_runs │
                    │─────────────│
                    │ id (PK)     │
                    │ profile_id  │
                    │ started_at  │
                    │ completed   │
                    │ jobs_found  │
                    │ status      │
                    └─────────────┘
```

---

## Table Definitions

### users

| Column     | Type     | Description        |
| ---------- | -------- | ------------------ |
| id         | UUID     | Primary key        |
| clerk_id   | String   | Clerk user ID      |
| email      | String   | User email         |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update        |

### profiles

| Column            | Type      | Description              |
| ----------------- | --------- | ------------------------ |
| id                | UUID      | Primary key              |
| user_id           | UUID (FK) | Reference to users       |
| name              | String    | Profile name             |
| job_title         | String    | Target job title         |
| location          | String    | Target location          |
| remote_preference | Enum      | remote/hybrid/onsite/any |
| sources           | JSON      | List of job sources      |
| schedule_interval | Enum      | manual/1h/3h/6h/12h/24h  |
| is_active         | Boolean   | Currently active profile |
| created_at        | DateTime  | Creation timestamp       |

### resumes

| Column         | Type      | Description             |
| -------------- | --------- | ----------------------- |
| id             | UUID      | Primary key             |
| user_id        | UUID (FK) | Reference to users      |
| encrypted_data | Blob      | Fernet-encrypted resume |
| parsed_json    | JSON      | Structured resume data  |
| filename       | String    | Original filename       |
| created_at     | DateTime  | Upload timestamp        |

### jobs

| Column      | Type      | Description                    |
| ----------- | --------- | ------------------------------ |
| id          | UUID      | Primary key                    |
| profile_id  | UUID (FK) | Reference to profiles          |
| external_id | String    | ID from job source             |
| title       | String    | Job title                      |
| company     | String    | Company name                   |
| location    | String    | Job location                   |
| url         | String    | Job posting URL                |
| description | Text      | Full description               |
| source      | String    | Job board source               |
| posted_date | DateTime  | When job was posted            |
| status      | Enum      | new/applied/interview/rejected |
| created_at  | DateTime  | When discovered                |

### job_scores

| Column     | Type      | Description                    |
| ---------- | --------- | ------------------------------ |
| id         | UUID      | Primary key                    |
| job_id     | UUID (FK) | Reference to jobs              |
| score      | Integer   | 0-100 score                    |
| tier       | Enum      | excellent/strong/good/consider |
| breakdown  | JSON      | Category scores                |
| reasoning  | Text      | AI explanation                 |
| created_at | DateTime  | Scoring timestamp              |

### search_runs

| Column       | Type      | Description                        |
| ------------ | --------- | ---------------------------------- |
| id           | UUID      | Primary key                        |
| profile_id   | UUID (FK) | Reference to profiles              |
| started_at   | DateTime  | Run start time                     |
| completed_at | DateTime  | Run completion                     |
| jobs_found   | Integer   | Jobs discovered                    |
| jobs_scored  | Integer   | Jobs AI-scored                     |
| status       | Enum      | running/completed/failed/needs_key |

### settings

| Column        | Type      | Description              |
| ------------- | --------- | ------------------------ |
| id            | UUID      | Primary key              |
| user_id       | UUID (FK) | Reference to users       |
| purge_days    | Integer   | Auto-delete after N days |
| notifications | Boolean   | Enable notifications     |
| settings_json | JSON      | Additional settings      |

---

## Encryption

Resume data is encrypted using **Fernet (AES-256)**:

```python
from cryptography.fernet import Fernet

# Encrypt
cipher = Fernet(ENCRYPTION_KEY)
encrypted = cipher.encrypt(resume_bytes)

# Decrypt
decrypted = cipher.decrypt(encrypted)
```

Key stored in `ENCRYPTION_KEY` environment variable.
