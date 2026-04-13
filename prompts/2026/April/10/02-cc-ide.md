# 02 — Clara Code IDE panel (VS Code extension)

**Archived for:** `prompts/2026/April/12/S2-02-web-ui-dispatch.md`  
**Target branch (original spec):** `feat/ide-complete`  
**Implementation in repo:** `packages/ide-extension/`

## Scope

- Sidebar webview (`clara.panel`), voice bar, agent-facing status, settings aligned with VRD-001 / surface scripts (`surface: ide` | `surface: panel`).
- Gateway configuration: `claraCode.gatewayUrl`, `claraCode.userId`, `claraCode.panelMode`.

## Verification

```bash
cd packages/ide-extension
npm install
npm run compile
```

Install VSIX locally per `packages/ide-extension/README.md`.

## Notes

The April 10 copy on QCS1 was not present in this clone when S2-02 ran; this file records the canonical paths and acceptance checks for that prompt id.
