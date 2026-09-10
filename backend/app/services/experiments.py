"""ExperimentRunner: orchestrates the sweeps described in the spec
(Experiments A-F). Every number produced here comes from actually running
FastWeightMemory / NearestNeighborBaseline — nothing is precomputed or
hand-authored.
"""
from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np

from app.services.baseline import NearestNeighborBaseline
from app.services.fast_weight import FastWeightMemory
from app.utils.seed import SeedManager


@dataclass
class ProbePoint:
    step: int  # number of associations written so far
    probe_id: int
    similarity: float
    error: float
    status: str


@dataclass
class InterferenceResult:
    dimension: int
    learning_rate: float
    num_associations: int
    num_probes: int
    seed: int
    method: str  # "fast_weight" | "nearest_neighbor"
    points: list[ProbePoint] = field(default_factory=list)


@dataclass
class NoiseResult:
    noise_levels: list[float]
    similarities: list[float]
    errors: list[float]
    seed: int
    dimension: int
    learning_rate: float
    method: str


@dataclass
class ComparisonResult:
    fast_weight: InterferenceResult
    nearest_neighbor: InterferenceResult


class ExperimentRunner:
    def __init__(self, seed_manager: SeedManager | None = None):
        self.seed_manager = seed_manager or SeedManager()

    # ---------------------------------------------------------- Experiment C

    def run_interference(self, dimension: int, num_associations: int, learning_rate: float,
                          seed: int, method: str = "fast_weight",
                          num_probes: int = 5) -> InterferenceResult:
        """Write associations one at a time; after every write, re-query a
        fixed set of "probe" memories chosen from the earliest writes, and
        record retrieval quality. This directly demonstrates interference:
        for fast-weight memory, probe similarity should trend downward as
        more associations are superimposed into the same fixed-size W.
        """
        self.seed_manager.reset(seed)
        num_probes = max(1, min(num_probes, num_associations))

        if method == "fast_weight":
            mem = FastWeightMemory(dimension, learning_rate)
        elif method == "nearest_neighbor":
            mem = NearestNeighborBaseline(dimension)
        else:
            raise ValueError(f"unknown method {method}")

        associations = [
            (self.seed_manager.random_vector(dimension), self.seed_manager.random_vector(dimension))
            for _ in range(num_associations)
        ]

        probes: list[tuple[int, np.ndarray, np.ndarray]] = []  # (assoc_index, key, value)
        result = InterferenceResult(
            dimension=dimension, learning_rate=learning_rate, num_associations=num_associations,
            num_probes=num_probes, seed=seed, method=method,
        )

        for idx, (k, v) in enumerate(associations):
            if method == "fast_weight":
                mem.write(k, v)
            else:
                mem.write(k, v)

            if idx < num_probes:
                probes.append((idx, k, v))

            step = idx + 1
            for probe_idx, pk, pv in probes:
                if method == "fast_weight":
                    qr = mem.query(pk, pv)
                else:
                    qr = mem.query(pk, pv)
                result.points.append(ProbePoint(
                    step=step, probe_id=probe_idx,
                    similarity=qr.similarity, error=qr.error, status=qr.status,
                ))

        return result

    def compare_methods(self, dimension: int, num_associations: int, learning_rate: float,
                         seed: int, num_probes: int = 5) -> ComparisonResult:
        fw = self.run_interference(dimension, num_associations, learning_rate, seed,
                                    method="fast_weight", num_probes=num_probes)
        nn = self.run_interference(dimension, num_associations, learning_rate, seed,
                                    method="nearest_neighbor", num_probes=num_probes)
        return ComparisonResult(fast_weight=fw, nearest_neighbor=nn)

    # ---------------------------------------------------------- Experiment F

    def run_noise_sweep(self, dimension: int, learning_rate: float, seed: int,
                         noise_levels: list[float] | None = None,
                         method: str = "fast_weight") -> NoiseResult:
        """Store one association, then query with q = k + noise at increasing
        noise scales, measuring how retrieval degrades.

        Note (verified by tests/test_baseline_and_experiments.py): for a single
        fast-weight association, v_hat = eta * (k . q) * v is always a scalar
        multiple of v, so cosine similarity to v pins near +1 (or flips to -1
        only if noise reverses the sign of k.q) regardless of noise magnitude.
        The *error* (normalized L2 distance) is the metric that actually
        reveals degradation from key noise in the single-association case;
        similarity becomes informative once multiple associations interfere.
        Both metrics are returned so the UI can show this honestly rather than
        implying similarity alone tells the whole story.
        """
        self.seed_manager.reset(seed)
        noise_levels = noise_levels if noise_levels is not None else [0.0, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0]

        k = self.seed_manager.random_vector(dimension)
        v = self.seed_manager.random_vector(dimension)

        if method == "fast_weight":
            mem = FastWeightMemory(dimension, learning_rate)
        else:
            mem = NearestNeighborBaseline(dimension)
        mem.write(k, v)

        sims, errs = [], []
        for noise in noise_levels:
            q = k + self.seed_manager.noise_vector(dimension, noise)
            qr = mem.query(q, v)
            sims.append(qr.similarity)
            errs.append(qr.error)

        return NoiseResult(noise_levels=noise_levels, similarities=sims, errors=errs,
                            seed=seed, dimension=dimension, learning_rate=learning_rate, method=method)

    # ---------------------------------------------------------- Experiment E

    def run_dimension_sweep(self, dimensions: list[int], num_associations: int,
                             learning_rate: float, seed: int,
                             method: str = "fast_weight") -> list[InterferenceResult]:
        """Run the same interference experiment at several memory dimensions
        to show capacity scaling with d."""
        return [
            self.run_interference(d, num_associations, learning_rate, seed, method=method)
            for d in dimensions
        ]

    # ---------------------------------------------------------- Experiment D

    def run_learning_rate_sweep(self, dimension: int, num_associations: int,
                                 learning_rates: list[float], seed: int,
                                 method: str = "fast_weight") -> list[InterferenceResult]:
        return [
            self.run_interference(dimension, num_associations, eta, seed, method=method)
            for eta in learning_rates
        ]
