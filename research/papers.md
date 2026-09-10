# Research Sources

Primary sources only. Every entry below was verified via a live web search during
development (not recalled from training data) and links to the paper's own listing
page. No citation here is fabricated.

---

### 1. The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain
**Authors:** A. Kosowski, P. Uznański, J. Chorowski, Z. Stamirowska, M. Bartoszkiewicz
**Year:** 2025 (arXiv:2509.26507)
**Link:** https://arxiv.org/abs/2509.26507 · official code: https://github.com/pathwaycom/bdh
**Concept it supports:** This is the primary BDH paper. It frames the model's
working memory as synaptic plasticity implemented with Hebbian learning over
spiking, high-dimensional neuron particles — i.e., an associative memory whose
state is a changing matrix of synaptic strengths, not a set of gradient-trained
weights.
**Used in project:** `BDHModule.tsx` (frontend), `research/bdh-notes.md`. This is
the paper our "Fast Weights → BDH" module explains and links to; our implementation
is explicitly labeled as independent and NOT this codebase.

---

### 2. Fast weight programming and linear transformers: from machine learning to neurobiology
**Authors:** Kazuki Irie, Samuel J. Gershman (Harvard, Kempner Institute)
**Year:** 2025 (arXiv:2508.08435; accepted to TMLR 2025)
**Link:** https://arxiv.org/abs/2508.08435
**Concept it supports:** Directly defines Fast Weight Programmers (FWPs) as
recurrent networks with 2D matrix-form hidden state, states the write rule as an
outer product of key and value vectors (a "correlation matrix memory," citing
Kohonen 1972), and states retrieval as a matrix-vector product between the memory
matrix and a query — i.e. exactly the `W <- W + eta(k v^T)` / `v_hat = W^T k`
mechanism this project implements. It also explicitly connects FWPs to synaptic
plasticity in the brain, which is the bridge this project uses to justify the BDH
comparison.
**Used in project:** `research/equations.md` (derivation/orientation source),
`BDHModule.tsx`, `docs/methodology.md`.

---

### 3. Learning to (Learn at Test Time): RNNs with Expressive Hidden States
**Authors:** Yu Sun, Xinhao Li, Karan Dalal, Jiarui Xu, Arjun Vikram, Genghan Zhang,
Yann Dubois, Xinlei Chen, Xiaolong Wang, Sanmi Koyejo, Tatsunori Hashimoto, Carlos
Guestrin
**Year:** 2024 (arXiv:2407.04620)
**Link:** https://arxiv.org/abs/2407.04620
**Concept it supports:** "Test-Time Training" (TTT) layers treat the hidden state
itself as a set of fast weights updated online, at inference time, by a local
learning rule rather than by backpropagation through the whole model — the same
core distinction this project's claim rests on ("without gradient descent, but
capacity is bounded"). TTT's discussion of hidden-state capacity vs. sequence
length is a directly relevant, modern treatment of the same capacity/interference
trade-off Experiment C investigates.
**Used in project:** `docs/methodology.md`, framing for Experiments C/E (capacity
and interference), `BDHModule.tsx` comparison table.

---

### 4. Linear Transformers Are Secretly Fast Weight Programmers
**Authors:** Imanol Schlag, Kazuki Irie, Jürgen Schmidhuber
**Year:** 2021 (arXiv:2102.11174, ICML 2021) — foundational/background source,
included because it is the paper that re-established the fast-weight framing this
whole field (and BDH) builds on; cited by both papers above.
**Link:** https://arxiv.org/abs/2102.11174
**Concept it supports:** Formalizes the equivalence between linear attention and
outer-product fast-weight memories, and introduces the delta-rule update as a way
to reduce interference from purely additive writes — directly relevant to why
Experiment C (interference) exists and to `docs/limitations.md`'s note that this
project's write rule is the simpler, purely-additive Hebbian case rather than the
delta-rule variant.
**Used in project:** `research/equations.md` (contrast with delta-rule), limitations.

---

## Official BDH source (technical reference, not a paper)
**Repository:** pathwaycom/bdh — https://github.com/pathwaycom/bdh
Official implementation released by Pathway alongside the paper above. Referenced
directly in `BDHModule.tsx` as "official implementation" evidence, distinct from
this project's independent, simplified educational implementation.

---

## Note on scope
The hackathon concept sheet asked for 3+ primary papers dated 2022–2026. Sources
1–3 satisfy that directly (2024–2025). Source 4 (2021) is included as clearly
labeled background because it is the paper the two in-range sources both build on
and cite — it is not counted toward the 2022–2026 quota.
