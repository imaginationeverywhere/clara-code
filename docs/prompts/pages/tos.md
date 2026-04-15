# Terms of Service page

## What it does

Generates **Terms of Service** for multi-tenant SaaS: platform vs site responsibilities, acceptable use, liability caps placeholders.

## Default behavior

Marketing + authenticated app links; version date in content.

## Customization options

`--multi-tenant`, `--stripe` for subscription/billing clauses; `--clerk` for account terms.

## Example queue command

`/queue-prompt --tos "Add marketplace + Stripe Connect clauses"`

## Example pickup command

`/pickup-prompt --tos`

## Output location

`frontend/app/(legal)/terms` or project convention; may mirror `docs/legal/`.

## Agent ownership

**Frontend** + **Legal review** (human).

## Related

- [privacy-policy.md](privacy-policy.md)
