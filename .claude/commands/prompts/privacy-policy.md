# Template: Privacy Policy (`/privacy`)

## Role

**Primary:** Frontend (Next.js App Router page + metadata) · **Secondary:** Legal review, analytics disclosure

## Goal

Generate a **Privacy Policy** page route (`/privacy`) that is **GDPR**, **CCPA**, and **COPPA-aware** (including children’s sections where the product allows minors), jurisdiction-aware placeholders, and accurate third-party disclosures.

## Mandatory sections

1. Who we are (entity name, contact, DPO/privacy contact if applicable)
2. Data we collect (account, usage, voice/audio if applicable, payments, device/telemetry)
3. Purposes and legal bases (contract, legitimate interests, consent where required)
4. Third-party processors (e.g. auth, payments, hosting, AI inference, email/SMS) — **names only at template level**; Heru fills live vendor list
5. Cookies and similar technologies + how to control them
6. Retention
7. Security measures (high level)
8. International transfers (if applicable) and safeguards
9. Your rights (**GDPR**: access, rectification, erasure, restriction, portability, objection, complaint to authority; **CCPA**: know, delete, opt-out of sale/share, non-discrimination)
10. **COPPA**: if service is directed to children or knowingly collects child data — parental consent and limitations
11. Changes to this policy
12. Contact for privacy requests

## Multi-tenant

State clearly: **PLATFORM_OWNER** operates the service; **SITE_OWNER** business data is isolated by `tenant_id`. Describe what the platform vs site sees at a high level (no implementation leakage).

## Acceptance

- [ ] Route `/privacy` with semantic HTML, accessible headings
- [ ] Last updated date surfaced in UI
- [ ] No PII in client logs; no secrets in page bundle
