from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    CreateMemoryRequest, CreateMemoryResponse,
    WriteRequest, WriteResponse,
    QueryRequest, QueryResponse,
    ResetRequest, ResetResponse,
)
from app.services.session_store import store

router = APIRouter(prefix="/memory", tags=["memory"])


@router.post("/create", response_model=CreateMemoryResponse)
def create_memory(req: CreateMemoryRequest):
    session = store.create(req.dimension, req.learning_rate, req.seed, req.normalize)
    return CreateMemoryResponse(
        session_id=session.id,
        dimension=req.dimension,
        learning_rate=req.learning_rate,
        seed=req.seed,
        matrix=session.fast_weight.matrix_snapshot(),
    )


@router.post("/write", response_model=WriteResponse)
def write_memory(req: WriteRequest):
    try:
        session = store.get(req.session_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

    dim = session.fast_weight.dimension
    if req.auto_generate or req.key is None or req.value is None:
        key = session.seed_manager.random_vector(dim).tolist()
        value = session.seed_manager.random_vector(dim).tolist()
    else:
        key, value = req.key, req.value

    result = session.fast_weight.write(key, value, label=req.label)
    session.baseline.write(key, value)

    return WriteResponse(
        association_id=result.association.id,
        key=result.association.key,
        value=result.association.value,
        matrix_before=result.matrix_before,
        matrix_after=result.matrix_after,
        changed_cells=result.changed_cells,
        num_associations=session.fast_weight.num_associations,
        frobenius_norm=session.fast_weight.frobenius_norm(),
    )


@router.post("/query", response_model=QueryResponse)
def query_memory(req: QueryRequest):
    try:
        session = store.get(req.session_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

    if req.method == "fast_weight":
        qr = session.fast_weight.query(req.query_key, req.expected_value)
        return QueryResponse(
            query=qr.query, expected_value=qr.expected_value, retrieved_value=qr.retrieved_value,
            similarity=qr.similarity, error=qr.error, status=qr.status, method="fast_weight",
        )
    elif req.method == "nearest_neighbor":
        qr = session.baseline.query(req.query_key, req.expected_value)
        return QueryResponse(
            query=qr.query, expected_value=qr.expected_value, retrieved_value=qr.retrieved_value,
            similarity=qr.similarity, error=qr.error, status=qr.status, method="nearest_neighbor",
            matched_association_id=qr.matched_key_id,
        )
    else:
        raise HTTPException(status_code=400, detail="method must be fast_weight or nearest_neighbor")


@router.post("/reset", response_model=ResetResponse)
def reset_memory(req: ResetRequest):
    try:
        session = store.get(req.session_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    session.fast_weight.reset(learning_rate=req.learning_rate)
    session.baseline.reset()
    session.seed_manager.reset(session.seed)
    return ResetResponse(session_id=session.id, matrix=session.fast_weight.matrix_snapshot())


@router.get("/{session_id}/state")
def get_state(session_id: str):
    try:
        session = store.get(session_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {
        "session_id": session.id,
        "dimension": session.fast_weight.dimension,
        "learning_rate": session.fast_weight.learning_rate,
        "num_associations": session.fast_weight.num_associations,
        "matrix": session.fast_weight.matrix_snapshot(),
        "frobenius_norm": session.fast_weight.frobenius_norm(),
        "associations": [
            {"id": a.id, "key": a.key, "value": a.value, "label": a.label}
            for a in session.fast_weight.associations
        ],
    }
