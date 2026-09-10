"""Deterministic seed management for reproducible experiments.

Every random draw in the engine (association generation, noise injection)
must go through a numpy.random.Generator produced here, seeded explicitly,
so that a (seed, dimension, learning_rate, num_associations, noise) tuple
fully determines the experiment output.
"""
from __future__ import annotations

import numpy as np


class SeedManager:
    """Wraps numpy's Generator API so callers never touch global RNG state."""

    def __init__(self, seed: int = 42):
        self.seed = int(seed)
        self._rng = np.random.default_rng(self.seed)

    def reset(self, seed: int | None = None) -> None:
        if seed is not None:
            self.seed = int(seed)
        self._rng = np.random.default_rng(self.seed)

    @property
    def rng(self) -> np.random.Generator:
        return self._rng

    def random_vector(self, dim: int, low: float = -1.0, high: float = 1.0) -> np.ndarray:
        return self._rng.uniform(low, high, size=dim)

    def noise_vector(self, dim: int, scale: float) -> np.ndarray:
        return self._rng.normal(loc=0.0, scale=scale, size=dim)
