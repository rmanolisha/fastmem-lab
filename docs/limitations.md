# Limitations

1. **Fast-weight capacity is finite.** A d×d matrix has a fixed amount of representational
   capacity; it cannot store unboundedly many independent associations without loss. This is
   demonstrated, not just asserted — see Experiment C / `docs/methodology.md`.
2. **Superposition causes interference between associations.** Because writes are purely
   additive (`W ← W + η(kvᵀ)`), every new association's outer-product term is summed on top
   of all previous ones in the same matrix, so they are never perfectly separable once the
   matrix is close to saturated.
3. **Representation quality affects retrieval.** Results depend on the structure of the key
   vectors used (random vs. near-orthogonal vs. correlated); this project mostly uses randomly
   drawn vectors, which is a reasonable default but not the only regime worth studying.
4. **This is a simplified associative-memory model.** It implements the plain, purely additive
   Hebbian outer-product rule, not the delta-rule (Schlag et al., 2021) or gated variants that
   more advanced fast-weight programmers use specifically to reduce interference. That's a
   deliberate scope choice so Experiment C's interference result is a clean, uncorrected
   consequence of superposition — not a claim that this is the best possible fast-weight design.
5. **This is not a reproduction of the Dragon Hatchling (BDH) system.** No spiking neurons, no
   scale-free connectivity, no surrounding attention/sequence-model architecture, no training run,
   and none of BDH's published benchmark results (GPT-2-comparable scaling, Sudoku-Extreme
   accuracy, etc.) are reproduced, measured, or implied anywhere in this project. See
   `research/bdh-notes.md` for the explicit similarity/difference breakdown.
6. **Browser visualization uses small dimensions for interpretability.** The matrix viewer
   switches from a numeric table to a compact SVG heatmap above dimension 16, and the UI caps
   selectable dimension at 32, to keep rendering responsive and the display readable — this is a
   presentation choice, not a change to the underlying computation (the backend supports up to
   dimension 64 per the API's validation).
7. **BDH claims are tied to the cited published sources, not inferred from this project's toy
   model.** The BDH module explicitly separates "what the published paper claims" from "what our
   simplified mechanism does," and labels our implementation as independent throughout.
8. **Backend session state is process-local and in-memory.** There is no database; restarting
   the backend process discards all sessions. This is a deliberate simplicity trade-off for a
   hackathon-scoped lab tool, documented in `docs/architecture.md`, not something masked as a
   database-backed system.
9. **Single-association cosine similarity is mathematically degenerate under query noise**
   (documented in `research/equations.md`): for one stored association, `v̂` is always a scalar
   multiple of `v`, so similarity does not gradually degrade with noise the way one might expect.
   Normalized L2 error is the metric that reveals this experiment's real effect. This was caught
   by a failing unit test during development and fixed by reporting the correct metric rather than
   adjusting the test to hide the behavior.
10. **No deployment was performed in this delivery.** The build environment used to produce this
    project has no outbound hosting access. Local run instructions and deployment steps for common
    hosts are in `docs/architecture.md`; STATUS.md and HACKATHON_CHECKLIST.md mark this explicitly
    as `[!] BLOCKED` rather than silently as done.
