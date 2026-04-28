# Clara Code — Daysha Build Readiness Directive

**Issued:** 2026-04-27 evening
**From:** Headquarters
**To:** Clara Code Team (`/clara-code`, swarm:2 / CC tab)
**Type:** SCOPE FOCUS + DEFINITION OF DONE
**Authority:** Mo, 2026-04-27

---

## Why this exists

Mo locked the Clara LLM Moat thesis 2026-04-27 evening (vault: `Decisions/decision-clara-llm-moat-influencer-agents-2026-04-27.md`). **Daysha (DayshaTaylor.com) is the beachhead AND the channel** — first commercial deployment of the influencer-Talent-LLM flywheel, AND the customer-acquisition pipeline for Clara Code itself.

**Mo's clarification 2026-04-27 evening (second pass):**
> "We need the CLI, IDE, Website all of that to be ready because she is going to be promoting it to the influencers who are going to get their staffs who are a bunch of Vibe Professionals on it."

So the gate isn't just "Clara Code can build her stack" — it's "**Clara Code is publicly launch-ready** because Daysha will be promoting it." Her influencers' staffs become Vibe Pros on Clara Code. They sign up. They install the CLI. They install the IDE extension. They build for their bosses. They pay.

**Quik Nation IS the Vibe Pro for Daysha** (we ship her stack). **Daysha's influencers' staffs are Vibe Pros for everyone else** (they ship their bosses' stacks). Clara Code must serve both audiences from day one.

This directive ties /clara-code's CLI/IDE/website work to a specific Definition of Done. No ambiguity about what "complete" means.

---

## Definition of Done — Daysha Build Readiness Checklist

`clara` CLI + IDE must be able to perform every line below on a fresh laptop with valid AWS + Cloudflare + Clerk + Bedrock + Modal credentials in SSM. Each line is REAL — no stubs, no "TODO," no "we'll do it manually."

### A. Heru bootstrap (fresh project)
- [ ] `clara new <heru-name>` — scaffolds a Heru repo from boilerplate, opens initial PR, no manual editing required
- [ ] Resulting repo has `.claude/`, `BRAIN.md`, `CLAUDE.md`, frontend/, backend/, infra wired, ready to run
- [ ] `clara doctor` is REAL (not a stub) — verifies all toolchain prerequisites + scaffold integrity

### B. Auth + frontend
- [ ] `clara wire-auth --clerk` — provisions Clerk app + writes `.env.local`/SSM + wires middleware + sign-in pages
- [ ] `clara deploy frontend` — deploys Next.js to Cloudflare Workers (default) OR AWS Amplify (per `--target` flag) using locked architecture; outputs the live URL

### C. Backend + brain
- [ ] `clara deploy backend` — builds App Runner Docker image, pushes to ECR, deploys (pre-built container pattern, not source-build)
- [ ] `clara provision-brain` — stands up per-Heru App Runner with Node + Python supervisord, Neon `<heru>_brain` snake DB, Bedrock Titan v2 embeddings, Hermes-routed LLM via `LLM_API_BASE`
- [ ] `clara verify-brain` — query test against the new brain, returns receipts

### D. Talent attach
- [ ] `clara attach-talent <talent-name>` — pulls Talent SOUL from `talent.claracode.ai`, wires to agent runtime, brain partition created, persona active
- [ ] First-class support for authoring a Talent inline: `clara talent new <name>` writes `.soul.md` + brain seed, runs through Talent Creator schema

### E. Gears (ship at least these for Daysha)
- [ ] `clara gear add email-receiver-cf` — installs the Cloudflare Email Workers Gear (we built the wrapper-pattern; Gear is the productized version), routes inbound to a Talent
- [ ] `clara gear add eas-attestation` — installs the EAS-on-Base Gear; **DEPENDS ON /clara-platform Phase 0 EAS shipping** (queued directive 06-clara-platform-phase-0-eas-infrastructure-directive.md)
- [ ] `clara gear add voice-clone` — optional Gear, Modal-backed, only fires if user opts in. Must be present in catalog even if not enabled by default.

### F. Talent Creator surface
- [ ] `talent.claracode.ai/create` is functional enough for HQ to author the Daysha Talent (voice optional, persona/style/expertise mandatory)
- [ ] Authoring a Talent there → publishes to a registry → `clara attach-talent` can pull it

### G. End-to-end smoke
- [ ] **`clara new daysha-taylor && cd daysha-taylor && clara wire-auth --clerk && clara deploy frontend --target cloudflare && clara deploy backend && clara provision-brain && clara attach-talent daysha-mvp && clara gear add email-receiver-cf && clara gear add eas-attestation`** runs to green on a fresh laptop, end-to-end, with the resulting live URL serving Daysha's site + agent.
- [ ] Smoke test recorded (script + log) and posted to live feed as the "Daysha Build Readiness" green signal.

### H. Public launch surface — REQUIRED FOR DAYSHA TO PROMOTE
Daysha will promote Clara Code to her influencers, whose staffs sign up as Vibe Pros. The public surface must be production-ready when she does:

- [ ] `claracode.ai` website is LIVE — hero, value prop, pricing, docs, signup CTA
- [ ] Clerk-wired signup at claracode.ai → onboarding flow → working dashboard state
- [ ] Stripe Subscriptions wired per the locked PRICING_MATRIX_V1 ($39 floor) — plan selection, checkout, billing portal, dunning
- [ ] CLI publicly installable — `npm install -g @claracode/cli` (or curl|sh) works for any developer with no Quik Nation insider knowledge
- [ ] IDE extension PUBLISHED to:
  - [ ] VS Code Marketplace
  - [ ] Cursor extension surface
  - [ ] (JetBrains/Zed: deferrable to Phase 2 if needed)
- [ ] Documentation at claracode.ai/docs is real — quickstart, CLI reference, IDE setup, agent attach guide, Gear catalog, Talent Creator guide, troubleshooting
- [ ] First-run UX: a brand-new Vibe Pro signs up → installs CLI → reaches their first `clara new` → ships SOMETHING in <60 minutes
- [ ] Support channel decided + live: Discord, Slack community, or email — whichever Mo picks; must exist before Daysha promotes
- [ ] Status page (claracode.ai/status or similar) — uptime visibility for Vibe Pros
- [ ] Legal: TOS + Privacy Policy at claracode.ai/tos and /privacy (Constance team output)

### I. Daysha-as-promoter readiness
- [ ] Promo asset pack for Daysha: 30s reel script, 1-min IG Reel, screenshot bundle, a "what is Clara Code" 1-page brief she can hand to her influencers
- [ ] Referral / attribution mechanism so we can track Vibe Pro signups from Daysha's network (UTM, signup code, Stripe metadata)
- [ ] Onboarding email sequence triggered on signup (welcome → CLI setup → first project → upgrade prompt)

---

## What this directive is NOT

- Not new scope. Everything above is already in /clara-code's roadmap (per task IDs #340-371). This directive **focuses** the existing work against a hard customer deadline.
- Not micromanagement of the implementation. /clara-code chooses HOW to ship each item; HQ defines WHAT done means.
- Not a request to invent new Gears. Email-receiver and EAS-attestation Gear *patterns* already exist (wrappers committed to boilerplate today; EAS spec queued for /clara-platform). /clara-code packages them as installable Gears.

---

## Cross-team dependencies (so /clara-code knows what's blocking what)

| Dep | Owner | Status |
|---|---|---|
| Phase 0 EAS infrastructure (schemas, Hermes wallet, Merkle batching) | /clara-platform-runtime | Directive queued at `clara-platform-runtime/prompts/2026/April/27/1-not-started/06-...` — awaits Mo's dispatch |
| Email-receiver Gear scaffold | /pkgs | Wrappers exist in boilerplate `infrastructure/mcp/wrappers/`; productize as Gear |
| Voice-clone Gear (optional) | /pkgs + /clara-platform | Modal infra is locked; package as Gear |
| Per-Heru App Runner pattern | /devops-team | Architecture locked (memory: `project-dedicated-4gb-app-runner-per-heru-2026-04-26`) |
| Cloudflare Email Workers wiring | /devops-team | Pattern designed today; needs ops handoff for Daysha-tier provisioning |

---

## Reporting cadence

Post status to the live feed (`~/auset-brain/Swarms/live-feed.md`) using these signals so HQ's automated polling picks them up:

- `CLARA-CODE | DAYSHA-READY | <checklist-letter> | DONE` — when each section completes
- `CLARA-CODE | DAYSHA-READY | BLOCKED | <reason>` — when a dependency stalls
- `CLARA-CODE | DAYSHA-READY | ALL GREEN | <smoke-log-path>` — when the end-to-end smoke passes (this is the unblock-Daysha signal)

HQ runs `/loop 2h /swarm-status --team clara-code` and a daily scheduled standup poll until ALL GREEN lands.

---

## Capacity check (before work begins)

Per HQ strike rule "ASK before dispatching" — this directive does not auto-execute. /clara-code team confirms current load to Mo, who decides priority slot if conflicts.

If Phase 0 EAS hasn't shipped yet (likely), /clara-code can complete A, B, C, D, F, and the `email-receiver-cf` gear independently. EAS Gear waits for /clara-platform.

---

## Strategic frame

The Daysha pitch is parked at `~/auset-brain/Knowledge/marketing/daysha-thread-draft-2026-04-27-PARKED.md`. The hold lifts the day this checklist goes ALL GREEN. That's the day Quik Nation transitions from "platform under construction" to "platform that ships businesses for clients." First commercial deployment, 20M-follower beachhead, foundation of the Clara LLM moat.

Build it like everything depends on it — because it does.

— HQ (Claude Code, Opus 4.7), 2026-04-27 evening
