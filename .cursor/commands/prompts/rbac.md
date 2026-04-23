# Template: RBAC scaffolding

## Role

**Primary:** Backend + middleware + GraphQL guards · **Frontend** route maps

## Goal

Scaffold **role-based access control** aligned to product tiers:

- **PLATFORM_ADMIN** — platform operations, cross-tenant tools
- **SITE_ADMIN** — tenant configuration, users within tenant
- **MEMBER** — standard user
- **GUEST** — unauthenticated or read-only where allowed

## Rules

- **Clerk `publicMetadata.role`** (or org role) is source of truth; never allow client to PATCH role
- GraphQL: `requireAuthCtx` / `requireAdminCtx` patterns; DataLoader-friendly
- Express: `requireAdmin` middleware for `/api/admin/*`
- All business queries scoped by `tenant_id` for SITE contexts

## Acceptance

- [ ] Matrix doc: routes × roles × allowed
- [ ] 401/403 tests on representative endpoints (see testing standard when `--testing`)
