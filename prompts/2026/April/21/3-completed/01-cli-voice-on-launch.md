# CLI — Wire Clara Greeting + Voice Conversation on Launch

**TARGET REPO:** imaginationeverywhere/clara-code
**Package:** `packages/cli/`
**Milestone:** `clara` → Clara greets → voice conversation, end-to-end

---

## Context

The CLI already has all the voice infrastructure:
- `src/lib/audio-capture.ts` — sox/rec mic capture
- `src/lib/stt-client.ts` — POST audio → `/api/voice/stt` → transcript
- `src/lib/play-audio-file.ts` — afplay / ffplay playback
- `src/hooks/useVoice.ts` — full voice phase loop
- `src/commands/greet.ts` — posts to `CLARA_VOICE_URL/voice/respond` and plays audio
- `src/commands/tui.tsx` — renders the Ink TUI, passes `voiceAudioEnabled` (currently always `false`)

The Hermes gateway is now live: `https://info-24346--hermes-gateway.modal.run`
It accepts: `POST /` with `{ platform, user, message }` and returns `{ reply }`.

## What's Wrong (the gaps)

1. **No default gateway URL** — `HERMES_GATEWAY_URL` has no fallback. Users get "Gateway URL is not configured" on first run.
2. **Voice is opt-in** — `voiceAudioEnabled` is hardcoded `false` in `launchTui`. The `--voice` flag exists but is never turned on by default.
3. **No greeting on launch** — `clara` opens the TUI silently. Mo wants Clara to greet the user with audio before the TUI renders.
4. **Wrong npm package name** — `package.json` `name` is `@clara/cli`. For `npm install -g clara@latest` and `npx clara@latest` to work, it must be `"name": "clara"`.
5. **Greet endpoint mismatch** — `greet.ts` hits `CLARA_VOICE_URL/voice/respond`. The Hermes gateway endpoint for greeting is `POST /` with `{ platform: "tui", user, message: "" }` and returns JSON `{ reply }`. It does NOT return raw audio. Audio TTS must be requested from `backendUrl/api/voice/tts`.

## Required Changes

### 1. `package.json` — rename for npm

```json
{
  "name": "clara",
  "version": "0.1.0",
  "description": "Clara Code — conversational AI voice coding CLI"
}
```

Keep `"bin": { "clara": "./dist/index.js" }` as-is.

### 2. `src/lib/backend.ts` — bake in Hermes default

Add a default gateway URL constant:

```typescript
const DEFAULT_GATEWAY_URL = "https://info-24346--hermes-gateway.modal.run";
```

Export a `resolveGatewayUrl(flag?: string): string` function (mirrors `resolveBackendUrl`):

```typescript
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

### 3. `src/commands/tui.tsx` — use new resolver + enable voice by default

In `resolveGatewayUrl` inside `tui.tsx`, replace the local inline function with an import of `resolveGatewayUrl` from `../lib/backend.js`.

In `launchTui`, change:
```typescript
// Before
voiceAudioEnabled={opts.voice === true}

// After
voiceAudioEnabled={opts.voice !== false}  // default true; --no-voice disables
```

And in `registerTuiCommand`, flip the default:
```typescript
.option("--no-voice", "Disable audio playback (text-only mode)")
```
Remove the old `--voice` option.

### 4. `src/commands/greet.ts` — fix greeting to use gateway + TTS

The greet command needs to:
1. POST to the gateway (same as chat) with `message: ""` to get Clara's text greeting
2. POST the text to `backendUrl/api/voice/tts` to get audio
3. Play the audio

Rewrite `greet.ts`:

```typescript
import { randomBytes } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Command } from "commander";
import { resolveBackendUrl, resolveGatewayUrl } from "../lib/backend.js";
import { readClaraConfig } from "../lib/config-store.js";
import { playAudioFile } from "../lib/play-audio-file.js";

export function registerGreetCommand(program: Command): void {
  program
    .command("greet")
    .description("Request Clara's voice greeting and play the audio")
    .option("-g, --gateway <url>", "Gateway URL override")
    .option("-b, --backend <url>", "Backend URL override")
    .action(async (opts: { gateway?: string; backend?: string }) => {
      const gatewayUrl = resolveGatewayUrl(opts.gateway);
      const backend = resolveBackendUrl(opts.backend);
      const cfg = readClaraConfig();
      const userId = cfg.userId ?? "dev";

      // Step 1: Get greeting text from gateway
      let greetText: string;
      try {
        const res = await fetch(gatewayUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform: "tui", user: userId, message: "" }),
        });
        const body = await res.json() as Record<string, unknown>;
        greetText = (typeof body.reply === "string" ? body.reply : null)
          ?? (typeof body.text === "string" ? body.text : null)
          ?? "Hello, I'm Clara. Ready to help.";
      } catch {
        console.log("Clara: Hello! (voice unavailable — network error)");
        return;
      }

      // Step 2: Convert text to audio via backend TTS
      let audioBuffer: Buffer;
      try {
        const ttsRes = await fetch(`${backend.url}/api/voice/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: greetText }),
        });
        if (!ttsRes.ok) throw new Error(`TTS ${ttsRes.status}`);
        audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
      } catch {
        // Fallback: print text, no audio
        console.log(`Clara: ${greetText}`);
        return;
      }

      // Step 3: Play
      const ext = ".mp3";
      const outPath = join(tmpdir(), `clara-greet-${randomBytes(8).toString("hex")}${ext}`);
      await writeFile(outPath, audioBuffer);
      try {
        await playAudioFile(outPath);
      } finally {
        await unlink(outPath).catch(() => {});
      }
    });
}
```

### 5. `src/index.ts` — play greeting before TUI renders

When `clara` is launched with no args, play the greeting first, then launch the TUI:

```typescript
// In the argv.length === 0 branch:
if (argv.length === 0) {
  // Play greeting (best-effort, don't block TUI on failure)
  const { spawnGreet } = await import("./lib/greet-on-launch.js");
  await spawnGreet();
  launchTui({});
} else {
  program.parse(process.argv);
}
```

Create `src/lib/greet-on-launch.ts`:

```typescript
import { randomBytes } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveBackendUrl, resolveGatewayUrl } from "./backend.js";
import { readClaraConfig } from "./config-store.js";
import { playAudioFile } from "./play-audio-file.js";

export async function spawnGreet(): Promise<void> {
  try {
    const gatewayUrl = resolveGatewayUrl();
    const backend = resolveBackendUrl();
    const userId = readClaraConfig().userId ?? "dev";

    const res = await fetch(gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: "tui", user: userId, message: "" }),
      signal: AbortSignal.timeout(8000),
    });
    const body = await res.json() as Record<string, unknown>;
    const text = (typeof body.reply === "string" ? body.reply : null) ?? "Hello, I'm Clara.";

    const ttsRes = await fetch(`${backend.url}/api/voice/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(15000),
    });
    if (!ttsRes.ok) return;

    const buf = Buffer.from(await ttsRes.arrayBuffer());
    const outPath = join(tmpdir(), `clara-greet-${randomBytes(8).toString("hex")}.mp3`);
    await writeFile(outPath, buf);
    try {
      await playAudioFile(outPath);
    } finally {
      await unlink(outPath).catch(() => {});
    }
  } catch {
    // Greeting is best-effort. If it fails, TUI still launches silently.
  }
}
```

## Build + Verify

```bash
cd packages/cli
npm run typecheck
npm run build
node dist/index.js greet --backend https://api.claracode.ai
# Should: print text or play audio greeting
```

## Acceptance Criteria

- [ ] `package.json` name is `"clara"`
- [ ] `npm install -g .` then `clara` launches without flags
- [ ] Clara greeting plays (or prints text fallback) before TUI renders
- [ ] Voice is on by default in the TUI (spacebar → listen → Clara responds)
- [ ] `--no-voice` flag disables audio
- [ ] Gateway defaults to `https://info-24346--hermes-gateway.modal.run`
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
