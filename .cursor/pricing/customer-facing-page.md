# Customer-Facing Pricing Page — What Users See

> **CUSTOMER-FACING COPY.** This is what renders on claracode.ai/pricing. No COGS numbers. No provider names. No time windows. No usage counters.

**Source of truth for the pricing page.** The React components in `frontend/` render from this structure.

---

## The Pitch (Hero)

> **# Configure your first AI hire for $39.**
>
> Clara is the brain. You configure specialized agents — a frontend engineer, a backend developer, a voice agent builder — to do the work.
>
> No usage limits. No counters. Focus on what you're building.

---

## Philosophy — Why No Usage Limits

Clara Code exists for **Vibe Professionals** — founders, builders, and creators who ship voice-first products: websites, mobile apps, desktop tools, CLIs, and AI agents.

The #1 killer of creative flow is worrying about quotas. Clara doesn't do that. **You use Clara as much as you want.** The subscription covers the compute. We route behind the scenes to keep costs low and quality high — you never see the routing.

The only thing that matters to you is: **How big is your team, and what can they build?**

---

## The Decision Page

Every tier includes **premium voice, custom voice cloning, best-available AI**, and **unlimited usage**. What changes is how many agents work for you.

| | **Basic** | **Pro** | **Max** | **Business** | **Enterprise** |
|--|:-:|:-:|:-:|:-:|:-:|
| **Monthly price** | **$39** | **$69** | **$99** | **$299** | **$4,000+** |
| **Harness agents (team working for you)** | **3** | **6** | **9** | **24** | **350** |
| **Build new agents / month** | 1 | 3 | 6 | 12 | Unlimited |
| **Eject agents / month** | 1 | 3 | 6 | 12 | Unlimited |
| **Best for** | Solo builder, first agent | Small team build-out | Full product team | Agency / product shop | Full-company deployment |
| **Unlimited usage** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Premium voice + custom clones** | ✅ | ✅ | ✅ | ✅ | ✅ brand voices |
| **Best AI thinking** | ✅ | ✅ | ✅ | ✅ | ✅ dedicated |
| **Host agents on Clara + sell anywhere** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Memory across sessions** | ✅ personal | ✅ personal | ✅ personal | ✅ team | ✅ federated |
| **Support** | Email (48h) | Email (48h) | Email (48h) | Email (48h) | Dedicated manager + SLA |

---

## The Agent Configurator (at Signup)

This is the heart of the Clara Code signup. Instead of "pick a tier," new users get asked: **"What do you want to build?"**

Their answer maps to a suggested agent configuration:

| User says... | Clara suggests | Tier |
|--------------|----------------|------|
| "A simple website for my business" | 1 Frontend Engineer with Next.js + Tailwind skills | Basic $39 |
| "A booking app for my barbershop" | 1 Full-Stack Engineer with barbershop vertical skill | Basic $39 |
| "An ecommerce store" | 3 agents: Frontend + Backend + Stripe integrations | Pro $69 |
| "A SaaS with mobile app" | 6 agents: +Mobile + QA + DevOps | Max $99 |
| "Run my business and have agents talk to customers" | 12 agents + runtime agent builder | Business $299 |
| "Replace my dev team" | Enterprise consultation | Enterprise |

Users see the exact agents on their team with names, voices, and specialties. They can reconfigure anytime.

---

## Plain-English Tier Explanations

### Basic — $39/mo — "Your first team"

A team of **3 harness agents** cloned from Clara's template library — pick frontend engineer, backend developer, accountant, publicist, whatever fits your gig. They work for you. With this team you can **build your first agent** (the product you ship) at 1 new agent per month.

**What Basic is for:** Solo founders, side-project builders, barbershop owners, real estate agents, personal trainers — anyone running a one-person operation who needs a small team of AI hires to ship a website and their first custom agent.

### Pro — $69/mo — "Small team"

**6 harness agents**, more templates to draw from, **3 new agents per month** to ship.

**What Pro is for:** Freelancers shipping client work weekly. Founders building multi-project pipelines. Indie hackers with 2-3 side projects running.

### Max — $99/mo — "Full team"

**9 harness agents**. Every role you'd need for a full product — frontend, backend, DevOps, mobile, QA, research, design, plus accountant and publicist if you want them. **6 new agents per month** to ship.

**What Max is for:** Startups shipping production. Vibe coders running at full speed. Teams of 1-3 humans with big ambitions.

### Business — $299/mo — "Agency scale"

**24 harness agents** — full agency capacity. Configure multiple specialists per role. **12 new agents per month** to ship AND the unlock: those built agents earn you 85% of every invocation, whether a customer hired them through claraagents.com, your own website, an affiliate funnel, or anywhere else. Stripe Connect handles payouts across channels.

**What Business is for:** Agencies running client work at volume. Product teams operating live platforms. Founders turning into agent developers with recurring marketplace revenue.

### Enterprise — $4,000+/mo — "Full-company"

**350 harness agents** in configurable teams. Dedicated infrastructure. Custom brand voice cloning. SSO, audit logs, SLA, white-glove onboarding. Priority model routing. Unlimited agent builds. Full migration support if you ever need to run agents on your own infra — dedicated engineering help included.

**What Enterprise is for:** Companies replacing their entire engineering org with Clara. Running Clara at scale across departments.

---

## How Usage Really Works

**You don't watch a counter.** Clara shows you nothing about usage unless something is actually wrong (extreme abuse detection, which affects ~0.1% of users).

Behind the scenes, we route your requests intelligently:
- Most tasks → our own self-hosted open-source AI (fast, free for us to run on Modal GPUs)
- Complex reasoning tasks → routed to premium inference silently
- Voice (STT + TTS) → our own Modal GPUs

The subscription covers all of this. We don't nickel-and-dime you per token.

### What's actually capped?

Only what would indicate abuse:

- **Rate limiting**: max 120 requests/minute (anti-bot — you'll never hit this legitimately)
- **Review trigger**: 300+ active hours/month flags your account for a support check-in (a human codes ~8hrs/day max; 300 hrs/mo is 10 hrs/day × 30 days)
- **Hard protection**: if you somehow burn $100+ of our infrastructure in a month, we pause and reach out to understand the use case

These are NOT user-facing. You only see them if you're genuinely trying to abuse the system.

---

## Clara Credits (Optional for Power Users)

If you want to pre-pay for extended compute (team reimbursement, budget predictability, enterprise expense planning), Clara Credits let you bank hours:

| Credit Pack | Price | Equivalent |
|-------------|-------|-----------|
| 100 hours | $29 | Safety buffer for a heavy month |
| 500 hours | $99 | Power-user reserve |
| 1,500 hours | $249 | Enterprise budget bucket |

**Credits never expire. You don't need them.** They exist for predictability — you can run a quarter without any surprise flags.

---

## FAQ

**Q: Is it really unlimited?**
A: Yes, within fair use. If you're coding a normal schedule (even heavy — 8-10 hrs/day), you will never hit a limit. You don't need to think about it.

**Q: What if I need more agents mid-month?**
A: Upgrade instantly, prorated. Your existing agents stay; new ones spin up.

**Q: What if I want to switch which agents I have?**
A: Reconfigure anytime. Your agents persist — you can retrain one (Frontend → Mobile), or retire and replace one.

**Q: Can I change tiers mid-month?**
A: Yes. Upgrade instant + prorated. Downgrade at end of current billing cycle.

**Q: Is my work private?**
A: Your vault is yours. Your agents are configured for you. The marketplace is opt-in.

**Q: What models does Clara use?**
A: Clara is the brain. We route to whatever model gets you the best answer. The specific models are our secret sauce — you get Clara, not a branded LLM wearing a costume.

**Q: What if I have a Claude Code subscription already?**
A: Add Clara as a plugin. Clara brings memory, voice, agent team, and vault. Your Claude Code brings the reasoning. Same $39 tier, 85%+ of our margin (our best deal for power users).

**Q: Can I cancel anytime?**
A: Yes. No contracts below Enterprise. 7-day full refund on any tier.

**Q: Is there a free trial?**
A: No. Every tier starts billing immediately. But we stand behind the product — 7-day full refund, no questions asked.

**Q: Can I take my agents and run them elsewhere?**
A: Yes. Export any built agent from your dashboard. You'll get your SOUL.md, voice, data, and configuration. You won't get our platform (Hermes runtime, knowledge engine, skill code). Ejecting an agent does NOT cancel your subscription — many customers build on Clara and deploy to their own infrastructure while continuing to use Clara for new builds. Export caps: Basic 1/mo, Pro 3/mo, Max 6/mo, Business 12/mo, Enterprise unlimited with migration engineering support.

**Q: If I sell my agents off-platform, does Clara take a cut?**
A: If the agent runs on Clara when a customer hires it, yes — 15% of the invocation (you keep 85%). Where the customer discovered you (claraagents.com, your site, social) doesn't matter. Stripe Connect handles payouts across channels. If you eject the agent to your own infra, Clara gets 0% because we're no longer hosting it.

---

## Sign-Up CTAs

- **Basic / Pro / Max / Business:** "Configure your team →" (leads to agent configurator + Stripe checkout)
- **Enterprise:** "Talk to us" (Calendly booking)

---

## Related Files

- **`pricing/cogs-and-unit-economics.md`** — internal COGS + open-model routing economics
- **`pricing/abuse-protection.md`** — invisible guardrails (rate limits, review triggers, hard caps)
- **`pricing/model-routing-strategy.md`** — how we route Gemma → Kimi → DeepSeek for best cost/quality
- **`pricing/product-tiers.md`** — full product ladder definitions
- **`pricing/voice-tiers.md`** — self-hosted voice stack (Whisper + XTTS on Modal)
- **`pricing/marketplace-pricing.md`** — claraagents.com marketplace economics (runtime agents)
