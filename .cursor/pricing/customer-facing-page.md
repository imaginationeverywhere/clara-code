# Customer-Facing Pricing Page — What Users See

> **CUSTOMER-FACING COPY.** This is what renders on claracode.ai/pricing. No COGS numbers. No provider names. No time windows. No usage counters.

**Source of truth for the pricing page.** The React components in `frontend/` render from this structure.

---

## The Pitch (Hero)

> **# Your AI team. Hundreds of hours of voice. 10× the usage of any platform.**
>
> Hire your first team for $39/month. Frontend engineer. Accountant. Publicist. Whatever your gig needs — they're yours.
>
> Your team builds voice-first tools for your business — websites, mobile apps, desktop software, CLIs, and voice agents you can sell. Every plan includes generous voice hours (up to 750/month on Clara AI Elite). Heavy reasoning is compute pass-through — no markup.

---

## Philosophy — 10× The Usage, Zero The Quota Anxiety

Clara Code exists for **Vibe Professionals** — founders, builders, and creators who gig their income with voice-first products.

The #1 killer of creative flow is worrying about quotas. Claude Code gives you 5-hour sessions. Cursor counts every request. Copilot throttles after a few hours. **Clara gives you roughly 10× that budget — hundreds of included hours per month across all our consumer tiers.**

How do we do it? We run open-source AI on our own infrastructure. The models are free to us (Gemma 4, DeepSeek's latest — the same models Claude Code's competitors charge you premium rates for). A Clara agent running 24/7 for a full month (≈750 hours) costs us around $23 in compute. That's how we can hand you the keys.

When you need heavy reasoning on the absolute-frontier models (Claude Sonnet, GPT-5), you pay compute pass-through — no markup, no margin grab. Opt-in per request.

**What you pick is how big your team is, and what they can build.**

---

## The Decision Page

Every tier includes **premium voice, custom voice cloning, and best-available AI**. Basic through Business include a generous pool of included voice hours and default-stack generations — sized to cover normal heavy use without quota anxiety. Enterprise terms are negotiated per contract. What changes across tiers is how big your team is and what you can build.

| | **Basic** | **Pro** | **Max** | **Business** | **Enterprise** |
|--|:-:|:-:|:-:|:-:|:-:|
| **Monthly price** | **$39** | **$69** | **$99** | **$299** | **$4,000+** |
| **Your team size** | **3** | **6** | **9** | **24** | **350** |
| **Build new agents / month** | 1 | 3 | 6 | 12 | Custom (per contract) |
| **Eject agents / month** | 1 | 3 | 6 | 12 | Custom (per contract) |
| **Best for** | Solo builder, first agent | Small team build-out | Full product team | Agency / product shop | Full-company deployment |
| **Included voice hours/mo** | Generous pool (sized to cover heavy use) | Generous pool | Generous pool | Generous pool | Per contract |
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
| "A simple website for my business" | 1 Frontend Engineer with Next.js + Tailwind Talents | Basic $39 |
| "A booking app for my barbershop" | 1 Full-Stack Engineer with barbershop vertical Talent | Basic $39 |
| "An ecommerce store" | 3 agents: Frontend + Backend + Stripe integrations | Pro $69 |
| "A SaaS with mobile app" | 6 agents: +Mobile + QA + DevOps | Max $99 |
| "Run my business and have agents talk to customers" | 12 agents + runtime agent builder | Business $299 |
| "Replace my dev team" | Enterprise consultation | Enterprise |

Users see the exact agents on their team with names, voices, and specialties. They can reconfigure anytime.

---

## Plain-English Tier Explanations

### Basic — $39/mo — "Your first team"

Your team of **3 AI hires**. Pick who you need — frontend engineer, accountant, publicist, whatever fits your gig. You name them, give them your voice (or pick one), and put them to work. They build what you tell them to build: websites, mobile apps, CLIs, voice agents — any voice-first tool your business needs. Plus: ship **1 new voice agent per month** as a product you can sell or deploy.

**What Basic is for:** Solo founders, side-project builders, barbershop owners, real estate agents, personal trainers — anyone gigging their income who needs a small team of AI hires to ship a website and start building voice agents.

### Pro — $69/mo — "Small team"

Your team of **6 AI hires**. More roles covered, more projects in parallel. **3 new voice agents per month** shipped.

**What Pro is for:** Freelancers shipping client work weekly. Founders building multi-project pipelines. Indie hackers with 2-3 side projects running.

### Max — $99/mo — "Full team"

Your team of **9 AI hires**. Every role you'd need for a full product — frontend, backend, DevOps, mobile, QA, research, design, plus accountant and publicist. **6 new voice agents per month** shipped.

**What Max is for:** Startups shipping production. Vibe Professionals running at full speed. Teams of 1-3 humans with big ambitions.

### Business — $299/mo — "Agency scale"

Your team of **24 AI hires** — full agency capacity. Multiple specialists per role. **12 new voice agents per month**, and every voice agent you build earns you 85% of every invocation. Whether customers hire them through claraagents.com, your own website, an affiliate funnel, or anywhere else — Stripe Connect handles payouts across channels.

**What Business is for:** Agencies running client work at volume. Product teams operating live platforms. Founders turning into agent developers with recurring revenue.

### Enterprise — $4,000+/mo — "Full-company"

Your team of **350 AI hires** in configurable squads. Dedicated infrastructure. Custom brand voice cloning. SSO, audit logs, SLA, white-glove onboarding. Priority model routing. Voice agent builds, ejections, and usage are all negotiated per contract — sized to your deployment. Full migration support if you ever want to run your agents on your own infra — dedicated engineering help included.

**What Enterprise is for:** Companies replacing their entire engineering org with their own AI team. Running Clara at scale across departments.

---

## How Usage Really Works

**You don't watch a counter.** Clara shows you nothing about usage unless something is actually wrong (extreme abuse detection, which affects ~0.1% of users).

Behind the scenes, we route your requests intelligently:
- **Default stack** (Gemma 4, DeepSeek latest, other open-source SOTA) — generously included on every paid tier. We run it ourselves; the marginal cost is essentially zero.
- **Heavy reasoning stack** (opt-in premium models — Claude Sonnet, GPT-5, etc.) — compute pass-through, zero markup. Only used when you explicitly opt in or Enterprise contracts route it by default.
- **Voice (STT + TTS)** — our own self-hosted stack, included in every tier's hour allotment.

Your subscription covers the default stack + voice entirely. You only pay additional if you opt into premium reasoning.

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

**Q: How much voice and agent time do I actually get?**
A: A lot. Our Clara AI Personal tiers include 90 hours (Starter) up to 750 hours (Elite) per month. Clara Code builder tiers include a generous pool sized for even heavy users (8-10 hrs/day of normal work). You don't need to stare at a counter — we'll notify you before you approach any limit.

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
A: Yes. Export any built agent from your dashboard. You'll get your SOUL.md, voice, data, and configuration. You won't get our platform (Hermes runtime, knowledge engine, skill code). Ejecting an agent does NOT cancel your subscription — many customers build on Clara and deploy to their own infrastructure while continuing to use Clara for new builds. Export caps: Basic 1/mo, Pro 3/mo, Max 6/mo, Business 12/mo. Enterprise caps are set per contract alongside migration engineering support.

**Q: If I deploy my agent on my own website or mobile app, how does Clara make money?**
A: Your Clara Code subscription covers building AND deploying to your own properties — no extra runtime fees. In return, every transaction your agent processes goes through a Stripe Connect gate. The customer pays a **7% platform fee** and the standard **Stripe fee (2.9% + $0.30)** on top of your listed price — both passed through to the customer, not deducted from your revenue. You keep **100%** of what you charge. If your agent doesn't process transactions (internal scheduler, lead-gen bot, back-office tool), you pay nothing beyond your subscription.

**Q: What about listing my agent on the Clara AI mobile app, or letting other mobile apps embed it?**
A: Different model for broader distribution: **Clara takes 15%, you keep 85%** of every dollar. This covers distribution, discovery, and user acquisition across the Clara Agents network. Stripe Connect handles the payout. You set the price; Clara collects from the hirer and pays you 85%.

**Q: What if I eject my agent and run it on my own infrastructure?**
A: Clara gets 0% — we're no longer hosting, so there's no fee. Ejecting does NOT cancel your subscription.

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
