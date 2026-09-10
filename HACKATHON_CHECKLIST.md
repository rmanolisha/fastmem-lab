# HACKATHON_CHECKLIST.md

(Corresponds to STATUS.md; nothing here is marked done without a verified line there.)

[x] Precise falsifiable claim
[x] Real computational substrate (NumPy fast-weight engine, no gradient descent, no scripted results -- verified live end-to-end)
[x] Interactive controls (every control in ExperimentControls/AssociationBuilder maps to a real API parameter)
[x] Visible internal state (MatrixViewer shows the actual W; changed cells highlighted per write)
[x] Ground truth vs estimate (RetrievalPanel, never hides failed retrieval)
[x] Interference experiment (Section 5, live, tested)
[x] Baseline comparison (nearest-neighbor, Section 7, live, tested)
[x] Substantive BDH module (9-part structure: architecture, mechanism, diagram, comparison table, what's implemented/not, why useful, sources, evidence labeling)
[x] BDH evidence/source (arXiv:2509.26507 + official github.com/pathwaycom/bdh, both verified via live search)
[x] 3+ recent primary papers (2024-2025: arXiv:2509.26507, 2508.08435, 2407.04620 -- see research/papers.md)
[x] Limitations section (docs/limitations.md, 10 items, + in-app section)
[!] Public deployment -- not performed; sandbox has no outbound hosting access. Local run verified (backend curl smoke test + frontend production build served and smoke-tested). Deploy steps documented in docs/architecture.md for the user to execute.
[ ] Public GitHub repository -- user must create the repo and push the provided archive
[x] README (full, all required sections per spec Section 25)
[x] Reproduction instructions (seed+params in every experiment response; documented in README)
[x] One-page concept summary (docs/concept-summary.md)
[x] Source/license record (LICENSE, README licenses section, research/papers.md)
[x] AI assistance disclosure (README.md)
[x] Data/asset disclosure (in-app Provenance section + docs/limitations.md)
[~] Accessibility check -- focus-visible states, aria-labels on inputs/charts, prefers-reduced-motion respected; no full screen-reader pass performed
[~] Mobile/basic responsive check -- CSS grid collapses sidebar at 860px, layout tested via build output only, not on a physical device
[x] Tests passing -- 32/32 backend (pytest -v); frontend type-checks clean and builds successfully
