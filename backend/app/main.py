from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import experiments, memory

app = FastAPI(
    title="FastMem Lab API",
    description="Fast-weight associative memory research/experimentation backend. "
                 "All computation is live NumPy — no scripted or precomputed responses.",
    version="0.1.0",
)

# CORS: allow the configured frontend origin(s). Defaults cover local Vite dev server.
_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
allowed_origins = os.environ.get("FASTMEM_ALLOWED_ORIGINS", _default_origins).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(memory.router)
app.include_router(experiments.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "fastmem-lab-api"}
