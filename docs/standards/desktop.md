# Clara Code — Desktop (VS Code extension)

**Type:** VS Code extension (`packages/ide-extension/`)

## Auth and secrets

- **API keys:** Stored with `ExtensionContext.secrets` (`clara.apiKey`), not in `settings.json`.
- **Gateway URL:** Default is compiled into the extension (`DEFAULT_GATEWAY_URL`). Optional dev override is stored in SecretStorage (`clara.gatewayUrl`), set via the internal command `clara.setGatewayUrl` (hidden from the Command Palette).
- **User display id:** `claraCode.userId` in workspace settings — non-sensitive label only.

## Build and distribution

- Build: `npm run compile` / `npm run build` in `packages/ide-extension`.
- Package: `npm run package` produces a `.vsix` for sideload or marketplace publish.

## Code signing

- Marketplace-signed VSIX when published; local dev uses unsigned VSIX.

## Auto-update

- Updates via VS Code marketplace when published.
