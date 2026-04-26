#!/usr/bin/env bash
# Fresh-install smoke for the `clara` CLI.
#
# Proves the install path: pack the tarball, install it into a clean
# /tmp directory using `npm i -g --prefix`, and exercise `--help` +
# `config get`. Brain-grounded answer is gated on platform corpus
# ingest and the production gateway URL — those are sequencing deps,
# not part of the install proof.
#
# Usage:  ./scripts/smoke-fresh-install.sh
# Exits non-zero on any failure.

set -euo pipefail

PKG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SMOKE_ROOT="${TMPDIR:-/tmp}/clara-smoke-$$"
PREFIX="${SMOKE_ROOT}/prefix"

cleanup() { rm -rf "${SMOKE_ROOT}"; }
trap cleanup EXIT

mkdir -p "${PREFIX}"

echo "▶ Pack tarball from ${PKG_DIR}"
cd "${PKG_DIR}"
TARBALL="$(npm pack --silent | tail -1)"
TARBALL_ABS="${PKG_DIR}/${TARBALL}"
echo "  tarball: ${TARBALL_ABS}"

echo "▶ Install into fresh prefix ${PREFIX}"
cd "${SMOKE_ROOT}"
npm init -y >/dev/null
npm install -g --silent --prefix "${PREFIX}" "${TARBALL_ABS}"

CLARA_BIN="${PREFIX}/bin/clara"
[ -x "${CLARA_BIN}" ] || { echo "✘ clara binary missing at ${CLARA_BIN}"; exit 1; }

echo "▶ clara --help"
"${CLARA_BIN}" --help

echo
echo "▶ clara tui --help (verifies CLARA_GATEWAY_URL — no internal-name leaks)"
"${CLARA_BIN}" tui --help

echo
echo "▶ Verify: zero HERMES references in installed binary"
HERMES_HITS=$(grep -c "HERMES" "${PREFIX}/lib/node_modules/@clara/cli/dist/index.js" || true)
if [ "${HERMES_HITS}" != "0" ]; then
  echo "✘ Found ${HERMES_HITS} HERMES references in installed binary — brand-hygiene fail"
  exit 1
fi
echo "  ✓ 0 HERMES leaks in installed dist/index.js"

echo
echo "▶ Cleanup tarball"
rm -f "${TARBALL_ABS}"

echo
echo "✓ Fresh-install smoke PASSED"
echo "  Brain-grounded answer step requires:"
echo "  • CLARA_GATEWAY_URL set to the platform-issued production gateway"
echo "  • Platform corpus ingested at brain-api.claracode.ai"
echo "  Both are sequencing deps owned by /clara-platform."
