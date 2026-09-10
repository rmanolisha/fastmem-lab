# FastMem Lab — Associative Memory & Fast Weights 

## Fast-Weight Associative Memory: Learning Through Changing Connections

**Team:** The further
**Hackathon:** DataForge / Dragon Hatchling  
**GitHub:** [Your GitHub Repository Link]  
**Live Demo:** https://fastmem-lab.vercel.app/

**Claim:** A fast-weight matrix can store and retrieve associations without gradient
descent, but capacity is bounded and new writes interfere with old ones.

An interactive research/education laboratory for a real fast-weight (Hebbian,
outer-product) associative memory. Every number in the app is produced by live NumPy
computation on the backend — nothing is scripted, mocked, or precomputed.

## Problem / motivation
Modern sequence models increasingly rely on "fast weights" — memory that updates
directly, online, via a local rule (not gradient descent) — as a complement to slow,
trained parameters. Pathway's Dragon Hatchling (BDH) architecture frames its own
working memory this way, as Hebbian synaptic plasticity. This project isolates the
simplest version of that idea — a single matrix, one write rule, one retrieval rule —
so its capacity and interference behavior can be measured directly instead of inferred
from a much larger system.

## Technical mechanism
```
Write:     W <- W + eta (k v^T)      # Hebbian outer-product update, no gradient
Retrieve:  v_hat = W^T k
```
`k, v, q ∈ ℝᵈ`; `W ∈ ℝ^(d×d)`, initialized to zero; `η` is the write/learning rate. Full
derivation, the exact orientation convention, and a manually-verified worked example
are in [`research/equations.md`](research/equations.md).

## Architecture
```
frontend/  React + TypeScript + Vite dashboard  --fetch()-->  backend/  FastAPI
                                                                    |
                                                                    v
                                                     NumPy fast-weight / NN engine
```
Full breakdown in [`docs/architecture.md`](docs/architecture.md).

## How retrieval works
`Wᵀq` is a matrix-vector product against the query. For a single stored association,
this always returns a scalar multiple of the stored value — a real, tested mathematical
property documented in `research/equations.md` that changes which metric (similarity vs.
error) actually reveals degradation under query noise.

## Interference experiment
A handful of early associations are fixed as "probes." As more associations are written
into the same fixed-size matrix, the probes are re-queried after every write and their
retrieval quality is plotted. This is the app's central, live experiment — see
[`docs/methodology.md`](docs/methodology.md).

## Baseline
Fast-weight retrieval is compared against a nearest-neighbor associative memory that
stores every `(key, value)` pair explicitly. Neither is claimed to be universally
better — they represent different memory mechanisms with different storage/accuracy
trade-offs.

## BDH connection
A dedicated module (`frontend/src/components/BDHModule.tsx`) explains the relationship
to Pathway's Dragon Hatchling architecture, with a diagram, a side-by-side comparison
table, and sourced references — explicitly labeled as an independent educational
implementation, not the official BDH codebase or a reproduction of its results. See
[`research/bdh-notes.md`](research/bdh-notes.md).

## What is live / synthetic / precomputed
- **Live:** the fast-weight matrix, all writes/retrievals, the nearest-neighbor
  baseline, and every experiment (interference, noise, dimension, learning-rate sweeps).
- **Synthetic:** randomly drawn key/value vectors (seeded, reproducible), and the
  deterministic local text-to-vector projection used in Association Builder Mode 2.
- **Precomputed:** none. Nothing in this app is precomputed.
- **Analytical:** the equations and mathematical explanations.
- **Published research evidence:** the BDH architecture description (linked sources,
  not independently verified by this project).

Full classification table in `docs/limitations.md` and inside the app's Provenance
section.

## How to run locally

### Backend
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env       # sets VITE_API_BASE_URL=http://localhost:8000
npm run dev                # http://localhost:5173
```

## Testing
```bash
cd backend && source .venv/bin/activate && pytest -v
```
32 tests: 20 unit tests on the numerical engine (including the manual worked example
from the spec) + 12 FastAPI integration tests. All passing as of this build.

```bash
cd frontend && npx tsc -b && npm run build
```
Type-checks clean; production build verified and smoke-tested by serving `dist/`.

## Experiment reproduction
Every experiment result includes `dimension`, `learning_rate`, `num_associations`,
`seed`, and `method` in its response. Re-issuing the same `/experiment/run` request with
the same parameters reproduces the same output exactly (`SeedManager` wraps
`numpy.random.default_rng(seed)`, never NumPy's global RNG state — verified in
`test_seed_reproducibility_across_full_experiment`).

## Research sources
See [`research/papers.md`](research/papers.md) for the full list with links and how
each is used in this project. Primary sources (2024–2025): the BDH paper
(arXiv:2509.26507), Irie & Gershman on fast weight programming
(arXiv:2508.08435), and Sun et al. on test-time training (arXiv:2407.04620).

## Licenses
Code in this repository: MIT (see `LICENSE`). Cited papers and the official BDH
repository remain under their own licenses/terms — this project only links to and
paraphrases them; no external code or text is copied in.

## AI assistance disclosure
This project's code, documentation, and research summaries were produced with AI
assistance (Claude, Anthropic) working from a detailed human-authored specification.
All backend tests were actually executed (not just written) and all cited papers were
verified via live search against their real, current listings rather than recalled from
memory — see `STATUS.md` for exactly what was implemented and verified versus what
remains manual follow-up for the user (primarily: pushing this to a public repository
and deploying it, since the build environment used here has no outbound hosting
access).

## Known limitations
See [`docs/limitations.md`](docs/limitations.md) for the full list, including the
purely-additive (non-delta-rule) write mechanism, in-memory-only backend sessions, and
the single-association cosine-similarity degeneracy surfaced during development.
