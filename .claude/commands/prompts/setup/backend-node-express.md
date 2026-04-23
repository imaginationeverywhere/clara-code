# Template: Backend — Node / Express (Step 3)

## Role

**Primary:** Backend · **Secondary:** DBA (migrations)

## Goal

**Express + Apollo Server + Sequelize + PostgreSQL (Neon)** per platform stack; GraphQL context with auth, DataLoader, and guarded resolvers.

## Default stack

- Node 20 · TypeScript strict · `.env` variants: local / develop / production.

## Constraints

- Read `.claude/standards/backend.md` and `.claude/standards/graphql.md` when present.
- Webhooks that need raw body (e.g. Stripe) registered **before** `express.json()`.

## Acceptance

- [ ] Health route + GraphQL endpoint operational
- [ ] Migrations path documented; indexes on FKs
