import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_create_write_query_roundtrip():
    r = client.post("/memory/create", json={"dimension": 8, "learning_rate": 1.0, "seed": 42})
    assert r.status_code == 200
    body = r.json()
    sid = body["session_id"]
    assert len(body["matrix"]) == 8
    assert all(v == 0.0 for row in body["matrix"] for v in row)

    r2 = client.post("/memory/write", json={
        "session_id": sid,
        "key": [0.9, -0.2, 0.4, 0.1, -0.7, 0.3, 0.05, -0.6],
        "value": [0.1, 0.9, -0.3, 0.4, 0.2, -0.5, 0.6, 0.0],
    })
    assert r2.status_code == 200
    w = r2.json()
    assert w["num_associations"] == 1
    assert w["frobenius_norm"] > 0
    assert w["changed_cells"]

    r3 = client.post("/memory/query", json={
        "session_id": sid,
        "query_key": [0.9, -0.2, 0.4, 0.1, -0.7, 0.3, 0.05, -0.6],
        "expected_value": [0.1, 0.9, -0.3, 0.4, 0.2, -0.5, 0.6, 0.0],
        "method": "fast_weight",
    })
    assert r3.status_code == 200
    q = r3.json()
    assert q["similarity"] > 0.99
    assert q["status"] == "success"


def test_query_unknown_session_404():
    r = client.post("/memory/query", json={
        "session_id": "does-not-exist",
        "query_key": [0.1, 0.2],
    })
    assert r.status_code == 404


def test_reset_endpoint():
    r = client.post("/memory/create", json={"dimension": 4, "learning_rate": 0.5, "seed": 1})
    sid = r.json()["session_id"]
    client.post("/memory/write", json={"session_id": sid, "key": [1, 0, 0, 0], "value": [0, 1, 0, 0]})
    r2 = client.post("/memory/reset", json={"session_id": sid})
    assert r2.status_code == 200
    assert all(v == 0.0 for row in r2.json()["matrix"] for v in row)


def test_state_endpoint_reflects_writes():
    r = client.post("/memory/create", json={"dimension": 4, "learning_rate": 0.5, "seed": 1})
    sid = r.json()["session_id"]
    client.post("/memory/write", json={"session_id": sid, "key": [1, 0, 0, 0], "value": [0, 1, 0, 0]})
    r2 = client.get(f"/memory/{sid}/state")
    assert r2.status_code == 200
    assert r2.json()["num_associations"] == 1


def test_experiment_run_endpoint_returns_real_points():
    r = client.post("/experiment/run", json={
        "dimension": 8, "num_associations": 20, "learning_rate": 0.5, "seed": 42, "num_probes": 3,
        "method": "fast_weight",
    })
    assert r.status_code == 200
    body = r.json()
    assert len(body["points"]) > 0
    # not all identical -> real computation, not a placeholder constant
    sims = {p["similarity"] for p in body["points"]}
    assert len(sims) > 1


def test_experiment_compare_endpoint():
    r = client.post("/experiment/compare", json={
        "dimension": 8, "num_associations": 20, "learning_rate": 0.5, "seed": 42, "num_probes": 3,
    })
    assert r.status_code == 200
    body = r.json()
    assert body["fast_weight"]["method"] == "fast_weight"
    assert body["nearest_neighbor"]["method"] == "nearest_neighbor"


def test_noise_sweep_endpoint():
    r = client.post("/experiment/noise", json={
        "dimension": 8, "learning_rate": 1.0, "seed": 1, "noise_levels": [0.0, 1.0, 2.0],
    })
    assert r.status_code == 200
    body = r.json()
    # single-association retrieval is co-linear with the stored value, so cosine
    # similarity pins near +-1; error (magnitude drift) is the metric that
    # actually reveals noise degradation -- see test_noise_sweep_error_grows_with_noise
    assert body["errors"][0] < body["errors"][-1]


def test_dimension_sweep_endpoint():
    r = client.post("/experiment/dimension-sweep", json={
        "dimensions": [4, 16], "num_associations": 10, "learning_rate": 0.5, "seed": 2,
    })
    assert r.status_code == 200
    body = r.json()
    assert len(body) == 2


def test_learning_rate_sweep_endpoint():
    r = client.post("/experiment/learning-rate-sweep", json={
        "dimension": 8, "num_associations": 10, "learning_rates": [0.1, 1.0], "seed": 2,
    })
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_query_without_expected_value_is_json_serializable():
    """Regression test: querying with no ground truth used to return NaN for
    similarity/error, which is not valid JSON and made the endpoint 500. Now
    it returns null and status 'unknown'."""
    r = client.post("/memory/create", json={"dimension": 4, "learning_rate": 0.5, "seed": 1})
    sid = r.json()["session_id"]
    client.post("/memory/write", json={"session_id": sid, "key": [1, 0, 0, 0], "value": [0, 1, 0, 0]})
    r2 = client.post("/memory/query", json={"session_id": sid, "query_key": [1, 0, 0, 0]})
    assert r2.status_code == 200
    body = r2.json()
    assert body["similarity"] is None
    assert body["error"] is None
    assert body["status"] == "unknown"


def test_write_with_auto_generate():
    r = client.post("/memory/create", json={"dimension": 6, "learning_rate": 0.5, "seed": 5})
    sid = r.json()["session_id"]
    r2 = client.post("/memory/write", json={"session_id": sid, "auto_generate": True})
    assert r2.status_code == 200
    assert len(r2.json()["key"]) == 6
