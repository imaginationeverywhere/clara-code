"""
Cognee-backed ingest and search for Clara brain.

Configures Cognee storage under DATA_DIR (Kuzu + LanceDB embedded) and uses
Bedrock for LLM/embeddings in production via standard Cognee / LiteLLM env vars.
"""

from __future__ import annotations

import asyncio
import json
import os
import time
from pathlib import Path
from typing import Any

_DATASET_DEFAULT = "clara_vault"


def _run(coro: Any) -> Any:
  return asyncio.run(coro)


def configure_cognee_environment(data_dir: str) -> None:
  """Point Cognee system roots at DATA_DIR (call before first cognee import in-process)."""
  root = Path(data_dir).resolve()
  sys_root = root / "cognee_system"
  data_root = root / "cognee_data"
  sys_root.mkdir(parents=True, exist_ok=True)
  data_root.mkdir(parents=True, exist_ok=True)
  # Pre-create subdirs Cognee 0.5.8 writes into. On a freshly-mounted EFS
  # volume these don't exist, and Cognee's async SQLAlchemy engine blows up
  # with "sqlite3.OperationalError: unable to open database file" when it
  # tries to create cognee_db.db inside a non-existent parent dir.
  (sys_root / "databases").mkdir(parents=True, exist_ok=True)
  (data_root / "databases").mkdir(parents=True, exist_ok=True)

  os.environ.setdefault("ENABLE_BACKEND_ACCESS_CONTROL", "false")
  os.environ["SYSTEM_ROOT_DIRECTORY"] = str(sys_root)
  os.environ["DATA_ROOT_DIRECTORY"] = str(data_root)
  os.environ.setdefault("GRAPH_DATABASE_PROVIDER", os.getenv("GRAPH_DATABASE_PROVIDER", "kuzu"))
  os.environ.setdefault("VECTOR_DB_PROVIDER", os.getenv("VECTOR_DB_PROVIDER", "lancedb"))
  # Production defaults — override in ECS task / SSM-fed env; Bedrock only (no OpenAI direct).
  os.environ.setdefault("LLM_PROVIDER", os.getenv("LLM_PROVIDER", "bedrock"))
  os.environ.setdefault(
    "LLM_MODEL",
    os.getenv("LLM_MODEL", "us.anthropic.claude-haiku-4-5-20251001-v1:0"),
  )
  os.environ.setdefault("EMBEDDING_PROVIDER", os.getenv("EMBEDDING_PROVIDER", "bedrock"))
  os.environ.setdefault(
    "EMBEDDING_MODEL",
    os.getenv("EMBEDDING_MODEL", "amazon.titan-embed-text-v2:0"),
  )
  # CI can set MOCK_EMBEDDING=true (supported by Cognee embedding engines)


def _get_cognee() -> Any:
  import cognee  # lazy so tests can patch this module

  return cognee


async def setup_cognee_database() -> None:
  """Create Cognee's metadata DB schema + default user on a fresh DATA_DIR.

  Required on first boot against a new (EFS or ephemeral) DATA_DIR — without
  this, /query and /ingest fail with 'no such table: principals' /
  DatabaseNotCreatedError. Cognee 0.5.8 does not expose a top-level
  cognee.setup(); the real init path is create_db_and_tables() then
  get_default_user() (which creates the default user on miss). Both are
  idempotent — create_all is a no-op on existing schema, get_default_user
  is a no-op when the user already exists."""
  from cognee.infrastructure.databases.relational import create_db_and_tables
  from cognee.modules.users.methods import get_default_user

  await create_db_and_tables()
  await get_default_user()


def _ingest_payload(content: str, metadata: dict[str, Any] | None) -> str:
  md = metadata or {}
  if not md:
    return content
  meta_txt = "\n".join(f"{k}: {v}" for k, v in md.items() if v is not None)
  return f"---\n{meta_txt}\n---\n{content}"


async def _ingest_async(content: str, metadata: dict[str, Any] | None, dataset_name: str) -> None:
  cognee = _get_cognee()
  payload = _ingest_payload(content, metadata)
  await cognee.add(payload, dataset_name=dataset_name)
  await cognee.cognify(datasets=[dataset_name])


async def ingest_with_cognee_async(
  data_dir: str,
  content: str,
  metadata: dict[str, Any] | None,
  dataset_name: str | None = None,
) -> None:
  configure_cognee_environment(data_dir)
  ds = dataset_name or os.getenv("COGNEE_DATASET_NAME", _DATASET_DEFAULT)
  await _ingest_async(content, metadata, ds)


def ingest_with_cognee(
  data_dir: str,
  content: str,
  metadata: dict[str, Any] | None,
  dataset_name: str | None = None,
) -> None:
  """Sync wrapper for scripts/tests. Do NOT call from ASGI handlers —
  aiosqlite binds its worker thread to the event loop at first use; a fresh
  asyncio.run() per request tears that loop down and leaves the aiosqlite
  worker pointing at a closed loop, which crashes every subsequent request."""
  configure_cognee_environment(data_dir)
  ds = dataset_name or os.getenv("COGNEE_DATASET_NAME", _DATASET_DEFAULT)
  _run(_ingest_async(content, metadata, ds))


def _extract_score(item: Any, payload: Any) -> float | None:
  for attr in ("score", "similarity", "rank_score"):
    v = getattr(item, attr, None)
    if v is not None:
      try:
        return float(v)
      except (TypeError, ValueError):
        continue
  if isinstance(payload, dict):
    for key in ("score", "similarity", "rank_score"):
      if key in payload and payload[key] is not None:
        try:
          return float(payload[key])
        except (TypeError, ValueError):
          continue
  return None


def _serialize_results(raw: list[Any]) -> list[dict[str, Any]]:
  rows: list[dict[str, Any]] = []
  for idx, item in enumerate(raw):
    payload: Any = None
    dname: str | None = None
    if hasattr(item, "search_result"):
      payload = item.search_result
      dname = getattr(item, "dataset_name", None)
    else:
      payload = item
    text: Any
    if isinstance(payload, dict):
      text = payload.get("text") or payload.get("content") or json.dumps(payload)[:8000]
    elif isinstance(payload, str):
      text = payload
    else:
      text = str(payload)
    row: dict[str, Any] = {
      "id": f"hit-{idx}",
      "content": str(text)[:8000],
      "dataset_name": dname,
    }
    pl_for_score = payload if isinstance(payload, dict) else {}
    score = _extract_score(item, pl_for_score)
    if score is not None:
      row["score"] = score
    rows.append(row)
  return rows


async def _search_async(
  query: str,
  limit: int,
  mode: str | None,
  dataset_name: str,
) -> list[dict[str, Any]]:
  from cognee.modules.data.exceptions.exceptions import DatasetNotFoundError
  from cognee.modules.search.types.SearchType import SearchType

  cognee = _get_cognee()
  m = (mode or "hybrid").lower()
  if m == "vector":
    st = SearchType.CHUNKS
  elif m == "graph":
    st = SearchType.GRAPH_COMPLETION
  else:
    st = SearchType.RAG_COMPLETION
  try:
    raw = await cognee.search(query_text=query, query_type=st, top_k=limit, datasets=[dataset_name])
  except DatasetNotFoundError:
    # Fresh DATA_DIR with no ingested content yet — return empty results
    # instead of 500. The MCP client + Heru integrations treat "no hits" and
    # "no data" the same way; a 500 here falsely looks like infra failure.
    return []
  return _serialize_results(list(raw))


async def search_with_cognee_async(
  data_dir: str,
  query: str,
  limit: int,
  mode: str | None,
  dataset_name: str | None = None,
) -> list[dict[str, Any]]:
  configure_cognee_environment(data_dir)
  ds = dataset_name or os.getenv("COGNEE_DATASET_NAME", _DATASET_DEFAULT)
  return await _search_async(query, limit, mode, ds)


def search_with_cognee(
  data_dir: str,
  query: str,
  limit: int,
  mode: str | None,
  dataset_name: str | None = None,
) -> list[dict[str, Any]]:
  """Sync wrapper for scripts/tests. See ingest_with_cognee() for why ASGI
  handlers must call search_with_cognee_async() instead."""
  configure_cognee_environment(data_dir)
  ds = dataset_name or os.getenv("COGNEE_DATASET_NAME", _DATASET_DEFAULT)
  return _run(_search_async(query, limit, mode, ds))


def meta_path(data_dir: str) -> Path:
  Path(data_dir).mkdir(parents=True, exist_ok=True)
  return Path(data_dir) / "brain_meta.json"


def load_idempotency_hashes(data_dir: str) -> set[str]:
  p = meta_path(data_dir)
  if not p.is_file():
    return set()
  try:
    raw = json.loads(p.read_text(encoding="utf-8"))
    return set(raw.get("content_hashes", []))
  except (OSError, json.JSONDecodeError):
    return set()


def append_idempotency_hash(data_dir: str, content_hash: str) -> None:
  hashes = load_idempotency_hashes(data_dir)
  hashes.add(content_hash)
  p = meta_path(data_dir)
  payload: dict[str, Any] = {
    "content_hashes": sorted(hashes),
    "last_ingest_at": time.time(),
  }
  # Atomic write: a crash mid-write never leaves a half-written meta file.
  tmp = p.with_suffix(p.suffix + ".tmp")
  tmp.write_text(json.dumps(payload, indent=2), encoding="utf-8")
  os.replace(tmp, p)


def get_meta_stats(data_dir: str) -> dict[str, Any]:
  from .graph_stats import count_kuzu_nodes

  p = meta_path(data_dir)
  hashes: list[str] = []
  if p.is_file():
    try:
      raw = json.loads(p.read_text(encoding="utf-8"))
      hashes = list(raw.get("content_hashes") or [])
    except (OSError, json.JSONDecodeError):
      hashes = []
  out: dict[str, Any] = {"documents_ingested": len(hashes)}
  real_nodes = count_kuzu_nodes(data_dir)
  if real_nodes is not None:
    out["graph_nodes"] = real_nodes
  return out

