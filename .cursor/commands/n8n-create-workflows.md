# n8n-create-workflows — Create API Contract Workflows for a Heru

**Agent:** Otis (Otis Boykin — precision resistor inventor, 26 patents, pacemakers)

Create n8n automation workflows that define the API contracts code agents build against. Otis goes FIRST in every sprint — before any code agent is dispatched.

## Usage
```
/n8n-create-workflows "Create workflows for FMO — vendor, product, order, and fulfillment lifecycles"
/n8n-create-workflows --project qcr "Add insurance verification webhook to booking flow"
/n8n-create-workflows --contract-only "Generate API contract doc for QuikCarry driver onboarding"
/n8n-create-workflows --deploy "Push FMO workflows to n8n.quiknation.com"
```

## Arguments
- `<task>` (required) — What workflows to create or update
- `--project <name>` — Target Heru project
- `--deploy` — Deploy workflows to n8n.quiknation.com after creation
- `--contract-only` — Generate API contract document without workflow JSON
- `--from-req <file>` — Read requirements file to extract webhook events

## What This Command Does

1. **Reads** the project requirements to identify all webhook events
2. **Designs** n8n workflows for each event category
3. **Creates** workflow JSON deployable to n8n
4. **Generates** API contract documents that Nikki embeds in code agent prompts
5. **Deploys** workflows to n8n.quiknation.com (on QC1)
6. **Reports** to Slack with workflow summary

## Why This Runs First

n8n workflows ARE the API contracts. Code agents build AGAINST them. Without contracts:
- Frontend calls mutations that don't exist
- Backend implements resolvers with wrong names
- Schema mismatches crash the app
- See: My Voyages Marvin merge — 4 API blockers because no contract existed

**Pipeline:** Granville → Maya → **Otis (n8n FIRST)** → Nikki embeds contracts in prompts → Code agents build

## Related Commands
- `/ship` — Full pipeline (includes n8n-create-workflows automatically)
- `/gran` — Architecture decisions
- `/nikki` — Dispatch agents (after workflows are live)
- `/n8n-workflow` — Lower-level n8n workflow builder
