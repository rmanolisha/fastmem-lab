# PROJECT_PLAN.md — FastMem Lab

## Repository state at audit time
Greenfield. No existing code. Sandbox has Node v22.22.2, npm 10.9.7, Python 3.12.3, pip 24.0.
Network egress is allow-listed to package registries (npm, PyPI, GitHub) — no generic internet access
from the backend at runtime, and no hosting/deploy credentials are available in this environment.

## Consequence for deliverables
Everything will be built and verified to run **locally** (backend via `uvicorn`, frontend via
`vite build`/`vite preview`). I cannot push to a public host or create a live URL from this sandbox.
`docs/architecture.md` includes concrete steps for the user to deploy the backend (Render/Fly/Railway)
and frontend (Vercel/Netlify) themselves. This is recorded as a limitation, not silently skipped.

## Implementation order (Phases 1–8 from spec)

1. **Core mathematics** (`backend/app/services/fast_weight.py`, `baseline.py`, `metrics.py`,
   `utils/seed.py`) + pytest suite, including the manual worked example from the spec
   (k=[1,0], v=[0,1], η=1 → W=[[0,1],[0,0]]). Tests must pass before moving on.
2. **Experiment engine** (`experiments.py`): multi-association writes, interference sweep with
   fixed probe memories, noise sweep, dimension sweep, learning-rate sweep, baseline comparison.
3. **FastAPI layer**: typed Pydantic request/response models, endpoints listed in STATUS.md,
   CORS enabled for the Vite dev server, no placeholder/mock responses.
4. **Frontend**: Vite + React + TS. Dashboard shell → MatrixViewer → VectorViewer → RetrievalPanel
   → AssociationBuilder → ExperimentControls/Chart → BaselineComparison → BDHModule → provenance/limits.
   Frontend calls the real backend; nothing is hardcoded/faked.
5. **BDH module**: research-backed write-up with equations, diagram, our-implementation-vs-published
   comparison table, sourced from `research/papers.md` and the official Pathway BDH repo.
6. **Polish**: accessibility labels, responsive layout, loading/error states, equation rendering.
7. **Validation**: run backend tests, `vite build`, manual endpoint smoke tests; confirm no
   scripted/fake data remains anywhere in the frontend.
8. **Packaging**: zip the repo, provide it via `present_files`, document local run + deploy steps.

## Mathematical convention (fixed up front, documented in `research/equations.md`)
- Keys/values are vectors in R^d, optionally L2-normalized (toggle exposed in UI).
- Write rule: `W ← W + η · (k vᵀ)`, so `W` is d×d with `W[i,j] = Σ η·k_i·v_j` accumulated over writes.
- Retrieval: `v̂ = Wᵀ k`. Given the write rule, `Wᵀ k = η(v kᵀ)k = η(k·k) v` for a single clean write,
  which recovers `v` (scaled by `η‖k‖²`) — this is the orientation verified in the unit test.
- This is a linear (outer-product / Hebbian) associative memory, i.e. a simplified fast-weight
  layer — not a trained gradient-based parameter matrix.

## Estimated remaining work at close of this session
Tracked live in STATUS.md; summarized in the final report at the end of this turn.
