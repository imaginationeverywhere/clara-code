# RBAC architecture

## What it does

Scaffolds **role model** (e.g. PLATFORM_ADMIN, SITE_ADMIN, MEMBER, GUEST) with Clerk `publicMetadata` and server guards.

## Default behavior

Roles are **never** user-editable; enforced in GraphQL context + middleware.

## Customization options

`--backend`, `--graphql`, `--multi-tenant`, `--admin` for admin surfaces.

## Example queue command

`/queue-prompt --rbac "Add auditor read-only role across GraphQL"`

## Example pickup command

`/pickup-prompt --rbac`

## Output location

Shared auth helpers, resolver guards, admin route gates.

## Agent ownership

**Backend** + **Frontend** + **Security** review.

## Related

- [user-journey.md](user-journey.md)
- [clerk.md](../setup/clerk.md)
