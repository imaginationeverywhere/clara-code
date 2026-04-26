"""Read graph node counts from Cognee's embedded Kuzu database under DATA_DIR."""

from __future__ import annotations

import logging
from pathlib import Path

_log = logging.getLogger(__name__)


def _kuzu_database_paths(data_dir: str) -> list[Path]:
  root = Path(data_dir).resolve() / "cognee_system" / "databases"
  if not root.is_dir():
    return []
  return sorted(root.glob("*.kuzu"))


def count_kuzu_nodes(data_dir: str) -> int | None:
  """Return node count from the Kuzu graph file under DATA_DIR, or None if unavailable."""
  try:
    import kuzu  # noqa: PLC0415 — optional heavy import
  except ImportError:
    return None
  paths = _kuzu_database_paths(data_dir)
  if not paths:
    return None
  db_path = paths[0]
  try:
    db = kuzu.Database(str(db_path))
    conn = kuzu.Connection(db)
    res = conn.execute("MATCH (n) RETURN COUNT(n) AS c")
    if res.has_next():
      row = res.get_next()
      return int(row[0])
    return 0
  except Exception as exc:  # noqa: BLE001 — best-effort metrics; never fail callers
    _log.warning("count_kuzu_nodes failed (%s): %s", db_path, exc)
    return None
