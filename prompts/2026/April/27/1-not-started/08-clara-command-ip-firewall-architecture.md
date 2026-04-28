# Clara Command IP Firewall + Voice Intent Architecture (MASTER)

**Issued:** 2026-04-27 evening
**Type:** ARCHITECTURE LOCK — read before any 09–22 command prompt
**Authority:** Mo, 2026-04-27

---

## The principle

Claude Code's slash commands (`/init`, `/help`, `/explain`) are not readable. Users type them, Anthropic's runtime executes them, the user sees the OUTPUT only. The prompt template that drives each command is server-side IP — sealed, undumpable, untenforceable from the client.

**Every Clara CLI / IDE / voice command must follow the same model.**

What ships in the public binary:
- Command name (e.g., `clara new`)
- Argument parsing
- HTTP dispatch to gateway with `intent: "<intent_id>"`
- Local apply of returned diffs/output

What is server-side IP, NEVER in the binary:
- The prompt templates that drive each command
- The brain context retrieval logic
- The model selection per command
- The post-processing that produces the diff
- The cost/tier-gating logic

---

## Architecture

```
USER                    CLI / IDE / VOICE             GATEWAY                LLM + BRAIN
────                    ─────────────────             ───────                ───────────
"clara new daysha"      parse → intent="new"
                        params={heru_name:"daysha"}
                        POST /v1/run
                        { intent, params, surface }   →   look up template
                                                          fill params
                                                          retrieve brain
                                                          call LLM           →
                                                          produce diff       ←
                                                          tier-gate
                                                      ←   { diff, minutes }
                        apply diff locally
                        update minute counter
"Done — your repo is ready"
```

The CLI is a **dumb actuator**. The gateway is the **brain**. Templates live on the gateway side ONLY.

---

## Intent contract (the wire)

Every command POSTs to `${gatewayUrl}/v1/run`:

```json
{
  "intent": "new" | "wire-auth" | "deploy.frontend" | "provision-brain" | ...,
  "surface": "cli" | "ide" | "voice",
  "params": { ... command-specific ... },
  "context": {
    "cwd": "/path/to/agent-repo",
    "git_remote": "https://github.com/...",
    "active_files": [ ... ],
    "user_prefs": { ... }
  }
}
```

Server returns:

```json
{
  "ok": true,
  "diff": [ { "path": "...", "op": "create"|"update"|"delete", "content": "..." } ],
  "stdout_lines": [ "..." ],
  "minutes_remaining": 482,
  "next_suggestions": [ ... ]
}
```

OR on tier-lock / minutes / errors: existing `tier_lock` / `minutes_exhausted` / mapped error responses (per `lib/http-errors.ts`).

---

## What every command prompt (09–22) MUST encode

1. **Intent ID** (the wire field) — e.g., `"new"`, `"wire-auth"`, `"gear.add"`
2. **Voice phrasings** — at least 5 natural ways a user would speak this command
3. **Param shape** — JSON schema for `params`
4. **Server-side template name** — the file path on the gateway (e.g., `templates/new.md`) — IS NOT shipped in the CLI
5. **Tier requirement** — Taste / Plus / Cook / Orpheus per `PRICING_MATRIX_V1.md`
6. **Acceptance criteria** that include a "client-readable IP audit" — verify the binary doesn't contain:
   - The prompt template content
   - Model names
   - System prompt fragments
   - Brain query logic

---

## Voice intent classifier (server-side)

Voice flow:
1. Whisper transcribes user speech → text
2. Text + context → intent classifier (a small fine-tuned model OR keyword-rule layer with LLM fallback)
3. Classifier returns `{ intent, params, confidence }`
4. If confidence < threshold → ask user to confirm
5. Same `/v1/run` dispatch as typed command

The catalog of (phrasing → intent → params) is in prompt 09. **It also lives server-side** — the CLI/voice client does NOT hold the full mapping. Client sends raw transcript; server classifies.

---

## What this prevents

- A user `cat`-ing the CLI binary to extract our prompt templates (Anthropic's IP play)
- Reverse-engineering the system prompts that make each command work
- Cloning the command catalog into a competing tool by reading our source
- Bypassing tier gates by patching the binary (gates live server-side)

---

## What QCS1 builds (cross-cuts every 10–22 prompt)

1. **Gateway intent registry** (server-side, /clara-platform owns) — lookup `intent → { template_path, model, retrieval_strategy, tier }`
2. **CLI thin dispatcher** (`packages/cli/src/lib/intent-dispatch.ts`) — single function `runIntent(intentId, params, context)` that POSTs to `/v1/run` and applies the returned diff
3. **Per-command actuator** — each `clara <verb>` command file (`packages/cli/src/commands/*.ts`) does ONLY arg parsing + `runIntent("<id>", params)` + local apply. No prompt content, no model names, no system prompts.
4. **Voice intent classifier** (server-side, /clara-platform Phase 0+) — text → intent
5. **Audit script** — `scripts/audit-cli-ip.sh` greps the built CLI binary for forbidden strings (model names, prompt phrases, brain query SQL, etc.)

---

## Constraints (apply to ALL 09–22 prompts)

- Zero prompt template text in `packages/cli/` source
- Zero hardcoded model names anywhere in the CLI
- Zero brain query construction in the CLI (server-side only)
- Voice phrasings live in prompt 09 (this repo) AS A SPEC; the runtime classifier loads them from the gateway, not from the CLI bundle
- All command outputs go through `claraHttpErrorMessage` for non-2xx — no raw HTTP leaks
- All gated commands return `tier_lock` payloads server-side; the CLI just renders the verdict

---

## Strategic frame

This is the same pattern Anthropic uses to keep Claude Code's competitive moat intact. We're applying it deliberately. Every command we ship as a thin client + sealed template is a brick in the moat. Every byte of prompt content that leaks into a public binary is a brick the next competitor uses to clone us.

Build accordingly.
