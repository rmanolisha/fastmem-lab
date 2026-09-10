import numpy as np
import pytest

from app.services.baseline import NearestNeighborBaseline
from app.services.experiments import ExperimentRunner
from app.utils.seed import SeedManager


def test_nearest_neighbor_exact_recall():
    nn = NearestNeighborBaseline(dimension=6)
    nn.write([1, 0, 0, 0, 0, 0], [10, 0, 0, 0, 0, 0])
    nn.write([0, 1, 0, 0, 0, 0], [0, 20, 0, 0, 0, 0])
    qr = nn.query([0, 1, 0, 0, 0, 0], [0, 20, 0, 0, 0, 0])
    assert qr.similarity == pytest.approx(1.0, abs=1e-6)
    assert qr.matched_key_id == 1


def test_nearest_neighbor_reset():
    nn = NearestNeighborBaseline(dimension=3)
    nn.write([1, 0, 0], [1, 0, 0])
    nn.reset()
    assert nn.keys == []


def test_interference_experiment_shows_degradation_for_fast_weight():
    runner = ExperimentRunner()
    result = runner.run_interference(
        dimension=8, num_associations=40, learning_rate=0.5, seed=42,
        method="fast_weight", num_probes=3,
    )
    # points for probe 0 across steps
    probe0_points = sorted([p for p in result.points if p.probe_id == 0], key=lambda p: p.step)
    first_sim = probe0_points[0].similarity
    last_sim = probe0_points[-1].similarity
    # interference: similarity for the earliest probe should degrade as more
    # associations are superimposed into a fixed-size matrix
    assert last_sim <= first_sim + 1e-6
    assert first_sim > 0.9  # right after writing, retrieval should be strong


def test_interference_experiment_nearest_neighbor_does_not_degrade():
    runner = ExperimentRunner()
    result = runner.run_interference(
        dimension=8, num_associations=40, learning_rate=0.5, seed=42,
        method="nearest_neighbor", num_probes=3,
    )
    probe0_points = sorted([p for p in result.points if p.probe_id == 0], key=lambda p: p.step)
    sims = [p.similarity for p in probe0_points]
    # nearest neighbor stores everything explicitly -> no interference expected
    assert min(sims) > 0.99


def test_noise_sweep_error_grows_with_noise():
    """For a single association, v_hat = eta*(k.q)*v is always co-linear with v
    (cosine similarity pins near +/-1 depending on the sign of k.q), so
    *magnitude* error -- not cosine similarity -- is the metric that reveals
    degradation from key noise. This is verified explicitly here, and is why
    the noise experiment reports both metrics in the API/UI rather than
    similarity alone."""
    runner = ExperimentRunner()
    result = runner.run_noise_sweep(dimension=8, learning_rate=1.0, seed=1,
                                     noise_levels=[0.0, 0.5, 1.0])
    assert result.errors[0] < result.errors[-1]
    assert result.errors[0] == pytest.approx(0.0, abs=1e-6)


def test_dimension_sweep_higher_dimension_more_capacity():
    runner = ExperimentRunner()
    results = runner.run_dimension_sweep(dimensions=[4, 32], num_associations=30,
                                          learning_rate=0.5, seed=3)
    def final_probe0_similarity(res):
        pts = sorted([p for p in res.points if p.probe_id == 0], key=lambda p: p.step)
        return pts[-1].similarity

    low_d_final = final_probe0_similarity(results[0])
    high_d_final = final_probe0_similarity(results[1])
    assert high_d_final > low_d_final


def test_learning_rate_sweep_runs_and_varies():
    runner = ExperimentRunner()
    results = runner.run_learning_rate_sweep(dimension=8, num_associations=20,
                                              learning_rates=[0.1, 1.0], seed=5)
    assert len(results) == 2
    assert results[0].learning_rate == 0.1
    assert results[1].learning_rate == 1.0


def test_compare_methods_returns_both():
    runner = ExperimentRunner()
    comp = runner.compare_methods(dimension=8, num_associations=15, learning_rate=0.5, seed=9)
    assert comp.fast_weight.method == "fast_weight"
    assert comp.nearest_neighbor.method == "nearest_neighbor"


def test_seed_reproducibility_across_full_experiment():
    runner1 = ExperimentRunner()
    runner2 = ExperimentRunner()
    r1 = runner1.run_interference(dimension=8, num_associations=10, learning_rate=0.5, seed=123)
    r2 = runner2.run_interference(dimension=8, num_associations=10, learning_rate=0.5, seed=123)
    sims1 = [p.similarity for p in r1.points]
    sims2 = [p.similarity for p in r2.points]
    assert sims1 == sims2
