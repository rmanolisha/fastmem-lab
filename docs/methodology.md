# Methodology

## What the experiments measure and why

**Experiment A/B (single / multiple associations).** Baseline sanity check: write one
or a few associations into an empty matrix and query them back immediately. Retrieval
should be strong (similarity > 0.99 for a single clean write, verified in
`test_retrieval_single_association_is_strong`). This establishes that the mechanism
works before asking what breaks it.

**Experiment C (interference) — the central experiment.** A fixed number of early
associations ("probes") are held aside. As more associations are written into the
*same fixed-size* matrix, the probes are re-queried after every subsequent write. For
fast-weight memory, probe retrieval quality is expected to degrade as the matrix
accumulates more superimposed outer-product terms — this is interference, and it's the
direct experimental consequence of the claim's second half ("new writes interfere with
old ones"). The same experiment run with `method=nearest_neighbor` is expected *not* to
degrade, because that baseline stores every pair explicitly. Both expectations are
enforced as unit tests (`test_interference_experiment_shows_degradation_for_fast_weight`,
`test_interference_experiment_nearest_neighbor_does_not_degrade`), not just asserted in
prose.

**Experiment D (learning rate).** Re-runs the interference sweep at different η values.
η scales how strongly each write perturbs `W`; larger η means faster overwriting of
existing structure by new associations, which should show up as faster interference
onset. The dashboard exposes η as a live slider (0.05–2.0) rather than a fixed constant.

**Experiment E (dimension/capacity).** Re-runs the interference sweep at different `d`.
A larger matrix has more independent directions to store associations in before they
start overlapping, so higher `d` should sustain more associations before probe
similarity drops — verified directly in `test_dimension_sweep_higher_dimension_more_capacity`.

**Experiment F (noisy queries).** Store one association, then query with
`q = k + noise` at increasing noise scale. This experiment surfaced a genuine
mathematical subtlety during development (documented in full in
`research/equations.md`): for a *single* stored association, retrieval is always a
scalar multiple of the stored value, so cosine similarity to the ground truth pins near
+1 regardless of noise magnitude (it can only flip to −1 if noise reverses the sign of
`⟨k, q⟩`). The metric that actually reveals degradation in this regime is the
*normalized L2 error*, which responds to the shrinking dot product `⟨k, q⟩` as the query
drifts from the stored key. The lab reports both metrics and explains this rather than
picking whichever one looked better.

## Reproducibility
Every experiment call takes `(dimension, learning_rate, num_associations, seed)` and is
fully deterministic given those four numbers — `SeedManager` wraps a
`numpy.random.default_rng(seed)` so no code path anywhere touches NumPy's global RNG
state. `test_seed_reproducibility_across_full_experiment` re-runs the same experiment
through two independent `ExperimentRunner` instances and asserts bit-identical output.

## What counts as "real computation" here
Every number the frontend displays comes from an HTTP round-trip to the FastAPI backend,
which calls into `backend/app/services/`, which does the NumPy arithmetic on the
request. There is no seeded/precomputed lookup table standing in for a slow computation,
and no client-side mock data path — `src/lib/api.ts` is the only place the frontend
talks to "the model," and it always makes a real request.
