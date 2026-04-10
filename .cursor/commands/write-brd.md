# /write-brd — Write Business Requirements Document

**Agent:** Reginald (Reginald F. Lewis) | **Type:** Action command

Generate a Business Requirements Document — the business case for why to build.

## Usage
```
/write-brd                                     # BRD for current project
/write-brd "Clara reseller program"            # BRD for a specific initiative
/write-brd --competitor-analysis               # Include competitive landscape
/write-brd --roi                               # Focus on ROI and financial projections
```

## Arguments
- `<initiative>` (optional) — Business initiative name
- `--competitor-analysis` — Include competitive landscape analysis
- `--roi` — Focus on ROI modeling and financial projections
- `--stakeholder <name>` — Tailor for specific stakeholder audience
- `--output <path>` — Custom output path

## What You Get
- Business justification and opportunity
- Market analysis and competitive landscape
- Stakeholder requirements and success metrics
- Revenue model and cost-benefit analysis
- Risk assessment and mitigation
- Resource requirements and timeline
- Go/no-go recommendation

## Related Commands
- `/reginald` — Talk to Reginald directly
- `/write-prd` — Product Requirements (Pauli)
- `/legal-doc` — Legal documents (Constance)
