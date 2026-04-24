# Unblock PR #54 and PR #55 — Tests + Integration Fixes

**TARGET REPO:** imaginationeverywhere/clara-code
**Branches:** `prompt/2026-04-23/clara-voice-client-pickup` (PR #54) and `prompt/2026-04-23/clara-distribution` (PR #55)

Both PRs are blocked by code review. Fix all blockers in this prompt, then push each branch so the PRs can be merged.

---

## Part 1 — Fix PR #54 (`prompt/2026-04-23/clara-voice-client-pickup`)

```bash
git checkout prompt/2026-04-23/clara-voice-client-pickup
git pull origin prompt/2026-04-23/clara-voice-client-pickup
```

### Fix 1a — Add `reply` field alias to `converse.ts`

**File:** `packages/clara-voice-client/src/converse.ts`

The Hermes gateway at `hermes-gateway.modal.run` returns `{ reply }` — not `reply_text`, `replyText`, or `text`. The current alias list misses it entirely, meaning the live gateway always returns `reply_text: undefined`.

Find the reply field extraction block and add `reply` as the first (highest priority) alias:

```typescript
// Before
const reply_text =
  (typeof o.reply_text === "string" && o.reply_text) ||
  (typeof o.replyText === "string" && o.replyText) ||
  (typeof o.text === "string" && o.text) ||
  (typeof o.transcript === "string" && o.transcript) ||
  undefined;

// After
const reply_text =
  (typeof o.reply === "string" && o.reply) ||           // Hermes gateway canonical
  (typeof o.reply_text === "string" && o.reply_text) ||
  (typeof o.replyText === "string" && o.replyText) ||
  (typeof o.text === "string" && o.text) ||
  (typeof o.transcript === "string" && o.transcript) ||
  undefined;
```

### Fix 1b — Add missing tests to `converse.test.ts`

**File:** `packages/clara-voice-client/test/converse.test.ts`

Append these tests to the existing file (do not replace the existing 3 tests):

```typescript
// Test: HTTP 4xx returns ok: false
void test("postVoiceConverse returns {ok:false} on HTTP 4xx", async (t) => {
  const server: Server = createServer((req, res) => {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "bad request" }));
  });
  const port: number = await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const a = server.address();
      assert.ok(a && typeof a === "object" && "port" in a);
      resolve((a as { port: number }).port);
    });
  });
  t.after(() => new Promise<void>((r) => server.close(() => r())));

  const result = await postVoiceConverse(`http://127.0.0.1:${port}`, { text: "x" });
  assert.equal(result.ok, false);
});

// Test: Hermes 'reply' field alias
void test("postVoiceConverse maps Hermes 'reply' field", async (t) => {
  const server: Server = createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ reply: "hello from hermes" }));
  });
  const port: number = await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const a = server.address();
      assert.ok(a && typeof a === "object" && "port" in a);
      resolve((a as { port: number }).port);
    });
  });
  t.after(() => new Promise<void>((r) => server.close(() => r())));

  const result = await postVoiceConverse(`http://127.0.0.1:${port}`, { text: "ping" });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.reply_text, "hello from hermes");
  }
});

// Test: 'replyText' camelCase alias
void test("postVoiceConverse maps 'replyText' camelCase alias", async (t) => {
  const server: Server = createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ replyText: "camel case reply" }));
  });
  const port: number = await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const a = server.address();
      assert.ok(a && typeof a === "object" && "port" in a);
      resolve((a as { port: number }).port);
    });
  });
  t.after(() => new Promise<void>((r) => server.close(() => r())));

  const result = await postVoiceConverse(`http://127.0.0.1:${port}`, { text: "ping" });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.reply_text, "camel case reply");
  }
});

// Test: empty base URL returns configuration error without throwing
void test("postVoiceConverse with empty base returns configuration error", async () => {
  const result = await postVoiceConverse("", { text: "x" });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.error.length > 0);
    assert.equal(result.offline, undefined); // not an offline error, a config error
  }
});

// Test: abort signal returns {ok: false, error: 'Aborted'}
void test("postVoiceConverse respects abort signal", async (t) => {
  const server: Server = createServer((_req, res) => {
    // Never respond — simulates a slow server
    void t.after(() => new Promise<void>((r) => server.close(() => r())));
  });
  const port: number = await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const a = server.address();
      assert.ok(a && typeof a === "object" && "port" in a);
      resolve((a as { port: number }).port);
    });
  });

  const ac = new AbortController();
  const promise = postVoiceConverse(`http://127.0.0.1:${port}`, { text: "x" }, { signal: ac.signal });
  ac.abort();
  const result = await promise;
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error, "Aborted");
  }
});
```

### Fix 1c — Create `packages/clara-voice-client/test/greeting-cache.test.ts`

Create this new file:

```typescript
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { strict as assert } from "node:assert/strict";
import { readGreetingFromCache, writeGreetingToCache } from "../src/greeting-cache.js";

// Isolated temp directory per test run
const testDir = join(tmpdir(), `clara-cache-test-${Date.now()}`);

// Override XDG_CACHE_HOME so tests never touch ~/.cache/clara-code
process.env.XDG_CACHE_HOME = testDir;

test("readGreetingFromCache returns null when cache directory is missing", async () => {
  await rm(testDir, { recursive: true, force: true });
  const result = await readGreetingFromCache();
  assert.equal(result, null);
});

test("writeGreetingToCache + readGreetingFromCache roundtrip", async () => {
  await rm(testDir, { recursive: true, force: true });

  const bytes = Buffer.from("fake-audio-bytes");
  const contentType = "audio/mpeg";
  await writeGreetingToCache({ bytes, contentType });

  const result = await readGreetingFromCache();
  assert.ok(result !== null);
  assert.deepEqual(result!.bytes, bytes);
  assert.equal(result!.contentType, contentType);
});

test("readGreetingFromCache returns null when data file is empty", async () => {
  await rm(testDir, { recursive: true, force: true });
  await mkdir(join(testDir, "clara-code"), { recursive: true });
  await writeFile(join(testDir, "clara-code", "greeting-canonical"), Buffer.alloc(0));

  const result = await readGreetingFromCache();
  assert.equal(result, null);
});

test("readGreetingFromCache uses octet-stream when mime file is missing", async () => {
  await rm(testDir, { recursive: true, force: true });
  await mkdir(join(testDir, "clara-code"), { recursive: true });
  await writeFile(join(testDir, "clara-code", "greeting-canonical"), Buffer.from("audio"));
  // No mime file written

  const result = await readGreetingFromCache();
  assert.ok(result !== null);
  assert.equal(result!.contentType, "application/octet-stream");
});

test("defaultCacheDirectory uses XDG_CACHE_HOME when set", async () => {
  const { defaultCacheDirectory } = await import("../src/greeting-cache.js");
  const dir = defaultCacheDirectory();
  assert.ok(dir.startsWith(testDir), `Expected dir to start with ${testDir}, got ${dir}`);
});
```

### Fix 1d — Wire `postVoiceConverse` into `greet.ts`

**File:** `packages/cli/src/commands/greet.ts`

The current greet command uses the old `/voice/respond` endpoint directly. Replace the network fetch with `postVoiceConverse` from the voice client, then use `/api/voice/tts` to get audio.

Replace the entire file content:

```typescript
import { randomBytes } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  postVoiceConverse,
  readGreetingFromCache,
  writeGreetingToCache,
} from "@imaginationeverywhere/clara-voice-client";
import type { Command } from "commander";
import { resolveBackendUrl, resolveGatewayUrl } from "../lib/backend.js";
import { readClaraConfig } from "../lib/config-store.js";
import { playAudioFile } from "../lib/play-audio-file.js";

function extensionForContentType(contentType: string | null): string {
  if (!contentType) return ".bin";
  const lower = contentType.toLowerCase();
  if (lower.includes("mpeg") || lower.includes("mp3")) return ".mp3";
  if (lower.includes("wav")) return ".wav";
  if (lower.includes("ogg")) return ".ogg";
  if (lower.includes("webm")) return ".webm";
  return ".bin";
}

export function registerGreetCommand(program: Command): void {
  program
    .command("greet")
    .description("Request Clara's voice greeting and play the audio")
    .option("--refresh", "Bypass cache and fetch a fresh greeting")
    .action(async (opts: { refresh?: boolean }) => {
      // 1. Cache-first (unless --refresh)
      if (!opts.refresh) {
        const fromCache = await readGreetingFromCache();
        if (fromCache) {
          const ext = extensionForContentType(fromCache.contentType);
          const outPath = join(tmpdir(), `clara-greet-cached-${randomBytes(8).toString("hex")}${ext}`);
          await writeFile(outPath, fromCache.bytes);
          try {
            await playAudioFile(outPath);
          } finally {
            await unlink(outPath).catch(() => {});
          }
          return;
        }
      }

      // 2. Fetch greeting text from Hermes gateway
      const gatewayUrl = resolveGatewayUrl();
      const backend = resolveBackendUrl();
      const userId = readClaraConfig().userId ?? "dev";

      const converseResult = await postVoiceConverse(gatewayUrl, {
        text: "",
        session_id: userId,
      });

      if (!converseResult.ok) {
        console.error(
          `clara greet: gateway error — ${converseResult.error}${converseResult.offline ? " (offline)" : ""}`
        );
        process.exitCode = 1;
        return;
      }

      const greetText =
        converseResult.reply_text ??
        "Hello! I'm Clara. Ready when you are.";

      // 3. Convert greeting text to audio via TTS
      let res: Response;
      try {
        res = await fetch(`${backend.url}/api/voice/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: greetText }),
          signal: AbortSignal.timeout(15_000),
        });
      } catch (err) {
        // TTS unavailable — print text fallback, not an error
        console.log(`Clara: ${greetText}`);
        return;
      }

      if (!res.ok) {
        console.log(`Clara: ${greetText}`);
        return;
      }

      const buf = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get("content-type") ?? "audio/mpeg";
      const mimeForCache = contentType.split(";")[0]!.trim();

      // 4. Cache then play
      try {
        await writeGreetingToCache({ bytes: buf, contentType: mimeForCache });
      } catch {
        // best-effort cache write
      }

      const ext = extensionForContentType(contentType);
      const outPath = join(tmpdir(), `clara-greet-${randomBytes(8).toString("hex")}${ext}`);
      await writeFile(outPath, buf);
      try {
        await playAudioFile(outPath);
      } finally {
        await unlink(outPath).catch(() => {});
      }
    });
}
```

Also ensure `resolveGatewayUrl` is exported from `packages/cli/src/lib/backend.ts`. If it's not there yet, add:

```typescript
const DEFAULT_GATEWAY_URL = "https://info-24346--hermes-gateway.modal.run";

export function resolveGatewayUrl(flag?: string): string {
  const fromFlag = flag?.trim();
  if (fromFlag) return stripTrailingSlash(fromFlag);
  const fromEnv = process.env.HERMES_GATEWAY_URL?.trim();
  if (fromEnv) return stripTrailingSlash(fromEnv);
  const cfg = readClaraConfig();
  const fromConfig = cfg.gatewayUrl?.trim();
  if (fromConfig) return stripTrailingSlash(fromConfig);
  return DEFAULT_GATEWAY_URL;
}
```

### Verify PR #54 changes

```bash
cd packages/clara-voice-client
npm run test
# Expect: 8 tests passing (3 original + 5 new)

cd ../cli
npm run typecheck
```

### Commit and push PR #54 fixes

```bash
git add packages/clara-voice-client/src/converse.ts
git add packages/clara-voice-client/test/converse.test.ts
git add packages/clara-voice-client/test/greeting-cache.test.ts
git add packages/cli/src/commands/greet.ts
git add packages/cli/src/lib/backend.ts
git commit -m "fix: add missing tests + wire postVoiceConverse into greet.ts

- Add reply/replyText/abort/4xx/empty-base tests to converse.test.ts
- Add greeting-cache.test.ts (5 tests: roundtrip, empty, no-mime, XDG, cache-miss)
- Add 'reply' alias to converse.ts field extraction (Hermes canonical field)
- Wire greet.ts to use postVoiceConverse + TTS instead of /voice/respond
- Add --refresh flag to bypass cache
- Export resolveGatewayUrl from backend.ts with Hermes default URL"

git push origin prompt/2026-04-23/clara-voice-client-pickup
```

---

## Part 2 — Fix PR #55 (`prompt/2026-04-23/clara-distribution`)

```bash
git checkout prompt/2026-04-23/clara-distribution
git pull origin prompt/2026-04-23/clara-distribution
```

### Fix 2a — Remove broken beta install command from `InstallSection.tsx`

**File:** `frontend/src/components/marketing/InstallSection.tsx`

`npx github:imaginationeverywhere/clara-code` runs the monorepo root (`pi-monorepo`, private, no bin). It doesn't work. Remove the "Try the beta" block.

Also fix the Node.js version from "18+" to "20+".

**Find and remove** the entire "Try the beta" inner div (the block containing `betaCmd`, the copy button, and the `handleCopy` logic). After removal:

1. Delete the `betaCmd` const and `handleCopy` function and `copied` state — they're no longer used.
2. Remove the imports for `IconCheckCircle`, `IconCopy` if they're no longer used elsewhere.
3. In the footer of the CLI card, change:
   ```tsx
   <span className="font-mono text-[11px] text-white/25">Node.js 18+ required</span>
   ```
   to:
   ```tsx
   <span className="font-mono text-[11px] text-white/25">Node.js 20+ required</span>
   ```

The CLI card should now show only:
- The "Coming Soon" badge
- The greyed-out install commands as visual reference (`npm install -g clara@latest`, `npx clara@latest`, `npm i -g @clara/cli`)
- Footer with "Node.js 20+ required" and GitHub link

No interactive copy button until the package is actually published.

### Fix 2b — Add shim tests

**Create file:** `packages/clara/test/shim.test.mjs`

```javascript
import { test } from "node:test";
import { strict as assert } from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const shim = join(dirname(fileURLToPath(import.meta.url)), "../bin/clara.mjs");

test("shim --version exits 0 and prints a version string", () => {
  const r = spawnSync(process.execPath, [shim, "--version"], { encoding: "utf8" });
  assert.equal(r.status, 0, `expected exit 0, got ${r.status}\nstderr: ${r.stderr}`);
  assert.match(r.stdout.trim(), /\d+\.\d+\.\d+/, "expected semver in stdout");
});

test("shim --help exits 0 and prints usage", () => {
  const r = spawnSync(process.execPath, [shim, "--help"], { encoding: "utf8" });
  assert.equal(r.status, 0, `expected exit 0, got ${r.status}\nstderr: ${r.stderr}`);
  assert.ok(
    r.stdout.includes("clara") || r.stdout.includes("Usage"),
    `expected usage text, got: ${r.stdout.slice(0, 200)}`
  );
});

test("shim forwards non-zero exit code from CLI", () => {
  // 'hello' is a stub command that exits 1
  const r = spawnSync(process.execPath, [shim, "hello"], { encoding: "utf8" });
  assert.notEqual(r.status, 0, "expected non-zero exit from stub hello command");
  assert.equal(r.error, undefined, `unexpected spawn error: ${r.error}`);
});

test("shim passes unknown flag to CLI (not shim error)", () => {
  // An unknown flag should be rejected by commander, not crash the shim itself
  const r = spawnSync(process.execPath, [shim, "--xyz-unknown-flag"], { encoding: "utf8" });
  // Should exit non-zero from CLI, not from shim error
  assert.equal(r.error, undefined, "shim should not throw a spawn error");
  assert.notEqual(r.status, null, "shim should not be killed by signal");
});
```

**Update `packages/clara/package.json`** — add a test script:

```json
{
  "scripts": {
    "test": "node --test test/*.test.mjs"
  }
}
```

### Verify PR #55 changes

```bash
cd packages/clara
npm test
# Expect: 4 tests passing

cd ../../frontend
npm run type-check
npm run lint
```

TypeScript should pass since we removed code (no new types added).

### Commit and push PR #55 fixes

```bash
git add frontend/src/components/marketing/InstallSection.tsx
git add packages/clara/test/shim.test.mjs
git add packages/clara/package.json
git commit -m "fix: remove broken beta install cmd, add shim tests, fix Node version

- Remove 'npx github:imaginationeverywhere/clara-code' beta command
  (monorepo root has no bin field; command does not work)
- Fix Node.js version requirement: 18+ → 20+ in InstallSection
- Add packages/clara/test/shim.test.mjs (4 tests: --version, --help, exit code, unknown flag)
- Add test script to packages/clara/package.json"

git push origin prompt/2026-04-23/clara-distribution
```

---

## After both pushes

Both PRs should now clear code review blockers:

| PR | Was Blocked By | Fixed By |
|----|---------------|----------|
| #54 | 0% coverage on greeting-cache.ts; greet.ts using old endpoint; missing `reply` alias | 8 new tests; greet.ts wired to postVoiceConverse; alias added |
| #55 | 0% coverage on shim; broken beta command; Node version mismatch | 4 shim tests; broken command removed; version corrected |

Report to HQ via live feed when both branches are pushed.

## Acceptance Criteria

- [ ] `packages/clara-voice-client` test suite: ≥8 tests, all pass
- [ ] `packages/clara-voice-client` coverage: ≥80% on `converse.ts` and `greeting-cache.ts`
- [ ] `clara greet` uses `postVoiceConverse` (no reference to `/voice/respond` remains in `greet.ts`)
- [ ] `packages/cli npm run typecheck` passes
- [ ] `packages/clara` test suite: 4 tests, all pass
- [ ] `InstallSection.tsx` has no `npx github:` command
- [ ] `InstallSection.tsx` says "Node.js 20+" not "18+"
- [ ] `frontend npm run type-check` passes
- [ ] Both branches pushed to origin
