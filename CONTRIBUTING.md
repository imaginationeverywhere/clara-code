# Contributing to Clara Code

Thanks for wanting to contribute! This guide exists to save both of us time.

## The One Rule

**You must understand your code.** If you can't explain what your changes do and how they interact with the rest of the system, your PR will be closed.

Using AI to write code is fine. You can gain understanding by interrogating an agent with access to the codebase until you grasp all edge cases and effects of your changes. What's not fine is submitting agent-generated slop without that understanding.

If you use an agent, run it from the `pi-mono` root directory so it picks up `AGENTS.md` automatically. Your agent must follow the rules and guidelines in that file.

## First-Time Contributors

We use an approval gate for new contributors:

1. Open an issue describing what you want to change and why
2. Keep it concise (if it doesn't fit on one screen, it's too long)
3. Write in your own voice, at least for the intro
4. A maintainer will comment `lgtm` if approved
5. Once approved, you can submit PRs

This exists because AI makes it trivial to generate plausible-looking but low-quality contributions. The issue step lets us filter early.

## Before Submitting a PR

```bash
npm run check  # must pass with no errors
./test.sh      # must pass
```

Do not edit `CHANGELOG.md`. Changelog entries are added by maintainers.

If you're adding a new provider to `packages/ai`, see `AGENTS.md` for required tests.

## Philosophy

pi's core is minimal. If your feature doesn't belong in the core, it should be an extension. PRs that bloat the core will likely be rejected.

## Thin-client discipline (non-negotiable)

> **"The API is the moat. The API is the IP."**

Clara Code ships three surfaces to the public: the CLI (`packages/cli`), the Tauri desktop IDE (`desktop`), and the website (`frontend`). **All three are thin HTTP clients.** They contain zero replicable intelligence.

### What may NOT appear in CLI / desktop / frontend source

| Forbidden | Why |
|-----------|-----|
| LLM prompt templates or system prompts | Server-side only |
| Persona text (Clara's personality, heritage, etc.) | Server-side only |
| Culture packs or VSL slang rules | Server-side only |
| LLM routing logic or model selection | Server-side only |
| Model provider IDs (claude-3, gpt-4, deepseek-…) | Server-side only |
| Voice IDs or TTS catalog entries | Server-side only |
| Brain Proxy rules or filter patterns | Server-side only |
| Agent SOUL.md content or agent configs | Server-side only |
| Subscription-tier feature-gate decisions | Server-side only |
| Internal gateway hostnames (hermes-gateway, modal.run) | Server-side only |

### What IS allowed in client source

- HTTP client code (auth headers, retry logic, streaming)
- UI rendering (TUI components, Tauri chrome, landing pages)
- Mic capture, audio playback, clipboard, file I/O
- Local caching of already-fetched artifacts (the greeting MP3 cache is fine — caching content, not hardcoding it)
- Auth/subscription UI — validation happens server-side
- Install / update mechanics

### Why the CLI is safe on npm

Publishing `clara` to npm does not expose our IP. Anyone can `npm install -g clara` and read the source. What they get is an HTTP client that calls `api.claracode.ai`. Without valid credentials that endpoint does nothing. The intelligence — personas, model routing, voice synthesis, culture packs — never leaves our servers.

This is identical to how Claude Code (`npm install -g @anthropic-ai/claude-code`), Stripe CLI, and Vercel CLI work. The moat is the API, not the client source.

### Enforcement

A CI job (`.github/workflows/thin-client-gate.yml`) scans every PR diff for forbidden markers listed in `.github/thin-client-forbidden.txt`. Any match blocks the merge and posts a comment explaining the violation.

**Example violations that will be blocked:**
```
// BAD: model routing in CLI
const model = "claude-sonnet-4-6";

// BAD: persona text in frontend
const greeting = "Hi! I'm Clara Villarosa, your AI coding partner...";

// BAD: calling Hermes directly from the CLI
const url = "https://info-24346--hermes-gateway.modal.run";
```

**Correct pattern:**
```typescript
// CLI makes one call to the public facade
const res = await fetch(`${process.env.CLARA_VOICE_URL}/voice/converse`, { ... });
// The API decides the model, persona, voice — not the client
```

If you need to add a new forbidden marker (a new voice ID is minted, a new model is added), update `.github/thin-client-forbidden.txt`.

## Questions?

Open an issue or ask on [Discord](https://discord.com/invite/nKXTsAcmbT).
