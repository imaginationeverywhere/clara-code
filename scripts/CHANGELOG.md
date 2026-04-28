# Changelog

## [Unreleased] - 2026-04-27

### Added

- **`audit-cli-intent-catalog.mjs`** — Ensures `docs/catalog/voice-intent-catalog.yaml` phrasings do not appear verbatim in `packages/cli/src`. Run: **`npm run audit:cli-intent-catalog`**.

### Fixed

- **`graphify-rebuild.sh`** — New wrapper used by `CLAUDE.md` and `.cursor/rules/graphify.mdc`: if `import graphify.watch` fails, exit 0 (no stderr noise on agents or clones without the Python package); otherwise run `_rebuild_code`. See root **`CHANGELOG.md`**, **`docs/CHANGELOG.md`**.
