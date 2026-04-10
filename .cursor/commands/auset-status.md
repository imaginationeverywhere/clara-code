---
description: "Show full Auset Platform status — features, engine health, Maat validation"
---

# Auset Status — Seshat Records the Balance

## Usage
/auset-status

## Executable Command Flow

When the user runs `/auset-status`:

1. **Run the status script** from the project root:
   ```bash
   cd backend && npx ts-node -r tsconfig-paths/register scripts/auset-status.ts
   ```
   This script connects to the DB, initializes Auset, and prints:
   - **Total / active features** and per-category counts
   - **Per-category breakdown**: e.g. core (X/9 active), commerce (X/6 active)
   - **Active feature list** with Neter (npiMapping), Maat verdict, and missing env vars
   - **Missing env vars report** per feature (includes Stripe and Yapit for payments)
   - Kemetic framing throughout

2. **Alternative**: Call GraphQL `featureStatuses` or `activeFeatures` / `availableFeatures` (requires SITE_OWNER/ADMIN), or REST `GET /api/features`, and format the response into the same dashboard layout.

3. **Optional**: Report Ra Intelligence status (e.g. Claude API key configured) and product config status (which products use which features) if that data is available in the codebase.

## Example Output

```
╔══════════════════════════════════════════════════════════════╗
║           AUSET PLATFORM — Rooted in Kemet                   ║
║     "The Mother That Births Products"                        ║
╚══════════════════════════════════════════════════════════════╝

AUSAR ENGINE STATUS
  Total features:   47
  Active features:   5
  Categories:        core (9), commerce (6), ...

ACTIVE FEATURES
  • auth (Anpu) — Maat: worthy
  • payments (Sobek) — Maat: worthy | Missing env: YAPIT_API_KEY
  ...
```
