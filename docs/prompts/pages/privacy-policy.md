# Privacy policy page

## What it does

Generates a **Privacy Policy** page with GDPR/CCPA/COPPA-aware sections tailored to the Heru’s data practices.

## Default behavior

Route + content scaffold; links from footer; tenant-aware disclosure where applicable.

## Customization options

Combine `--frontend`, `--clerk`, `--multi-tenant`, `--analytics` for full compliance story.

## Example queue command

`/queue-prompt --privacy-policy "Emphasize booking + payment data for salon product"`

## Example pickup command

`/pickup-prompt --privacy-policy`

## Output location

`frontend/app/(marketing)/privacy` or equivalent; legal markdown under `docs/legal/` if requested.

## Agent ownership

**Frontend** + **Legal review** (human).

## Related

- [tos.md](tos.md)
- [footer.md](../components/footer.md)
