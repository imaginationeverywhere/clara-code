# /write-prd — Write Product Requirements Document

**Agent:** Pauli (Pauli Murray) | **Type:** Action command

Generate a complete Product Requirements Document for any project or feature.

## Usage
```
/write-prd                                     # PRD for current project (reads PRD.md context)
/write-prd "Clara mobile app"                  # PRD for a specific product
/write-prd --feature "voice conference"        # Feature-level PRD
/write-prd --update                            # Update existing PRD with new requirements
```

## Arguments
- `<product>` (optional) — Product or project name
- `--feature <name>` — Feature-level PRD instead of full product
- `--update` — Update existing docs/PRD.md
- `--from-vault` — Pull requirements from Auset Brain vault notes
- `--output <path>` — Custom output path (default: docs/PRD.md)

## What You Get
- Executive summary and vision
- Target users and personas
- Tech stack decisions
- Screen/page inventory with descriptions
- Feature matrix with P0/P1/P2 priorities
- MVP scope definition
- Success metrics and KPIs
- Timeline and milestones

## Related Commands
- `/pauli` — Talk to Pauli directly
- `/write-brd` — Business Requirements (Reginald)
- `/legal-doc` — Legal documents (Constance)
