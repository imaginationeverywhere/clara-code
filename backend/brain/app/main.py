from __future__ import annotations

import json
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI
from pydantic import BaseModel, Field

from .auth import require_api_key
from .config import settings
from .ingest_service import ingest_markdown
from .query_service import run_query


@asynccontextmanager
async def lifespan(app: FastAPI):
  from . import cognee_engine

  cognee_engine.configure_cognee_environment(settings.data_dir)
  # Initialize Cognee's metadata DB schema + default user. Idempotent, and
  # required on a fresh DATA_DIR — otherwise first /query fails with
  # 'no such table: principals' (DatabaseNotCreatedError).
  await cognee_engine.setup_cognee_database()
  yield


app = FastAPI(title="clara-brain", version="0.1.0", lifespan=lifespan)


class IngestBody(BaseModel):
  content: str
  metadata: dict[str, Any] = Field(default_factory=dict)


class QueryBody(BaseModel):
  query: str
  limit: int = Field(default=10, ge=1, le=50)
  mode: str | None = Field(default="hybrid", description="vector | graph | hybrid (Cognee TBD)")


@app.get("/health")
def health() -> dict[str, str]:
  return {"status": "ok", "service": "clara-brain"}


@app.get("/stats", dependencies=[Depends(require_api_key)])
def stats() -> dict[str, Any]:
  from . import cognee_engine

  meta = cognee_engine.get_meta_stats(settings.data_dir)
  mpath = cognee_engine.meta_path(settings.data_dir)
  last_ts: float | None = None
  if mpath.is_file():
    try:
      raw = json.loads(Path(mpath).read_text(encoding="utf-8"))
      last_ts = raw.get("last_ingest_at")
    except (OSError, json.JSONDecodeError):
      last_ts = None
  body: dict[str, Any] = {
    "documents_ingested": int(meta.get("documents_ingested", 0)),
    "last_ingest_at": last_ts,
    "engine": "cognee",
  }
  if "graph_nodes" in meta:
    body["graph_nodes"] = int(meta["graph_nodes"])
  return body


@app.post("/ingest", dependencies=[Depends(require_api_key)])
async def ingest(body: IngestBody) -> dict[str, Any]:
  return await ingest_markdown(body.content, body.metadata)


@app.post("/query", dependencies=[Depends(require_api_key)])
async def query(body: QueryBody) -> dict[str, Any]:
  return await run_query(body.query, body.limit, body.mode)
