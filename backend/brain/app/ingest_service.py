from __future__ import annotations

import hashlib
import time
from typing import Any

from . import cognee_engine
from .config import settings


async def ingest_markdown(content: str, metadata: dict[str, Any] | None) -> dict[str, Any]:
  md = metadata or {}
  h = hashlib.sha256(content.encode("utf-8")).hexdigest()
  if h in cognee_engine.load_idempotency_hashes(settings.data_dir):
    return {"status": "skipped", "content_hash": h, "engine": "cognee", "reason": "duplicate_hash"}

  await cognee_engine.ingest_with_cognee_async(settings.data_dir, content, md)
  cognee_engine.append_idempotency_hash(settings.data_dir, h)

  return {
    "status": "accepted",
    "content_hash": h,
    "engine": "cognee",
    "ingested_at": time.time(),
  }

