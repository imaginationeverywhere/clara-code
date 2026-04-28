# Retrofit existing Clara commands — IP firewall + voice catalog parity

## Role
You are **Cheikh Anta Diop** auditing every shipped Clara CLI + IDE command for IP firewall + voice catalog compliance. Sweeping fix, not feature work.

## Read first
- 08 (firewall architecture — non-negotiable)
- 09 (voice catalog — every command must appear)
- The shipped CLI source under `packages/cli/src/commands/`

## Inventory

Existing commands shipped (as of develop tip `eee8b692`):

| Command | File | Firewall status | Voice catalog status |
|---|---|---|---|
| `clara login` | commands/login.ts | thin actuator ✓ | catalog ✓ |
| `clara init` | commands/init.ts | partial — needs audit | needs phrasings |
| `clara chat` | commands/chat.ts (or tui.tsx) | sends `intent` field already | needs phrasings |
| `clara analyze/think/critically-think/creative-thinking/truth/facts/save/remember` | commands/cognitive/*.ts | uses runCognitive helper — verify intent contract | catalog has §F coverage |
| `clara deploy backend` | commands/deploy.ts | thin ✓ | catalog ✓ |
| `clara config get/set` | commands/config.ts | local-only — no gateway path | n/a (local config) |
| `clara doctor` | commands/doctor.ts | currently endpoint-probe stub — being upgraded in prompt 11 | catalog ✓ |
| `clara the-brain` | commands/the-brain.ts | thin ✓ (refuses quiknation, defaults claracode.ai) | catalog ✓ |
| `clara hello` | commands/hello.ts | "not yet implemented" — DELETE if dead, or build | needs phrasings if kept |
| `clara ask` | commands/ask.ts | "not yet implemented" — DELETE or build | needs phrasings if kept |
| `clara greet` | commands/greet.ts | TTS greeting — server-routed | catalog needs entry |
| `clara tui` | commands/tui.tsx | alias for `clara chat` (per prompt 03) | catalog ✓ via chat |
| `clara configure-agent` | commands/configure-agent.ts | partial — verify intent contract | catalog needs entry |

## Task

Audit + retrofit each row:

### Sweep 1 — IP firewall compliance
For every command file in `packages/cli/src/commands/`, verify:
- No prompt template content
- No model names
- No system prompt fragments
- No hardcoded LLM API URLs (only `DEFAULT_GATEWAY_URL` allowed)
- No brain query construction
- All non-2xx responses go through `claraHttpErrorMessage`
- All gated commands render server's `tier_lock` payload via `formatTierLockMessage`

For each violation: refactor the offending logic to the gateway side, leave a thin actuator.

### Sweep 2 — Intent contract migration
Every command must:
- POST to `/v1/run` with `{ intent: "<id>", surface: "cli", params: {...}, context: {...} }`
- Receive `{ ok, diff, stdout_lines, minutes_remaining }`
- Apply diff via `lib/diff-apply.ts` (built in prompt 10)
- Display `stdout_lines` as they stream
- Update minute counter

Migrate commands that still use ad-hoc HTTP calls (e.g., direct `fetch` to specific routes) to the unified intent pattern.

### Sweep 3 — Voice catalog completeness
For each command not already in catalog 09, ADD entries with:
- intent ID
- typed form
- tier
- ≥5 phrasings

Then verify the runtime classifier loads from this catalog (server-side test).

### Sweep 4 — Dead command cleanup
Commands marked "not yet implemented" (`hello`, `ask`):
- Either build them (intent + phrasings)
- Or delete entirely (don't ship dead surface area)

Discuss with Mo before deletion in case there's planned use.

### Sweep 5 — Audit script
Add `scripts/audit-cli-ip.sh`:
- Greps the built CLI binary (`packages/cli/dist/index.js`) for forbidden patterns:
  - Model names (`gemma-`, `claude-`, `gpt-`, `deepseek`, `bedrock`)
  - Internal codenames (`Hermes`, `Modal`, `pi-coding`, `cognee`, `brain-api.quiknation`)
  - Prompt phrases (`You are`, `system prompt`, `<role>`)
  - Brain query SQL (`SELECT`, `INSERT INTO`)
- Fails if any match found
- Wired into CI as a release gate (similar to `verify-customer-brain-ship.mjs`)

## Acceptance

- Every shipped command in the inventory table audited + retrofit
- All commands route via `/v1/run` intent dispatch
- Voice catalog 09 has entries for every command
- `scripts/audit-cli-ip.sh` exists, runs clean, wired into release CI
- CLI binary post-audit grep: zero forbidden strings
- All existing tests still pass
- New tests: each migrated command's intent contract is verified
- `npm run check` passes

## Constraints

- Don't break existing commands' user-facing behavior — same UX, different plumbing
- Don't ship dead commands — if a command says "not yet implemented", either build or delete in this sweep
- Cognitive verbs already use `runCognitive` (close to the pattern) — just align them with the new `runIntent` if they diverge

## Mo is watching

This is the IP firewall ship gate. Every command we leave thick risks the moat. The audit script is the line of defense — make it loud.
