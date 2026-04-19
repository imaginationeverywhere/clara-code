# Desktop Application Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --desktop`

Applies to: VS Code fork (Clara Code IDE), Electron apps, Tauri apps, VS Code extensions.

---

## CRITICAL RULES

### 1. Auth cannot use web redirect flows — use PKCE + loopback

Desktop apps cannot receive OAuth redirects the same way web apps can.

**FORBIDDEN:**
```typescript
// ❌ Web OAuth redirect — breaks in desktop context
window.location.href = `https://clerk.com/oauth/authorize?redirect_uri=https://myapp.com/callback`;
```

**REQUIRED (VS Code extension / Electron):**
```typescript
// ✅ PKCE flow with loopback server
import * as vscode from "vscode";

export async function signIn() {
  // 1. Open external browser for auth
  await vscode.env.openExternal(vscode.Uri.parse(
    `${CLERK_DOMAIN}/sign-in?redirect_uri=${encodeURIComponent("vscode://claracode.clara-code/auth/callback")}`
  ));
  // 2. VS Code handles vscode:// URI scheme and receives token
  // 3. Token stored in vscode.SecretStorage — NOT localStorage, NOT config
}
```

---

### 2. Secrets in SecretStorage — never in settings.json or localStorage

```typescript
// ✅ VS Code SecretStorage (encrypted by OS keychain)
const secrets = context.secrets;
await secrets.store("claracode.apiKey", apiKey);
const apiKey = await secrets.get("claracode.apiKey");

// ❌ settings.json — readable by any extension
vscode.workspace.getConfiguration("claracode").update("apiKey", apiKey);

// ❌ localStorage — not available in extension host context
localStorage.setItem("apiKey", apiKey);
```

---

### 3. IPC communication pattern (Electron)

```typescript
// ✅ Main process: expose only what's needed via contextBridge
// preload.ts
contextBridge.exposeInMainWorld("claraAPI", {
  getApiKey: () => ipcRenderer.invoke("get-api-key"),
  setApiKey: (key: string) => ipcRenderer.invoke("set-api-key", key),
});

// ✅ Main process: handle IPC with input validation
ipcMain.handle("set-api-key", async (event, key: string) => {
  if (typeof key !== "string" || !key.startsWith("sk-clara-")) {
    throw new Error("Invalid API key format");
  }
  await safeStorage.encryptString(key); // OS-level encryption
});

// ❌ Never use ipcRenderer.sendSync — blocks the renderer process
// ❌ Never expose node: modules directly via contextBridge
```

---

### 4. Extension manifest (package.json) requirements

Every Clara Code VS Code extension MUST include:

```json
{
  "engines": { "vscode": "^1.85.0" },
  "activationEvents": ["onStartupFinished"],
  "contributes": {
    "commands": [/* all commands registered here */],
    "configuration": {
      "title": "Clara Code",
      "properties": {
        "claracode.apiKey": {
          "type": "string",
          "description": "Your Clara Code API key",
          "scope": "application"
          // ⚠️ API key stored here only as fallback — prefer SecretStorage
        }
      }
    }
  }
}
```

---

### 5. Build and package standard

```bash
# VS Code Extension
npm run package        # produces .vsix file
vsce publish           # publish to marketplace

# Electron
npm run dist           # electron-builder → .dmg / .exe / .AppImage
# Code signing: ALWAYS sign on macOS (notarization required for Gatekeeper)
# Windows: Authenticode certificate required for SmartScreen

# Never ship unsigned desktop apps to production users
```

---

### 6. Auto-update pattern

```typescript
// ✅ Electron: use electron-updater, never manual download prompts
import { autoUpdater } from "electron-updater";

app.on("ready", () => {
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on("update-available", () => {
  // Show non-blocking notification — never force-close the app
});
```

---

### Heru-specific tech doc required

Each Heru MUST have `docs/standards/desktop.md` that documents:
- Type of desktop app (VS Code extension / Electron / Tauri)
- Auth flow used (PKCE + loopback / OS keychain / other)
- How build artifacts are distributed (marketplace / direct download / EAS)
- Code signing certificates and where they're stored (SSM path)
- Auto-update endpoint

If `docs/standards/desktop.md` does not exist, create it.
