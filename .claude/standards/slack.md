# Slack Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --slack`

Covers: Slack bot messages, slash commands, event subscriptions, and channel notifications.

---

## CRITICAL RULES

### 1. Bot token and channel IDs from SSM — never hardcoded

```typescript
// ✅ From environment (injected via SSM)
const botToken  = process.env.SLACK_BOT_TOKEN;  // SSM: /[project]/SLACK_BOT_TOKEN
const channelId = process.env.SLACK_CHANNEL_ID; // SSM: /[project]/SLACK_CHANNEL_ID

// ❌ Never hardcode tokens or channel IDs
const client = new WebClient("xoxb-hardcoded-token");
await client.chat.postMessage({ channel: "C012AB3CD" });
```

**SSM paths (per environment):**
```
/[project]/dev/SLACK_BOT_TOKEN
/[project]/dev/SLACK_CHANNEL_ID
/[project]/prod/SLACK_BOT_TOKEN
/[project]/prod/SLACK_CHANNEL_ID
```

---

### 2. Slack client singleton

```typescript
// src/services/slack.ts
import { WebClient } from "@slack/web-api";

let _client: WebClient | null = null;

export function getSlackClient(): WebClient {
  if (!_client) {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) throw new Error("SLACK_BOT_TOKEN not configured");
    _client = new WebClient(token);
  }
  return _client;
}
```

---

### 3. Slash command and event webhook — validate signatures

```typescript
import { createHmac, timingSafeEqual } from "crypto";

// ✅ Validate every incoming Slack request
function validateSlackSignature(req: Request): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET!;
  const timestamp = req.headers["x-slack-request-timestamp"] as string;
  const signature = req.headers["x-slack-signature"] as string;

  // Reject requests older than 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const sigBase = `v0:${timestamp}:${JSON.stringify(req.body)}`;
  const hmac = createHmac("sha256", signingSecret).update(sigBase).digest("hex");
  const computed = Buffer.from(`v0=${hmac}`);
  const received = Buffer.from(signature);

  return computed.length === received.length && timingSafeEqual(computed, received);
}

router.post("/api/webhooks/slack/events", express.json(), (req, res) => {
  if (!validateSlackSignature(req)) {
    res.status(403).json({ error: "invalid_signature" });
    return;
  }
  // Handle event
});

// SSM: /[project]/SLACK_SIGNING_SECRET
```

---

### 4. Use Block Kit for rich messages — not plain text for structured data

```typescript
// ✅ Block Kit for structured notifications
await getSlackClient().chat.postMessage({
  channel: process.env.SLACK_CHANNEL_ID!,
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*New order* #${order.id}\n${order.customerName}`,
      },
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `Total: $${order.total}` },
        { type: "mrkdwn", text: `Status: ${order.status}` },
      ],
    },
  ],
});

// ❌ Plain text for structured data — hard to scan
await client.chat.postMessage({ channel: channelId, text: `New order ${order.id} from ${order.customerName} total ${order.total} status ${order.status}` });
```

---

### 5. Rate limiting — Slack Tier awareness

```typescript
// Slack Web API rate limits (Tier 3 = 50 calls/min for chat.postMessage)
// ✅ Wrap bulk sends with a queue / delay
import pLimit from "p-limit";

const limit = pLimit(2); // Max 2 concurrent Slack calls

await Promise.all(
  notifications.map(n =>
    limit(() => getSlackClient().chat.postMessage({ channel: n.channel, text: n.text }))
  )
);

// ❌ Fire-and-forget bulk blasts — will hit 429s
await Promise.all(notifications.map(n => client.chat.postMessage(...)));
```

---

### 6. No PII in Slack messages

```typescript
// ❌ PII in notification
await client.chat.postMessage({ text: `New user: john@example.com, phone: +15555551234` });

// ✅ Reference IDs only — link back to admin panel for details
await client.chat.postMessage({ text: `New user registered: <${process.env.ADMIN_URL}/users/${userId}|View profile>` });
```

---

### Heru-specific tech doc required

Each Heru using Slack MUST have `docs/standards/slack.md` documenting:
- Which Slack workspace and channels are used
- Bot scopes requested (`chat:write`, `commands`, `reactions:write`, etc.)
- Slash commands registered and their handler endpoints
- Event subscriptions and their handlers
- Rate limiting strategy for bulk notifications

If `docs/standards/slack.md` does not exist, create it.
