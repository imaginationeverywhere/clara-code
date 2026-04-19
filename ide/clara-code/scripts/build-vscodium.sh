#!/usr/bin/env bash
# Optional: produce Clara Code desktop binaries from a local VSCodium checkout.
# Prerequisites: clone https://github.com/VSCodium/vscodium, run its ./get_repo.sh,
# merge product.json, copy extensions/clara-voice into vscode/extensions/, then
# follow VSCodium docs for your OS (build can take 1–3+ hours).
set -euo pipefail

PLATFORM="${1:?Usage: build-vscodium.sh <darwin|linux|win32>}"
VSCODIUM_DIR="${VSCODIUM_DIR:?Set VSCODIUM_DIR to your VSCodium clone}"

echo "This repository does not run the full VSCodium compile in CI by default."
echo "Platform: ${PLATFORM}"
echo "VSCODIUM_DIR: ${VSCODIUM_DIR}"
echo ""
echo "Manual steps:"
echo "  1. cd \"\${VSCODIUM_DIR}\" && ./get_repo.sh"
echo "  2. node \"$(dirname "$0")/merge-product.mjs\" \"\${VSCODIUM_DIR}/vscode/product.json\" --in-place"
echo "  3. rsync -a \"$(cd "$(dirname "$0")/.." && pwd)/extensions/clara-voice\" \"\${VSCODIUM_DIR}/vscode/extensions/clara-voice\""
echo "  4. Register the extension in vscode/build/npm/dirs.js if your vscode revision requires it."
echo "  5. Run VSCodium ./build.sh for your OS (see VSCodium docs)."
exit 1
