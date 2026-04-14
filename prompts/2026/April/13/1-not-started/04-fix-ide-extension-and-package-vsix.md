# Fix IDE Extension Race Condition + Package VSIX

**Package:** `ide/clara-code/extensions/clara-voice/`
**Independent — can run in parallel with prompts 01, 02, and 03.**
**Goal:** Fix the WebSocket toggle race condition, compile the extension, package a VSIX.

## Context

`clara-voice` is the VS Code extension for the Clara IDE. It adds a status bar voice control
(Cmd+Shift+V / Ctrl+Shift+V toggle) and a Code Lens. The source file `src/extension.ts` is
complete but has never been compiled — `out/` is empty. There is also a race condition in the
WebSocket toggle that will cause socket leaks under fast double-clicks.

## Required Fix

### File: `ide/clara-code/extensions/clara-voice/src/extension.ts`

**Problem (M1 from code review):**
`isRecording` is set to `true` inside the `"open"` event callback. Between `new WebSocket(wsUrl)`
and the `"open"` event firing, `isRecording` is still `false`. If the user toggles twice quickly
during this window, a second socket is created without closing the first. Both open, both set
`isRecording = true`, one leaks.

**Fix:** Add an `isConnecting` guard set synchronously before the constructor, cleared on `"open"`
or `"error"`:

```typescript
let socket: WebSocket | undefined;
let isRecording = false;
let isConnecting = false;   // ADD THIS

const toggle = async (): Promise<void> => {
  const base = resolveVoiceServerUrl();
  if (!isRecording) {
    if (isConnecting) return;                // ADD THIS — guard against double-click during connect
    if (base.length === 0) {
      void vscode.window.showErrorMessage(
        "Clara Voice: set clara.voice.serverUrl or CLARA_VOICE_SERVER_URL.",
      );
      return;
    }
    const wsUrl = toWebSocketUrl(base);
    isConnecting = true;                     // ADD THIS — set synchronously before new WebSocket()
    try {
      socket = new WebSocket(wsUrl);
    } catch (e) {
      isConnecting = false;                  // ADD THIS — clear on constructor throw
      const message = e instanceof Error ? e.message : String(e);
      void vscode.window.showErrorMessage(`Clara Voice: could not connect (${message}).`);
      return;
    }
    socket.addEventListener("open", () => {
      isConnecting = false;                  // ADD THIS — clear when open
      isRecording = true;
      updateStatusLabel(status, true);
    });
    socket.addEventListener("error", () => {
      isConnecting = false;                  // ADD THIS — clear on error
      void vscode.window.showWarningMessage("Clara Voice: connection error.");
    });
    socket.addEventListener("close", () => {
      isRecording = false;
      updateStatusLabel(status, false);
      socket = undefined;
    });
    return;
  }
  socket?.close();
  socket = undefined;
  isRecording = false;
  updateStatusLabel(status, false);
};
```

That is the only code change. Do not touch anything else in `extension.ts`.

## Steps After the Fix

### Step 1 — Install dependencies

```bash
cd ide/clara-code/extensions/clara-voice
npm install
```

### Step 2 — Compile

```bash
npm run compile
```

This runs `tsc -p ./` and writes output to `out/`. Expected result: `out/extension.js` exists.

If TypeScript errors appear (other than the race condition fix), fix them — do not suppress.

### Step 3 — Verify compilation output

```bash
ls out/
```

Should show `extension.js` (and optionally `extension.js.map`, `extension.d.ts`).

### Step 4 — Package VSIX

```bash
npm run package
```

This runs `npm run compile && vsce package --no-dependencies`. Expected output: a `.vsix` file
in the extension directory (e.g., `clara-voice-0.1.0.vsix`).

```bash
ls *.vsix
```

### Step 5 — (Optional) Install the VSIX locally to verify

```bash
code --install-extension clara-voice-0.1.0.vsix
```

Or open VS Code → Extensions → Install from VSIX → select the file.

Verify: status bar should show "$(mic) Clara Voice" after install.

## Acceptance Criteria

- [ ] `isConnecting` guard added — double-click during connect does not create two sockets
- [ ] `npm run compile` completes with zero TypeScript errors
- [ ] `out/extension.js` exists after compile
- [ ] `npm run package` produces a `.vsix` file
- [ ] VSIX filename matches version in `package.json` (currently `0.1.0`)

## Do NOT

- Do not change the command IDs, key bindings, or extension API
- Do not add new features or refactor unrelated code
- Fix only the `isConnecting` race condition — nothing else
