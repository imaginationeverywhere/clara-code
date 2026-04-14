# Clara Code — Product Requirements Document

**Version:** 1.0.0
**Date:** 2026-04-14
**Owner:** Amen Ra Mendel (CTO & Co-Founder)
**Status:** CANONICAL — all pricing, tier, and model decisions derive from this document

---

## Product Vision

Clara Code is a **voice-first developer tool**. Developers speak to their IDE and CLI to write code, manage agents, and build voice-enabled applications. Every product decision flows from this identity. Clara Code is not a text completion tool. The atomic unit of value is a **voice exchange** — one full round trip: developer speaks, Clara responds with text and synthesized voice audio.

---

## Developer Acquisition Funnel

```
1. Sign up free → claracode.ai account (Clerk)
2. Download IDE or CLI → always free (acquisition vehicle)
3. Free tier → 100 voice exchanges/month, Maya model, 1 agent
4. Hit the limit mid-session → subscribe at claracode.ai
5. Active subscription → API key issued → full access unlocked
```

The IDE and CLI are distribution, not product. The product is what happens inside them once a developer subscribes.

---

## Subscription Tiers

| Tier | Price | Voice Exchanges | Models | Agents | Extras |
|------|-------|----------------|--------|--------|--------|
| **Free** | $0/mo | 100/month | Maya only | 1 | CLI + IDE, 1 sample project |
| **Pro** | $29/mo | Unlimited | Mary + Maya + Nikki | 5 | API access, vault memory, voice sessions |
| **Business** | $99/mo | Unlimited | All models + custom voice config | 25 | SSO, audit logs, SLA, team management |

### Usage Unit

The billing unit is **voice exchanges**, not tokens or completions. One voice exchange = one full voice round trip (user speaks → Clara responds). This unit reflects what the product delivers and what it costs to serve (Modal GPU inference + TTS synthesis on the cp-team infrastructure).

### Free Tier Enforcement

- 100 voice exchanges per calendar month per account
- Counter resets on the 1st of each month
- When limit reached: backend returns HTTP 402 with `{ error: "voice_limit_reached", used: 100, limit: 100, reset_date: "..." }`
- IDE and CLI display a clear upgrade prompt — not an error

---

## Clara's Models

Models are branded under Clara Code names. The underlying inference providers are not disclosed in the product UX.

| Brand Name | Character | Speed | Use Case | Available On |
|---|---|---|---|---|
| **Maya** | Fast, directed — turns plans into action | Fast | Autocomplete, inline suggestions, quick edits | All tiers (including free) |
| **Mary** | Thoughtful — knows the full arc before acting | Slow, deep | Architecture, hard debugging, reasoning | Pro + Business |
| **Nikki** | Versatile dispatcher — handles what others route | Balanced | Multilingual, broad use cases | Pro + Business |

Free tier users always use Maya. Pro and Business users select their model per session or set a default in settings.

---

## Distribution

### What Goes on Public npm
Only the **Clara CLI** (`@clara/cli`) is published to public npm.
```bash
npx claracode@latest   # installs and runs the CLI
```

### What Does NOT Go on Public npm
- `@claracode/sdk` — gated behind API key + active subscription
- `@claracode/marketplace-sdk` — gated behind $99/year Clara Developer Program

Both are distributed through the **Clara Talent Agency** private registry at `registry.claracode.ai`. Developers authenticate with their Clara Code credentials to install.

---

## API Key Lifecycle

1. Developer subscribes (Stripe Checkout)
2. `checkout.session.completed` webhook fires to backend
3. Backend generates a unique `cc_live_...` API key scoped to the subscription tier
4. Key is stored in DB, associated with `user_id` + `subscription_tier` + `subscription_id`
5. Key is displayed once in the dashboard settings page (copy-on-reveal pattern)
6. Every SDK/API request validates the key and enforces tier limits

---

## Voice Exchange Tracking

Every call to `/api/voice/*` that successfully completes a voice round trip increments the user's monthly usage counter. The backend enforces limits before processing, not after.

```
Request arrives → validate API key → check usage against tier limit → process or reject (402)
```

Monthly usage data is visible in the developer dashboard.

---

## Related Documents

- `docs/auto-claude/CLARA_TALENT_AGENCY.md` — Talent marketplace architecture
- `docs/auto-claude/MVP_PROGRESS.md` — Current sprint state
- `docs/auto-claude/MVP_BLOCKERS.md` — Active blockers register
