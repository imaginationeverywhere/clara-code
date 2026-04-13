# Clara Code IDE changelog

## [Unreleased]

### Added

- `extensions/clara-voice` — VS Code extension (`publisher: clara`, `name: clara-voice`): Clara Dark theme (`#09090F`), status bar voice control, Code Lens, Cmd/Ctrl+Shift+V toggle; connects to `CLARA_VOICE_SERVER_URL` / `clara.voice.serverUrl`.
- `product/clara-product-fragment.json` and `product/default-settings.json` — VSCodium `product.json` merge inputs (identity, telemetry nulls, Hermes/Copilot defaults).
- `scripts/merge-product.mjs`, `build-extension.sh`, `build-platform.sh`, `build-vscodium.sh` — packaging and VSCodium integration helpers.
- `README.md` — build and merge documentation.
