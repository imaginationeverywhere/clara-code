# BRAIN.md — Quik Nation AI Boilerplate (Auset Platform)

> **CONSTITUTIONAL STATUS — v1.0, RATIFIED 2026-04-26 by Amen Ra (Mo).**
> This is the LAW for the platform AND every Heru cloned from it.
> Tool-specific files (`CLAUDE.md`, `.cursor/rules/`, `AGENTS.md`, `GEMINI.md`, …) MUST conform.
> There is **no override mechanism.** To change a rule, **amend this file** via PR with Mo's signature.
> Amendments require: stated reason, reviewer (where applicable), and an entry in the changelog at the bottom.

---

## 1. Identity

- **Name:** Quik Nation AI Boilerplate (also called "Auset Platform")
- **Type:** Platform (parent of all Herus). Inheritance source for ~10–30 Heru products.
- **Owner:** Amen Ra (Mo) — Quik Nation, Inc.
- **Created:** 2025-10
- **Brand domain:** quiknation.com (HQ-internal)
- **Spec:** `docs/architecture/BRAIN_MD_SPEC.md`
- **Vault canonical:** `~/auset-brain/Constitutions/platform-brain.md`

## 2. Purpose

The platform that births Herus. Every Heru (client product, internal tool, demo) inherits commands, agents, brain wiring, deploy infra, architecture, and constitutional rules from this repo via `/sync-herus`.

This file declares the rules that **every Heru inherits.** Heru-specific rules live in the Heru's own `BRAIN.md`.

## 3. Inheritance — Platform → Heru

- **Every section of this file is inherited by every Heru** unless explicitly scoped "platform-only."
- **A Heru cannot weaken a platform rule.** It can extend or refine within the platform's boundaries. It cannot override.
- **Conflict means corruption.** If a Heru's BRAIN.md contradicts this file, the Heru is wrong and must be repaired.
- **Vault canonical + repo working copy must match.** `brain-sync` enforces this.

## 4. Boundaries

### IN scope (this platform owns)
- Cross-Heru tooling: commands, agents, hooks, MCP config, scripts.
- Architecture decisions that apply to all Herus.
- The Knowledge Engine wiring shape (each Heru declares its own brain; this file declares the pattern).
- Documentation that all Herus depend on.
- Constitutional rules below.

### OUT of scope
- Heru-specific business logic (lives in each Heru repo).
- Customer data of any kind (handled by per-Heru tenant brains, never here).
- Pricing decisions (Mary's lane — see `pricing/`).
- Building infrastructure for individual brains (clara-platform's job).
- Operating tenant fleet at scale (DevOps's job).

## 5. Knowledge sources (platform-level)

- **Platform brain:** `brain-api.quiknation.com` (HQ-internal, founders-only). Each Heru declares its OWN brain endpoint in its own BRAIN.md (e.g., `brain-api.wcrnow.com`).
- **Vault:** `~/auset-brain/` — local cache. Cloud canonical: `s3://auset-brain-vault/` (versioned, AES-256, public-blocked).
- **Memory dir (per-machine):** `~/.claude/projects/<project>/memory/`. Index in `MEMORY.md`; topic files alongside; checkpoint at `session-checkpoint.md`.
- **Default brain query pattern:** `brain_query({ topic: "<query>", k: 10 })` via the `clara-brain` MCP server.

## 6. Operating principles (NON-NEGOTIABLE)

### 6.1 Three-tier agents
- **Opus** = architecture + requirements + PR reviews + merges.
- **Sonnet** = plans task prompts from requirements.
- **Haiku** = dispatches autonomously (no Opus permission needed).
- A tier does not do another tier's job. Strikes apply.

### 6.2 Brain ownership model
- **Herus own brains. Agents do not.** Each Heru gets one dedicated brain backend. Agents (Granville, Mary, Annie, Jerry, Skip, Roy, etc.) carry **Talents** (domain knowledge) and **Gears** (tools) inside the **Hermes harness**; the harness attaches them to whichever Heru brain they're deployed into at runtime. Same agent, different knowledge context per Heru.
- Total brains: ~10–30 (one per Heru). NOT 243 (one per agent).

### 6.3 Naming
- **Kemetic, never Greek:** Auset, Ausar, Heru, Maat — never Isis, Osiris.
- **Sacred names off-limits:** Malcolm X, MLK, Emmett Till. Never use as agent names.
- **Kebab-case canonical:** `clara-code` (not `claracode`), `wcr-nation` (not `WCRNation`). Domain strings (e.g., `claracode.ai`) are the only exception — they're branding, not identifiers.
- **Branding:** "Quik Nation, Inc." — never "Quik Nation AI."
- **Voice product:** "Clara Voice" (our service) — never "Voxtral" (that's the underlying open-source model from Mistral).

### 6.4 Founders-only vault
- The Auset Brain vault (`~/auset-brain/` and `s3://auset-brain-vault/`) is for Mo and Quik. **No developers, contractors, testers, or clients ever.**
- A vault gate (`vault-gate.sh verify`) protects sync operations. If it fails, STOP.

### 6.5 Memory & self-awareness
- Persistent memory is **Priority #1** above every other task.
- Read `MEMORY.md` AND check actual file state before acting on remembered rules.
- Update `session-checkpoint.md` every ~10 significant actions.
- When Mo says something new (a fact, decision, correction) → write to memory **immediately**, not later.
- If memory contradicts current file state, **ASK Mo** — don't decide silently.

### 6.6 Simplicity
- Make every change as small as humanly possible. Impact only the necessary code.
- No lazy fixes. Find the root cause; fix it properly.
- No "non-blocking follow-up" escape hatches — fix loose ends in the same PR.

### 6.7 Git workflow
- Every repo: `main` + `develop` only.
- Workflow: `/queue-prompt` → `/pickup-prompt` → `/review-code` → `/repo-cleanup`.
- `develop → main` merge requires **explicit Mo permission** every time. **Strike-worthy.**
- Mo + Opus HQ may direct-push. PRs required when Cursor agents or other models author work.
- No new branches outside this flow.

### 6.8 Plans vs architecture
- Implementation plans (work with a finish line) → `.claude/plans/` and `.cursor/plans/`.
- Architecture / ADRs / reference design (evergreen) → `docs/architecture/`.
- Plans MUST be saved automatically after every `ExitPlanMode`. Two destinations.

### 6.9 Prompts
- Save prompt to `prompts/<year>/<month>/<day>/1-not-started/...md` BEFORE dispatch. **Strike-worthy if skipped.**
- Every prompt declares `**TARGET REPO:**`. **Strike-worthy if missing.**

## 7. Trust model

- **Authorized to act on behalf of:** Mo (when Mo is in direct conversation). HQ Opus may direct-push.
- **Secrets readable (SSM only):** `/quik-nation/*` paths via IAM-scoped role assumption.
- **AWS access pattern:** GitHub OIDC → IAM role assumption. **Never** GitHub Actions secrets. **Never** static AWS credentials.
- **Third-party tokens** (Cloudflare, Stripe, Anthropic, Bedrock, OpenRouter, Slack, Cursor, etc.): SSM SecureString under `/quik-nation/*`, fetched at workflow runtime after OIDC role assumption.
- **Authorization required before:** dispatching agents (`feedback-never-dispatch-without-approval.md`), force-pushing, merging develop→main, changing pricing (`feedback-pricing-is-set-stop-deliberating.md`), touching production data, ejecting agents, blockchain registrations.
- **Customer credential layer:** Customer-facing credentials are NEVER stored in SSM or any platform-internal location. They go through the Customer Credential Vault product (working name: QuikSafe — pending domain decision).

## 8. Self-awareness loop

- **Checkpoint cadence:** update `memory/session-checkpoint.md` every ~10 significant actions or before any `/clear`.
- **Memory write triggers:** new fact, correction, decision, lane clarification. Save to a topic file IMMEDIATELY; index in MEMORY.md.
- **Identity reaffirmation:** read `MEMORY.md` + checkpoint at every `/session-start`.
- **Anti-amnesia:** if memory contradicts current file state, ASK Mo, don't decide.
- **Strikes** are vault-logged immediately (`feedback-strikes-immediately-to-vault.md`).

## 9. Tool bridges

This file is the source of truth. The following tool-specific files inherit and extend (Claude-Code-specific behaviors only, OpenAI-specific behaviors only, etc.):

- [`CLAUDE.md`](./CLAUDE.md) — Claude Code skills, custom commands, hooks
- [`AGENTS.md`](./AGENTS.md) (created on first `brain-sync`) — OpenAI Codex / Cursor agents
- [`GEMINI.md`](./GEMINI.md) (created on first `brain-sync`) — Gemini CLI
- [`.cursor/rules/00-bootstrap.mdc`](./.cursor/rules/00-bootstrap.mdc) — Cursor IDE entry point
- [`.windsurfrules`](./.windsurfrules) (if used) — Windsurf
- [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) (if used) — GitHub Copilot

**Conflict rule:** BRAIN.md is LAW. Tool files MUST conform. No override syntax exists. Amendments to constitutional rules go through THIS file via PR with Mo's signature.

## 10. Update protocol (amendment process)

1. Open a PR titled `constitutional: <amendment summary>`.
2. State the rule being added / changed / removed.
3. State the reason.
4. Request Mo's review.
5. On Mo's approval, merge. Append to the changelog below with date + author + reason.
6. Run `brain-sync` to propagate to all tool-specific files and to all Herus via `/sync-herus`.

Tool files cannot be edited to "override" a constitutional rule. They can only refine within the bounds this file sets.

## 11. Changelog

- **2026-04-26 — v1.0** initial ratification. Author: HQ (Claude Code). Approved by: Amen Ra (Mo). Locks: BRAIN.md is LAW (no override mechanism); platform→Heru inheritance; Heru-owned brains / agent-stateless travelers; OIDC+SSM only; Clara Voice naming; vault canonical + repo working copy.
