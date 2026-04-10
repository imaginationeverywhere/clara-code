# pencil-design — AI Agent Team Designs Your App UI

**Agent:** Lois (Lois Mailou Jones — 70 years of art, textile patterns, Howard professor)

Orchestrate a team of Pencil AI design agents to create app interfaces. Clients WATCH the design happen. The output becomes the visual contract frontend agents build against.

## Usage
```
/pencil-design "Design the FMO Grooming booking flow — 6 screens"
/pencil-design --project wcr "Redesign the homepage for World Cup Ready"
/pencil-design --from-prd "Read the PRD and design all screens"
/pencil-design --style "afrofuturistic" "Design the QuikNation landing page"
```

## Arguments
- `<task>` (required) — What to design
- `--project <name>` — Target Heru project
- `--from-prd` — Read docs/PRD.md to determine what screens to design
- `--style <style>` — Design style (modern, afrofuturistic, minimal, corporate)
- `--screens <n>` — Number of screens to design
- `--client-view` — Generate a shareable link for the client to watch

## What This Command Does

1. **Reads** PRD and/or Otis's API contracts to scope screens and flows
2. **Configures** a Pencil (pencil.dev) agent team for the design task
3. **Runs** the design session (optionally with client-view link)
4. **Exports** design system and screens to `designs/` in the Heru repo
5. **Produces** specs and config for Katherine/Dorothy to implement

## Pipeline Position
```
Otis (n8n contracts) → LOIS (Pencil designs) → Code agents build
```

## Related Commands
- `/n8n-create-workflows` — Otis creates API contracts (before design)
- `/convert-design` — Convert Lois's designs to Next.js code (after design)
- `/frontend-dev` — Frontend implementation (after design approval)
