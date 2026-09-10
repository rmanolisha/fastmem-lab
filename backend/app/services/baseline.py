"""Nearest-neighbor associative memory — the baseline the fast-weight
matrix is compared against.

Stores every (key, value) pair explicitly (unbounded, unlike the fast-weight
matrix which compresses everything into a fixed d x d state). Retrieval finds
the stored key with highest cosine similarity to the query and returns its
value. This trades memory cost (O(n) storage) for near-perfect exact-match
recall, which is exactly the point of comparison: fast weights are bounded
and lossy by construction, nearest-neighbor is not (until queries get noisy
or keys collide).
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from app.services.metrics import cosine_similarity, l2_normalize, normalized_l2_error, status_from_similarity


@dataclass
class NNQueryResult:
    query: list[float]
    expected_value: list[float] | None
    retrieved_value: list[float]
    matched_key_id: int | None
    similarity: float | None
    error: float | None
    status: str


class NearestNeighborBaseline:
    def __init__(self, dimension: int, normalize: bool = True):
        self.dimension = dimension
        self.normalize = normalize
        self.keys: list[np.ndarray] = []
        self.values: list[np.ndarray] = []
        self.ids: list[int] = []
        self._next_id = 0

    def _prep(self, v: np.ndarray) -> np.ndarray:
        return l2_normalize(v) if self.normalize else v

    def reset(self) -> None:
        self.keys, self.values, self.ids = [], [], []
        self._next_id = 0

    def write(self, key: list[float] | np.ndarray, value: list[float] | np.ndarray) -> int:
        k = self._prep(np.asarray(key, dtype=float))
        v = self._prep(np.asarray(value, dtype=float))
        self.keys.append(k)
        self.values.append(v)
        aid = self._next_id
        self.ids.append(aid)
        self._next_id += 1
        return aid

    def retrieve(self, query_key: list[float] | np.ndarray) -> tuple[np.ndarray, int | None]:
        q = self._prep(np.asarray(query_key, dtype=float))
        if not self.keys:
            return np.zeros(self.dimension), None
        sims = [cosine_similarity(q, k) for k in self.keys]
        best = int(np.argmax(sims))
        return self.values[best], self.ids[best]

    def query(self, query_key: list[float] | np.ndarray,
              expected_value: list[float] | np.ndarray | None = None) -> NNQueryResult:
        q = np.asarray(query_key, dtype=float)
        v_hat, matched_id = self.retrieve(q)

        expected = None
        similarity = None
        error = None
        status = "unknown"
        if expected_value is not None:
            expected = self._prep(np.asarray(expected_value, dtype=float))
            similarity = cosine_similarity(v_hat, expected)
            error = normalized_l2_error(v_hat, expected)
            status = status_from_similarity(similarity)

        return NNQueryResult(
            query=q.tolist(),
            expected_value=expected.tolist() if expected is not None else None,
            retrieved_value=v_hat.tolist(),
            matched_key_id=matched_id,
            similarity=similarity,
            error=error,
            status=status,
        )
