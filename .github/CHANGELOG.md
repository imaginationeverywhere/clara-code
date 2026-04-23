# GitHub workflows changelog

## [Unreleased]

### Added

- `workflows/desktop-macos-dmg.yml` — on push/PR to `main` or `develop` (paths: `desktop/**`, `packages/clara-voice-client/**`), macOS Tauri `npm run build`, upload `*.dmg` from `bundle/dmg` (warn if missing).
- `workflows/release-on-tag.yml` — on SemVer tag `v*.*.*`: publish `@imaginationeverywhere/clara-voice-client` and `clara` to npm when `NPM_TOKEN` is set; parallel macOS build + artifact + `softprops/action-gh-release` to attach the `.dmg`. See `docs/distribution-pipeline.md`.
- `workflows/clara-code-ide.yml` — CI for Clara Code IDE: on push to `main` (paths under `ide/clara-code/`) and `workflow_dispatch`, matrix builds `clara-voice` VSIX on macOS, Ubuntu, and Windows and uploads artifacts.
