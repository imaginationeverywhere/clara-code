#!/usr/bin/env bash
# Rebuild the graphify knowledge graph after code changes.
#
# Silently no-ops if graphify is not installed in the current Python env.
# Local dev with graphify installed gets the rebuild; QCS1 / CI / fresh
# clones skip without noise.

set -e

if ! python3 -c "import graphify.watch" 2>/dev/null; then
  # graphify not installed — skip silently, exit 0
  exit 0
fi

python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))" || true
