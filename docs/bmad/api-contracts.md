# Job Scout - API Contracts

## Base URL

- **Development:** `http://localhost:8000`
- **Production:** `https://your-api.railway.app`

## Authentication

All endpoints require Clerk JWT in Authorization header:

```
Authorization: Bearer <clerk_jwt_token>
```

---

## Endpoints

### Auth

| Method | Path           | Description        |
| ------ | -------------- | ------------------ |
| `POST` | `/auth/verify` | Verify Clerk token |

---

### Profiles

| Method   | Path                      | Description        |
| -------- | ------------------------- | ------------------ |
| `GET`    | `/profiles`               | List user profiles |
| `POST`   | `/profiles`               | Create new profile |
| `GET`    | `/profiles/{id}`          | Get profile by ID  |
| `PUT`    | `/profiles/{id}`          | Update profile     |
| `DELETE` | `/profiles/{id}`          | Delete profile     |
| `PUT`    | `/profiles/{id}/activate` | Set active profile |

**Profile Schema:**

```json
{
  "id": "uuid",
  "name": "string",
  "job_title": "string",
  "location": "string",
  "remote_preference": "remote|hybrid|onsite|any",
  "sources": ["linkedin", "indeed", "glassdoor", "ziprecruiter"],
  "schedule_interval": "manual|1h|3h|6h|12h|24h",
  "is_active": boolean
}
```

---

### Resume

| Method   | Path             | Description            |
| -------- | ---------------- | ---------------------- |
| `POST`   | `/resume/upload` | Upload & parse resume  |
| `GET`    | `/resume`        | Get parsed resume data |
| `DELETE` | `/resume`        | Delete resume          |

**Upload:** `multipart/form-data` with `file` field

---

### Jobs

| Method | Path                | Description              |
| ------ | ------------------- | ------------------------ |
| `GET`  | `/jobs`             | List jobs (with filters) |
| `POST` | `/jobs/search`      | Trigger job search       |
| `GET`  | `/jobs/{id}`        | Get job details          |
| `PUT`  | `/jobs/{id}/status` | Update job status        |
| `GET`  | `/jobs/export`      | Export jobs as CSV       |

**Query Parameters (GET /jobs):**

- `profile_id` - Filter by profile
- `tier` - Filter by tier (excellent, strong, good, consider)
- `source` - Filter by source
- `status` - Filter by status (new, applied, interview, rejected)
- `limit` / `offset` - Pagination

---

### Scoring

| Method | Path               | Description                |
| ------ | ------------------ | -------------------------- |
| `POST` | `/scoring/score`   | Score jobs against profile |
| `GET`  | `/scoring/formula` | Get scoring formula        |

**Score Request:**

```json
{
  "job_ids": ["uuid", ...],
  "openai_key": "sk-..."  // Session-only
}
```

---

### Metrics

| Method | Path                            | Description          |
| ------ | ------------------------------- | -------------------- |
| `GET`  | `/metrics/tier-distribution`    | Tier breakdown       |
| `GET`  | `/metrics/source-effectiveness` | Jobs per source      |
| `GET`  | `/metrics/top-companies`        | Top hiring companies |
| `GET`  | `/metrics/system-health`        | System health stats  |

---

### Settings

| Method | Path        | Description       |
| ------ | ----------- | ----------------- |
| `GET`  | `/settings` | Get user settings |
| `PUT`  | `/settings` | Update settings   |

**Settings Schema:**

```json
{
  "purge_days": 30,
  "default_schedule": "manual",
  "notifications_enabled": boolean
}
```

---

## Error Responses

```json
{
  "detail": "Error message"
}
```

| Code | Meaning          |
| ---- | ---------------- |
| 400  | Bad request      |
| 401  | Unauthorized     |
| 403  | Forbidden        |
| 404  | Not found        |
| 422  | Validation error |
| 500  | Server error     |
