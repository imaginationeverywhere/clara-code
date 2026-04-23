# Template: Deploy — AWS (Step 8)

## Role

**Primary:** DevOps

## Goal

Default **AWS Organization** layout: Amplify or OpenNext/CF for frontend, App Runner/EC2 + ECR for backend, secrets in SSM, OIDC for GitHub Actions — align with `docs/deployment/*.md` in this boilerplate.

## Constraints

- Backend production: **pre-built Docker to ECR → App Runner** (no source-build App Runner for prod).
- No long-lived AWS keys in repos.

## Acceptance

- [ ] Staging + prod environments named and documented
- [ ] Rollback path (image tag / Amplify rollback) noted
