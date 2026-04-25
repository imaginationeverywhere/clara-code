# Communication Costs

All communication providers and their costs. These are baked into the Technology Fee or Voice tier — customers never see provider names.

## Provider Stack

| Channel | Provider | Cost | Status |
|---------|----------|------|--------|
| Email (transactional) | AWS SES | $0.10/1,000 emails | Active |
| Email (marketing blasts) | AWS SES | $0.10/1,000 emails | Active |
| SMS (OTP, notifications) | AWS SNS | $0.00645/text (US) | Active |
| Push notifications | FCM (Android) / APNs (iOS) / Expo | Free, no volume cap | Active |
| Voice calls | Twilio | $0.014/min outbound | Active |
| Voice customer service | Twilio Flex | Per-agent pricing | Planned (Kashea) |

## What's NOT in the Stack

| Provider | Status | Why |
|----------|--------|-----|
| **SendGrid** | REMOVED | All email through AWS SES. Decided April 4, 2026. |
| **Twilio SMS** | REMOVED for text | SMS moved to AWS SNS. Twilio for VOICE ONLY. |

## How Costs Are Covered

| Cost | Covered By |
|------|-----------|
| Transactional email/SMS | Technology Fee ($1.00-$1.50 per transaction) |
| Marketing blasts | Paid monthly tier ($29-$199/mo for site owners) |
| Push notifications | Free — no cost to cover |
| Voice minutes | Included in Voice tier pricing (Standard or Premium) |
| Twilio Flex | Included in Clara Code Business tier |

## Marketing Blast Tiers (for Heru site owners)

Site owners who want to send email/SMS campaigns to their customers:

| Tier | Price | What They Get |
|------|-------|-------------|
| Starter | $29/mo | 5,000 emails + 500 SMS per month |
| Growth | $99/mo | 25,000 emails + 2,500 SMS per month |
| Scale | $199/mo | 100,000 emails + 10,000 SMS per month |

Built on AWS SES (email) + AWS SNS (SMS). Push notifications included on all tiers with no volume cap.

## Compliance

- **CAN-SPAM:** Unsubscribe link in every marketing email
- **TCPA:** Opt-in required + STOP keyword for SMS
- **GDPR:** Consent tracking if international
