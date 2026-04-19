# Frontend — Next.js (Step 2)

## What it does

Scaffolds or aligns the **Next.js 16 App Router** frontend with the Quik Nation stack (Tailwind, Apollo, Clerk, Redux-Persist).

## Default behavior

Server Components by default; client only where hooks/events require it; brand tokens in Tailwind config.

## Customization options

`--nextjs` is an alias of `--frontend`. Combine with `--design web`, `--clerk`, `--graphql` (client operations).

## Example queue command

`/queue-prompt --frontend "Add checkout route skeleton with tenant-scoped layout"`

## Example pickup command

`/pickup-prompt --frontend`

## Output location

Typically `frontend/` or app-root `app/` per project layout.

## Agent ownership

**Frontend** (primary).

## Related

- [backend-node-express.md](backend-node-express.md)
- [clerk.md](clerk.md)
