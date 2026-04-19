#!/usr/bin/env bash
# Build Clara Voice VSIX for a target OS tag (darwin | linux | win32).
# Full VSCodium-based IDE binaries require VSCODIUM_DIR and docs in README.
set -euo pipefail

PLATFORM="${1:?Usage: build-platform.sh <darwin|linux|win32>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="${ROOT}/dist"
EXT="${ROOT}/extensions/clara-voice"

case "${PLATFORM}" in
	darwin | linux | win32) ;;
	*)
		echo "Unknown platform: ${PLATFORM}"
		exit 1
		;;
esac

mkdir -p "${DIST}"
cd "${EXT}"
if [[ -f package-lock.json ]]; then
	npm ci
else
	npm install
fi
npm run compile
npx @vscode/vsce package --no-dependencies --allow-missing-repository -o "${DIST}/clara-voice-${PLATFORM}.vsix"

echo "Packaged ${DIST}/clara-voice-${PLATFORM}.vsix"

if [[ -n "${VSCODIUM_DIR:-}" ]]; then
	echo "Hint: VSCODIUM_DIR is set. For full IDE binaries, see README and scripts/build-vscodium.sh"
fi
