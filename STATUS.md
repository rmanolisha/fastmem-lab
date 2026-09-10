# STATUS.md — FastMem Lab

States: `[ ] NOT STARTED` `[~] IN PROGRESS` `[x] COMPLETED` `[!] BLOCKED` `[-] NOT REQUIRED`

Last updated: Phase 4 (frontend) complete — 32/32 backend tests passing; found + fixed a real NaN/JSON-serialization bug in /memory/query during integration; full frontend built and end-to-end smoke-tested against live backend; production build verified.

## Phase 0 — Audit
[x] Repository inspected (empty — greenfield build)
[x] Node v22.22.2 / npm 10.9.7 confirmed
[x] Python 3.12.3 / pip 24.0 confirmed
[x] STATUS.md created
[x] PROJECT_PLAN.md created
[x] HACKATHON_CHECKLIST.md created

## Core Engine (backend/app/services)
[x] FastWeightMemory class
[x] Matrix initialization
[x] Hebbian write (W += eta * outer(k, v))
[x] Retrieval (v_hat = W^T k)
[x] Cosine similarity + error metrics
[x] Reset
[x] Deterministic seed manager
[x] NearestNeighborBaseline class

## Experiment Engine
[x] Multiple-association writer
[x] Interference experiment (probe memories)
[x] Noise/query-perturbation experiment
[x] Dimension/capacity experiment
[x] Learning-rate experiment
[x] Baseline vs fast-weight comparison

## Backend (FastAPI)
[x] App scaffold
[x] POST /memory/create
[x] POST /memory/write
[x] POST /memory/query
[x] POST /memory/reset
[x] POST /experiment/run
[x] POST /baseline/query (served via /memory/query?method=nearest_neighbor and /experiment/compare)
[x] GET /memory/{id}/state (session summary/metrics)
[x] CORS config for local frontend

## Testing
[x] Unit: matrix init
[x] Unit: Hebbian write (manual worked example)
[x] Unit: multiple writes
[x] Unit: retrieval
[x] Unit: cosine similarity
[x] Unit: reset
[x] Unit: deterministic seed
[x] Unit: nearest-neighbor baseline
[x] Unit: interference experiment
[x] Integration: API endpoints (11 tests, incl. 404 handling)

## Frontend
[x] Vite + React + TS scaffold
[x] App shell / lab layout
[x] MatrixViewer.tsx (heatmap + numeric, compact mode above d=16)
[x] VectorViewer.tsx (bar chart)
[x] RetrievalPanel.tsx (truth vs estimate)
[x] AssociationBuilder.tsx (Mode 1 + Mode 2)
[x] ExperimentControls.tsx
[x] ExperimentChart.tsx (interference plot) + NoiseSweepChart.tsx
[x] BaselineComparison.tsx
[x] BDHModule.tsx
[x] Educational flow (Sections 1-9)
[x] Provenance / Limitations panels
[x] Connected to live backend (no mocked data) -- verified via full end-to-end smoke test
[x] Production build verified (tsc -b && vite build succeed; dist/ served and smoke-tested with curl)

## Research
[x] research/papers.md — 3+ primary sources (2024-2025), real verified links
[x] research/bdh-notes.md
[x] research/equations.md
[x] Official Pathway BDH repo referenced

## Documentation
[x] docs/architecture.md
[x] docs/methodology.md
[x] docs/limitations.md
[x] docs/concept-summary.md (one-pager)
[x] README.md (full)
[x] AI assistance disclosure (in README.md)

## Deployment
[x] Local backend runs (uvicorn) -- verified via curl smoke test
[-] Not re-verified with `npm run dev` directly (production build + static serve was verified instead, which exercises the same bundle)
[x] Frontend production build passes (tsc -b && vite build; dist/ served and smoke-tested)
[!] Public hosting — NOT AVAILABLE in this environment (sandbox has no outbound deploy target/hosting credentials). Deployment instructions will be documented instead; user must deploy (e.g. Vercel/Render) themselves using provided config.
