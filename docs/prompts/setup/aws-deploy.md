# Deploy — AWS (Step 8)

## What it does

Default **AWS** path: Amplify/OpenNext/CloudFront for web, **ECR + App Runner** (or EC2) for API, SSM secrets, GitHub OIDC.

## Default behavior

Backend prod uses **pre-built Docker → ECR → App Runner**; no App Runner source-build for production.

## Customization options

`--neon` for DB; `--cf` for Cloudflare-heavy frontends; combine with `--eas` for mobile builds on QCS1.

## Example queue command

`/queue-prompt --aws-deploy "Document App Runner service + ECR repo for develop/prod"`

## Example pickup command

`/pickup-prompt --aws-deploy`

## Output location

`infrastructure/**`, `docs/deployment/*`, CI workflows.

## Agent ownership

**DevOps** (primary).

## Related

- [gcp.md](gcp.md)
- [cloudflare.md](cloudflare.md)
