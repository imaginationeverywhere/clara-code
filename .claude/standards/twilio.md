# Twilio Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --twilio`

Covers: SMS, Voice, Video, and WhatsApp integrations via Twilio.

---

## CRITICAL RULES

### 1. Account credentials from SSM — never hardcoded

```typescript
// ✅ Retrieve at runtime from SSM (injected via environment)
const accountSid = process.env.TWILIO_ACCOUNT_SID;   // SSM: /[project]/TWILIO_ACCOUNT_SID
const authToken  = process.env.TWILIO_AUTH_TOKEN;    // SSM: /[project]/TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER;  // SSM: /[project]/TWILIO_PHONE_NUMBER

// ❌ Never hardcode credentials
const client = new twilio("ACxxxxxxxx", "authtoken");
```

**SSM paths (per environment):**
```
/[project]/dev/TWILIO_ACCOUNT_SID
/[project]/dev/TWILIO_AUTH_TOKEN
/[project]/dev/TWILIO_PHONE_NUMBER
/[project]/prod/TWILIO_ACCOUNT_SID
/[project]/prod/TWILIO_AUTH_TOKEN
/[project]/prod/TWILIO_PHONE_NUMBER
```

Shared credentials reference: `docs/shared-environment-variables/TWILIO_ENVIRONMENT_VARIABLES.md`

---

### 2. Webhook signature validation — mandatory on all Twilio webhooks

```typescript
import twilio from "twilio";

// ✅ Always validate X-Twilio-Signature before processing
router.post("/api/webhooks/twilio/sms", express.urlencoded({ extended: false }), (req, res) => {
  const signature = req.headers["x-twilio-signature"] as string;
  const url = `${process.env.BASE_URL}/api/webhooks/twilio/sms`;

  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    req.body
  );

  if (!isValid) {
    res.status(403).json({ error: "invalid_signature" });
    return;
  }

  // Process webhook
});

// ❌ Never skip signature validation
router.post("/api/webhooks/twilio/sms", (req, res) => {
  // processing without validation
});
```

**Body parser for Twilio webhooks:** `express.urlencoded({ extended: false })` (NOT `express.json()`) — Twilio posts form-encoded data.

---

### 3. No phone numbers in logs

```typescript
// ❌ Never log phone numbers
logger.info("Sending SMS", { to: req.body.To, from: req.body.From, body: req.body.Body });

// ✅ Log only message SID and direction
logger.info("SMS webhook received", { messageSid: req.body.MessageSid, direction: "inbound" });
logger.info("SMS sent", { messageSid: message.sid, status: message.status });
```

Phone numbers are PII. Treat them like passwords in logs.

---

### 4. Rate limiting on SMS send endpoints

```typescript
import rateLimit from "express-rate-limit";

// ✅ SMS send must be rate limited — Twilio also rate limits, but protect your endpoint first
const smsLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 5,                  // 5 SMS per minute per IP
  message: { error: "too_many_requests" },
});

router.post("/api/sms/send", requireAuth, smsLimiter, async (req, res) => {
  // ...
});
```

---

### 5. Twilio client singleton

```typescript
// src/services/twilio.ts
import twilio from "twilio";

let _client: twilio.Twilio | null = null;

export function getTwilioClient(): twilio.Twilio {
  if (!_client) {
    const sid   = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) throw new Error("TWILIO credentials not configured");
    _client = twilio(sid, token);
  }
  return _client;
}
```

---

### 6. Status callback URL required for SMS

```typescript
// ✅ Always register a status callback to track delivery
const message = await getTwilioClient().messages.create({
  to: phoneNumber,
  from: process.env.TWILIO_PHONE_NUMBER!,
  body: messageBody,
  statusCallback: `${process.env.BASE_URL}/api/webhooks/twilio/sms-status`,
});
```

---

### Heru-specific tech doc required

Each Heru using Twilio MUST have `docs/standards/twilio.md` documenting:
- Which Twilio features are used (SMS, Voice, Video, WhatsApp)
- Shared vs. dedicated phone numbers
- Webhook URLs per environment
- Rate limiting configuration
- Any opt-out/STOP handling implementation

If `docs/standards/twilio.md` does not exist, create it.
