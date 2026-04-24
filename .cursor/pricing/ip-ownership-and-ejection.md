# IP Ownership & Ejection Policy

> **DUAL AUDIENCE.** The policy summary is customer-facing. The detection, fingerprinting, and enforcement details are internal-only.

**Authoritative for:** who owns what, what the VP gets when they eject, how ejection caps work per tier, and how we detect + prevent simultaneous hosting on competing platforms.

---

## The IP Split (NON-NEGOTIABLE)

### VP owns (keeps forever, even on ejection)

The **creative + business** layer:

- Agent identity: name, personality description, role definition (SOUL.md content they wrote)
- Voice: voice samples they uploaded, voice clones made from their own recordings
- Curation: the specific template + skill + tweak bundle they chose
- Data: conversation history, memory entries, customer data, databases
- Business logic: behavior rules, workflows they encoded
- Blockchain certificate: ownership record for each built agent

### Clara owns (stays forever, never exported)

The **platform** layer:

- Hermes harness (runtime orchestration, lifecycle, tool dispatch)
- Cognee knowledge engine (memory graph, context, retrieval)
- Skill implementations (the CODE behind each skill — Stripe integration, calendar scheduling, etc.)
- Model routing (Gemma/Kimi/DeepSeek intelligent routing)
- Voice stack (Whisper + XTTS on Modal, voice server, cloning pipeline)
- Agent template library (Frontend Engineer, Accountant, Lawyer, Publicist, etc.)
- AGENT_IP_WRAPPER (system-prompt IP firewall)
- Tool integrations

---

## Ejection Caps Per Tier

| Tier | Price | Ejections / month | Support During Ejection |
|------|-------|--------------------|--------------------------|
| Basic | $39 | 1 | Self-service (ZIP + docs + FAQ) |
| Pro | $69 | 3 | Self-service |
| Max | $99 | 6 | Self-service |
| Business | $299 | 12 | Self-service |
| Enterprise | $4k+ | Unlimited | Dedicated engineer + migration playbook + on-call during cutover |

**Key rule**: ALL paid tiers from Basic through Business get the **same self-service experience**. No bronze/silver/gold support differentiation — that would create ops overhead without clear benefit. Enterprise gets white-glove support because their contract pays for it.

---

## What Ejection Actually Produces

When a VP clicks "Export / Eject" in the dashboard, they receive:

```
clara-export-2026-04-24.zip
├── agents/
│   ├── marcus-the-accountant/
│   │   ├── soul.md                  # personality + description (scrubbed of Clara infra refs)
│   │   ├── voice_sample.wav         # voice clone input
│   │   ├── conversation_history.json
│   │   └── configuration.json       # name, skill-list (NAMES only, not code), personality tweaks
│   └── simone-the-publicist/...
├── databases/
│   └── user_data.sql                # their data export
├── README.md                        # what they have, what they'd need, ToS reminder
└── SIGNED_ATTESTATION.pdf           # countersigned: "I understand I'm taking my IP, not Clara's"
```

Missing from the ZIP (intentionally, per the IP split):

- No Hermes code / Modal deploy configs
- No Cognee knowledge engine
- No skill implementation code (VP gets skill names, must reimplement)
- No voice server / XTTS weights / Whisper weights
- No routing logic
- No template library (base Frontend Engineer / Accountant / Lawyer templates)

To actually run the ejected agent, a developer needs to stand up their own inference, voice, orchestration, skills, and memory. That's weeks-to-months of engineering. Only hardcore devs will do it.

---

## Ejection ≠ Subscription Cancellation

Ejecting an agent does **NOT** auto-cancel the Clara subscription. A VP can legitimately:

- Build agents on Clara, deploy them to their own infrastructure, keep paying Clara to build MORE agents
- This is Clara's "agent factory" use case — we want it
- Cancellation is a separate action in the billing dashboard

---

## Anti-Double-Hosting (The ToS Rule)

**A VP must NOT run the SAME agent on Clara's infrastructure AND a competing AI platform simultaneously.**

Example of violation:
- Agent "Marcus" serves requests on Clara (Clara bills subscription + collects 15% of invocations)
- AND the SAME agent runs on Anthropic's Managed Agents platform for the same customer flow

This is double-dipping. Detection:

1. **Fingerprinted SOUL.md**: every exported SOUL.md contains a cryptographic watermark tied to the VP's account. If Clara finds that fingerprint live on another AI platform's public listing, it's a breach.
2. **Periodic scans**: Clara scrapes Anthropic's Managed Agents marketplace, OpenAI's GPT store, and similar directories for fingerprints matching our exports.
3. **Quarterly attestation**: dashboard modal — "I confirm none of my exported agents are actively serving on another AI platform while I maintain active Clara deployment of the same agent."
4. **Legal (ToS)**: *"Exported agent configurations are for off-platform use. Running the same agent configuration simultaneously on a competing AI platform while maintaining active Clara hosting is a material breach."*
5. **Enforcement**: detected breach → account paused, resolution required, potential termination. Subscription cancels, no refund.

### What's fine (not a violation)

- Build on Clara, deploy entirely to own infra (Clara hosts 0% — fine)
- Build on Clara, keep hosting on Clara, market everywhere (fine — our whole goal)
- Build on Clara, export for backup/portability insurance (fine, if you don't actively serve on a competitor)

---

## Enterprise Migration Partnership

For Enterprise accounts moving 50+ agents to their own infrastructure:

- **Dedicated engineering contact** (named individual, not a ticket queue)
- **Custom migration playbook** tailored to their infra (AWS/GCP/Azure/self-hosted)
- **Test environment provisioning**: Clara helps stand up a parallel environment for validation
- **On-call support during cutover**: 24/7 for migration week
- **Post-migration audit**: confirm all agents running cleanly on customer infra
- **Subscription continuation option**: customer may keep Clara subscription for new agent creation while running legacy agents on own infra

This is a feature sold as part of the Enterprise contract. It's why they pay $4k+.

---

## Customer-Facing Copy (For the Pricing Page FAQ)

**Q: Can I take my agents elsewhere?**
> Yes. Export any built agent from your dashboard. You'll get your SOUL.md, voice, data, and configuration. You won't get our platform (Hermes runtime, knowledge engine, skill code). Ejecting does NOT cancel your subscription — many customers build on Clara and deploy their agents to their own infrastructure while continuing to use Clara for new builds. Export caps: Basic 1/mo, Pro 3/mo, Max 6/mo, Business 12/mo, Enterprise unlimited with migration engineering support.

**Q: If I sell my agents off-platform, does Clara take a cut?**
> If the agent runs on Clara when a customer hires it, yes — 15% of the invocation (you keep 85%). Where the customer discovered you doesn't matter. Stripe Connect handles payouts across channels. If you eject the agent to your own infra, Clara gets 0%.

---

## Related Files

- **`pricing/customer-facing-page.md`** — the main tier table + FAQ
- **`pricing/marketplace-pricing.md`** — the 15% invocation fee structure
- **`pricing/cogs-and-unit-economics.md`** — internal tier economics
- Memory: `project_harness_agents_and_blockchain.md` — harness vs built agent IP split
- Memory: `project_ejection_policy.md` (to be written alongside implementation prompt in Phase 1)
