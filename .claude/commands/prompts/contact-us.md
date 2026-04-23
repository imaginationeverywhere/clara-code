# Template: Contact Us

## Role

**Primary:** Frontend form + routing · **Backend:** secure submission endpoint

## Goal

Build **Contact Us** with: form (name, email, topic, message), support routing hints, physical address if applicable, social links, response-time expectation.

## Security & abuse

- Rate limit public POST
- Server-side validation (length caps, email format)
- CAPTCHA or honeypot if product is spam-prone (Heru decision)
- No sensitive attachments in v1 unless explicitly requested

## Support routing

Map `topic` to internal queue IDs (billing, technical, partnership) — **IDs only in config**, not hardcoded emails in client.

## Multi-tenant

If deployed per-site, show **site** support email where SITE_OWNER configures it; platform escalation path for PLATFORM_OWNER.

## Acceptance

- [ ] Accessible labels, errors announced
- [ ] Success + error states
- [ ] `tenant_id` captured server-side from host/session where applicable
