# Clara Usage Pricing Philosophy

**Classification:** Internal Strategy — Founders Only
**Author:** Amen Ra Mendel (CTO), from session with Mo (Rashad Campbell)
**Date:** April 10, 2026 (v1.0) | **Updated:** April 10, 2026 (v1.2)
**Version:** v1.2
**Status:** Canonical Philosophy — Numbers Deferred to pricing/

> Cross-reference: All final tier numbers live in
> `/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate/pricing/`
> This document is the WHY. That directory is the WHAT.

---

## The Core Principle

> **"Conversations are free. Actions have value."**

This is the north star. Every pricing, UX, and product decision flows from this sentence. When something doesn't fit, test it against this sentence first.

---

## The Problem We Are Solving

The biggest negative about AI right now is usage limits and hitting walls mid-conversation. People hate it. It is disrespecting. It breaks trust at the exact moment a user is engaged and vulnerable — right in the middle of a thought.

And yet people keep paying anyway. That means willingness to pay exists. The problem is not willingness to pay. The problem is WHERE the wall appears.

ChatGPT walls mid-conversation. Claude walls mid-conversation. Gemini walls mid-conversation. This is the most disrespecting UX in the technology industry. Clara never does this.

**The goal is not just to deliver value. The goal is to make people FEEL value.** By the time a user pays, they should not feel like they are buying a product. They should feel like they are investing in themselves — in a relationship they already have.

---

## The Economic Reality

Voice conversations where nothing is persisted are essentially free to serve at scale.

| Action Type | Est. Cost to Serve | Example |
|-------------|-------------------|---------|
| Ephemeral voice exchange | ~$0.005 | "What do you think, Clara?" |
| Ephemeral text exchange | ~$0.001 | Quick question/answer |
| Vault write (memory save) | Real cost | "Clara, remember this" |
| Agent task (research/write/build) | Real cost | "Find me three vendors" |
| Background agent | Real cost | Runs while user is offline |
| Voice clone use | Real cost | Rendered with cloned voice |
| Document generation | Real cost | PDF, deck, report |

The conversation — the greeting, the hug branch, discovery, "what do you think?" — is cheap to serve and priceless to the relationship. The persistent actions are where real compute occurs. Price accordingly.

---

## The UX Rule (NON-NEGOTIABLE)

**Never interrupt a conversation with a usage wall.**

Usage gates appear BEFORE an action begins. Never mid-sentence. Never mid-thought. Never after a user has already emotionally committed to something.

**Correct pattern:**
> "You have 2 agent tasks left this month. Want me to start this research now, or save it?"

**This happens BEFORE the task begins.** The user decides with full information. They are never surprised.

**Incorrect pattern:**
> [User asks for research task]
> [Clara starts]
> [Mid-way] "You've hit your limit. Upgrade to continue."

This is what the incumbents do. Clara never does this. The conversation box is always open.

**The rule in one line:** Actions have limits. The relationship doesn't.

---

## Tier Structure (Draft — Numbers Subject to pricing/ Directory)

> These are structural drafts only. All final prices and quotas are the authority
> of `/pricing/product-tiers.md` and related files.

| What | Free | Pro | Business |
|------|------|-----|----------|
| Conversations (voice + text) | Unlimited | Unlimited | Unlimited |
| Vault saves (memory writes) | 10/month | Unlimited | Unlimited |
| Agent tasks | 5/month | 50/month | Unlimited |
| Voice clone use | 1 (signup hook) | 3 clones | Unlimited |
| Background agents | No | No | Yes |
| Team agents | No | No | Yes |
| API access | No | No | Yes |
| Document generation | Limited | Included | Included |

The conversation is never gated. The relationship is never paused. The limit is on what talking LEADS to.

---

## The Two-Layer Model: Immutable vs. Mutable

Mo's final crystallization of this model:

> **"If it's immutable, it's free."**

Immutable tasks have no variance — same input produces the same output, every time. They are pure functions. They do not require judgment, creativity, or reasoning. You can write them down once and they run identically ten thousand times. These are free at every tier, always.

Mutable tasks require thinking. The output changes based on context, judgment, and inference. Clara has to reason. These are metered.

---

Not all "actions" are created equal. Mo identified a core distinction that reshapes how we think about unlimited and metered usage.

**Immutable (formerly "Routines")** — scripted, deterministic tasks. Email sorting, filtering, and auto-rules. Calendar scheduling and reminders. Contact management. File organization. Social post scheduling. Data sync. Form auto-fill. Price tracking. Simple notifications. These tasks require no LLM reasoning — just execution. Clara does not think through an immutable task; she runs it. The cost to serve is effectively zero — these run on **Qwen3 (self-hosted on Modal)**, not a paid API. No per-token cost. Just GPU compute time at Modal scale. This is why immutable tasks are unlimited at every tier, forever. There is no economic argument for capping them, and no user experience argument either.

**Mutable (formerly "Reasoning")** — agent loop tasks requiring real inference. Research, writing, code generation, complex analysis, synthesis, problem-solving, sophisticated email drafts, proposals. Multiple LLM calls. Tool use. Real inference. These run on **Claude Sonnet or Opus** via Bedrock. The cost to serve scales with depth (~$0.05–$0.20/task). These are the tasks that change your situation. These are the haircut, not the handshake.

> "If Clara just needs to DO it — it's free. If Clara needs to THINK about it — that's a Mutable task."

**Model routing by task type:**

| Task type | Model | Infrastructure | Cost |
|-----------|-------|---------------|------|
| Immutable (scripts, automation) | Qwen3 | Self-hosted Modal | ~$0.00001/run |
| Mutable (reasoning, agent loops) | Claude Sonnet/Opus | AWS Bedrock API | ~$0.05–$0.20/task |
| Voice synthesis | XTTS v2 | Self-hosted Modal | ~$0.01/request |

The practical consequence is that even a category like "email management" splits across the two layers. Auto-sort rules, templates, and filters are immutable — unlimited, no ceiling at any tier. Writing a nuanced response to a difficult message is mutable — it draws from the monthly credit. Clara knows the difference and routes accordingly. The user feels this as a natural distinction, not a gotcha.

**Updated FREE tier:**
- Unlimited conversations (voice + text, ephemeral)
- Device vault: unlimited saves, gated on audio minutes stored (e.g., last 60 minutes of voice memories). Data lives on-device — we hold nothing. GDPR/CCPA clean.
- Unlimited Routines (email rules, calendar, reminders, scripted automations — no ceiling, ever)
- 1 Reasoning task/month
- 1 voice clone (acquisition hook)

**Updated PRO tier:**
- Unlimited conversations
- Cloud vault: unlimited + syncs from device + permanent retention + cross-device. The upgrade is "your memories follow you everywhere," not "pay us to store your data."
- Unlimited Routines (same as free — no ceiling at any tier)
- 50 Reasoning tasks/month (research, write, code, complex analysis)
- 3 voice clones

> Final quotas and prices live in `pricing/product-tiers.md`. These are structural drafts that define the model, not the numbers.

---

## The Device-First Vault

For free users, Clara's vault lives entirely on their device — both mobile and desktop. We hold zero data for free users. This is not a privacy policy claim; it is an architectural fact. Nothing leaves the device unless the user explicitly upgrades to cloud vault.

This approach makes the privacy promise airtight. "Clara listens. She only remembers what you ask her to." That sentence is true at a systems level — not just a marketing line. There is nothing to subpoena, nothing to breach, nothing to accidentally expose.

The free vault is gated by audio minutes, not by save count. For a voice-first product, minutes are the natural unit. A user who captures ten minutes of voice memory and ten written notes has used roughly the same storage as a user who captured twenty minutes of voice. Minutes give the user an intuitive sense of their vault without requiring them to count saves.

The Pro upgrade hook is not "pay us to store your data" — it is "your memories follow you to any device." Cross-device sync is the genuine upgrade. The value is continuity. Clara remembers you on your laptop the same way she remembers you on your phone. For free users, switching devices means starting over. For Pro users, Clara travels with them.

This framing matters for positioning. We are not holding data hostage behind a paywall. We are offering a convenience that costs real infrastructure to deliver. The free tier is complete. The Pro tier is expanded. That is the correct way to present the distinction — internally and to users.

---

## The Barbershop Model (Alonzo Herndon)

Alonzo Herndon built Atlanta Life Insurance — the largest Black-owned insurance company in American history — starting from a barbershop at 66 Peachtree Street.

But he did not make his community pay for conversation. He gave away the newspaper. He gave away the shoeshine. He gave away the community. The barbershop was the gathering place. The RELATIONSHIP was free.

He charged for the haircut. The thing that actually changed your situation. The service that transformed you when you walked out the door.

**Clara's free conversation is the community.** The discovery, the support, the "what do you think?" — that is the gathering place. It is free because it builds the relationship. It builds trust. It makes people feel seen.

**The agent tasks are the haircut.** Research, building, writing, background work — these change your situation. These have a price. And by the time someone pays that price, they already feel the value of being in the room.

---

## The Madam CJ Walker Principle

Madam CJ Walker did not lead with the price. She led with the feeling. She gave women the experience of what it felt like to be seen, treated, and transformed. She let them feel the outcome before they committed to the cost.

By the time they paid, they were not buying a product. They were investing in themselves. In who they could become.

**Every free Clara conversation is a sales call that doesn't feel like one.**

The discovery conversation, the advice, the "I see you" exchange — this is the demonstration. Clara earns trust in free. Clara earns revenue in action. The relationship between the two is the business model.

---

## The Quote That Names It

> "You don't charge people for talking. You charge them for what talking leads to."
>
> — Nikki (Nikki Giovanni, April 10, 2026)

This quote goes on the wall. It is the pricing philosophy in one sentence.

---

## Competitive Differentiation

| Platform | What Gets Walled | When the Wall Appears |
|----------|-----------------|----------------------|
| ChatGPT | Conversations (message count) | Mid-conversation |
| Claude | Conversations (daily cap) | Mid-conversation |
| Gemini | Context and features | Mid-conversation |
| **Clara** | **Actions (tasks, saves, builds)** | **BEFORE the action starts** |

The incumbents price the wrong thing. They price conversation — which is the relationship. They kill the relationship to protect margin. This is bad economics and bad ethics simultaneously.

Clara prices action — which is the value. The relationship stays whole. The meter only runs when something real is happening.

This is not just a marketing position. It is a structural advantage. Once users experience Clara's always-open conversation, the incumbents' walls will feel like what they are: disrespect.

---

## Implementation Notes

1. **The greeting is always free.** No exception. Clara always says hello.

2. **Discovery is always free.** Any conversation that does not result in a vault write, task, or deliverable is free. Clara can talk for hours. That is the point.

3. **The pre-action gate is a UX feature, not a punishment.** Frame it as "here's what this will use" — not "you're running out." The tone is informational and empowering, never punitive.

4. **1 free voice clone at signup.** This is the acquisition hook, confirmed April 9, 2026. The clone is the demonstration of Clara's transformation. See `decision-voice-cloning-free-signup-hook.md` in vault.

5. **Free tier is a business model, not a charity.** Free users generate data, referrals, and future conversions. The 5 agent tasks on free are enough to feel the haircut. That is intentional.

6. **The upgrade prompt is Clara's voice, not a popup.** "You've used your 5 tasks this month — you want me to be able to do more? Here's how." Clara asks. A modal doesn't interrupt.

---

## What This Document Is Not

This document is the philosophy and framework. It is not:

- The final tier prices (see `pricing/product-tiers.md`)
- The final agent task quotas (see `pricing/product-tiers.md`)
- The voice clone tier breakdown (see `pricing/voice-tiers.md`)
- The vault write pricing architecture (see `pricing/vault-and-blockchain.md`)

All numbers belong in the `pricing/` directory. This document belongs in `prompts/` because it is the thinking that precedes the numbers — the founder's intent that must survive every pricing revision.

When the numbers change, this philosophy does not. When someone argues for walling the conversation, this document is the answer.

---

*Classified: Founders Only. Quik Nation, Inc. Internal Use.*
*Do not share with developers, testers, contractors, or clients.*
