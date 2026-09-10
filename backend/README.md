# FastMem Lab — Backend

FastAPI + NumPy service exposing the fast-weight associative memory engine.

## Setup
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Test
```bash
pytest -v
```
32 tests (20 unit on `app/services/`, 12 FastAPI integration).

## Structure
- `app/services/fast_weight.py` — the core `FastWeightMemory` engine (see docstring for
  the write/retrieve equations and the manual worked example).
- `app/services/baseline.py` — `NearestNeighborBaseline`.
- `app/services/experiments.py` — `ExperimentRunner` (interference, noise, dimension,
  learning-rate sweeps).
- `app/services/metrics.py` — cosine similarity, normalized L2 error, status thresholds.
- `app/services/session_store.py` — in-memory, process-local session registry.
- `app/api/` — FastAPI routers (`memory.py`, `experiments.py`).
- `app/models/schemas.py` — Pydantic request/response models.
- `tests/` — pytest suite.

See `../research/equations.md` for the full mathematical writeup and
`../docs/architecture.md` for how this fits with the frontend and how to deploy it.
