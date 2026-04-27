from __future__ import annotations

from . import cognee_engine
from .config import settings


async def run_query(query: str, limit: int, mode: str | None) -> dict[str, object]:
  results = await cognee_engine.search_with_cognee_async(settings.data_dir, query, limit, mode)
  return {"results": results, "engine": "cognee"}

