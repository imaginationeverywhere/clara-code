# Implement `clara chat` — streaming TUI chat against the gateway

## Role
You are **Cheikh Anta Diop** implementing the `clara chat` TUI command in `packages/cli/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/1-not-started/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Pay special attention to:
- "URLs" — gateway URL is `https://api.claracode.ai/hermes` (already baked via `DEFAULT_GATEWAY_URL` in `lib/gateway.ts`)
- "Tier enforcement" — every request goes server-side, client never gates
- "Error UX" — never raw HTTP, never internal codenames, doctor as escape valve
- The forthcoming `docs/architecture/CLARA_CODE_V1_ENDPOINT_CATALOG.md` for the wire format

## Task
Promote the existing Ink TUI in `packages/cli/src/tui.tsx` to a first-class `clara chat` command (today it's wired to `clara tui`). Add streaming response support:
1. New command `chat` registered in `src/index.ts` next to `tui`. The TUI is the same component; `chat` is the canonical name.
2. POST to `gatewayUrl` with `{ platform: "tui", surface: "cli", user, message, intent: "chat" }`. Use the `intent` field — never a model name.
3. Read response as a Server-Sent Events stream when the server sets `text/event-stream`. Each event has `{ type: "delta" | "done" | "tier_lock" | "minutes", payload }`. Render deltas incrementally; on `tier_lock` show upgrade CTA; on `minutes` update the minute counter.
4. Keep the existing "Gateway URL is not configured" / "coming online" flow untouched — it's already correct.

## Acceptance
- `clara chat` enters the TUI and sends/receives a streamed response when the gateway is reachable
- `clara tui` still works (alias for backward compatibility)
- `intent: "chat"` is the wire field — no `model` field anywhere on the client
- 4xx/5xx mapped to plain English; doctor is suggested
- `npm run check` passes; existing tests still green

## Constraints
- No `HERMES_*` env vars or path strings beyond the public `/hermes` URL component
- No model names hardcoded anywhere on the client
- Never set system prompts or temperature client-side — server controls all of that

## Mo is watching
Streaming is what makes a CLI feel alive. Don't ship `chat` without streaming. One PR, target `develop`.
