# @claracode/sdk

TypeScript client for the Clara Code HTTP API. All requests use `Authorization: Bearer <apiKey>` and target the Clara API gateway (`gatewayUrl`, default `https://api.claracode.ai`).

## Install

```bash
npm install @claracode/sdk
```

## API surface

- `createClient(config)` — returns a `ClaraClient`
- `client.ask(prompt)` — single assistant `ClaraMessage`
- `client.stream(prompt)` — async iterable of SSE `data:` text chunks
- `client.startVoice()` — `VoiceSession` (`ready`, `send`, `close`)
- `client.createAgent(name, soul)` — `Promise<Agent>` with `ask` / `stream`

Routes used (relative to `gatewayUrl`):

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/v1/ask` | Non-streaming reply |
| POST | `/v1/stream` | `text/event-stream` (SSE) |
| POST | `/v1/voice/sessions` | Create voice session |
| POST | `/v1/voice/sessions/:id/messages` | Send utterance |
| DELETE | `/v1/voice/sessions/:id` | End session |
| POST | `/v1/agents` | Create agent |
| POST | `/v1/agents/:id/ask` | Agent reply |
| POST | `/v1/agents/:id/stream` | Agent SSE stream |

## Example: ask

```typescript
import { createClient } from "@claracode/sdk";

const client = createClient({
	apiKey: process.env.CLARA_API_KEY!,
	// gatewayUrl defaults to https://api.claracode.ai — no need to set it
	model: "claude-sonnet-4",
});

const reply = await client.ask("Summarize the repo.");
console.log(reply.role, reply.content);
```

## Example: stream

```typescript
import { createClient } from "@claracode/sdk";

const client = createClient({
	apiKey: process.env.CLARA_API_KEY!,
});

for await (const chunk of client.stream("Write a haiku about terminals.")) {
	process.stdout.write(chunk);
}
```

## Example: voice

```typescript
import { createClient } from "@claracode/sdk";

const client = createClient({
	apiKey: process.env.CLARA_API_KEY!,
	voice: "default",
});

const session = client.startVoice();
try {
	await session.ready;
} catch (err) {
	// Voice session creation failed (non-2xx or invalid response) — do not call send()
	console.error(err);
	return;
}

const msg = await session.send("What is Clara Code?");
console.log(msg.content, msg.voiceUrl);

await session.close();
```

## Local API stub

After installing this package (or from the monorepo `packages/sdk`), run the stub (defaults to port `18765`, token `stub-api-key`):

```bash
node node_modules/@claracode/sdk/scripts/hermes-stub.mjs
# or from a checkout:
npm run hermes-stub
```

Then:

```typescript
const client = createClient({
	apiKey: "stub-api-key",
	gatewayUrl: "http://127.0.0.1:18765",
});
await client.ask("ping");
```

Run the integration test (starts the stub automatically):

```bash
npm test
```

## Build

This package ships **ESM** (`.mjs`) and **CJS** (`.js`) plus **TypeScript declarations**.

```bash
npm run build
```

## License

MIT
