from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    ExperimentRequest, ExperimentResponse, ProbePointOut,
    CompareRequest, CompareResponse,
    NoiseSweepRequest, NoiseSweepResponse,
    DimensionSweepRequest, LearningRateSweepRequest,
)
from app.services.experiments import ExperimentRunner, InterferenceResult

router = APIRouter(tags=["experiments"])
runner = ExperimentRunner()


def _to_response(res: InterferenceResult) -> ExperimentResponse:
    return ExperimentResponse(
        dimension=res.dimension, learning_rate=res.learning_rate,
        num_associations=res.num_associations, num_probes=res.num_probes,
        seed=res.seed, method=res.method,
        points=[ProbePointOut(step=p.step, probe_id=p.probe_id, similarity=p.similarity,
                               error=p.error, status=p.status) for p in res.points],
    )


@router.post("/experiment/run", response_model=ExperimentResponse)
def run_experiment(req: ExperimentRequest):
    if req.method not in ("fast_weight", "nearest_neighbor"):
        raise HTTPException(status_code=400, detail="method must be fast_weight or nearest_neighbor")
    res = runner.run_interference(
        dimension=req.dimension, num_associations=req.num_associations,
        learning_rate=req.learning_rate, seed=req.seed, method=req.method,
        num_probes=req.num_probes,
    )
    return _to_response(res)


@router.post("/experiment/compare", response_model=CompareResponse)
def compare_methods(req: CompareRequest):
    comp = runner.compare_methods(
        dimension=req.dimension, num_associations=req.num_associations,
        learning_rate=req.learning_rate, seed=req.seed, num_probes=req.num_probes,
    )
    return CompareResponse(fast_weight=_to_response(comp.fast_weight),
                            nearest_neighbor=_to_response(comp.nearest_neighbor))


@router.post("/experiment/noise", response_model=NoiseSweepResponse)
def noise_sweep(req: NoiseSweepRequest):
    res = runner.run_noise_sweep(
        dimension=req.dimension, learning_rate=req.learning_rate, seed=req.seed,
        noise_levels=req.noise_levels, method=req.method,
    )
    return NoiseSweepResponse(
        noise_levels=res.noise_levels, similarities=res.similarities, errors=res.errors,
        seed=res.seed, dimension=res.dimension, learning_rate=res.learning_rate, method=res.method,
    )


@router.post("/experiment/dimension-sweep", response_model=list[ExperimentResponse])
def dimension_sweep(req: DimensionSweepRequest):
    results = runner.run_dimension_sweep(
        dimensions=req.dimensions, num_associations=req.num_associations,
        learning_rate=req.learning_rate, seed=req.seed, method=req.method,
    )
    return [_to_response(r) for r in results]


@router.post("/experiment/learning-rate-sweep", response_model=list[ExperimentResponse])
def learning_rate_sweep(req: LearningRateSweepRequest):
    results = runner.run_learning_rate_sweep(
        dimension=req.dimension, num_associations=req.num_associations,
        learning_rates=req.learning_rates, seed=req.seed, method=req.method,
    )
    return [_to_response(r) for r in results]
