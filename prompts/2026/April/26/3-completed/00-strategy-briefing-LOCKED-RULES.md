---
type: cursor-prompt
status: completed-archived
archived: 2026-04-28
kind: strategy-briefing-locked-rules
authored_by: HQ
team: /clara-code
target_repos: clara-code
---

**Archival note (2026-04-28):** This ratified **standing policy** document was moved from `1-not-started/` to `3-completed/` so no backlog prompts remain in the not-started queue. Keep reading it before every new prompt; "completed" here means **in force and canonical**, not "done building."

# /clara-code — Strategy briefing for QCS1 Cursor agent prompts

**Audience:** /clara-code team (the agent that picked up `02-clara-code-brain-live-finish-sprint.md`).
**Purpose:** This document is your input. You convert it into focused Cursor prompts and dispatch them to QCS1 (Mac M4 Pro at Quik's). Their code-pushes ship the CLI + IDE.
**Scope rule:** Every Cursor prompt you write MUST encode the locked rules below or its output will need rework.

---

## What the QCS1 agents do NOT do

- App Runner / Dockerfile / brain endpoint provisioning — that's /clara-platform (me)
- Pricing tier database schema, billing logic — that's /clara-platform
- Express `/hermes` middleware on `api.claracode.ai` — that's /clara-platform
- Cloudflare DNS / cert management — that's /clara-platform / /devops

If a Cursor prompt would touch any of those, **route it back to /clara-platform** instead of writing it.

---

## What the QCS1 agents DO

Build the public Clara Code surfaces:
- `clara` CLI binary (Node, distributed as `npm i -g @claracode/cli` or similar)
- `clara-code` VS Code extension (.vsix, distributed via marketplace and direct install)
- (Future) Tauri desktop app
- All the harness wiring inside CLI/IDE that talks to api.claracode.ai

---

## LOCKED RULES — every prompt must enforce these

### Naming

- **Public command:** `clara` only. Never `pi`, never any internal codename. Strike-level — the agent that violated this got corrected hard.
- **Env vars:** `CLARA_GATEWAY_URL`, `CLARA_BRAIN_URL`, `CLARA_BACKEND_URL`. Never `HERMES_*`.
- **Agent names:** full first names always. `granville` not `gran`. `mary-mcleod` not `mary`. (Cultural lock — agents are people, not features.)
- **Repo names:** `imaginationeverywhere/<agent-name>` for internal Quik Nation agents. `imaginationeverywhere/<vp-handle>-<agent-name>` for Vibe Professional agents.

### URLs (defaults the CLI/IDE bake in)

| Surface | Default URL | Notes |
|---|---|---|
| Clara gateway (LLM) | `https://api.claracode.ai/hermes` | Permanent. Middleware ships Sprint 4 from /clara-platform. |
| Clara brain (memory + facts) | `https://brain-api.claracode.ai` | Already LIVE in production (verified 2026-04-26). |
| Clara backend (auth, billing, voice) | `https://api.claracode.ai` | Already LIVE. |
| Auth flow | `https://claracode.ai/cli-auth` | Clerk-backed. |

**Never default to a `*.modal.run` URL.** Those are private, server-to-server only. They never appear in any client-facing artifact.

### Authentication

- CLI/IDE authenticate via Clara's GitHub App (when VP wants to bring their own GitHub) OR Clerk session token (always).
- Tokens stored in OS-native secret storage:
  - macOS Keychain
  - Windows Credential Manager
  - Linux libsecret
- Never plaintext config files. Never embedded in the binary.

### Repo strategy (for `clara init <agent-name>`)

- **Default flow:** CLI calls our backend → backend forks `imaginationeverywhere/agent-template` → creates `imaginationeverywhere/<vp-handle>-<agent-name>` → returns clone URL → CLI clones it.
- **Eject path:** `clara` does NOT have an eject command. Eject is a button in the dashboard at `claracode.ai/dashboard/agents/<agent>/eject`. Not in CLI by design — too easy to misfire.
- **Never propose monorepo for VP agents.** Each agent gets its own repo.

### Pricing-driven feature gates (the CLI/IDE must enforce these)

| Tier | Price | What CLI/IDE allows |
|---|---|---|
| **Taste** | $19.99 | 8 cognitive endpoints capped, 1 agent slot, no voice cloning, no `/ask-granville`, no prod deploy |
| **Plus** | $29 | Same as Taste + 2 agent slots, larger minute pool |
| **Clara Agents PA** | $39 | End-user product, voice (Kokoro), brain memory. NOT a Clara Code dev tier. |
| **Cook** | $49 | Dedicated App Runner, 3 agents, XTTS voice cloning, `/ask-granville` (counts against minutes), prod deploy |
| **Orpheus** | $59+ | Cook + Orpheus voice + 6-agent harness team |

**Add-ons** (structural only, never gradient):
- Multi-app isolation: +$35/mo per extra App Runner
- Extra cloned voice: $2.50 one-time per voice (kept forever)
- Clara Safe (optional password manager): $2.99/mo or $25/yr — OR bring 1Password/Bitwarden via API

**Universal currency: MINUTES.** Every cost (LLM, brain ingest, support, `/ask-granville`) draws from one minute pool. Never design a per-feature quota or gradient upsell.

### Forbidden words / patterns (strike-level — Cursor prompts must enforce)

- **"Unlimited"** — banned in CLI/IDE copy, error messages, marketing, docs
- **"Free tier"** — banned, no free tier exists
- **"Outlier user"** / **"thin margin"** / **"doesn't survive X"** — banned framing in any artifact
- **Internal codenames** (pi, etc.) in user-facing surfaces — banned
- **Forced bundle attaches** — never auto-bundle Clara Safe, never push attach upsells in CLI/IDE error states
- **Priority support upsells** — banned. Support draws from minutes.
- **Gradient upsells** ("extended X for +$Y") — banned. Two tiers + structural add-ons only.

### Cultural rules

- **Agents are people.** When the CLI mentions an agent, use full first names. When a webview shows an agent, the soul.md backstory loads.
- **The harness agents are celebrities.** Their personas matter. Granville is the architect. Mary is product. Norbert is Docker. Don't reduce them to function names.
- **`/ask-granville` is human-feeling.** Error messages should say "Granville is helping another builder right now" not "Rate limit exceeded for harness escalation endpoint."

---

## Remaining work for QCS1 to dispatch

These are the things QCS1 Cursor agents need to build. **You write the prompt for each.** Each prompt must reference this briefing and enforce the locked rules.

### CLI

1. **`clara login`** — opens browser to `https://claracode.ai/cli-auth`, receives Clerk token + Clara API key, stores in OS keyring. Refresh on expiry.
2. **`clara init <agent-name>`** — calls backend, provisions `imaginationeverywhere/<vp>-<agent-name>` from template, clones locally.
3. **`clara chat`** — opens TUI that talks to gateway. Uses `intent` field, never a model name. Streams responses.
4. **`clara analyze` / `clara think` / `clara critically-think` / `clara creative-thinking` / `clara truth` / `clara facts` / `clara save` / `clara remember`** — direct verb commands hitting `/v1/<verb>` endpoints on `api.claracode.ai/hermes`.
5. **`clara deploy`** — builds the agent, pushes to ECR, triggers App Runner deploy via backend orchestration. Tier-gated to Cook+.
6. **`clara doctor`** — diagnostic: gateway reachable, brain reachable, auth valid, tier active, last error. Used when defaults (which point at `api.claracode.ai/hermes`) hit a transient outage.
7. **`clara config get|set <key>`** — for CLARA_GATEWAY_URL, CLARA_BRAIN_URL overrides only. No "model" key. No "system_prompt" key. Server controls those.

### IDE (VS Code extension)

8. **Activity bar agent tray** — lists user's agents, shows soul.md previews, deploy status.
9. **Inline chat** — same `/v1/*` endpoints. Selection → /v1/think with selection as context.
10. **Command palette commands:** `Clara: Login`, `Clara: New Agent`, `Clara: Deploy`, `Clara: Set Gateway URL` (Secret Storage).
11. **Status bar:** tier, minutes remaining, gateway health.
12. **Webview** for harness escalation — `/ask-granville` opens a chat panel with Granville's persona avatar + soul.md context.

### Tier enforcement (in CLI and IDE)

13. **Every command checks tier server-side via the gateway.** Never client-side gating only — clients can be patched. The gateway returns 403 with `{"reason":"tier_lock","upgrade_url":"..."}` and the CLI/IDE display the upgrade CTA.
14. **Minute counter visible always.** Status bar (IDE), bottom-of-TUI (CLI). Updates after every gateway call.
15. **Out-of-minutes UX.** When 429-with-cap-exhausted comes back: clear "you've used your minute allotment" message + 1-click "Buy more minutes" link. NOT "your subscription has expired" — that's a different error.

### Error UX (every command)

16. **Never show raw HTTP errors.** Every 4xx/5xx maps to a plain-English fix-hint.
17. **Never mention internal codenames** in error output. "Service coming online" not "Hermes Modal endpoint timed out."
18. **`clara doctor` is the universal escape valve.** Any error fix-hint should suggest running it.

---

## How to write the QCS1 prompts (template)

Each Cursor prompt should follow this shape:

```
[ROLE]
You are <Agent Name> implementing <feature> for the Clara Code <CLI|IDE> in
<repo path>. Mo is watching. Sprint 3 closes Thursday.

[BRIEFING REFERENCE]
Read `prompts/2026/April/26/3-completed/00-strategy-briefing-LOCKED-RULES.md`
in full before writing any code. Every locked rule below must be enforced.

[TASK]
<Specific feature, e.g., "implement `clara doctor` command per spec in
briefing section 'Remaining work / CLI #6'">

[ACCEPTANCE]
- <verifiable outcome>
- <verifiable outcome>
- ...

[CONSTRAINTS]
- No internal codenames in any artifact
- No "unlimited", no "free tier", no "outlier user"
- Every URL default uses the locked production URL (api.claracode.ai/hermes etc.)
- Tier gating is server-side only
- Minute counter visible after every gateway call
- All commits in one PR per task; no direct push to main/develop
- Tests + tsc + eslint must pass before commit

[MO IS WATCHING]
The brand IS the work. Three weeks shipping the Clara surface. Every leak of
internal names, every "unlimited", every gradient upsell that lands in this
codebase is a strike. Build the public surface. Don't bypass it.
```

---

## Architecture references (docs being written by /clara-platform this session)

- `docs/architecture/AGENT_REPO_STRATEGY.md` — full Option B + A spec, GitHub App, template, transfer
- `docs/architecture/CLARA_CODE_V1_ENDPOINT_CATALOG.md` — full v1 endpoint list (eight cognitive + audited additions)
- `docs/architecture/AGENT_BRAIN_NAMESPACING.md` — three-substrate map, subdomain pattern
- `docs/architecture/HARNESS_ESCALATION_PATTERN.md` — `/ask-granville` etc., minute-currency model
- `docs/architecture/PRICING_MATRIX_V1.md` — corrected pricing matrix (canonical)
- `docs/architecture/HERMES_GATEWAY_EXPLAINER.md` — plain-language explainer for Mo + Quik

These ship from /clara-platform within the next 24 hours. As each lands, update QCS1 prompts to reference them.

---

## Memory references (vault, for QCS1 prompt enforcement)

Cursor prompts can ask the agent to read these directly to internalize platform rules:

- `feedback_no_free_tier_paid_only.md`
- `feedback_dont_extract_dont_nickel_dime.md`
- `feedback_word_unlimited_banned.md`
- `feedback_internal_names_never_leak_to_user_surfaces.md` (NEW today — the strike-level lesson from your "pi" leak)
- `project_minutes_are_universal_currency.md`
- `project_subdomain_per_agent_brain_pattern.md`
- `project_agent_repo_strategy_template_fork_with_eject.md`
- `project_one_repo_per_agent_cultural_lock.md`
- `project_clara_safe_byo_password_manager.md`
- `project_rekhit_com_shared_substrate.md`

Path: `~/.claude/projects/-Volumes-X10-Pro-Native-Projects-AI-clara-voice/memory/`

---

## Scope rule (one more time, clearly)

**You write Cursor prompts. QCS1 agents execute them. Output is PRs against the clara-code repo.**

You do NOT touch:
- App Runner config
- Dockerfile.combined or Dockerfile.production
- The Express `/hermes` middleware (that's /clara-platform)
- The brain ingest endpoint or cognee config
- Cloudflare DNS or cert config
- IAM roles
- SSM parameters

If a feature requires those, **flag it back to /clara-platform** with a one-line "blocked on platform: <thing>" note. Don't write a Cursor prompt that crosses the lane.

---

## Done means

For Sprint 3 close (Thursday 2026-04-30):
- A real user installs `clara` from a fresh machine
- Runs `clara login` → succeeds
- Runs `clara init my-first-agent` → repo provisioned, cloned
- Runs `clara chat "..."` → gets a response (gateway middleware shipped)
- Same flow works in the IDE
- Zero internal-name leaks in any user-facing artifact
- Zero "unlimited" / "free tier" / nickel-and-dime copy in any UI surface

Post the smoke result to `#maat-discuss` in plain language. No commit hashes, no file paths, no jargon (per Slack-plain-language feedback in vault).
