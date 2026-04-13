#!/usr/bin/env bash
# Build a single clara-voice VSIX (no platform suffix).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="${ROOT}/dist"
EXT="${ROOT}/extensions/clara-voice"
mkdir -p "${DIST}"
cd "${EXT}"
if [[ -f package-lock.json ]]; then
	npm ci
else
	npm install
fi
npm run compile
npx @vscode/vsce package --no-dependencies --allow-missing-repository -o "${DIST}/clara-voice.vsix"
echo "Packaged ${DIST}/clara-voice.vsix"
