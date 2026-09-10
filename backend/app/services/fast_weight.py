"""Fast-weight (Hebbian, outer-product) associative memory.

Mathematical convention (see research/equations.md for the full derivation):

    Write:     W <- W + eta * (k v^T)          # outer product, d x d
    Retrieve:  v_hat = W^T k

Worked example (also the manual test in tests/test_fast_weight.py):
    k = [1, 0], v = [0, 1], eta = 1
    outer(k, v) = [[0, 1],
                   [0, 0]]
    W after one write = [[0, 1], [0, 0]]
    retrieval: W^T @ k = [[0, 0], [1, 0]] @ [1, 0] = [0, 1] = v   (exact recovery)

This is a linear associative memory updated directly by the Hebbian rule —
there is no gradient, no loss function, and no backward pass anywhere in
this file. That is the entire point of the "fast weight" distinction from
slow, gradient-trained parameters.
"""
from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np

from app.services.metrics import cosine_similarity, l2_normalize, normalized_l2_error, status_from_similarity


@dataclass
class Association:
    """One stored (key, value) pair, kept so the UI can show ground truth."""
    id: int
    key: list[float]
    value: list[float]
    label: str | None = None


@dataclass
class WriteResult:
    matrix_before: list[list[float]]
    matrix_after: list[list[float]]
    changed_cells: list[tuple[int, int]]
    association: Association


@dataclass
class QueryResult:
    query: list[float]
    expected_value: list[float] | None
    retrieved_value: list[float]
    similarity: float | None
    error: float | None
    status: str


class FastWeightMemory:
    """W in R^(d x d), updated by the Hebbian outer-product rule.

    Parameters
    ----------
    dimension : d, the shared dimensionality of keys and values.
    learning_rate : eta, the write strength.
    normalize : if True, keys and values are L2-normalized before being
        written/queried. This keeps eta's effect comparable across random
        vector draws and matches the convention documented in
        research/equations.md.
    """

    def __init__(self, dimension: int, learning_rate: float = 0.5, normalize: bool = True):
        if dimension < 1:
            raise ValueError("dimension must be >= 1")
        self.dimension = dimension
        self.learning_rate = float(learning_rate)
        self.normalize = normalize
        self.W = np.zeros((dimension, dimension), dtype=float)
        self.associations: list[Association] = []
        self._next_id = 0

    # ------------------------------------------------------------------ core ops

    def reset(self, learning_rate: float | None = None) -> None:
        self.W = np.zeros((self.dimension, self.dimension), dtype=float)
        self.associations = []
        self._next_id = 0
        if learning_rate is not None:
            self.learning_rate = float(learning_rate)

    def _prep(self, v: np.ndarray) -> np.ndarray:
        return l2_normalize(v) if self.normalize else v

    def write(self, key: list[float] | np.ndarray, value: list[float] | np.ndarray,
              label: str | None = None) -> WriteResult:
        k = self._prep(np.asarray(key, dtype=float))
        v = self._prep(np.asarray(value, dtype=float))
        if k.shape[0] != self.dimension or v.shape[0] != self.dimension:
            raise ValueError(f"key/value must have dimension {self.dimension}")

        before = self.W.copy()
        delta = self.learning_rate * np.outer(k, v)
        self.W = self.W + delta
        after = self.W.copy()

        changed = [(i, j) for i in range(self.dimension) for j in range(self.dimension)
                   if abs(delta[i, j]) > 1e-12]

        assoc = Association(id=self._next_id, key=k.tolist(), value=v.tolist(), label=label)
        self._next_id += 1
        self.associations.append(assoc)

        return WriteResult(
            matrix_before=before.tolist(),
            matrix_after=after.tolist(),
            changed_cells=changed,
            association=assoc,
        )

    def retrieve(self, query_key: list[float] | np.ndarray) -> np.ndarray:
        q = self._prep(np.asarray(query_key, dtype=float))
        if q.shape[0] != self.dimension:
            raise ValueError(f"query must have dimension {self.dimension}")
        return self.W.T @ q

    def query(self, query_key: list[float] | np.ndarray,
              expected_value: list[float] | np.ndarray | None = None) -> QueryResult:
        q = np.asarray(query_key, dtype=float)
        v_hat = self.retrieve(q)

        expected = None
        similarity = None
        error = None
        status = "unknown"
        if expected_value is not None:
            expected = self._prep(np.asarray(expected_value, dtype=float))
            similarity = cosine_similarity(v_hat, expected)
            error = normalized_l2_error(v_hat, expected)
            status = status_from_similarity(similarity)

        return QueryResult(
            query=q.tolist(),
            expected_value=expected.tolist() if expected is not None else None,
            retrieved_value=v_hat.tolist(),
            similarity=similarity,
            error=error,
            status=status,
        )

    def query_by_association_id(self, assoc_id: int) -> QueryResult:
        assoc = next((a for a in self.associations if a.id == assoc_id), None)
        if assoc is None:
            raise KeyError(f"no association with id {assoc_id}")
        return self.query(assoc.key, assoc.value)

    # ------------------------------------------------------------------ introspection

    @property
    def num_associations(self) -> int:
        return len(self.associations)

    def matrix_snapshot(self) -> list[list[float]]:
        return self.W.tolist()

    def frobenius_norm(self) -> float:
        return float(np.linalg.norm(self.W))
