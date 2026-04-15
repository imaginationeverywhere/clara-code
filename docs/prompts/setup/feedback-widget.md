# Feedback widget (Step 5 + component)

## What it does

Integrates the **Heru Feedback SDK**: floating entry, pipeline submission, session context **without PII** in telemetry.

## Default behavior

Widget on allowed routes; error boundary; `tenant_id` on server metadata when stored.

## Customization options

Same flag as the **component** library template — combine with `--frontend` or `--mobile` depending on surface.

## Example queue command

`/queue-prompt --feedback-widget "Enable widget on dashboard + admin-only debug route"`

## Example pickup command

`/pickup-prompt --feedback-widget`

## Output location

Shared UI package or `frontend/components`, plus any backend ingest endpoint.

## Agent ownership

**Frontend** (primary).

## Related

- [footer.md](../components/footer.md)
- [user-journey.md](../architecture/user-journey.md)
