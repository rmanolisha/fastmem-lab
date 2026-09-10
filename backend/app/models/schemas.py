from __future__ import annotations

from pydantic import BaseModel, Field


# ---------------------------------------------------------------- memory

class CreateMemoryRequest(BaseModel):
    dimension: int = Field(ge=1, le=64)
    learning_rate: float = Field(default=0.5, ge=0.0, le=5.0)
    seed: int = 42
    normalize: bool = True


class CreateMemoryResponse(BaseModel):
    session_id: str
    dimension: int
    learning_rate: float
    seed: int
    matrix: list[list[float]]


class WriteRequest(BaseModel):
    session_id: str
    key: list[float] | None = None
    value: list[float] | None = None
    label: str | None = None
    auto_generate: bool = False  # if true, ignore key/value and draw from seeded RNG


class WriteResponse(BaseModel):
    association_id: int
    key: list[float]
    value: list[float]
    matrix_before: list[list[float]]
    matrix_after: list[list[float]]
    changed_cells: list[tuple[int, int]]
    num_associations: int
    frobenius_norm: float


class QueryRequest(BaseModel):
    session_id: str
    query_key: list[float]
    expected_value: list[float] | None = None
    method: str = "fast_weight"  # "fast_weight" | "nearest_neighbor"


class QueryResponse(BaseModel):
    query: list[float]
    expected_value: list[float] | None
    retrieved_value: list[float]
    similarity: float | None
    error: float | None
    status: str
    method: str
    matched_association_id: int | None = None


class ResetRequest(BaseModel):
    session_id: str
    learning_rate: float | None = None


class ResetResponse(BaseModel):
    session_id: str
    matrix: list[list[float]]


# ---------------------------------------------------------------- experiments

class ExperimentRequest(BaseModel):
    dimension: int = Field(ge=1, le=64)
    num_associations: int = Field(ge=1, le=500)
    learning_rate: float = Field(default=0.5, ge=0.0, le=5.0)
    seed: int = 42
    num_probes: int = Field(default=5, ge=1, le=20)
    method: str = "fast_weight"


class ProbePointOut(BaseModel):
    step: int
    probe_id: int
    similarity: float
    error: float
    status: str


class ExperimentResponse(BaseModel):
    dimension: int
    learning_rate: float
    num_associations: int
    num_probes: int
    seed: int
    method: str
    points: list[ProbePointOut]


class CompareRequest(BaseModel):
    dimension: int = Field(ge=1, le=64)
    num_associations: int = Field(ge=1, le=500)
    learning_rate: float = Field(default=0.5, ge=0.0, le=5.0)
    seed: int = 42
    num_probes: int = Field(default=5, ge=1, le=20)


class CompareResponse(BaseModel):
    fast_weight: ExperimentResponse
    nearest_neighbor: ExperimentResponse


class NoiseSweepRequest(BaseModel):
    dimension: int = Field(ge=1, le=64)
    learning_rate: float = Field(default=0.5, ge=0.0, le=5.0)
    seed: int = 42
    noise_levels: list[float] | None = None
    method: str = "fast_weight"


class NoiseSweepResponse(BaseModel):
    noise_levels: list[float]
    similarities: list[float]
    errors: list[float]
    seed: int
    dimension: int
    learning_rate: float
    method: str


class DimensionSweepRequest(BaseModel):
    dimensions: list[int]
    num_associations: int = Field(ge=1, le=500)
    learning_rate: float = Field(default=0.5, ge=0.0, le=5.0)
    seed: int = 42
    method: str = "fast_weight"


class LearningRateSweepRequest(BaseModel):
    dimension: int = Field(ge=1, le=64)
    num_associations: int = Field(ge=1, le=500)
    learning_rates: list[float]
    seed: int = 42
    method: str = "fast_weight"
