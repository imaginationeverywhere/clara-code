# Template: Terms of Service (`/tos`)

## Role

**Primary:** Frontend page + copy structure · **Secondary:** Stripe/subscription linkage via product docs

## Goal

Generate **Terms of Service** at `/tos` for a **multi-tenant SaaS** product: account rules, acceptable use, IP, payments, disclaimers, limitation of liability, indemnity, dispute resolution, termination, governing law.

## Mandatory sections

1. Agreement to terms; eligibility; authority to bind an organization
2. Description of services (platform vs site owner framing)
3. Accounts & security (credentials, notification of compromise)
4. **Acceptable use** (no abuse, illegal content, credential sharing, scraping, reverse engineering where prohibited)
5. **User content / outputs** — clarify ownership of user prompts, generated code, and marketplace agents per product positioning (Heru-specific details in prompt body override)
6. **Subscription & billing** — reference live pricing page; auto-renew; taxes; failed payment
7. **Third-party services** — integrations are subject to third-party terms
8. **Intellectual property** — platform IP vs user IP; license to operate user content as needed to provide the service
9. **Confidentiality** (lightweight, if applicable for B2B)
10. **Disclaimers** — service “as is”, no warranty where allowed
11. **Limitation of liability** — cap and exclusions where enforceable
12. **Indemnity** — user indemnifies for misuse / violation of terms
13. **Dispute resolution** — arbitration + venue (Delaware or counsel-specified) — **flag for attorney review**
14. **Termination** — suspension, cancellation, effect on data (link to privacy/data handling)
15. **Changes to terms** — notice mechanism
16. **Contact**

## Multi-tenant

Explicitly describe **PLATFORM_OWNER** vs **SITE_OWNER** responsibilities (payments, customer relationships, content on site-owned storefronts).

## Acceptance

- [ ] Route `/tos` with accessible structure
- [ ] Pricing not hardcoded; link to current pricing artifact
- [ ] Attorney review banner in footer or callout if product requires
