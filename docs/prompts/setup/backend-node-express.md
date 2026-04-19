# Backend — Node / Express (Step 3)

## What it does

Implements or aligns **Express + Apollo Server + Sequelize + PostgreSQL (Neon)** with guarded GraphQL resolvers and DataLoader.

## Default behavior

Node 20, TypeScript strict, middleware order documented (Helmet, CORS, Stripe raw body before JSON, etc.).

## Customization options

Stack with `--graphql`, `--migrations`, `--multi-tenant`, `--security`, `--stripe`, webhooks as needed.

## Example queue command

`/queue-prompt --backend "Add Order type + tenant-scoped query with DataLoader"`

## Example pickup command

`/pickup-prompt --backend`

## Output location

`backend/src/**`, migrations, env templates.

## Agent ownership

**Backend** (primary), **DBA** for migrations.

## Related

- [clerk.md](clerk.md)
- [aws-deploy.md](aws-deploy.md)
