# Release Checklist

A personal release checklist app for managing release readiness.

## API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List all projects (ordered by newest first) |
| `POST` | `/api/projects` | Create a project with checklist steps |
| `GET` | `/api/projects/:id` | Get a single project with all steps |
| `DELETE` | `/api/projects/:id` | Delete a project |
| `PATCH` | `/api/projects/:id/steps/:stepId` | Toggle a step's completed status |

### Status Logic

| Condition | Status |
|-----------|--------|
| No steps completed | `planned` |
| Some steps completed | `ongoing` |
| All steps completed | `done` |

### Data Shapes

**Project**
```json
{
  "id": "uuid",
  "name": "string",
  "steps": [
    { "question": "string", "order": 0, "status": false }
  ],
  "status": "planned | ongoing | done",
  "created_at": "timestamp"
}
```

**POST /api/projects body**
```json
{
  "name": "v2.1 Release",
  "steps": [
    { "question": "All tests passing?", "order": 0, "status": false },
    { "question": "Changelog updated?", "order": 1, "status": false }
  ]
}
```

## Database

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID` | Primary key, auto-generated |
| `name` | `VARCHAR(255)` | Project name |
| `steps` | `JSONB` | Array of `{question, order, status}` objects |
| `status` | `VARCHAR(20)` | Computed & persisted on write |
| `created_at` | `TIMESTAMPTZ` | Defaults to `NOW()` |

## Getting Started

### Server

```bash
cd server
cp .env.example .env   # fill in DATABASE_URL
npm install
npm run migrate
npm start
```

The server runs on `http://localhost:3000`.

### Client

```bash
cd react
npm install
npm run dev
```

The client runs on `http://localhost:5173` and proxies `/api` requests to the server.
