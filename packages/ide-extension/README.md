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

- **Gateway URL** — Default Hermes URL is compiled into the extension (not in `settings.json`). Dev-only override: SecretStorage key `clara.gatewayUrl`, or the `clara.setGatewayUrl` command (hidden from the Command Palette; bind a keyboard shortcut or run `vscode.commands.executeCommand('clara.setGatewayUrl')` from a dev task). Empty string clears the override.
- `claraCode.userId` — display name / user id sent with requests (non-secret; stored in settings)
- `claraCode.panelMode` — use `surface: panel` and D1/D2 ultra-short copy

The default gateway URL is compiled into the extension (not in user settings). To override it for development, assign a keybinding to the command `clara.setGatewayUrl` in Keyboard Shortcuts. The value is stored in VS Code SecretStorage under `clara.gatewayUrl`, not in `settings.json`.
