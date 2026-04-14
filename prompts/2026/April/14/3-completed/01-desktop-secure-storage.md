# Desktop Standard: Secure IDE Extension Credentials

**Flag:** `/pickup-prompt --desktop`
**Project:** clara-code
**File:** `packages/ide-extension/`

## Context

The Clara Code VS Code extension currently stores the voice gateway URL in `vscode.workspace.getConfiguration("claraCode")` — this is VS Code settings, which are visible in `settings.json` and potentially committed to git. The gateway URL exposes an internal service endpoint that must not be public.

The API key storage is already correct: `context.secrets.store("clara.apiKey", ...)` at `ClaraPanelProvider.ts:90`. The problem is `claraCode.gatewayUrl` and `claraCode.userId` in the contributes configuration.

## What Needs to Change

### 1. Remove `gatewayUrl` from VS Code configuration

In `packages/ide-extension/package.json`, the `contributes.configuration.properties` block has:
```json
"claraCode.gatewayUrl": {
  "type": "string",
  "default": "https://info-24346--hermes-gateway.modal.run",
  ...
}
```

**This URL must not be in package.json or settings.json.** It's an internal endpoint.

**Fix:** Remove `claraCode.gatewayUrl` from `contributes.configuration`. Hardcode the default gateway URL as a constant in the extension source, but make it overridable via `context.secrets` (for dev overrides only — not public settings).

```typescript
// packages/ide-extension/src/constants.ts
export const DEFAULT_GATEWAY_URL = "https://info-24346--hermes-gateway.modal.run";
export const GATEWAY_SECRET_KEY = "clara.gatewayUrl"; // dev override only
```

### 2. Read gateway URL from SecretStorage with hardcoded fallback

In `ClaraPanelProvider.ts`, replace:
```typescript
const config = vscode.workspace.getConfiguration("claraCode");
// any reference to config.get("gatewayUrl")
```

With:
```typescript
import { DEFAULT_GATEWAY_URL, GATEWAY_SECRET_KEY } from "./constants";

// In resolveWebviewView or wherever gatewayUrl is read:
const gatewayUrl = (await this._context.secrets.get(GATEWAY_SECRET_KEY)) ?? DEFAULT_GATEWAY_URL;
```

### 3. Move `userId` to globalState (already non-sensitive — just make consistent)

The `claraCode.userId` in configuration is fine as a settings.json field — it's not a secret, just a display name. Keep it in configuration but document it's non-sensitive.

### 4. Add a `clara.setGatewayUrl` command (dev-only override)

Register a hidden command so developers can set a custom gateway URL via SecretStorage without touching settings.json:

```typescript
// packages/ide-extension/src/commands/dev.ts
export function registerDevCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("clara.setGatewayUrl", async () => {
      const url = await vscode.window.showInputBox({
        prompt: "Clara gateway URL (leave blank to reset to default)",
        placeHolder: "https://...",
      });
      if (url === undefined) return; // cancelled
      if (url === "") {
        await context.secrets.delete("clara.gatewayUrl");
        vscode.window.showInformationMessage("Gateway URL reset to default.");
      } else {
        await context.secrets.store("clara.gatewayUrl", url);
        vscode.window.showInformationMessage("Gateway URL updated.");
      }
    })
  );
}
```

Register this in `extension.ts` activate function.

### 5. Add CSP nonce to webview

In `ClaraPanelProvider.ts`, the `getNonce()` function exists but verify the webview HTML uses it correctly in the Content-Security-Policy meta tag:

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none';
    script-src 'nonce-${nonce}' ${webview.cspSource};
    style-src ${webview.cspSource} 'unsafe-inline';
    connect-src https: wss:;
    img-src ${webview.cspSource} https: data:;">
```

Verify this is present in the `getHtmlForWebview()` method. If it's missing `nonce-${nonce}` on scripts, add it.

### 6. Remove gatewayUrl from contributes.configuration in package.json

Final state of `contributes.configuration.properties` should only have:
```json
{
  "claraCode.userId": {
    "type": "string",
    "default": "dev",
    "description": "Display name / user ID"
  },
  "claraCode.panelMode": {
    "type": "boolean",
    "default": false,
    "description": "Use 280px terminal-panel mode"
  }
}
```

## Acceptance Criteria

- [ ] `claraCode.gatewayUrl` is removed from `package.json` contributes.configuration
- [ ] Gateway URL is read from `context.secrets.get("clara.gatewayUrl")` with `DEFAULT_GATEWAY_URL` fallback
- [ ] `clara.setGatewayUrl` command exists for dev override (not shown in command palette by default — add `"when": "false"` to command palette visibility if needed)
- [ ] All existing API key storage (`context.secrets.store("clara.apiKey", ...)`) is unchanged
- [ ] Webview CSP has `nonce-${nonce}` on all script tags
- [ ] `npm run check` passes (tsc --noEmit)
- [ ] Extension activates without errors in VS Code Extension Development Host

## Do NOT

- Do not add new UI surfaces or panels — this is a security fix only
- Do not change how the API key is stored (it's already using SecretStorage correctly)
- Do not modify the webview React components
- Do not remove the `claraCode.userId` or `claraCode.panelMode` settings
