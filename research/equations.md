# Equations — FastMem Lab

## Notation
- `k, v, q ∈ R^d` — key, value, query vectors.
- `W ∈ R^(d×d)` — the fast-weight memory matrix, initialized to the zero matrix.
- `η` (eta) — learning/write rate, a positive scalar.
- `⟨a, b⟩` — dot product; `‖a‖` — Euclidean norm.

## Write (Hebbian outer-product rule)
```
W ← W + η (k vᵀ)
```
`k vᵀ` is the outer product: `(k vᵀ)[i, j] = k_i · v_j`. This is exactly the
correlation-matrix-memory / fast-weight-programmer write rule described in
Irie & Gershman (2025, arXiv:2508.08435, Sec. on FWPs as key-value associative
memory) and formalized for linear attention in Schlag et al. (2021,
arXiv:2102.11174). There is no gradient, no loss, and no backward pass in this
update — the defining property of a "fast weight."

## Retrieval
```
v̂ = Wᵀ k
```
Orientation check (also the manual unit test in
`backend/tests/test_fast_weight.py::test_manual_worked_example_no_normalization`):

```
k = [1, 0],  v = [0, 1],  η = 1
outer(k, v) = [[0, 1],
               [0, 0]]
W after write = [[0, 1],
                 [0, 0]]
Wᵀ = [[0, 0],
      [1, 0]]
Wᵀ @ k = Wᵀ @ [1, 0] = [0, 1] = v      ✓ exact recovery
```

## Why this orientation, and what it implies
For a single write, `W = η (k vᵀ)`, so:
```
v̂ = Wᵀ q = η (v kᵀ) q = η ⟨k, q⟩ · v
```
i.e. the retrieved vector is **always a scalar multiple of the stored value
`v`** — its *direction* never changes, only its magnitude, which scales with
`η · ⟨k, q⟩`. Two consequences that the UI makes explicit rather than hiding:

1. **Cosine similarity is degenerate for a single stored association.** It pins
   near `+1` whenever `⟨k, q⟩ > 0`, and flips to `-1` only if enough query noise
   reverses that sign. It does *not* smoothly degrade with query noise. This
   was caught and fixed by the noise-sweep unit test in
   `backend/tests/test_baseline_and_experiments.py`.
2. **Normalized L2 error is the metric that reveals noise degradation** for a
   single association, because it responds to the magnitude drift
   `η·⟨k, q⟩` even though the direction is unchanged. Once more than one
   association is stored, superposition breaks the clean scalar-multiple
   relationship and cosine similarity becomes informative again — this is
   exactly the interference mechanism Experiment C measures.

## Normalization convention
Keys and values are L2-normalized before every write/retrieval by default
(`FastWeightMemory(normalize=True)`), so that `η`'s effect is comparable across
randomly drawn vectors of different raw magnitude. This can be disabled per
session (`normalize=False`) — the manual worked example above uses
`normalize=False` so the numbers match the spec's example exactly.

## Metrics
```
cosine_similarity(a, b) = ⟨a, b⟩ / (‖a‖ ‖b‖)     (0 if either vector is ~zero)
normalized_l2_error(â, a) = ‖â - a‖ / ‖a‖         (falls back to ‖â - a‖ if ‖a‖≈0)
status(similarity):  "success" if ≥0.85, "degraded" if ≥0.5, else "interference"
```

## Nearest-neighbor baseline
```
retrieve(q) = value[argmax_i cosine_similarity(q, key_i)]
```
Stores every `(key, value)` pair explicitly — O(n) memory, no compression, so it
does not suffer the same interference as the fixed-size `W`. This is the
intended contrast, not a claim that nearest-neighbor is "better": it trades
unbounded storage for near-perfect exact-match recall, and is comparably
brittle under key-similarity ambiguity (two very similar stored keys can still
be confused).

## What is explicitly NOT used
No gradient descent, no backpropagation, and no trained "programmer" network
appear anywhere in the write path. The delta-rule variant from Schlag et al.
(2021), which subtracts an old association before writing a new one to reduce
interference, is **not implemented** here — this project uses the simpler,
purely additive Hebbian rule on purpose, so that Experiment C's interference
result is a direct, uncorrected consequence of superposition in a fixed-size
matrix. This is called out in `docs/limitations.md`.
