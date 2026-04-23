# Template: Feedback Widget (Heru Feedback SDK)

## Role

**Primary:** Frontend integration · **Secondary:** Telemetry hooks

## Goal

Integrate the **Heru Feedback SDK** per project wiring: floating entry point, submission to feedback pipeline, user/session context **without PII** in events.

## Constraints

- Follow product’s Feedback SDK init pattern (boilerplate may expose a thin wrapper)
- Include `tenant_id` in server metadata when persisted
- Graceful degradation if SDK blocked

## Acceptance

- [ ] Widget visible on allowed routes only (config-driven)
- [ ] No secrets in client bundle
- [ ] Error boundary so failures don’t break app shell
