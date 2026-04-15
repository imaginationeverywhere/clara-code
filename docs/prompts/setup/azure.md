# Deploy — Azure (Step 8 alt)

## What it does

Targets **Microsoft Azure** (Container Apps / AKS / ACR) for runtime hosting when required.

## Default behavior

Key Vault for secrets; managed identity; no secrets in pipelines.

## Customization options

Use **`--azure-devops`** for Git hosting (Step 1), not this flag — this file is **cloud hosting**.

## Example queue command

`/queue-prompt --azure "Container Apps staging slot + Key Vault references"`

## Example pickup command

`/pickup-prompt --azure`

## Output location

IaC and `docs/deployment` notes.

## Agent ownership

**DevOps**.

## Related

- [source-control.md](source-control.md) (Azure DevOps Git)
- [aws-deploy.md](aws-deploy.md)
