# Changelog

## [Unreleased] - 2026-04-13

### Added

- **`create-clara-app` templates** — `packages/create-clara-app/templates/` (`open-next.config.ts`, `wrangler.toml`, `env.example`) documented in `packages/create-clara-app/README.md` and `packages/create-clara-app/CHANGELOG.md`.

### Changed

- **`create-clara-app`** — README expanded (usage, scaffold behavior, publish, build); package `0.1.1` → `0.1.2`. See `packages/create-clara-app/CHANGELOG.md`.

- **`@claracode/sdk`** — pointer: Hermes client package lives at `packages/sdk/` with README examples (`ask`, `stream`, voice). See root `CHANGELOG.md` and `packages/sdk/CHANGELOG.md`.
- `cloudflare/NEXTJS-15-TO-16-UPGRADE-GUIDE.md` — step-by-step guide for upgrading from Next.js 15 to 16 in the CF Workers deployment context.
- `cloudflare/NEXTJS-16-CLOUDFLARE-WORKERS-DEPLOYMENT.md` — complete deployment reference for Next.js 16 on Cloudflare Workers using `@opennextjs/cloudflare`.
- `cloudflare/README.md` — Cloudflare docs index with links to all deployment and email setup guides.
- `cloudflare/STEP-BY-STEP-DEPLOYMENT-GUIDE.md` — end-to-end deployment walkthrough for claracode.ai.
- `auto-claude/MVP_PROGRESS.md` — Clara Code MVP progress tracker (~52% complete); feature matrix covering web surface, backend API, voice layer, infrastructure.
- `auto-claude/MVP_SPRINT_PLAN.md` — Sprint 3 backlog with prioritized tasks, owners, and sprint risks.
- `auto-claude/MVP_BLOCKERS.md` — Active blockers register; BLK-01 (Stripe) resolved 2026-04-13.

## [Unreleased]

### Added

- Clara Code IDE documentation pointer: see `ide/clara-code/README.md` for VSCodium-based editor scaffold, Clara Voice extension, and `product.json` merge workflow.
- `review/20260411-011808-web-ui-code-review.md` — web UI code review notes.
- `review/20260411-080058-backend-code-review.md` — backend directory code review (coverage, structure, security).
- `review/20260411-082334-backend-corrective-review.md` — follow-up corrective review for backend tests and routes.
- `review/20260411-084952-backend-test-suite-review.md` — backend Jest suite and middleware/route test review.
