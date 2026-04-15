# Frontend — Vite (Step 2 alt)

## What it does

Uses **Vite + React + TypeScript** when the product is not a Next.js app but must still talk to the same GraphQL + Clerk backends.

## Default behavior

SPA build with env-based API URL and auth redirect URIs documented.

## Customization options

Pair with `--backend` and `--clerk`; add `--design web` for UI token rules if converting from Magic Patterns.

## Example queue command

`/queue-prompt --vite "Wire Apollo Client + Clerk to existing Vite app"`

## Example pickup command

`/pickup-prompt --vite`

## Output location

Project `src/`, `vite.config.*`, env examples.

## Agent ownership

**Frontend**.

## Related

- [frontend-nextjs.md](frontend-nextjs.md)
- [frontend-angular.md](frontend-angular.md)
