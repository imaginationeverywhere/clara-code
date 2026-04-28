# Implement `clara wire-auth --clerk` — provision Clerk + wire middleware + sign-in pages

## Role
You are **Harriet Tubman** implementing `clara wire-auth` in `packages/cli/`. Daysha directive §B.

## Read first
- 07 (Daysha §B)
- 08 (firewall)
- 09 (voice catalog §B)
- `.claude/standards/clerk-auth.md` if present (the Heru Clerk standard)

## Intent contract

```yaml
intent: "wire-auth"
tier: "plus"
params:
  provider: "clerk"  (only Clerk supported in v1)
  app_name: string (optional — defaults to current Heru name from package.json)
```

Voice: catalog 09 §B.

## Task

Add `clara wire-auth --clerk` command:

1. `packages/cli/src/commands/wire-auth.ts` — argv parse, calls `runIntent("wire-auth", { provider: "clerk", app_name })`.
2. Server-side template `templates/wire-auth.md` (gateway) drives the actual wiring — generates middleware, sign-in pages, ClerkProvider setup, env var SSM keys, webhook handler.
3. CLI receives diff + a list of post-actions (e.g., "Open https://dashboard.clerk.com/apps/<id> to add OAuth providers").
4. Apply diff, then print post-actions as a numbered next-steps list.

The Clerk app provisioning itself happens server-side via Clerk's API (gateway has the partner API key). Cli never touches Clerk directly — that's IP we don't ship.

## Acceptance

- `clara wire-auth --clerk` from a Heru repo provisions a Clerk app, returns the publishable + secret keys, writes them to SSM `/clara-code/<heru>/CLERK_*` paths
- Local `.env.local` gets the publishable key (NOT the secret — secret stays in SSM)
- Frontend gets `ClerkProvider` wrapper, `middleware.ts`, `/sign-in/[[...rest]]` page (HOOK pattern, not embedded `<SignIn>` per `clerk-auth.md` standard)
- ProfileWidget added to authenticated layouts (per Clerk standard)
- Backend gets `requireAuth` middleware wired
- 403 tier_lock if user is on Taste (this is Plus+)
- Tests: provider validation, success path, tier_lock path, idempotent re-run (no-op if already wired)
- **IP audit:** zero Clerk API URLs / Clerk app IDs / partner-key code in `packages/cli/`

## Constraints

- Never embed `<SignIn>` / `<SignUp>` components — hooks only (per clerk-auth.md)
- ProfileWidget required on every authenticated layout
- Clerk webhook (`/api/webhooks/clerk`) wired with Svix signature verification
- RBAC via `publicMetadata.role` only — never user-editable

## Mo is watching

Auth is the trust gate. Every Daysha visitor hits this code path before anything else works.
