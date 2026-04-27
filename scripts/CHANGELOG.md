# Changelog

## [Unreleased] - 2026-04-27

### Fixed

- **`graphify-rebuild.sh`** — New wrapper used by `CLAUDE.md` and `.cursor/rules/graphify.mdc`: if `import graphify.watch` fails, exit 0 (no stderr noise on agents or clones without the Python package); otherwise run `_rebuild_code`. See root **`CHANGELOG.md`**, **`docs/CHANGELOG.md`**.
