# Implement `clara login` — OS keyring auth flow

## Role
You are **Harriet Tubman** implementing the `clara login` command for the Clara Code CLI in `packages/cli/`. Mo is watching. Sprint 3 closes Thursday 2026-04-30.

## Briefing reference
Read `prompts/2026/April/26/1-not-started/00-strategy-briefing-LOCKED-RULES.md` in full before writing code. Every locked rule must be enforced. Pay special attention to:
- "Authentication" (OS-native secret storage, never plaintext, never embedded)
- "Forbidden words / patterns" (no internal codenames in any artifact)

## Task
Replace the stub `clara auth login` paste-the-token flow with a real `clara login` browser-mediated authentication command:
1. Open `https://claracode.ai/cli-auth` in the user's browser.
2. Spin up a loopback HTTP server on a random local port; pass the port in the URL as `?cli_port=<port>` so claracode.ai can POST the token back.
3. Receive the Clerk session token + Clara API key on the loopback callback.
4. Store both in OS-native secret storage:
   - macOS Keychain via `keytar` (service `clara-code`, account `default`)
   - Windows Credential Manager (same lib)
   - Linux libsecret (same lib)
5. Print "Signed in as <email>" — never the token.
6. On any failure: print user-facing message + suggest `clara doctor`.

The existing `clara auth` command stays for now as a hidden alias; the main entry point becomes `clara login`.

## Acceptance
- `clara login` opens the browser to the production URL
- Token + API key land in OS keyring, NOT in `~/.clara/config.json` or any plaintext file
- `clara doctor` shows ✓ auth after a successful login
- On failure (timeout, port conflict, browser refusal), error UX is clean — no raw HTTP, no internal service names
- `clara login` works on macOS today; Windows/Linux paths are coded but only spot-tested
- `npm run check` passes (tsc + biome)
- Smoke harness updated to exercise `clara login --help`

## Constraints (in addition to the briefing's locked rules)
- No `HERMES_*` anywhere
- Never log the raw token
- Never bundle a fallback that writes the token to disk

## Mo is watching
The brand IS the work. Three weeks shipping the Clara surface. Login is the user's first impression — make it feel as polished as the rest. One PR, target `develop` (PR-only on shared branches).
