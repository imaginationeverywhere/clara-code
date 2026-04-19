# Clara Code IDE (VSCodium-based)

Clara Code is a branded editor based on **VSCodium** (MIT, no Microsoft telemetry). This folder holds the **Clara Voice** built-in extension, **product.json** overrides, and scripts to merge them into a VSCodium/vscode checkout.

## Layout

| Path | Purpose |
|------|---------|
| `extensions/clara-voice/` | Built-in extension: `publisher=clara`, `name=clara-voice`, status bar voice control, Clara Dark theme, Code Lens |
| `product/clara-product-fragment.json` | Identity + telemetry-null fields merged into `vscode/product.json` |
| `product/default-settings.json` | Default settings merged into `product.json` → `defaultSettings` |
| `scripts/merge-product.mjs` | Merge fragment + defaults into a `product.json` |
| `scripts/build-platform.sh` | Package VSIX per OS tag; optional `VSCODIUM_DIR` hooks full IDE build |
| `scripts/build-vscodium.sh` | Documents manual VSCodium compile steps |

## Product identity

Merged fields include:

- `nameShort` / `nameLong`: **Clara Code**
- `applicationName`: **clara-code**
- `dataFolderName`: **`.clara-code`**
- `win32AppUserModelId`: **ClaraCode**
- Telemetry-related keys set to **null** / **0** where applicable (`statsigClientKey`, `telemetryEndpoint`, `telemetrySampleRate`)

## Clara Voice extension

- **Activation:** `onStartupFinished`
- **Status bar:** bottom bar item **Clara Voice** (left group); click or **Cmd+Shift+V** / **Ctrl+Shift+V** toggles connection
- **Server URL:** `clara.voice.serverUrl` or environment **`CLARA_VOICE_SERVER_URL`** (e.g. from AWS SSM at launch). WebSocket path defaults to `/voice/stream` under that base (see `src/extension.ts`).
- **Theme:** **Clara Dark** (`#09090F` editor background)
- **Code Lens:** one **Clara** lens on line 1 of each file when `clara.codeLens.enabled` is true

## Default settings (Hermes + Copilot off)

Defaults are in `product/default-settings.json`:

- `workbench.colorTheme`: **Clara Dark**
- `clara.ai.provider`: **clara**
- `clara.ai.hermesEndpoint`: placeholder `https://hermes.claraagents.com` (adjust for your Hermes deployment)
- GitHub Copilot suggestions disabled
- `editor.codeLens` and `clara.codeLens.enabled` enabled

## Quick: package VSIX only

```bash
cd ide/clara-code
npm run build:extension
# -> dist/clara-voice.vsix
```

Per-platform VSIX filenames (same contents; used by CI matrix):

```bash
npm run build:mac
npm run build:linux
npm run build:win
```

## Merge `product.json` in a vscode tree

After `./get_repo.sh` in [VSCodium](https://github.com/VSCodium/vscodium) (which vendors `vscode`):

```bash
node ide/clara-code/scripts/merge-product.mjs "$VSCODIUM_DIR/vscode/product.json" --out /tmp/product.clara.json
# inspect /tmp/product.clara.json, then:
cp /tmp/product.clara.json "$VSCODIUM_DIR/vscode/product.json"
```

Or in-place (writes backup `product.json.pre-clara.bak`):

```bash
node ide/clara-code/scripts/merge-product.mjs "$VSCODIUM_DIR/vscode/product.json" --in-place
```

## Install built-in extension into vscode source

```bash
rsync -a ide/clara-code/extensions/clara-voice/ "$VSCODIUM_DIR/vscode/extensions/clara-voice/"
```

Some vscode revisions require listing the folder in `build/npm/dirs.js`; follow upstream for your tag.

## Full IDE binaries

Set `VSCODIUM_DIR` to a complete VSCodium clone and follow **VSCodium** build documentation for your OS (`./build.sh` / platform scripts). Expect long compile times. `scripts/build-vscodium.sh` prints the checklist; CI does **not** run full Electron builds by default.

## Dev: run extension in VS Code / VSCodium

```bash
cd ide/clara-code/extensions/clara-voice
npm install
npm run compile
# In VS Code: Run > Open Folder, F5 "Run Extension"
```

Set `CLARA_VOICE_SERVER_URL` in the launch environment or in Settings.
