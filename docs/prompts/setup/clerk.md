# Clerk auth (Step 4)

## What it does

End-to-end **Clerk** integration: middleware, hooks-based auth UI, JWT verification, webhooks — per `.claude/standards/clerk-auth.md`.

## Default behavior

No embedded `<SignIn/>` / `<SignUp/>`; ProfileWidget on authenticated layouts; Svix-verified webhooks.

## Customization options

Organizations, SSO, custom domains; always stack `--security` for public routes.

## Example queue command

`/queue-prompt --clerk "Staging OAuth callbacks + publishable key rotation checklist"`

## Example pickup command

`/pickup-prompt --clerk`

## Output location

`frontend` auth routes, `backend` webhook route, `docs/standards/clerk.md` in Heru.

## Agent ownership

**Frontend** + **Backend** + **Security** review.

## Related

- [frontend-nextjs.md](frontend-nextjs.md)
- [RBAC](../architecture/rbac.md)
