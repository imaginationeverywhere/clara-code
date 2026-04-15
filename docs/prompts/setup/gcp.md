# Deploy — GCP (Step 8 alt)

## What it does

Targets **Google Cloud** (Cloud Run / GKE / Artifact Registry) when AWS is not the primary cloud.

## Default behavior

Secrets in Secret Manager; workload identity for CI/CD; no JSON keys in git.

## Customization options

Region, multi-tenant networking, and cost guardrails in task body.

## Example queue command

`/queue-prompt --gcp "Cloud Run deploy for GraphQL API on develop branch"`

## Example pickup command

`/pickup-prompt --gcp`

## Output location

`docs/deployment/*`, Terraform or Cloud Build configs if used.

## Agent ownership

**DevOps**.

## Related

- [aws-deploy.md](aws-deploy.md)
