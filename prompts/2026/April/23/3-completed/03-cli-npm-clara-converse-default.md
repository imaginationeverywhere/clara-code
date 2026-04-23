# CLI — publish as `clara`, default entry, `/voice/converse` loop

**TARGET REPO:** `imaginationeverywhere/clara-code`  
**Issued from:** `prompts/2026/April/23/3-completed/02-clara-code-team-directive-cli-ide-conversation.md`  
**Priority:** 1 (ship before desktop/website/pipeline)

## Goal

- npm package name **`clara`** (unscoped) on the public registry, `bin` → `clara`, so `npm install -g clara@latest` and `npx clara@latest` work as in the product spec.
- **Default** `clara` (no subcommand): Clara voice greeting, then **push-to-talk** (space) conversation loop using **`POST /voice/converse`** via `@imaginationeverywhere/clara-voice-client` (`postVoiceConverse`), not legacy `/voice/respond` only.
- macOS + Linux; document Windows as stretch.
- **Env:** `CLARA_VOICE_URL` (quikvoice base), optional `CLARA_VOICE_API_KEY` (Bearer for cp-team).

## Acceptance

- `clara greet` and default `clara` both hit `/voice/converse` for turns; offline behavior matches `clara-voice-client` (graceful fail, no throw on network).
- `npm run check` passes for touched packages.

## Dependencies

- Blocker until available: quikvoice `POST /voice/converse` + API key; until then use dev stub or legacy fallback where already implemented.

## References

- `packages/clara-voice-client/README.md`, `src/converse.ts`
- `packages/cli/src/commands/greet.ts` (greeting path already prefers converse + audio)
