# Architecture

## Overview
```
frontend/  React + TypeScript + Vite dashboard
             |  fetch() over HTTP (JSON)
             v
backend/   FastAPI app
             |
             v
         In-memory session store
             |
             v
         NumPy fast-weight / nearest-neighbor engine (backend/app/services/)
```

The numerical engine (`fast_weight.py`, `baseline.py`, `experiments.py`, `metrics.py`,
`seed.py`) has no FastAPI or HTTP imports and can be used standalone (see
`backend/tests/` for direct usage examples). The API layer (`app/api/`, `app/main.py`)
is a thin, typed wrapper around it. This separation is intentional: it's what let the
core math be unit-tested (20 tests) independently of the HTTP layer (12 more
integration tests), and it's why the manual worked example in the spec could be
verified before any API code existed.

## Backend
- **FastAPI** (`app/main.py`) with CORS restricted to an allow-list read from
  `FASTMEM_ALLOWED_ORIGINS` (defaults to the local Vite dev server).
- **Session store** (`app/services/session_store.py`) is a process-local Python dict
  keyed by a UUID. Each session pairs a `FastWeightMemory` and a `NearestNeighborBaseline`
  of the same dimension, plus a `SeedManager`, so `/memory/query?method=...` can serve
  either mechanism against the same writes. **This state is not persisted anywhere** —
  restarting the backend process clears every session. That's a deliberate simplicity
  trade-off for a hackathon lab tool, not an oversight; see `docs/limitations.md`.
- **Endpoints**: `/health`, `/memory/create|write|query|reset|{id}/state`,
  `/experiment/run|compare|noise|dimension-sweep|learning-rate-sweep`. All request/response
  shapes are typed Pydantic models in `app/models/schemas.py`.

## Frontend
- **Vite + React 19 + TypeScript**. `src/lib/api.ts` is the only place that talks to the
  backend; every component receives data as props or via `src/hooks/useSession.ts`.
  `VITE_API_BASE_URL` (see `.env.example`) controls the backend origin — nothing is
  hardcoded to `localhost` in a way that would survive a production build unedited.
- **recharts** for the interference and noise-sweep line charts; everything else
  (matrix heatmap, vector bars) is hand-rolled SVG/CSS for full control over the
  "live computation" visual language described in `frontend/src/index.css`.
- No client-side state management library — session state is small enough for
  React state in one hook.

## Local development
```bash
# backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# frontend (separate terminal)
cd frontend
npm install
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:8000
npm run dev                # http://localhost:5173
```

## Running tests
```bash
cd backend
source .venv/bin/activate
pytest -v                  # 32 tests: unit engine + API integration
```

```bash
cd frontend
npx tsc -b && npm run build   # type-check + production build
```

## Deployment (not performed by this build — see STATUS.md)
This project was built and verified in a sandbox with no outbound hosting access, so
no public URL was created as part of this delivery. To deploy it yourself:

**Backend** (any Python host — Render, Fly.io, Railway, a VM):
1. Set `FASTMEM_ALLOWED_ORIGINS` to your deployed frontend's origin.
2. Run `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. Note the resulting backend URL.

**Frontend** (any static host — Vercel, Netlify, GitHub Pages):
1. Set `VITE_API_BASE_URL` to the backend URL from above (as a build-time env var).
2. `npm run build`, deploy the `dist/` directory.

Because session state lives only in backend process memory, a backend restart or a
multi-instance/auto-scaled deployment will lose or fragment sessions — fine for a
demo, not production-grade. See `docs/limitations.md`.
