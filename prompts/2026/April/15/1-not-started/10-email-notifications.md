# Prompt 10 — Email Notifications (AWS SES)

**Date**: 2026-04-15
**Branch**: `prompt/2026-04-15/10-email-notifications`
**Flags**: `--backend --security --testing`
**Estimated scope**: 5–7 files

---

## Context

Clara Code has no email notifications. Two are required for MVP:
1. **Welcome email** — sent when a new user signs up (Clerk webhook `user.created`)
2. **API key created confirmation** — sent when a user generates their first API key

Email provider: **AWS SES** (already in the AWS infrastructure). Do NOT use SendGrid.

---

## Task 1 — Create `backend/src/services/email.service.ts`

```typescript
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { logger } from "@/utils/logger";

const SES_REGION = process.env.AWS_REGION ?? "us-east-1";
const FROM_ADDRESS = process.env.CLARA_EMAIL_FROM ?? "noreply@claracode.ai";

let sesClient: SESClient | null = null;

function getSES(): SESClient | null {
  // In local dev without AWS credentials, fail gracefully
  try {
    if (!sesClient) {
      sesClient = new SESClient({ region: SES_REGION });
    }
    return sesClient;
  } catch {
    return null;
  }
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const ses = getSES();
  if (!ses) {
    logger.warn("SES client not available — skipping email send");
    return;
  }

  try {
    await ses.send(
      new SendEmailCommand({
        Source: FROM_ADDRESS,
        Destination: { ToAddresses: [opts.to] },
        Message: {
          Subject: { Data: opts.subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: opts.html, Charset: "UTF-8" },
            Text: { Data: opts.text, Charset: "UTF-8" },
          },
        },
      }),
    );
    logger.info(`Email sent to ${opts.to}: ${opts.subject}`);
  } catch (err) {
    // Never throw — email failures must not block the API
    logger.error("Failed to send email:", err);
  }
}
```

---

## Task 2 — Create `backend/src/emails/welcome.ts`

```typescript
export function welcomeEmail(displayName: string): { subject: string; html: string; text: string } {
  const subject = "Welcome to Clara Code";
  const text = `Hi ${displayName},\n\nWelcome to Clara Code — voice-first AI coding.\n\nGet started:\n1. Download the IDE extension from claracode.ai\n2. Create your API key in the dashboard\n3. Say "hey Clara" in your IDE\n\nQuestions? Reply to this email.\n\n— The Clara Code team`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="background:#09090F;color:#D9D9D9;font-family:Inter,sans-serif;padding:40px 20px;margin:0">
  <div style="max-width:560px;margin:0 auto">
    <div style="margin-bottom:32px">
      <span style="font-size:18px;font-weight:700;color:#ffffff">Clara Code</span>
    </div>
    <h1 style="font-size:28px;font-weight:700;color:#ffffff;margin:0 0 16px">Welcome, ${displayName}.</h1>
    <p style="color:#B3B3B3;line-height:1.6;margin:0 0 24px">
      You're in. Clara is a voice-first AI coding assistant that lives in your IDE.
    </p>
    <div style="margin:24px 0">
      <p style="color:#B3B3B3;font-weight:600;margin:0 0 12px">Get started in 3 steps:</p>
      <ol style="color:#B3B3B3;line-height:2;padding-left:20px;margin:0">
        <li>Download the Clara Code IDE extension from <a href="https://claracode.ai" style="color:#7C3AED">claracode.ai</a></li>
        <li>Create your API key in the <a href="https://claracode.ai/dashboard" style="color:#7C3AED">dashboard</a></li>
        <li>Say <strong style="color:#ffffff">"hey Clara"</strong> in your IDE</li>
      </ol>
    </div>
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #141414">
      <p style="font-size:12px;color:#4D4D4D;margin:0">
        Clara Code by Imagination Everywhere · <a href="https://claracode.ai/privacy" style="color:#4D4D4D">Privacy</a> · <a href="https://claracode.ai/terms" style="color:#4D4D4D">Terms</a>
      </p>
    </div>
  </div>
</body>
</html>`;
  return { subject, html, text };
}
```

---

## Task 3 — Create `backend/src/emails/api-key-created.ts`

```typescript
export function apiKeyCreatedEmail(displayName: string, keyPrefix: string): { subject: string; html: string; text: string } {
  const subject = "Your Clara API key is ready";
  const text = `Hi ${displayName},\n\nYour Clara API key starting with ${keyPrefix} has been created.\n\nKeep it safe — anyone with this key can make requests on your behalf.\n\nIf you didn't create this key, delete it immediately from your dashboard: https://claracode.ai/dashboard\n\n— The Clara Code team`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="background:#09090F;color:#D9D9D9;font-family:Inter,sans-serif;padding:40px 20px;margin:0">
  <div style="max-width:560px;margin:0 auto">
    <div style="margin-bottom:32px">
      <span style="font-size:18px;font-weight:700;color:#ffffff">Clara Code</span>
    </div>
    <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0 0 16px">API key created</h1>
    <p style="color:#B3B3B3;line-height:1.6;margin:0 0 16px">
      Hi ${displayName}, a new API key starting with <code style="background:#1E1410;padding:2px 6px;border-radius:4px;color:#ffffff;font-family:monospace">${keyPrefix}...</code> was just created on your account.
    </p>
    <p style="color:#B3B3B3;line-height:1.6;margin:0 0 24px">
      Keep it safe — anyone with this key can make API requests on your behalf.
    </p>
    <a href="https://claracode.ai/dashboard" style="display:inline-block;background:#7C3AED;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
      View dashboard
    </a>
    <p style="margin-top:24px;font-size:13px;color:#8C8C8C">
      Didn't create this key? <a href="https://claracode.ai/dashboard" style="color:#7C3AED">Delete it immediately</a> from your dashboard.
    </p>
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #141414">
      <p style="font-size:12px;color:#4D4D4D;margin:0">
        Clara Code by Imagination Everywhere · <a href="https://claracode.ai/privacy" style="color:#4D4D4D">Privacy</a> · <a href="https://claracode.ai/terms" style="color:#4D4D4D">Terms</a>
      </p>
    </div>
  </div>
</body>
</html>`;
  return { subject, html, text };
}
```

---

## Task 4 — Wire welcome email to Clerk webhook

In `backend/src/routes/webhooks.ts` (the Clerk webhook handler), add welcome email on `user.created`:

```typescript
import { sendEmail } from "@/services/email.service";
import { welcomeEmail } from "@/emails/welcome";

// Inside user.created case:
case "user.created": {
  const u = event.data as { id: string; first_name?: string; email_addresses?: { email_address: string }[] };
  const displayName = u.first_name ?? "there";
  const email = u.email_addresses?.[0]?.email_address;
  if (email) {
    const { subject, html, text } = welcomeEmail(displayName);
    void sendEmail({ to: email, subject, html, text }); // fire-and-forget
  }
  break;
}
```

---

## Task 5 — Wire API key confirmation email

In `backend/src/routes/keys.ts`, after a successful key creation, fire the confirmation email:

```typescript
import { sendEmail } from "@/services/email.service";
import { apiKeyCreatedEmail } from "@/emails/api-key-created";

// After successful key creation, get user email from Clerk and send:
const clerkUser = await clerkClient().users.getUser(userId);
const email = clerkUser.emailAddresses[0]?.emailAddress;
const displayName = clerkUser.firstName ?? "there";
if (email) {
  const prefix = newKey.slice(0, 12); // first 12 chars as the "prefix" shown in email
  const { subject, html, text } = apiKeyCreatedEmail(displayName, prefix);
  void sendEmail({ to: email, subject, html, text }); // fire-and-forget
}
```

---

## Task 6 — Add dependencies + env vars

Install AWS SES SDK if not already installed:
```bash
cd backend && npm install @aws-sdk/client-ses
```

Add to `backend/.env.example`:
```bash
# AWS SES — email notifications
# Credentials come from ECS IAM role in production; use AWS_PROFILE locally
AWS_REGION=us-east-1
CLARA_EMAIL_FROM=noreply@claracode.ai
```

---

## Task 7 — Add tests

Add `backend/src/__tests__/email.service.test.ts`:
1. `sendEmail()` with valid SES client → calls `ses.send()` once with correct params
2. `sendEmail()` when SES unavailable → logs warning, does NOT throw
3. `welcomeEmail()` → returns subject, html, text with displayName interpolated
4. `apiKeyCreatedEmail()` → returns html with keyPrefix and dashboard link

Mock `@aws-sdk/client-ses` with `jest.mock()`.

---

## Acceptance Criteria

- [ ] `backend/src/services/email.service.ts` — never throws, graceful on missing SES
- [ ] Welcome email fires on `user.created` Clerk webhook
- [ ] API key email fires on successful key creation
- [ ] No PII logged (no email addresses in logger output)
- [ ] `@aws-sdk/client-ses` added to `backend/package.json`
- [ ] Tests pass: `cd backend && npm test`
- [ ] `cd backend && npm run type-check` passes

## What NOT to Change

- Frontend, middleware, Stripe webhook
- Clerk webhook signature verification (do NOT remove Svix guard)
- Rate limiting or auth on key creation route
