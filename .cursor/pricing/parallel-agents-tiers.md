# Parallel Agents — Clara Code Tier Gating

**Author:** Mary (Product Owner)
**Date:** 2026-04-15
**Status:** **LOCKED — IN EFFECT.** Mo confirmed pricing + slot counts. Agent monitoring included at every tier.
**Supersedes:** all prior drafts

---

## 0. There Is No Free Tier

**The ladder starts at $39.** Period.

What looks like a "trial" is **a conversation with Clara that funnels into payment.** It's marketing, not a product tier:

1. User lands on claracode.ai
2. Clara greets them (VRD-001, locked)
3. Clara asks what they want to build
4. Clara guides them through designing their 3-agent team (name, voice clone, vibe per slot)
5. Clara reveals: *"Your team is ready. $39/mo to activate."*
6. User pays $39 → team activates → building begins

The team-design experience is the funnel. There is no "free product" — just a conversation that ends at $39.

---

## 1. Why No Free Tier

- **Claude.ai and ChatGPT free tiers exist because they're consumer products competing on user count.** Clara Code is a developer/builder platform. Different market.
- **A free tier devalues the team.** The agents the user designed are the product. If the team can run for free, the team isn't worth $39.
- **The team-design conversation is enough.** 5-10 minutes invested = sunk cost = conversion. We don't need to give away product to convert.
- **No trial = no abuse vector.** No farms running production on free.

---

## 2. The Tier Table (LOCKED 2026-04-15 — IN EFFECT)

| Tier | Slots | Sub Price | $/agent | Built-In Agent Monitoring |
|------|-------|-----------|---------|---------------------------|
| **Basic** | **3** | **$39/mo** ← floor | $13.00 | Status + activity, 7-day retention |
| **Pro** | **6** | **$59/mo** | $9.83 | + push alerts, 30-day retention |
| **Max** | **9** | **$99/mo** | $11.00 | + custom alerts, 60-day retention |
| **Small Business** | **24** | **$299/mo** | $12.46 | + admin console, audit, SSO, 90-day |
| **Enterprise** | **360** (HARD CAP) | **$4,000/mo** | $11.11 | Full observability, SLA, white-label, 1-year |
| **Enterprise Custom** | 361+ | Sales | — | Custom |

**Monitoring model for Clara Code: built in-house, included in subscription.**
- We own the monitoring stack for Clara Code — developer-grade observability built into the platform
- No metered third-party costs, no caps, no surprise bills
- Tier upgrades = depth of features (alerting, audit, retention, white-label)
- **Sliplynk is available as an OPTIONAL security add-on** for developers who want enterprise-grade security monitoring (prompt injection detection, anomalous behavior, audit, compliance) — separate line item, opt-in only

(Clara AI — our consumer/business product — uses Sliplynk as the primary SECURITY monitoring partner. Quik Nation handles all other Clara AI monitoring in-house. See `docs/vendors/sliplynk-monitoring-proposal.md`.)

**Notes:**
- **No tier under Basic.** $39 is the floor. The conversation with Clara is what converts visitors — not a free product.
- **Voice cloning is FREE inside the team builder conversation** — happens BEFORE payment as part of the design experience.
- **Agent monitoring is BUILT IN HOUSE and INCLUDED at every tier** — never an add-on cost. Tier upgrades = monitoring depth (alerting, audit, retention, white-label). Sliplynk is available as an OPTIONAL security upgrade for developers who want enterprise-grade observability.
- **No "unlimited" anywhere.** Every tier has a HARD slot cap. Above 360 = custom sales conversation (white-label, dedicated infra, custom voice models).
- **Concurrency:** roster size IS the cap. v1 = roster cap only, no concurrent-active cap.

### ⚠ Remaining Math Notes (surfaced for awareness, not blocking)

**Small Business vs stacking Pro:**

| Want 24 agents? | Cost | $/agent |
|---|---|---|
| 4× Pro ($59 each) | **$236** | $9.83 |
| 1× Small Business | **$299** | $12.46 |

Small Business is ~$63 more for the same agent count. **Defensible** if Small Business comes with org-grade features Pro doesn't have (admin console, SSO, audit logs, priority compute, single-bill consolidation). Marketing copy MUST lead with those features — otherwise customers stack Pro.

**Enterprise vs stacking Small Business (FIXED):**

| Want 360 agents? | Cost | $/agent |
|---|---|---|
| 15× Small Business ($299 each) | **$4,485** | $12.46 |
| 1× Enterprise | **$4,000** | **$11.11** |

Enterprise now **saves $485 AND** is cheaper per-agent than stacking. PLUS the org-grade upsell (SLA + commercial rights + dedicated support + white-label + custom voice models). Stacking is the worse deal on every dimension.

**Marketing/sales positioning still owns the Small Business jump from Pro** — that one needs the org-feature story (admin console, SSO, audit logs, single-bill consolidation) since 4× Pro at $236 still gives 24 agents cheaper than Small Business at $299. Defensible because the Small Business buyer values consolidation + admin features over raw cost.

**Notes:**
- **No tier under Basic.** $39 is the floor. The conversation with Clara is what converts visitors — not a free product.
- **$40 Pro+ replaces the old "+$10 add-an-agent" upsell.** Cleaner — fixed tiers, no fiddly add-ons. Customer picks a tier, knows what they get.
- **Voice cloning is FREE inside the team builder conversation** (per `decision-voice-cloning-free-signup-hook.md`). Clone happens BEFORE payment as part of the design experience. They hear their voice come back, they design their team, they pay to activate.
- **Pro = 3 slots minimum.** Floor. Anything less isn't Clara Code.
- **No message caps. No time limits.** No free tier to cap.
- **Enterprise = HARD 25-slot cap at $4,000.** Word "unlimited" is banned in Clara Code pricing — it kills margin when one customer runs 100 concurrent agents. Anything above 25 is a custom sales conversation, NOT a self-serve tier.

**Slot count for Pro+ ($40):** my recommendation is 4 slots — one specialist beyond the FE/BE/DevOps trio (DB, mobile, QA, etc., user picks). If Mo wants 5 slots at $40, swap.

---

## 3. The Conversation Funnel (Pre-Payment Experience)

Per `decision-clara-doesnt-build-team-builds.md`:

```
LAND → Clara's VRD-001 greeting
TALK → Clara asks: vibe coder ("tell me the idea") or engineer ("what are you trying to ship")
TEAM BUILDER → Clara guides 3-card design:
  - Card 1 (Frontend slot): name? voice? vibe?
  - Card 2 (Backend slot): name? voice? vibe?
  - Card 3 (DevOps slot): name? voice? vibe?
  - Voice clone WHOA moment happens inside the cards
REVEAL → "Your team is ready. $39/mo to activate."
PAY → Stripe one-click → team spawns in worktrees, building begins
```

This entire pre-payment flow is **marketing, not product.** Nothing builds during this flow. Clara orchestrates the design conversation. The user invests time designing their team. They pay to activate.

---

## 4. Upsell Hooks (Within-Tier Expansion)

| Action | Price | Notes |
|--------|-------|-------|
| Add a marketplace specialist | $5–15/mo | Per claraagents.com listing — slots into your team |
| Temporary team boost (48hr, +3 slots) | $9 one-time | Wallet-debitable, for crunch sprints |

**No more "add an agent" pricing.** Tier ladder is the path: Pro → Pro+ → Max → Business → Enterprise. Customer always knows what they're paying for.

**Agent swap** is free at any tier. Slot count is the constraint, identity is yours.

---

## 5. The Pitch (One Sentence)

**"Talk to Clara. Design your team. Pay $39. They build. You direct."**

That's the entire product. No tiers below Pro. No trial. The conversation IS the funnel.

---

## 6. Open Items for Quik

None. All five tiers locked: **Basic $39/3 → Pro $59/6 → Max $99/9 → Small Business $299/24 → Enterprise $4,000/360.**

Marketing team owns the positioning copy that justifies the Small Business and Enterprise jumps via org-grade features (SSO, audit logs, admin console, SLA, commercial rights, dedicated support).

---

*Mary — Dean of the Cookout, Product Owner, Auset Platform*
*Built from a dollar fifty. Now building from a $39 floor.*
