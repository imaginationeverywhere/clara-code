# Template: Electron desktop (Step 7)

## Role

**Primary:** Desktop · **Secondary:** Security

## Goal

Desktop shell (Electron or aligned pattern) with **PKCE / loopback auth**, **contextBridge** IPC, **SecretStorage** for tokens — per `.claude/standards/desktop.md` when present.

## Constraints

- No Node APIs exposed to renderer.
- Signed builds for distribution; CSP on webviews in production.

## Acceptance

- [ ] Auth flow documented
- [ ] Update channel / versioning strategy noted
