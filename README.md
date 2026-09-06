# Intelligent Land Record Digitization and Validation System

SIH Problem Statement 26018 prototype — Ministry of Rural Development / DoLR.

## Structure

```
database/schema.sql        PostgreSQL + PostGIS schema (10 tables + 1 view)
backend/
  main.py                  FastAPI app entrypoint
  database.py              asyncpg data-access layer
  schemas.py               Pydantic request/response models
  services/
    ai_pipeline.py         Tier 1-3: OpenCV preprocess, PaddleOCR, NLP extraction, validation rules
    pipeline_runner.py      Orchestrates the background pipeline per document
  routers/
    documents.py           Upload, batch upload, status
    records.py             Search, field correction
    verification.py        Review queue, approve/flag/reject
    dashboard.py           Stats, district progress, error breakdown
    auth.py                 Login, JWT, role-based access
frontend/                  Full working app — runs standalone on mock data,
                            or against the live backend (see below)
  src/
    main.jsx, App.jsx       Entry + router + role-gated shell
    context/
      AuthContext.jsx        Mock login / role switching
      DataContext.jsx        Single switch point: mock data now, real API later
    mock/
      seedData.js             Seed records, users, districts
      mockApi.js               Simulates the OpenCV→OCR→NLP→validation pipeline
    api/client.js             Real axios client for the FastAPI backend
    pages/
      Login.jsx, Ingestion.jsx, Verification.jsx, Analytics.jsx
    components/
      Sidebar.jsx, Topbar.jsx, DocumentThumbnail.jsx
```

### Frontend: demo mode vs. live backend

The app runs fully standalone out of the box — `DataContext.jsx` uses
`mock/mockApi.js`, which simulates the upload → preprocessing → OCR →
extraction → validation pipeline with realistic delays and randomized
confidence scores, so every screen is interactive with zero setup.

To point it at the real FastAPI backend instead: open
`src/context/DataContext.jsx` and swap the `mockApi` calls for the
matching functions in `src/api/client.js` (same call shapes — the
swap is mechanical, no other file needs to change).

## Run locally

```bash
# Database
psql -U postgres -c "CREATE DATABASE land_records"
psql -U postgres -d land_records -f database/schema.sql

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## Pipeline flow

Upload → OpenCV preprocessing (deskew/denoise/binarize) → PaddleOCR →
regex/NLP field extraction → deterministic validation rules →
confidence ≥95% and rules pass → auto-approve to DILRMP vault,
otherwise → human review queue → Tehsildar approves/flags via the
verification desk → hash-chained audit log entry on every change.

## Notes for the hackathon demo

- `ai_pipeline.py` uses a regex matcher for field extraction as a fast
  working baseline — swap in a fine-tuned LayoutLMv3 model for the
  "winning" version if time allows.
- `database.py` connection string and `auth.py`'s `JWT_SECRET` are
  placeholders — move to environment variables before deploying.
- Keep a pre-recorded demo video as backup for the live judging round.
