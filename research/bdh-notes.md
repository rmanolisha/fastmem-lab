# BDH Notes — source material for the "Fast Weights → BDH" module

Source: Kosowski, Uznański, Chorowski, Stamirowska, Bartoszkiewicz. *The Dragon
Hatchling: The Missing Link between the Transformer and Models of the Brain.*
arXiv:2509.26507 (2025). https://arxiv.org/abs/2509.26507
Official code: https://github.com/pathwaycom/bdh

## What BDH is (published claims, paraphrased)
- BDH is a scale-free, biologically inspired network of locally interacting
  "neuron particles," proposed as a bridge between Transformers and brain-like
  computation — not a literal brain simulation.
- Its working memory during inference is implemented through **synaptic
  plasticity with Hebbian learning using spiking neurons** — the model's
  short-term/working memory lives in *changing connection strengths* (synapses),
  not only in the fixed, gradient-trained parameters.
- The paper reports that individual synapses measurably strengthen when the
  model processes a specific concept — offered as empirical evidence that the
  Hebbian/synaptic mechanism is doing real representational work, not just a
  theoretical gloss.
- BDH-GPU is a practical, GPU-efficient variant that approximates the underlying
  particle dynamics via mean-field interaction and low-rank factorization, and
  is described (Chapter 2 of the Pathway explainer) as being *derived from the
  attention equations*, reframing retrieval as synaptic memory in a
  high-dimensional sparse neuron space.
- The architecture is reported to scale similarly to GPT-2-class Transformers on
  language tasks at comparable parameter counts (10M–1B), while exposing
  interpretable, modular synapse/neuron structure.

## The recurring pattern (used for the architecture diagram)
Input → neuron/state activity → Hebbian/synaptic update → changing internal
memory (synaptic weights) → feeds the next recurrent computation step.

This is the same *shape* as a fast-weight programmer: a fast, directly-updated
matrix of associations sits alongside slower, gradient-trained parameters.

## Similarity to this project's mechanism
- Both use a **Hebbian-style update**: a change to memory driven directly by the
  correlation between two active signals (key/value here; pre/post-synaptic
  neuron activity in BDH), not by backpropagating a loss through the whole
  system.
- Both distinguish **fast, per-step memory state** from **slow, trained
  parameters**. In this project: `W` is fast, updated live; nothing here is
  learned by gradient descent. In BDH: the synaptic weight matrix that
  implements working memory changes during inference; the network's other,
  slower-trained parameters are separate.
- Both describe memory as literally a **matrix of pairwise associations**
  (synapses / outer-product terms) rather than a symbolic lookup table.

## Explicit differences (do not blur these)
- BDH's mechanism operates over a large population of sparse, spiking neuron
  particles with excitatory/inhibitory structure and integrate-and-fire
  dynamics; this project's `W` is a single dense d×d matrix over dense
  real-valued key/value vectors with no spiking, sparsity constraint, or
  neuron-level dynamics.
- BDH is embedded inside a full sequence-model architecture (with attention-like
  recurrent computation, scale-free connectivity, GPU-efficient low-rank
  approximation) trained end-to-end on language; this project is a standalone,
  isolated associative-memory primitive with no surrounding sequence model and
  no training run of any kind.
- BDH's empirical claims (GPT-2-comparable scaling, Sudoku-Extreme accuracy,
  monosemantic synapses) come from Pathway's own published experiments on their
  full system. **None of those results are reproduced, measured, or implied by
  this project.** Every number this project reports comes from the small,
  independent NumPy engine in `backend/app/services/`.
- BDH's "fast weight" is one interpretive lens the paper offers on part of its
  mechanism; it is not a drop-in synonym for the classic 1990s-2020s fast-weight
  programmer literature (Schmidhuber 1992; Schlag et al. 2021) even though the
  two lines of work rhyme. This project implements the latter, simpler
  mechanism and uses it as an accessible entry point into the former's ideas.

## Labeling requirement (enforced in BDHModule.tsx)
Every mention of "our W matrix" next to BDH must carry the label:
"Independent educational implementation inspired by the published mechanism —
not the official BDH codebase, not a reproduction of BDH's benchmarks."
