"""Retrieval-quality metrics. Pure functions, no hidden state, no smoothing.

All functions operate on real numpy arrays and return real floats — nothing
here is scripted or precomputed.
"""
from __future__ import annotations

import numpy as np

EPS = 1e-12


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity in [-1, 1]. Returns 0.0 if either vector is exactly zero
    (defined behavior, not a silent failure)."""
    na, nb = np.linalg.norm(a), np.linalg.norm(b)
    if na < EPS or nb < EPS:
        return 0.0
    return float(np.dot(a, b) / (na * nb))


def l2_error(a: np.ndarray, b: np.ndarray) -> float:
    """Euclidean distance between retrieved and expected vector."""
    return float(np.linalg.norm(a - b))


def normalized_l2_error(a: np.ndarray, b: np.ndarray) -> float:
    """L2 error normalized by the norm of the ground truth, so it is comparable
    across dimensions and value scales. 0 = perfect, 1 ≈ error the size of the
    signal itself."""
    nb = np.linalg.norm(b)
    if nb < EPS:
        return l2_error(a, b)
    return float(np.linalg.norm(a - b) / nb)


def status_from_similarity(similarity: float) -> str:
    """Categorical read-out used by the UI. Thresholds are documented, not hidden."""
    if similarity >= 0.85:
        return "success"
    if similarity >= 0.5:
        return "degraded"
    return "interference"


def l2_normalize(v: np.ndarray) -> np.ndarray:
    n = np.linalg.norm(v)
    if n < EPS:
        return v.copy()
    return v / n
