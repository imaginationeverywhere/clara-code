# CLI — Default Voice URL + Enable Voice-On in TUI

**TARGET REPO:** imaginationeverywhere/clara-code
**Packages:** `packages/cli/`
**Milestone:** `clara` → Clara greets → voice conversation, no env vars required on fresh install

---

## Context (what's already done — do NOT redo)

- ✅ `packages/cli/package.json` `name` is `"clara"` — npm publish works
- ✅ `src/index.ts` — `clara` (no args) calls `launchVoiceConverseMode()` → renders `VoiceConverseApp`
- ✅ `src/launch-voice-converse.ts` — mounts `VoiceConverseApp` via Ink
- ✅ `VoiceConverseApp` calls `playCanonicalGreeting()` on mount (greeting happens before input loop)
- ✅ `src/commands/greet.ts` uses `playCanonicalGreeting()` from `canonical-greeting.ts`
- ✅ `canonical-greeting.ts` routes through `postVoiceConverse` from `@imaginationeverywhere/clara-voice-client` — thin-client compliant

## What's Still Broken

### Gap 1 — `CLARA_VOICE_URL` has no default

`VoiceConverseApp` and `canonical-greeting.ts` both read `process.env.CLARA_VOICE_URL?.trim()` and fall back to `""`. On a fresh install with no env var set:
- Greeting fails: `"set CLARA_VOICE_URL to your voice service base URL"`
- Converse fails silently with empty base URL

**Fix:** default to `https://api.claracode.ai/api`

The voice client resolves the converse endpoint as `${base}/voice/converse`. With base = `https://api.claracode.ai/api`, this becomes `https://api.claracode.ai/api/voice/converse` — exactly where the backend mounts it (server.ts mounts `/api`, routes/index.ts mounts `/voice`, voice.ts registers `/converse`).

### Gap 2 — `HERMES_GATEWAY_URL` in `tui.tsx` is a forbidden env var name

`src/commands/tui.tsx` references `process.env.HERMES_GATEWAY_URL`. The thin-client gate blocks `HERMES_GATEWAY_URL` in any PR diff. Rename it to `CLARA_GATEWAY_URL` and default to `https://api.claracode.ai/api`.

### Gap 3 — Voice is opt-in in the TUI

`tui.tsx` passes `voiceAudioEnabled={opts.voice === true}` and exposes `--voice` flag. Voice should be on by default in `clara tui`. Default-on requires `--no-voice` to disable.

---

## Required Changes

### 1. `src/voice-converse-app.tsx` — add default URL

**File:** `packages/cli/src/voice-converse-app.tsx`

Find the `voiceBase()` function:

```typescript
// BEFORE
function voiceBase(): string {
	return process.env.CLARA_VOICE_URL?.trim() ?? "";
}
```

Replace with:

```typescript
const CLARA_VOICE_API_BASE = "https://api.claracode.ai/api";

function voiceBase(): string {
	return process.env.CLARA_VOICE_URL?.trim() || CLARA_VOICE_API_BASE;
}
```

Also update the error check that says `"CLARA_VOICE_URL is not set"` — with a default, this branch is unreachable. Remove the guard or change the message to reflect that the default is used when the env var is absent:

```typescript
// Remove or replace the guard:
// if (!base) { setGreetErr("CLARA_VOICE_URL is not set"); return; }
// The base always has a value now (defaults to CLARA_VOICE_API_BASE).
```

### 2. `src/lib/canonical-greeting.ts` — add default URL

**File:** `packages/cli/src/lib/canonical-greeting.ts`

Find the base resolution and guard:

```typescript
// BEFORE
const base = process.env.CLARA_VOICE_URL?.trim();
if (!base) {
    return { ok: false, message: "set CLARA_VOICE_URL to your voice service base URL" };
}
```

Replace with:

```typescript
const CLARA_VOICE_API_BASE = "https://api.claracode.ai/api";
const base = process.env.CLARA_VOICE_URL?.trim() || CLARA_VOICE_API_BASE;
```

Remove the `if (!base)` guard entirely — base is always set now.

> **Thin-client note:** `CLARA_VOICE_API_BASE` is our own backend domain (`api.claracode.ai`). All intelligence stays server-side. The client is simply pointing at the API proxy — this is correct and compliant.

### 3. `src/commands/tui.tsx` — rename env var + voice default

**File:** `packages/cli/src/commands/tui.tsx`

Replace the `resolveGatewayUrl` function:

```typescript
// BEFORE
function resolveGatewayUrl(opts: { gateway?: string }): string {
	const fromOpt = opts.gateway?.trim();
	if (fromOpt) return fromOpt;
	const fromEnv = process.env.HERMES_GATEWAY_URL?.trim();
	if (fromEnv) return fromEnv;
	return readClaraConfig().gatewayUrl?.trim() ?? "";
}

// AFTER
const CLARA_GATEWAY_DEFAULT = "https://api.claracode.ai/api";

function resolveGatewayUrl(opts: { gateway?: string }): string {
	const fromOpt = opts.gateway?.trim();
	if (fromOpt) return fromOpt;
	const fromEnv = process.env.CLARA_GATEWAY_URL?.trim();
	if (fromEnv) return fromEnv;
	return readClaraConfig().gatewayUrl?.trim() || CLARA_GATEWAY_DEFAULT;
}
```

Enable voice by default in `launchTui`:

```typescript
// BEFORE
voiceAudioEnabled={opts.voice === true}

// AFTER
voiceAudioEnabled={opts.voice !== false}
```

Flip the flag in `registerTuiCommand`:

```typescript
// BEFORE
.option("--voice", "Enable audio playback")

// AFTER
.option("--no-voice", "Disable audio playback (text-only mode)")
```

---

## Build + Verify

```bash
cd packages/cli
npm run typecheck   # must pass with 0 errors
npm run test        # must pass
npm run build

# Smoke test (no env vars — should use api.claracode.ai default):
node dist/index.js greet
# Expected: greeting audio plays OR prints Clara's text with fallback message

# Converse default:
node dist/index.js
# Expected: VoiceConverseApp renders, greeting plays, spacebar enters voice loop
```

## Acceptance Criteria

- [ ] `CLARA_VOICE_URL` not set → `voiceBase()` returns `"https://api.claracode.ai/api"`
- [ ] `canonical-greeting.ts` uses `api.claracode.ai/api` as default, no longer errors on missing env
- [ ] `HERMES_GATEWAY_URL` string does NOT appear anywhere in modified files
- [ ] `CLARA_GATEWAY_URL` replaces it in `tui.tsx`
- [ ] `clara tui` launches with voice ON by default; `clara tui --no-voice` disables
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] No `modal.run`, `hermes-gateway`, or `HERMES_GATEWAY_URL` strings in any diff

## Branch + PR

```bash
git checkout develop
git pull origin develop
git checkout -b prompt/2026-04-23/01-cli-voice-default-url
# make changes
git add packages/cli/src/voice-converse-app.tsx
git add packages/cli/src/lib/canonical-greeting.ts
git add packages/cli/src/commands/tui.tsx
git commit -m "feat(cli): default CLARA_VOICE_URL to api.claracode.ai/api; voice-on by default in TUI"
git push origin prompt/2026-04-23/01-cli-voice-default-url
gh pr create --base develop --title "feat(cli): default voice URL to api.claracode.ai — no env required on fresh install"
```
