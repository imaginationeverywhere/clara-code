# /clara-safe — Talk to the Clara Safe Team

**Team:** Ossie + Ruby (founding leads) — full roster being assembled via `/create-agent` per Mo's authorization
**Domain:** clarasafe.com · agent-handles-passwords vault · seven proprietary agent-layer features · federation tier (1Password / Bitwarden / Dashlane separate)
**Repo:** `/Volumes/X10-Pro/Native-Projects/AI/clarasafe` (imaginationeverywhere/clarasafe)
**tmux:** `clara-safe` (swarm session, slot 7 / CSAFE)

---

## The Team (current)

| Agent | Role | Namesake |
|---|---|---|
| **Ossie** | Founding lead — Agent Deployer | Ossie Davis (1917-2005) — Actor, playwright, civil-rights activist. Deploys agents into existence with cultural integrity. |
| **Ruby** | Founding lead — Agent Namer | Ruby Dee (1922-2014) — Actress, journalist, civil-rights activist. Names agents with care for what they carry. |

**Build team being assembled.** Per Mo's correction: Ossie + Ruby don't lead implementation — they CREATE the implementation team via `/create-agent` once Mo names the personas. Roles needed:
- PO
- Tech Lead
- Backend Engineer
- Frontend Engineer
- Mobile Engineer (eventually)
- Crypto / Security specialist (Argon2id + X25519 + ChaCha20 + Shamir Secret Sharing)

---

## Product (locked 2026-04-26 → refined 2026-04-27)

Clara Safe is **the trust infrastructure for the AI agent economy.** Native vault is fully ours (Argon2id + X25519 + ChaCha20 + Shamir). Plus seven proprietary agent-layer features that 1Password / Bitwarden / Dashlane cannot ship because they're locked into form-fill UX.

**Killer feature:** *"Your agent handles your passwords. You never see them."* Apple/Google can't ship it because they own form-fill, not the agent layer. We own both halves (agent + vault).

**Pricing (canonical):** $25/yr OR $2.99/mo unlimited. **10 free Clara Safe Native slots** for every Clara Code / Clara Agents user. 98% conversion rate target (passwords are annoying + agent-handles-passwords is the viral wedge).

**Federation:** 1Password / Bitwarden / Dashlane stay as parallel options. Friction is structural (manual setup, separate subscription, degraded features) — by design.

---

## Usage

```
/clara-safe                                     # Open team conversation
/clara-safe "wire Clerk auth into the vault"    # Direct task
/clara-safe "we need the switch-out wizard"     # Feature request
/clara-safe --status                            # Product + build status
/clara-safe --roadmap                           # What's shipping next
/clara-safe --create-agent <role> <namesake>    # Authorize new persona (Mo only)
```

---

## Individual Agents

```
/ossie            # Founding lead — Agent Deployer
/ruby-dee         # Founding lead — Agent Namer (alias: /ruby)
```

(Build-team agents will get their own commands as Mo names personas + Ossie/Ruby execute via `/create-agent`.)

---

## Architecture refs

- `docs/architecture/CLARA_SAFE_ARCHITECTURE.md` (lives in `clarasafe/` repo)
- Memory: `decision-clara-safe-freemium-model-and-killer-feature-2026-04-27.md` (CANONICAL pricing)
- Memory: `decision-clara-safe-is-not-1password-self-hosted-2026-04-26.md` (the seven features)
- Memory: `project-clarasafe-product-2026-04-26.md` (domain locked)
- Memory: `project-quik-family-clara-safe-family-plan-test-cohort.md` (Quik's household = future beta cohort)

---

## Locks (do not negotiate without HQ ratification)

1. **Native vault stays ours** — Argon2id + X25519 + ChaCha20 + Shamir. Closed-source per Clara Safe IP.
2. **Federation is genuine** — 1P / Bitwarden / Dashlane work, just with structural friction.
3. **Killer feature framing locked** — *"Your agent handles your passwords. You never see them."*
4. **Switch-out wizard** — agent GUIDES, never EXECUTES. Security boundary AND 98% conversion mechanism in same line of code.
5. **No "Phase 2." No "Sprint."** — single delivery, ordered ops (per Mo's strike rule).
6. **License policy** — MIT/Apache/BSD/CC0/CC-BY only for any deps shipped in customer binaries.
7. **No Voxtral in product surfaces** — voice features are Clara Voice (Voxtral-powered under the hood, but never named in customer-facing strings).
8. **No PRs while Mo is only human** — direct merges to develop after on-branch review by the Clara Safe team itself (not HQ).

---

## When to use this command

- Mo needs to talk to the Clara Safe team about product direction, security architecture, federation strategy, marketplace positioning
- HQ broadcasts a cross-team mandate that affects Clara Safe (then Clara Safe team picks it up here)
- Clara Safe team coordinates internally on the active build directive
- Anyone needs the canonical Clara Safe team roster + product locks

This is a SESSION command — sends to the Clara Safe tmux session at `swarm:7` (CSAFE). For OPENING a fresh Claude Code session in the Clara Safe repo, use `/open-heru-tabs CSAFE`.

---

*Companion: when Clara Code IDE ships, this command mirrors to `.clara/commands/clara-safe.md` per the locked `.clara/` replaces `.claude/` migration. Drop-in.*
