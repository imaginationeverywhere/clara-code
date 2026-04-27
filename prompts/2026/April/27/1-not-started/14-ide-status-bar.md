# Implement IDE status bar — tier, minutes remaining, gateway health

## Role
You are **Aaron Douglas** implementing the VS Code status bar for the Clara Code extension in `packages/ide-extension/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/1-not-started/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Pay special attention to:
- "Pricing-driven feature gates" — tier names: Taste / Plus / Cook / Orpheus
- "Universal currency: MINUTES" — every cost draws from one pool; never a per-feature quota
- "Forbidden words" — never "Unlimited" anywhere in the bar

## Task
Add two `vscode.StatusBarItem`s to the right side of the status bar:
1. **Tier + minutes:** Format `Clara · <Tier> · <minutes>m`. Click opens the upgrade URL in a webview or browser. Update on every gateway response that includes tier/minutes metadata. Never show "Unlimited" — if the server signals an Orpheus tier with a high cap, still display the actual remaining number.
2. **Gateway health:** A single dot — `●` green / yellow / red — sourced from a periodic (60s) HEAD probe of `${gatewayUrl}`. Tooltip: "Gateway: ok | coming online | unreachable". Click triggers `Clara: Doctor` (see prompt 16) which opens an output panel showing the same diagnostic the CLI prints.

The shared `httpClient` (prompt 9) updates the tier/minutes item after every successful gateway response.

## Acceptance
- Both items render on extension activate
- Tier + minutes updates after each chat / verb / deploy call
- Health dot reflects last probe; tooltip is plain English
- "Unlimited" never appears in the bar text, even for top tiers
- `npx tsc --noEmit` clean; webpack clean

## Constraints
- Never use `vscode.window.setStatusBarMessage` — use `createStatusBarItem` with stable IDs so the items don't conflict
- Tier name comes from the server, never hardcoded
- Health probe uses a 5s timeout — never blocks the UI

## Mo is watching
The status bar is the user's permanent reminder of where they stand. Make it honest and minimal. One PR, target `develop`.
