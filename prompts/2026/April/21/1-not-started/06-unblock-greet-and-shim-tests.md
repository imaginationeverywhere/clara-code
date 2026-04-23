# Unblock: Wire greet.ts + Add Shim Tests

**TARGET REPO:** imaginationeverywhere/clara-code
**Branch base:** develop
**Review docs:**
- `docs/review/20260421-pr54-clara-voice-client-review.md` (C1: greet.ts, H2: --refresh)
- `docs/review/20260421-pr55-clara-distribution-review.md` (C2: shim tests)
- `docs/review/20260421-pr56-voice-client-coverage-review.md` (M1/M2/M3: outstanding items)

---

## Context

PR #56 fixed voice-client coverage and InstallSection cleanup. Two blockers remain before the CLI voice loop can work end-to-end:

1. `packages/cli/src/commands/greet.ts` still calls `/voice/respond` directly — it never calls `postVoiceConverse` from `@imaginationeverywhere/clara-voice-client`.
2. `packages/clara/bin/clara.mjs` (the npm shim) has zero tests. Required: 4 tests using `node:test`.

Start from **develop**, create branch `prompt/2026-04-21/06-greet-and-shim-fix`, make ALL changes below, run the test suites, then open a PR into develop.

---

## Part 1 — Wire greet.ts to postVoiceConverse

### 1a. Update `packages/cli/src/commands/greet.ts`

Replace the existing file. Key requirements:
- Import `postVoiceConverse` and cache helpers from `@imaginationeverywhere/clara-voice-client`
- Remove the direct `fetch` to `/voice/respond`
- Use `CLARA_VOICE_URL` env var as the voice service base (same env var it uses today)
- Flow: check cache → if miss, call `postVoiceConverse` → extract `reply_text` → POST to `/api/voice/tts` for audio → cache the audio → play via `playAudio()`
- Add `--refresh` flag: when set, skip cache read and force a fresh call
- Keep the existing `playAudio()` helper (or move it to a shared location if it's used elsewhere)

```typescript
import { Command } from 'commander';
import {
  postVoiceConverse,
  readGreetingFromCache,
  writeGreetingToCache,
} from '@imaginationeverywhere/clara-voice-client';

// ... existing imports for playAudio, resolveBackendUrl, etc.

export function makeGreetCommand(): Command {
  return new Command('greet')
    .description('Play Clara\'s greeting')
    .option('--refresh', 'Bypass cache and fetch a fresh greeting')
    .action(async (opts) => {
      const voiceBase = process.env.CLARA_VOICE_URL?.trim() ?? '';
      const backendBase = resolveBackendUrl();

      // 1. Cache check
      const fromCache = opts.refresh ? null : await readGreetingFromCache();
      if (fromCache) {
        await playAudio(fromCache.bytes, fromCache.contentType);
        return;
      }

      // 2. Fetch greeting text from voice service
      const result = await postVoiceConverse(voiceBase, { text: '' });
      if (!result.ok) {
        if (result.offline) {
          console.error('clara: voice service unavailable (offline)');
        } else {
          console.error(`clara: ${result.error}`);
        }
        return;
      }

      const text = result.reply_text;
      if (!text) {
        console.error('clara: voice service returned no greeting text');
        return;
      }

      // 3. TTS
      const ttsRes = await fetch(`${backendBase}/api/voice/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(15_000),
      }).catch(() => null);

      if (!ttsRes?.ok) {
        console.error('clara: TTS unavailable');
        return;
      }

      const contentType = ttsRes.headers.get('content-type') ?? 'audio/mpeg';
      const bytes = Buffer.from(await ttsRes.arrayBuffer());

      // 4. Cache
      await writeGreetingToCache({ bytes, contentType });

      // 5. Play
      await playAudio(bytes, contentType);
    });
}
```

### 1b. Verify `resolveBackendUrl` exists in `packages/cli/src/lib/backend.ts`

It should already be there. If `playAudio` is currently inlined in greet.ts, keep it inline (don't move it). The goal is minimal changes beyond the network call swap.

### 1c. Run the CLI test suite

```bash
cd packages/cli && npm test
```

All existing tests must pass. If greet.ts was tested before, those tests need updating to mock `postVoiceConverse` instead of `fetch`.

---

## Part 2 — Add shim tests

### 2a. Create `packages/clara/test/shim.test.mjs`

```javascript
import { test } from 'node:test';
import { strict as assert } from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const shim = join(dirname(fileURLToPath(import.meta.url)), '../bin/clara.mjs');

test('shim forwards --version to @clara/cli', () => {
  const r = spawnSync(process.execPath, [shim, '--version'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /\d+\.\d+\.\d+/);
});

test('shim forwards --help to @clara/cli', () => {
  const r = spawnSync(process.execPath, [shim, '--help'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.ok(r.stdout.length > 0 || r.stderr.length > 0, 'help should produce output');
});

test('shim exits non-zero on unknown flag', () => {
  const r = spawnSync(process.execPath, [shim, '--unknown-flag-xyz-abc'], { encoding: 'utf8' });
  assert.ok(r.status !== 0, 'unknown flag should exit non-zero');
});

test('shim forwards exit code from child', () => {
  // greet with no CLARA_VOICE_URL set exits non-zero (offline error path)
  const r = spawnSync(process.execPath, [shim, 'greet'], {
    encoding: 'utf8',
    env: { ...process.env, CLARA_VOICE_URL: '' },
  });
  // Any status is acceptable — we're testing the shim forwards it
  assert.ok(typeof r.status === 'number', 'status should be a number');
});
```

### 2b. Update `packages/clara/package.json`

Add a `test` script:

```json
"scripts": {
  "test": "node --test test/*.test.mjs"
}
```

### 2c. Run shim tests

```bash
cd packages/clara && npm install && npm test
```

All 4 tests must pass. The `--version` test validates that the shim resolves and delegates to `@clara/cli` correctly.

---

## Part 3 — Run full test suite

```bash
# From repo root
npm run check

# Voice client (should still be 13/13)
cd packages/clara-voice-client && npm test

# CLI
cd packages/cli && npm test

# Shim
cd packages/clara && npm test
```

All must pass.

---

## Acceptance Criteria

- [ ] `greet.ts` calls `postVoiceConverse` instead of fetching `/voice/respond` directly
- [ ] `--refresh` flag bypasses cache in `clara greet`
- [ ] `postVoiceConverse` failure is reported cleanly (offline vs error)
- [ ] TTS step uses `/api/voice/tts` and caches result via `writeGreetingToCache`
- [ ] `packages/clara/test/shim.test.mjs` exists with 4 passing tests
- [ ] `packages/clara/package.json` has `"test": "node --test test/*.test.mjs"`
- [ ] `npm run check` passes at root
- [ ] All existing CLI tests still pass
- [ ] PR opened into develop
