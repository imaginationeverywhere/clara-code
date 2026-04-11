# Clara Code (VS Code extension)

Sidebar webview (`clara.panel`) that talks to the Clara Hermes gateway with VRD-001 surface scripts (`surface: ide` or `surface: panel`).

## Build

```bash
npm install
npm run compile
```

## Package

```bash
npm run package
```

Install locally: `code --install-extension clara-code-0.1.0.vsix`

## Configuration

- `claraCode.gatewayUrl` — Modal gateway (default: Hermes URL in manifest)
- `claraCode.userId` — user id sent with requests
- `claraCode.panelMode` — use `surface: panel` and D1/D2 ultra-short copy
