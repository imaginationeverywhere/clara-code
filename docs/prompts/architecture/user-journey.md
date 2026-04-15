# User journey architecture

## What it does

Maps **onboarding and core flows** (signup → first value → retention) with diagrams and implementation checkpoints.

## Default behavior

Tenant-scoped flows; guest vs member paths; error/recovery steps.

## Customization options

`--rbac`, `--clerk`, `--mobile` for parallel journeys.

## Example queue command

`/queue-prompt --user-journey "Driver dispatch journey for delivery Heru"`

## Example pickup command

`/pickup-prompt --user-journey`

## Output location

`docs/` journey artifacts + tickets referencing flow IDs.

## Agent ownership

**Product / Frontend** (lead), **Backend** for API touchpoints.

## Related

- [rbac.md](rbac.md)
