# Implement `clara talent new <name>` — author a Talent inline

## Role
You are **Lorraine Hansberry** implementing `clara talent new` in `packages/cli/`. Daysha directive §D. The Talent Creator surface (07 §F) is the web version; this is the CLI version for power authors.

## Read first
- 07 (Daysha §D + §F)
- 08 (firewall)
- 09 (voice catalog §D)
- `project_talent_creator_marketplace.md` (memory)

## Intent contract

```yaml
intent: "talent.new"
tier: "cook"
params:
  talent_name: string (required, kebab-case, ≤32 chars)
  category: string (optional — "writing" | "code" | "design" | etc.)
  voice: boolean (optional — whether to author a voice profile too)
```

Voice: catalog 09 §D.

## Task

`clara talent new <name>` runs an interactive authoring flow:

1. `packages/cli/src/commands/talent-new.ts` — argv + interactive prompts (using existing `prompts` dep) for:
   - Talent category
   - Persona (name, bio, expertise, voice description)
   - System prompt seed (the user describes the persona's role; the LLM expands)
   - Brain seed (initial knowledge — files, URLs, text the Talent should know)
   - Voice profile (optional — record a 5-second sample, gateway clones via Modal)
2. `runIntent("talent.new", { ...all the above })` per step OR batch at the end.
3. Server:
   - Creates `.soul.md` server-side (NEVER in this repo or the Talent's repo — Talents publish to the registry, not as files)
   - Runs through Talent Creator schema validation
   - Mints on Base via EAS attestation (depends on /clara-platform Phase 0 EAS — fall back to staging mint until live)
   - Returns `{ talent_id, registry_url, status: "draft" | "published" }`
4. CLI prints:
   - "Drafted Talent <name>: <registry_url>"
   - "Run `clara talent publish <name>` when ready" (publish = mark live in marketplace)
   - "Or attach immediately: clara attach-talent <name>"

## Acceptance

- Interactive flow guides user through persona authoring with sane defaults
- `--non-interactive` accepts a JSON payload from stdin for scripted authoring
- `--from-file <path>` reads a draft SOUL stub and uploads it
- Voice profile: records 5s via `clara` mic, uploads, server clones (Modal-side via XTTS — server picks model)
- 403 tier_lock for Taste/Plus (Cook+ required)
- Tests: interactive happy path (mocked prompts), non-interactive JSON, 403, voice path (mocked recording)
- **IP audit:** zero SOUL.md template content / persona system prompt patterns / voice cloning internals in CLI

## Constraints

- Talent .soul.md NEVER lives in the user's repo — it's marketplace IP, registry-owned
- Voice cloning consent flow: user must opt in explicitly per voice
- All publishes go through the EAS attestation gate (when Phase 0 ships); pre-Phase-0, mark as `staged` and let platform team backfill mints later
- Marketplace 15% fee applies to paid Talents on every invocation (server-enforced)

## Mo is watching

This is how Vibe Pros become Talent authors. Every Talent created here grows the catalog. Build it so authoring feels like creation, not configuration.
