# Code Review — PR #54 clara-voice-client pickup
**Date:** 2026-04-21
**Branch:** `prompt/2026-04-23/clara-voice-client-pickup → develop`
**Reviewer:** HQ Code Review (ultrathink pass)
**PR:** https://github.com/imaginationeverywhere/clara-code/pull/54

---

## ⚠️ COVERAGE REQUIREMENT CHECK

**Status: ❌ FAIL — Review BLOCKED on coverage**

| File | Lines | Tests | Estimated Coverage | Status |
|------|-------|-------|--------------------|--------|
| `packages/clara-voice-client/src/converse.ts` | 113 | 3 tests (partial) | ~50% | ❌ FAIL |
| `packages/clara-voice-client/src/greeting-cache.ts` | 67 | 0 tests | 0% | ❌ FAIL |
| `packages/clara-voice-client/src/index.ts` | 12 | re-exports only | ~100% | ✅ |
| `packages/cli/src/commands/greet.ts` | ~90 | 0 new tests | 0% new | ❌ FAIL |

**Estimated overall changed-file coverage: ~25–35%**
**Required: 80%**
**Deficit: ~45–55%**

The test file covers 3 cases:
1. `resolveConverseUrl` strips trailing slash (1 input, 1 branch covered)
2. `postVoiceConverse` JSON success against a real test HTTP server ✅
3. `postVoiceConverse` offline-safe on bad host ✅

`greeting-cache.ts` is entirely untested. The updated `greet.ts` in CLI has no new tests.

---

## Executive Summary

- **Files Changed:** 9 source files, 4 prompt files
- **Test Coverage:** ~25–35% (❌ below 80% threshold)
- **Issues Found:** 8 (2 critical, 2 high, 4 medium/low)
- **Overall Grade:** C+ (good design foundation, incomplete integration + coverage)
- **Review Status:** ❌ BLOCKED — do not merge until critical issues resolved

---

## 🔴 Critical Issues

### C1 — CLI `greet.ts` does not use `postVoiceConverse`

**File:** `packages/cli/src/commands/greet.ts`
**Impact:** The core deliverable of this PR — wiring the CLI to `/voice/converse` — was not completed.

The pickup built the `postVoiceConverse` function correctly in `clara-voice-client`. The updated `greet.ts` imports only the **cache functions** from the new package and continues to call the old `/voice/respond` endpoint directly:

```typescript
// What was shipped (greet.ts)
import { readGreetingFromCache, writeGreetingToCache } from "@imaginationeverywhere/clara-voice-client";
// ...
function voiceRespondUrl(): string | null {
  const base = process.env.CLARA_VOICE_URL?.trim();
  return `${base.replace(/\/$/, "")}/voice/respond`;  // OLD endpoint
}
```

`postVoiceConverse` is never called. The new package's primary function (`postVoiceConverse`) is fully implemented but not yet integrated into the CLI.

**Required fix:** Replace the raw `fetch` in `greet.ts` with `postVoiceConverse`. The cache TTL (prompt 03–06) can wire the network step properly:

```typescript
import { postVoiceConverse, readGreetingFromCache, writeGreetingToCache } from "@imaginationeverywhere/clara-voice-client";

const voiceBase = process.env.CLARA_VOICE_URL?.trim() ?? "";
const result = await postVoiceConverse(voiceBase, { text: "" });
// then TTS step for reply_text, or decode reply_audio_base64
```

---

### C2 — Test coverage is ~25–35%, far below the 80% requirement

**Files:** All changed source files
**Impact:** Code cannot be considered production-ready. Filesystem operations, error paths, and JSON aliasing are all untested.

`greeting-cache.ts` (67 lines) has zero tests despite containing:
- XDG env var parsing
- `mkdir({ recursive: true })` that can fail
- `readFile` that can fail silently
- Empty-buffer guard (`bytes.length === 0 → null`)
- Optional mime file with fallback

`converse.ts` (113 lines) tests only 2 of ~8 distinct code paths.

---

## 🟠 High Issues

### H1 — `postVoiceConverse` consumes and drops audio bytes for `audio/*` responses

**File:** `packages/clara-voice-client/src/converse.ts:68–90`

```typescript
const text = await response.text().catch(() => "");  // ← consumes the stream
// ...
if (contentType.startsWith("audio/")) {
  return {
    ok: true,
    mime_type: contentType,
    // ← bytes are GONE — text() already read them as a string
    rawJson: { _note: "audio/ response: prefer fetch+arrayBuffer in a thin wrapper" },
  };
}
```

If the Hermes gateway ever returns raw audio (which the old `/voice/respond` endpoint does), callers of `postVoiceConverse` receive `ok: true` with no usable bytes. The note in `rawJson` is a hint, not a solution. The caller has no way to get the audio.

**Required fix:** Read the body as `ArrayBuffer` for audio responses, or document clearly that `/voice/converse` is JSON-only and audio must be fetched separately:

```typescript
// Option A: ArrayBuffer path for audio
if (contentType.startsWith("audio/")) {
  const arrayBuf = Buffer.from(await response.arrayBuffer());
  return { ok: true, mime_type: contentType, reply_audio_bytes: arrayBuf };
}

// Option B: Document JSON-only contract at the top of the function
// and remove the audio/* branch entirely (simplifies the API)
```

The simpler Option B is better if Hermes always returns JSON with `reply_text` + optional `reply_audio_base64`.

---

### H2 — No cache TTL or invalidation

**File:** `packages/clara-voice-client/src/greeting-cache.ts` + `packages/cli/src/commands/greet.ts`

The cache never expires. Once written:
- Clara's voice could change (Voxtral update) → cached greeting still plays old voice
- The greeting text could change → cached version plays forever
- Cache could be corrupted (truncated write) → `bytes.length === 0` guard catches empty but not partial corruption

**Minimum fix:** Add a `--refresh` flag to `clara greet` that bypasses the cache. The cache itself doesn't need a TTL for v1, but the manual escape hatch is necessary.

```typescript
.option("--refresh", "Ignore cache and fetch fresh greeting")
// In action:
const fromCache = opts.refresh ? null : await readGreetingFromCache();
```

---

## 🟡 Medium Issues

### M1 — Five untested code paths in `converse.ts`

| Path | Lines | Impact |
|------|-------|--------|
| HTTP 4xx/5xx response parsing | ~55–65 | Server errors return wrong shape |
| `replyText` camelCase alias | ~70 | Hermes gateway uses `reply` not `reply_text` |
| `text` / `transcript` aliases | ~71–73 | Compatibility aliases untested |
| AbortError (abort signal) | ~105–108 | Cancellation behavior untested |
| Empty JSON object `{}` response | ~80–90 | Falls through to `reply_text: text` |

The Hermes gateway (from Slack: `hermes-gateway.modal.run`) returns `{ reply }` — not `reply_text`, `replyText`, or `text`. The existing alias list does **not** include `reply`. Add it:

```typescript
const reply_text =
  (typeof o.reply === "string" && o.reply) ||       // ← ADD: Hermes canonical
  (typeof o.reply_text === "string" && o.reply_text) ||
  (typeof o.replyText === "string" && o.replyText) ||
  (typeof o.text === "string" && o.text) ||
  (typeof o.transcript === "string" && o.transcript) ||
  undefined;
```

---

### M2 — `resolveConverseUrl("")` returns a relative path, not an error

**File:** `packages/clara-voice-client/src/converse.ts:28–32`

```typescript
if (b.length === 0) {
  return "/voice/converse";  // ← relative path
}
```

`postVoiceConverse` correctly catches this (`!url.startsWith("http")`) but the behavior of `resolveConverseUrl` itself is surprising — it returns a path that looks valid to a caller who doesn't also call `postVoiceConverse`. The function should either throw or return `null` for an empty base, or the guard should live inside `resolveConverseUrl`.

---

### M3 — `@imaginationeverywhere/clara-voice-client` is set to public npm

**File:** `packages/clara-voice-client/package.json`

```json
"publishConfig": { "access": "public" }
```

Project memory says: "@claracode/sdk is NOT on npm; gated API key + subscription." The voice client is lower-level than the SDK, but publishing it publicly exposes the internal `postVoiceConverse` API shape and the Hermes endpoint structure before we're ready. Confirm intent with Mo before merging.

---

### M4 — `packages/create-clara-app/bin/index.js` untracked

The pickup report noted this file was not staged. An untracked generated file in a package that should be committed (or gitignored) is a loose end. Verify: is this a build artifact that should be in `.gitignore`, or a source file that needs to be committed?

```bash
# Check
git status packages/create-clara-app/
# If it's a generated file, add to .gitignore:
echo "packages/create-clara-app/bin/index.js" >> .gitignore
```

---

## ✅ Positive Findings

1. **Offline-safe design is correct.** `postVoiceConverse` catches all network errors and returns `{ ok: false, offline: true }` — never throws. This is the right pattern for CLI tools on unreliable connections.

2. **Real HTTP test server (no mock fetch).** `test/converse.test.ts` spins up a real `node:http` server. This is the right approach — mocking `fetch` would hide content-type parsing bugs. Keep this pattern.

3. **XDG cache directory** is correctly prioritized over `~/.cache`. Good cross-platform hygiene.

4. **Discriminated union type** (`ConverseResult = ConverseSuccess | ConverseFailure`) forces callers to check `result.ok` before accessing fields. No nullable field confusion.

5. **AbortSignal support** in `postVoiceConverse` — needed for TUI cancel flows. Good forward design.

6. **`prebuild` chain in CLI** (`npm run build -w @imaginationeverywhere/clara-voice-client`) ensures the voice client is compiled before tsc sees it. Correct workspace dependency ordering.

7. **Separate mime file** in cache (`greeting-canonical` + `greeting-canonical.mime`) is clean and avoids embedding metadata inside the binary blob.

8. **`tsup` + `dts: true`** — the voice client ships proper `.d.ts` declarations so CLI and desktop both get type-safe imports.

---

## Required Actions Before Merge

### Blockers (must fix)

1. **Add tests for `greeting-cache.ts`** — at minimum: cache miss returns null, write + read roundtrip works, empty-buffer guard, XDG env var path.

2. **Add tests for untested `converse.ts` paths** — HTTP 4xx response, abort signal, `replyText`/`text` aliases, empty JSON object.

3. **Wire `postVoiceConverse` into `greet.ts`** — remove the direct `fetch` to `/voice/respond`, use the new function. If this belongs in prompt 03 (the npm alias prompt), document that explicitly and keep the two prompts sequenced.

4. **Add `reply` to the field alias list** — Hermes gateway returns `{ reply }`, not `{ reply_text }`.

### Should-fix (before v1 ship)

5. **Add `--refresh` flag** to `clara greet` to bypass cache.

6. **Fix the audio bytes drop** in `postVoiceConverse` — either add `ArrayBuffer` path or document JSON-only contract clearly.

7. **Confirm public npm publish intent** with Mo — if yes, proceed; if gated, change `publishConfig.access` to `restricted`.

### Low priority

8. **Resolve `create-clara-app/bin/index.js`** — commit it or gitignore it.

---

## Tests That Need to Be Written

```typescript
// greeting-cache.ts tests
test("readGreetingFromCache returns null on cache miss", async () => { ... });
test("writeGreetingToCache + readGreetingFromCache roundtrip", async () => { ... });
test("readGreetingFromCache returns null for empty bytes file", async () => { ... });
test("readGreetingFromCache uses 'application/octet-stream' when mime file missing", async () => { ... });
test("defaultCacheDirectory uses XDG_CACHE_HOME when set", () => { ... });

// converse.ts additional tests
test("postVoiceConverse returns {ok: false} on HTTP 4xx", async () => { ... });
test("postVoiceConverse maps 'replyText' camelCase alias", async () => { ... });
test("postVoiceConverse maps 'reply' field from Hermes gateway", async () => { ... });
test("postVoiceConverse returns {ok: false, error: 'Aborted'} on abort signal", async () => { ... });
test("resolveConverseUrl with no-trailing-slash base", () => { ... });
test("postVoiceConverse with empty base returns configuration error", async () => { ... });
```

---

## Verdict

The foundation is solid — good types, correct offline-safety, right test approach. But the primary integration goal (CLI uses `/voice/converse` via `postVoiceConverse`) was not completed, and coverage is ~30% where 80% is required.

**Do not merge PR #54 until blockers C1 and C2 are resolved.**

Prompts 03–06 should be held until this PR is green.
