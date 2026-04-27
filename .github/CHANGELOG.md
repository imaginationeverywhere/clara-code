# GitHub workflows changelog

## [Unreleased]

### Added

- `workflows/desktop-macos-dmg.yml` — on push/PR to `main` or `develop` (paths: `desktop/**`, `packages/clara-voice-client/**`), macOS Tauri `npm run build`, upload `*.dmg` from `bundle/dmg` (warn if missing).
- `workflows/release-on-tag.yml` — on SemVer tag `v*.*.*`: publish `@imaginationeverywhere/clara-voice-client` and `clara` to npm when `NPM_TOKEN` is set; after building `packages/cli`, run `node scripts/verify-customer-brain-ship.mjs` (forbidden founder brain host and founder-only command marker in shipped CLI / `.claude` / `mcp-brain-customer.example.json`). Parallel macOS build + artifact + `softprops/action-gh-release` for the `.dmg`. See `docs/distribution-pipeline.md`, `docs/architecture/BRAIN_API_ACCESS_CONTROL.md`.
- `workflows/clara-code-ide.yml` — on push to `main` (paths `ide/clara-code/**` and this workflow) and `workflow_dispatch`, matrix builds `clara-voice` VSIX (macOS, Linux, Windows), runs `verify-customer-brain-ship.mjs --vsix-only` per artifact, uploads VSIX. See `docs/architecture/BRAIN_API_ACCESS_CONTROL.md`.
