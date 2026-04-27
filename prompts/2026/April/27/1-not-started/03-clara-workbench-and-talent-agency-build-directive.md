# Clara Workbench + Talent Agency — Build Directive

**TARGET REPO:** `clara-code` (this repo) for primary build; `claraagents` for Talent Agency consumer surface; `quik-nation-ai-boilerplate` for boilerplate Gear scaffolds; `quik-nation-devops` for the harvest infrastructure.

**Author:** HQ (Claude Code, Opus 4.7), 2026-04-27
**Authorized by:** Mo, 2026-04-27
**Architecture spec:** `quik-nation-ai-boilerplate/docs/architecture/CLARA_WORKBENCH_AND_TALENT_AGENCY.md` — read first, this directive references it throughout.
**Strategic frame:** Mo's exact words 2026-04-27: *"After we come out they are going to start selling tools and skills so we need to create as many of them as possible."* This is the catalog land-grab. We launch with 5,000–10,000 Talents and 50–100 Gears; competitors launch empty.

---

## Capacity check (BEFORE work begins)

Per HQ strike rule "ASK before dispatching, teams are under Mo's direction": /clara-code team confirms current load before this becomes work-in-flight. Active concurrent work as of 2026-04-27 includes:

- CLI/IDE finishing (the-brain-customer wrapper — prompt 17 from 2026-04-26)
- Brain API access control client-side enforcement
- Hermes gateway URL + brand-hygiene work
- Clara Code v1 endpoint catalog implementation

If this directive doesn't fit the current load, /clara-code lead reports back to HQ and Mo decides priority order. **HQ does not unilaterally pile.**

---

## Mission (one paragraph)

Build the Workbench (the agent's workshop) + the Talent Agency (the public Talent marketplace at `talent.claracode.ai`) so Vibe Pros have a stocked toolkit on day one. Workbench has two shelves: **Gears** (services agents provision into clients' deployments) and **Talents** (persona-owned capabilities loaded into the agent runtime). Pre-launch we land-grab 5,000–10,000 Talents from the public OSS / CC-licensed ecosystem, re-author them in our voice with our agent personas, mint them on Base. Post-launch, the **Talent Creator** turns every Vibe Pro into a Talent author, growing the catalog while competitors ship empty.

Read the architecture spec first. Implementation directive below references its sections.

---

## Locks (do not negotiate without HQ ratification)

1. **Vocabulary is locked.** Talents = skills. Gears = tools. Never use "skills" or "tools" in product surfaces, code identifiers, docs, marketing. See architecture spec §2.
2. **License policy MIT / Apache 2.0 / BSD / CC0 / CC-BY only.** No AGPL, GPL, BSL, EPL, SSPL anywhere. No "customer self-deploys" workaround for encumbered tools. See architecture spec §10. Hard CI gate on every PR.
3. **Clean-room means clean-room.** No reading Huashu's repo. No extracting Anthropic prompts via API or otherwise. Re-author from public surface descriptions only. See architecture spec §5.1 and `decision-clara-code-design-clean-room-no-huashu.md`.
4. **Persona-owned Talents.** Every Talent has a primary owner agent (Aaron Douglas / Mary Bethune / etc.). System prompts written in that persona's voice. Cultural references cited from public sources + our original work.
5. **On-chain registration.** Every Talent + every Creation registers on Base via EAS at publish/mint time. No exceptions. See architecture spec §11.
6. **Brand-hygiene gate.** Customer-shipped binaries never contain `quiknation` strings. Per Brain API access control spec, build pipeline greps shipped binaries; release fails if found. Talents and Creations distributed to Vibe Pros must clear the same gate.
7. **No "Phase 2." No "Sprint."** This is one build with order of operations. Quik Nation PM Gear (Huly category) is sequenced AFTER v1 — same delivery, just later. Strike-level naming rule per Mo 2026-04-27.

---

## Order of operations (single delivery)

### Stream A — Workbench foundation
1. **CLI surface** — `clara workbench`, `clara workbench list`, `clara workbench add <gear|talent>`, `clara workbench provision <gear> --target <stack>`, `clara workbench search <query>`. Implement in clara-code CLI (TypeScript, existing Commander.js / Yargs pattern).
2. **IDE surface** — VSCode-extension command palette equivalents. Wire into the existing `.vsix` build.
3. **Workbench state** — JSON manifest in `~/.clara/workbench.json` tracking installed Gears + loaded Talents per project.
4. **Gear scaffold pattern** — define the contract every Gear meets: `provision()`, `configure()`, `verify()`, `uninstall()`. Gears live in `clara-code/gears/<gear-name>/`.

### Stream B — v1 Gears (10 ship immediately)
For each Gear in architecture spec §4 (Payload, PostgREST, Apollo, Refine, Clara Safe, Redash, ntfy, Mise, PersonaPlex, Clara Voice):
1. Implement provisioning module conforming to Gear scaffold contract
2. Write provisioning runbook (Markdown, lives in `clara-code/gears/<gear-name>/RUNBOOK.md`)
3. Wire SSM secret tree where Gear needs credentials
4. License compliance verification (CI gate)
5. Smoke test: provision into a clean Heru, verify works end-to-end

### Stream C — Talent runtime
1. **Talent definition format** (canonical YAML per architecture spec §9). Validator + parser.
2. **Talent loader** in Hermes harness — loads Talent YAML into agent context at runtime.
3. **Talent test runner** — runs Talent against its `testCases` block, scores via LLM-as-judge.
4. **Talent storage** — Talents live as YAML files + minted attestations on Base. Catalog API serves them to clients.
5. **Per-agent Talent inheritance** — when a persona owns a Talent, that persona's SOUL.md auto-loads the Talent in any Hermes session it joins.

### Stream D — Talent Harvest pipeline (the land-grab)
This is the throughput stream. Stand it up early so it runs in background continuously while everything else is built.

1. **Talent Scout** — crawler service. Sources listed in architecture spec §8. License-filter at fetch time. Score by category + uniqueness. Deduplicate. Run on QC1 cron every 4h. Output: candidate list to a Postgres queue.
2. **Talent Author** — Modal GPU job pool. Pulls candidates from queue, invokes per-domain agent (Aaron Douglas for design, Mary Bethune for educational, etc. per spec §14). Reads PUBLIC SURFACE of upstream Talent only. Re-authors in our voice. Generates synthetic test cases. Outputs Talent YAML.
3. **Talent Validator** — Hermes test harness. Runs Talent against its tests. LLM-as-judge scores outputs. Pass/fail/needs-rework.
4. **Talent Registrar** — batch-mints to Base nightly via EAS. Attribution metadata in attestation. Returns receipt UID, written into Talent YAML.
5. **Talent Catalog publisher** — pushes minted Talents to `talent.claracode.ai` API + CDN.
6. **Talent Drift Monitor** — recurring Scout pass; detects upstream changes; flags for Author re-run.

**Tempo:** 50–100 new Talents/day pre-launch. Pipeline scales horizontally on Modal.

### Stream E — Clara Code Design Talent Pack (flagship)
Aaron Douglas's Talent Pack is the product hero. Built clean-room, fresh from public Anthropic Skills surface docs + our cultural lineage.

1. **Aaron Douglas SOUL.md** — Clara Agents team owns; HQ reviews. Includes design philosophy, cultural references (Aaron Douglas himself, Romare Bearden, Catlett, Alma Thomas, Jean-Michel Basquiat, Faith Ringgold), system prompt scaffolds.
2. **10 Talents in pack** (architecture spec §5.1): landing-page, slide-deck, event-flyer, commercial, 3d-scene, motion-design, infographic, dashboard, email-template, app-screen.
3. **Cultural Packs** — markdown specs + reference image galleries + system-prompt fragments. v1: Soul Train, Stax/Motown, Block Party, HBCU, Caribbean fete, Hip-Hop tour, Pam Grier, FUBU/streetwear, Spike Lee, BET commercial cut, Don Cornelius, music-video pack.
4. **Technical libraries integrated** (architecture spec §5.1): Three.js, R3F, Drei, postprocessing, Theatre.js, Framer Motion, Motion One, Lottie, tsParticles, OGL, Remotion, html-to-image, Puppeteer, pdfkit. **GSAP excluded.**
5. **Output formats per Talent** validated end-to-end (1080×1080, 1080×1920, 1080×1350, 1200×628, 4×6 print, 11×17 print, animated MP4/GIF, PPTX, multi-aspect-ratio video).

### Stream F — Other v1 Talent Packs
Per architecture spec §5.2. Each pack: 3+ Talents minimum at v1, owner persona SOUL.md updated, registered on Base.
- Copywriting (Mary Bethune et al.)
- Code Review (David Blackwell et al.)
- Customer Service (Madam C.J. Walker et al.)
- Voice Conversation (Maya Angelou et al. — uses PersonaPlex Gear)
- SEO (Arturo Schomburg et al.)
- Legal Doc (Constance Baker Motley et al.)
- Email/Notifications (Langston Hughes et al.)
- Data Analysis (Dorothy Vaughan et al.)
- Scheduling (Mary Jackson et al.)
- Project Management (Dorothy Height et al.)

### Stream G — Creation pipeline
1. **Creation Manifest schema** — JSON schema validator (architecture spec §6).
2. **Output bundling** — every Talent that emits a Creation packages it per the manifest format. Bundle.tar.gz + manifest.json + previews.
3. **Blockchain mint at creation time** — agents-as-IP rule per `decision-blockchain-agent-registration-ip-provenance.md`.
4. **`clara design send-to-vibes`** command — validates manifest, license-checks deps, POSTs to Quik Vibes ingest API.
5. **Quik Vibes ingest stub** — if `quikvibes.com` Heru not yet bootstrapped, ingest endpoint stubs to a 200 + queues for later. Don't block Clara Code launch on Quik Vibes.

### Stream H — Talent Creator (post-launch viral mechanism)
Per architecture spec §9. The 11 features that beat Anthropic's Skill Creator. Voice-first authoring is the differentiator — wire PersonaPlex Gear to drive the authoring flow.

1. Web surface at `talent.claracode.ai/create`
2. CLI: `clara workbench create-talent`
3. IDE: command palette entry
4. All 11 features per spec
5. Internal team uses Talent Creator to author 50+ Talents pre-launch (dogfooding)

### Stream I — Internal dogfooding
Per architecture spec §12. Quik Nation team uses the Workbench across our 47 Heru projects starting day 1 of v1 stability. Internal usage IS the QA layer. Friction we hit, we fix before public launch.

### Stream J — License compliance CI gates
1. CI check on Clara Code repo: scans dependency tree of every PR; rejects AGPL/GPL/BSL/EPL/SSPL.
2. CI check on shipped binaries: greps for `quiknation` strings (per Brain API access control); fails release if found.
3. CI check on Talent YAML: validates `license` field, validates upstream attribution, validates test cases pass.
4. Talent Validator gate: full-runtime license check before mint.

---

## Acceptance criteria (HQ ratifies before merge)

Mirrors architecture spec §15. Every checkbox passes before the v1 ship is signed off:

### Workbench
- [ ] CLI surface live + tested
- [ ] IDE surface live + tested
- [ ] All 10 v1 Gears installable via single command
- [ ] Each Gear has provisioning RUNBOOK.md
- [ ] License compliance gate green on every Gear

### Talent Agency
- [ ] `talent.claracode.ai` live, browsable, searchable
- [ ] **At least 3,000 Talents harvested + re-authored + minted on Base** (stretch: 10,000)
- [ ] Clara Code Design Talent Pack live (10 Talents + 12 Cultural Packs minimum)
- [ ] Other v1 Talent Packs live (3+ Talents each minimum)
- [ ] Every Talent has: YAML manifest, system prompt in owner-agent voice, test suite, blockchain receipt, attribution

### Creation pipeline
- [ ] Creation Manifest schema validated end-to-end
- [ ] `clara design send-to-vibes` command working
- [ ] Quik Vibes ingest endpoint live OR stubbed safely

### Talent Creator
- [ ] All 11 features live
- [ ] Voice-first authoring tested end-to-end
- [ ] Internal team has authored 50+ Talents using the Creator before public launch

### Cross-cutting
- [ ] License compliance CI gate green
- [ ] Brand-hygiene CI gate green
- [ ] Internal dogfooding pattern documented + active across Quik Nation

---

## Out of scope for this directive (built later, NOT a Phase 2)

- **Quik Nation PM Gear** (Linear/Asana/Huly category) — Mo confirmed for us AND clients post-v1. Owned by /clara-code team or new dedicated team. Clean-room build, MIT license, dual-purpose (internal + Vibe Pro Gear).
- **Hyperspace Pods Gear** (BYO compute) — evaluate post-launch.
- **Customer-facing Quik Vibes profile pages with custom domains** — Quik Vibes team owns when bootstrapped.
- **Talent monetization beyond per-use + subscription** (auctions, bundles, time-limited offers) — post-launch when usage data informs.

These are NOT phases. They are sequenced after v1 ships, as part of the same continuous delivery, no naming as phases per Mo's strike rule.

---

## Sign-off

- HQ writes ✅ (architecture + this directive, 2026-04-27)
- Mo authorizes ✅ (verbal, this session, 2026-04-27)
- /clara-code lead capacity check — **PENDING**
- Dispatch — **AWAITING MO**

When /clara-code lead confirms capacity (or Mo names the priority slot), this becomes work-in-flight. Until then, this prompt sits in `1-not-started/` as a ready-to-execute architecture-ratified build directive.

---

*Written by HQ (Claude Code, Opus 4.7), 2026-04-27. Boilerplate architecture spec at `quik-nation-ai-boilerplate/docs/architecture/CLARA_WORKBENCH_AND_TALENT_AGENCY.md`.*
