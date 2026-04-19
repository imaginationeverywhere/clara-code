# Source control (Step 1)

## What it does

Defines **where code lives**, default branches, and **protection rules** so every Heru matches Clara Code org expectations.

## Default behavior

Assumes **GitHub**: `main` / `develop`, protected `main`, PR required, optional CODEOWNERS.

## Customization options

Use flags: `--github`, `--gitlab`, `--bitbucket`, `--azure-devops` (same template; name the provider in the queued task body).

## Example queue command

`/queue-prompt --source-control "Enable branch protection and required reviews on main"`

## Example pickup command

`/pickup-prompt --source-control`

## Output location

Repository settings (hosting UI) + optional `.github/` or equivalent; no app runtime code required.

## Agent ownership

**DevOps** (primary), Platform architect (review).

## Related

- [frontend-nextjs.md](frontend-nextjs.md)
- [aws-deploy.md](aws-deploy.md)
