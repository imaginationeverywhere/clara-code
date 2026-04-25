# Abuse Protection — The Invisible Guardrails

> **INTERNAL ONLY.** These rules fire for <0.1% of users. They are NEVER surfaced in the UI, marketing, or pricing page. The customer-facing story is "generous included hours sized to cover heavy legitimate use." These protections make that promise economically survivable.

**Source of truth for:** rate limits, review triggers, hard COGS caps, bot/scraper detection.

---

## Philosophy

Clara Code positions tier hour pools as generously covering all legitimate use. That's real for 99.9% of users — Vibe Professionals on heavy usage never hit these guardrails.

But generous pools can't mean exploitable. Someone running 5 bot accounts to scrape our model outputs, or leaving a script looping 24/7, will hit these protections. Normal developers won't.

---

## The Three Layers

### Layer 1 — Rate Limit (anti-bot)

**Cap:** 120 requests per user per minute.

**What this catches:** bot farms, scripted scrapers. A human typing + clicking cannot exceed this.

**User experience:** If hit, respond with HTTP 429 and a brief message ("Slow down — Clara's catching her breath"). No penalty, no counter shown. Next minute is fine.

**Config:** `redis.incr("rl:{userId}:{currentMinute}")` with TTL 65s.

### Layer 2 — Review Trigger (flag, don't block)

**Trigger:** user exceeds **600 active hours/month**.

**What this means:** 600 hours = 20 hrs/day × 30 days. 16 hrs/day (480 hrs/mo — a user talking to their assistant during all waking hours) is NORMAL and NOT flagged. 600+ hrs indicates (a) bot usage, (b) multi-user account sharing, or (c) sustained 24/7 automation.

**Action:**
1. Account flagged in internal ops dashboard
2. Account owner receives a friendly email: "We see you're using Clara a lot — awesome. Can we chat about your use case?"
3. NO automatic block. Usage continues.
4. Ops team reviews within 48 hours and decides: (a) confirm legitimate → no action, (b) suspected abuse → escalate to Layer 3, (c) multi-user use case → suggest Enterprise.

**User experience:** friendly, supportive, not punitive.

### Layer 3 — Hard COGS Cap (automatic freeze)

**Trigger:** monthly COGS per user exceeds the tier's absolute ceiling.

| Tier | Monthly Price | Hard COGS Cap | Typical Corresponds To |
|------|---------------|----------------|------------------------|
| Clara AI Personal $29 | $29 | **$28/mo** | ~700+ active hours (near 24/7) |
| Clara Code Basic $39 | $39 | **$35/mo** | ~900 active hours |
| Clara Code Pro $69 | $69 | **$60/mo** | ~1,500 active hours |
| Clara Code Max $99 | $99 | **$90/mo** | ~2,300 active hours |
| Clara Code Business $299 | $299 | **$280/mo** | ~7,000 active hours |
| Enterprise | $4k+ | **Flag only, no auto-freeze** | — |

**What this catches:** only accounts sustaining >22 hours/day of active use. Effectively impossible for a human — 16 hrs/day is a healthy power user; 22+ hrs/day is a bot.

**User experience:** account frozen. User sees:
> "We've paused your account due to unusually high usage. This is rare — please contact support to lift the pause."

Support verifies identity, reviews usage pattern, either lifts the pause or confirms abuse and offers refund + termination.

---

## What We Track (Redis)

```
usage:{userId}:{YYYYMM}:hours        -> monthly active hours (float)
usage:{userId}:{YYYYMM}:cogs_usd     -> monthly COGS (float)
rl:{userId}:{YYYYMMDDhhmm}           -> per-minute request count (TTL 65s)
flagged:{userId}                     -> boolean, set when Layer 2 triggers
frozen:{userId}                      -> boolean, set when Layer 3 triggers
```

## What "Active Hour" Means

An active hour is any clock hour in which the user made ≥1 billable API call. Idle time (CLI open, not calling) does not count.

```typescript
// After each billable call:
const hourKey = DateTime.utc().toFormat("yyyyMMddHH");
const isNewActiveHour = !(await redis.exists(`usage:${userId}:hour:${hourKey}`));
if (isNewActiveHour) {
  await redis.set(`usage:${userId}:hour:${hourKey}`, 1, "EX", 3700);  // ~1 hr TTL
  await redis.hincrbyfloat(`usage:${userId}:${monthKey}`, "hours", 1);
}
```

This makes the "300 hours" review trigger map to real-world heavy usage, not "leaving Clara open."

---

## Why This Math Holds

**Review threshold at 300 hours/month** catches the top <1% of usage at each tier:

| Tier | Typical Users (p50) | Heavy Users (p90) | Flagged (p99.5) |
|------|---------------------|-------------------|-----------------|
| Basic $39 | 20-40 hrs | 60-80 hrs | 300+ hrs |
| Pro $69 | 30-50 hrs | 80-120 hrs | 300+ hrs |
| Max $99 | 40-70 hrs | 120-180 hrs | 300+ hrs |
| Business $299 | 60-100 hrs | 200-300 hrs | 500+ hrs |

**Hard cap COGS** catches the top <0.1%:

- Basic $30/mo cap triggers at ~600 hours = 20 hrs/day × 30 days. Impossible human rate.
- Business $250/mo cap triggers at ~5,000 hrs = team-scale usage on an individual account, which is a compliance violation.

---

## Enterprise: No Auto-Freeze

Enterprise accounts don't get auto-frozen. Reason: dedicated account management handles it. High usage triggers a call from the account manager, not a silence-then-freeze.

---

## What the User Never Sees

- No monthly counter of hours used
- No percentage-of-cap bar in the UI
- No "you've used X of Y" on the dashboard
- No upgrade nudges based on usage
- No countdowns or timers

**The only usage UI is:** their active agents, their recent conversations, their builds. Not their metering.

---

## Related Files

- **`pricing/customer-facing-page.md`** — customer-facing copy (no mention of any of this)
- **`pricing/cogs-and-unit-economics.md`** — COGS math these caps are built on
- **`pricing/model-routing-strategy.md`** — how routing keeps COGS low enough for generous tier pools
- **`prompts/2026/April/23/1-not-started/11-usage-tracking-and-plan-limits.md`** — implementation
