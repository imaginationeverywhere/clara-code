# Desktop IDE — Tauri, Clara side panel, `.dmg`, R2

**TARGET REPO:** `imaginationeverywhere/clara-code`  
**Issued from:** `prompts/2026/April/23/3-completed/02-clara-code-team-directive-cli-ide-conversation.md`  
**Priority:** 2 (after CLI)

## Goal

- Tauri app under `desktop/`: editor area + **Clara conversation** side panel.
- Same voice loop as CLI: greet → push-to-talk → `postVoiceConverse` / shared client.
- Ship **`.dmg`** for macOS this milestone; Windows `.exe` later.
- Host installer on **Cloudflare R2** (or equivalent) and link from `claracode.ai` download CTA.

## Acceptance

- Local `desktop` build produces a signed-notarized path is out of scope if secrets missing; at minimum reproducible `pnpm`/`npm` build script and CI artifact.
- Voice panel uses `@imaginationeverywhere/clara-voice-client` (workspace).

## References

- `desktop/README.md`, `desktop/src/voice-overlay.ts`
- `docs/standards/desktop.md` (if present in this Heru)
