import numpy as np
import pytest

from app.services.fast_weight import FastWeightMemory
from app.services.metrics import cosine_similarity


def test_matrix_initialization():
    mem = FastWeightMemory(dimension=4, learning_rate=0.5)
    assert mem.W.shape == (4, 4)
    assert np.allclose(mem.W, 0.0)
    assert mem.num_associations == 0


def test_manual_worked_example_no_normalization():
    """k=[1,0], v=[0,1], eta=1 -> W = [[0,1],[0,0]]; retrieval via W^T k recovers v exactly."""
    mem = FastWeightMemory(dimension=2, learning_rate=1.0, normalize=False)
    result = mem.write([1, 0], [0, 1])
    expected_W = [[0.0, 1.0], [0.0, 0.0]]
    assert np.allclose(result.matrix_after, expected_W), result.matrix_after

    v_hat = mem.retrieve([1, 0])
    assert np.allclose(v_hat, [0.0, 1.0]), v_hat


def test_hebbian_write_is_additive_outer_product():
    mem = FastWeightMemory(dimension=3, learning_rate=0.5, normalize=False)
    k = np.array([1.0, 0.0, 0.0])
    v = np.array([0.0, 1.0, 0.0])
    result = mem.write(k, v)
    expected_delta = 0.5 * np.outer(k, v)
    assert np.allclose(np.array(result.matrix_after) - np.array(result.matrix_before), expected_delta)


def test_multiple_writes_accumulate():
    mem = FastWeightMemory(dimension=4, learning_rate=0.5, normalize=True)
    mem.write([1, 0, 0, 0], [0, 1, 0, 0])
    w1 = mem.W.copy()
    mem.write([0, 0, 1, 0], [0, 0, 0, 1])
    w2 = mem.W.copy()
    assert not np.allclose(w1, w2)
    assert mem.num_associations == 2
    # second write should not simply overwrite: earlier contribution still present
    assert not np.allclose(w2 - (w2 - w1), 0.0)


def test_retrieval_single_association_is_strong():
    mem = FastWeightMemory(dimension=8, learning_rate=1.0, normalize=True)
    k = [0.9, -0.2, 0.4, 0.1, -0.7, 0.3, 0.05, -0.6]
    v = [0.1, 0.9, -0.3, 0.4, 0.2, -0.5, 0.6, 0.0]
    mem.write(k, v)
    qr = mem.query(k, v)
    assert qr.similarity > 0.99, qr.similarity
    assert qr.status == "success"


def test_cosine_similarity_bounds():
    a = np.array([1.0, 0.0])
    b = np.array([1.0, 0.0])
    assert cosine_similarity(a, b) == pytest.approx(1.0)
    c = np.array([-1.0, 0.0])
    assert cosine_similarity(a, c) == pytest.approx(-1.0)
    d = np.array([0.0, 1.0])
    assert cosine_similarity(a, d) == pytest.approx(0.0, abs=1e-9)


def test_cosine_similarity_zero_vector_defined():
    a = np.zeros(3)
    b = np.array([1.0, 2.0, 3.0])
    assert cosine_similarity(a, b) == 0.0


def test_reset_clears_matrix_and_associations():
    mem = FastWeightMemory(dimension=4, learning_rate=0.5)
    mem.write([1, 0, 0, 0], [0, 1, 0, 0])
    assert mem.num_associations == 1
    mem.reset()
    assert mem.num_associations == 0
    assert np.allclose(mem.W, 0.0)


def test_reset_can_change_learning_rate():
    mem = FastWeightMemory(dimension=2, learning_rate=0.5)
    mem.reset(learning_rate=0.9)
    assert mem.learning_rate == pytest.approx(0.9)


def test_deterministic_seed_reproducibility():
    from app.utils.seed import SeedManager
    sm1 = SeedManager(seed=7)
    sm2 = SeedManager(seed=7)
    v1 = sm1.random_vector(6)
    v2 = sm2.random_vector(6)
    assert np.allclose(v1, v2)

    sm3 = SeedManager(seed=8)
    v3 = sm3.random_vector(6)
    assert not np.allclose(v1, v3)


def test_wrong_dimension_raises():
    mem = FastWeightMemory(dimension=4)
    with pytest.raises(ValueError):
        mem.write([1, 0], [0, 1])
