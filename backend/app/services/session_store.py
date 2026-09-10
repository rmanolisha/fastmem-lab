"""In-memory session registry. Each session pairs a FastWeightMemory with a
NearestNeighborBaseline of the same dimension so /memory/query can serve
either method for the same set of writes. This is process-local state
(no database) — acceptable for a hackathon lab tool, documented in
docs/architecture.md as a known limitation (state is lost on backend restart).
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass

from app.services.baseline import NearestNeighborBaseline
from app.services.fast_weight import FastWeightMemory
from app.utils.seed import SeedManager


@dataclass
class Session:
    id: str
    fast_weight: FastWeightMemory
    baseline: NearestNeighborBaseline
    seed_manager: SeedManager
    seed: int


class SessionStore:
    def __init__(self):
        self._sessions: dict[str, Session] = {}

    def create(self, dimension: int, learning_rate: float, seed: int, normalize: bool) -> Session:
        sid = str(uuid.uuid4())
        session = Session(
            id=sid,
            fast_weight=FastWeightMemory(dimension, learning_rate, normalize=normalize),
            baseline=NearestNeighborBaseline(dimension, normalize=normalize),
            seed_manager=SeedManager(seed),
            seed=seed,
        )
        self._sessions[sid] = session
        return session

    def get(self, session_id: str) -> Session:
        if session_id not in self._sessions:
            raise KeyError(f"unknown session_id {session_id}")
        return self._sessions[session_id]

    def delete(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)


# module-level singleton used by the API routers
store = SessionStore()
