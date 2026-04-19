# MVP Blockers — Clara Code

> **Updated:** 2026-04-19

| ID | Blocker | Severity | Owner | Status |
|----|---------|----------|-------|--------|
| BLK-01 | Stripe live keys | ✅ Resolved | Mo | Keys in SSM + Wrangler |
| BLK-02 | Clerk CF Pages env | ✅ Resolved | Mo | `develop.claracode.ai` Verified |
| BLK-03 | Svix webhook hardening | ✅ Resolved | QCS1 | `7e945a05` |
| BLK-04 | IDE/CLI voice wiring | ✅ Resolved | QCS1 | PRs #1-#4 merged |
| BLK-05 | Frontend dashboard wiring | ✅ Resolved | QCS1 | Dashboard live |
| BLK-06 | develop → main (277+ commits) | 🔴 Critical | **Mo** | Waiting — Mo action |
| BLK-07 | Backend public URL unreachable | 🟡 Medium | **Mo** | ALB healthy — DNS only |
| BLK-08 | Live voice test not run | 🟡 Medium | **Mo** | Need DNS for BLK-07 first |

---

## BLK-06 — Merge Develop → Main

Everything is in `develop`. Production (`main`) is 277+ commits behind. No feature is live in production until this merge.

```bash
# Create release PR
gh pr create --base main --head develop \
  --title "feat: CLI-First MVP v1.0 — voice loop, checkout, pricing" \
  --body "277+ commits: CLI voice loop (PRs #1-4), pricing vault sync, dynamic checkout, Stripe live prices, SES email, Clerk webhook, onboarding flow, backend build fix."

# After review:
gh pr merge <PR_NUMBER> --repo imaginationeverywhere/clara-code --squash
```

---

## BLK-07 — Backend DNS (Mo action — 5 min fix)

**Status:** ALB is healthy, target registered, backend running. Only DNS missing.

**What's done (2026-04-19):**
- ✅ Backend crash fixed: `tsc-alias` was rewriting `require("graphql")` → `require("../../graphql")` due to `baseUrl`; fixed with `replacers.base-url.enabled = false` in tsconfig.json (commit `ec12431b`)
- ✅ Dev ALB target group `clara-code-backend-dev-tg` — target `172.31.38.100:3001` is **healthy**
- ✅ Task definition rev 8 — includes `STRIPE_SECRET_KEY`, `HERMES_API_KEY`, `STRIPE_WEBHOOK_SECRET`
- ✅ ALB routes: `Host: api-dev.claracode.ai` → target group (dev ALB port 80)

**Mo: add these DNS records in Cloudflare (claracode.ai zone):**

| Name | Type | Value | Proxy |
|------|------|-------|-------|
| `api-dev` | CNAME | `qn-dev-alb-775555072.us-east-1.elb.amazonaws.com` | DNS only (grey cloud) |
| `api` | CNAME | `qn-prod-alb-30685095.us-east-1.elb.amazonaws.com` | DNS only (grey cloud) |

**After DNS propagates:**
1. Test: `curl https://api-dev.claracode.ai/health` — should return `{"status":"ok"}`
2. Update `NEXT_PUBLIC_BACKEND_URL=https://api-dev.claracode.ai` in Cloudflare Pages → `develop.claracode.ai`

**Note on prod:** `clara-code-backend-prod` ECS service is at 0/1 — needs BLK-06 (main merge) to trigger the prod CI deploy. The prod ALB and target group are already wired.

---

## BLK-08 — Live Voice Test

**Blocked by:** BLK-07 DNS

**Once `api-dev.claracode.ai` is reachable:**
1. Pre-warm Modal: `curl -X POST https://api-dev.claracode.ai/api/voice/tts -H "Authorization: Bearer sk-clara-<your-key>"` (expect 60-120s cold start)
2. Run `clara` CLI locally against `CLARA_API_URL=https://api-dev.claracode.ai`
3. Speak with `Ctrl+Space` — verify voice round-trip
