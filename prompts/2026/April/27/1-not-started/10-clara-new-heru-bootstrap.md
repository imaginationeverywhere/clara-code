# Implement `clara new <heru-name>` — Heru bootstrap from boilerplate

## Role
You are **Cheikh Anta Diop** implementing `clara new` for the Clara Code CLI in `packages/cli/`. Mo is watching. Daysha pitch is parked until this lands (07-daysha-build-readiness-directive.md §A).

## Read first
- `prompts/.../07-clara-code-daysha-build-readiness-directive.md` (the customer deadline)
- `prompts/.../08-clara-command-ip-firewall-architecture.md` (firewall pattern — non-negotiable)
- `prompts/.../09-clara-voice-intent-catalog.md` (voice phrasings)

## Intent contract

```yaml
intent: "new"
tier: "taste"
params:
  heru_name: string (required, kebab-case, ≤32 chars, not reserved)
```

Voice phrasings live in catalog 09. Server-side classifier maps utterances → this intent.

## Task

Add `clara new <heru-name>` as a thin actuator:

1. `packages/cli/src/commands/new.ts` — argv parse + validation (kebab-case, length, reserved-word reject) + `runIntent("new", { heru_name })` call.
2. `packages/cli/src/lib/intent-dispatch.ts` (new) — `runIntent(id, params, context?)`. POSTs to `${gateway}/v1/run` with bearer + intent + params. Returns `{ ok, diff, stdout_lines, minutes_remaining }`. Maps non-2xx via `claraHttpErrorMessage`.
3. Local-apply layer (`packages/cli/src/lib/diff-apply.ts`, new) — receives the diff array, creates / updates / deletes files inside the cwd. Refuses to touch paths outside cwd. Refuses to overwrite without `--force` if files exist.
4. Streams `stdout_lines` to the user as they arrive (SSE).
5. On success, prints "Created <name> at ./<name> — see <repoUrl>" and chains to `cd <name>` suggestion.

The PROMPT TEMPLATE that drives the bootstrap (which files get scaffolded, what `BRAIN.md` looks like, what defaults land) lives **server-side at `templates/new.md` on the gateway** — IS NOT in this repo. The CLI receives the diff, not the template.

## Acceptance

- `clara new my-first-agent` produces a populated `./my-first-agent/` (boilerplate-scaffolded by gateway, applied locally)
- Name validation rejects bad names with one-line plain-English errors
- `--force` flag allows overwrite into existing dir; without it, refuses
- `--dry-run` flag prints the diff plan without applying
- 401 → "Run `clara login` first." 403 → tier_lock CTA. 5xx → `claraHttpErrorMessage`
- Tests: name validation, success path (mocked gateway), 401 path, 403 path, --dry-run, --force
- `npm run check` passes
- **IP audit:** `grep -rEn "scaffold|boilerplate|template|BRAIN\\.md|CLAUDE\\.md" packages/cli/src/` returns ONLY framework references — no template content, no scaffold instructions, no model names

## Constraints

- No prompt template content in `packages/cli/`
- No model names anywhere in the CLI binary
- Diff-apply layer must NEVER write outside `cwd` — security guardrail
- Voice phrasings ship to gateway catalog 09, not bundled in the CLI

## Mo is watching

This is the foundation Daysha rides on. Build the actuator clean; the gateway carries the IP.
