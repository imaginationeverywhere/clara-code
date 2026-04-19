# Email Setup — AWS SES + Cloudflare + Clerk

> **Completed:** 2026-04-13 for claracode.ai
> **Time required:** ~20 minutes
> **Prerequisites:** Domain on Cloudflare, AWS credentials with SSM + SES access, Clerk project

---

## What This Sets Up

| Address | Purpose | Infrastructure |
|---------|---------|---------------|
| `support@<domain>` | Customer service inbox | Cloudflare Email Routing → real inbox |
| `noreply@<domain>` | Transactional sending | AWS SES (DKIM verified) |

---

## Phase 1 — Verify Domain in AWS SES

```bash
# Start domain verification (generates 3 DKIM tokens)
aws sesv2 create-email-identity \
  --email-identity <domain> \
  --dkim-signing-attributes NextSigningKeyLength=RSA_2048_BIT \
  --region us-east-1

# Get the DKIM tokens (3 strings you'll need for DNS)
aws sesv2 get-email-identity \
  --email-identity <domain> \
  --region us-east-1 \
  --query 'DkimAttributes.Tokens'
```

---

## Phase 2 — Add DNS Records via Cloudflare API

> **Why API not wrangler:** Wrangler manages Workers/secrets only. DNS records require the Cloudflare REST API.

Get the zone ID and DNS token from SSM:
```bash
CF_TOKEN=$(aws ssm get-parameter --name "/quik-nation/shared/CLOUDFLARE_DNS_TOKEN" \
  --with-decryption --query 'Parameter.Value' --output text --region us-east-1)

# Find your zone ID
curl -s "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CF_TOKEN" | python3 -c "
import json,sys
for z in json.load(sys.stdin)['result']:
    print(z['name'], z['id'])
"
```

### Add 3 DKIM CNAME records

```bash
ZONE_ID="<your-zone-id>"
DOMAIN="<your-domain>"

for TOKEN in <token1> <token2> <token3>; do
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{
      \"type\": \"CNAME\",
      \"name\": \"${TOKEN}._domainkey.${DOMAIN}\",
      \"content\": \"${TOKEN}.dkim.amazonses.com\",
      \"ttl\": 1,
      \"proxied\": false
    }"
done
```

### Add SPF TXT record

> **Important:** Use the combined SPF that covers BOTH Cloudflare Email Routing AND SES.
> Do NOT use just `include:amazonses.com` — Cloudflare Email Routing will conflict with it.

```bash
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{
    \"type\": \"TXT\",
    \"name\": \"${DOMAIN}\",
    \"content\": \"v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all\",
    \"ttl\": 1
  }"
```

---

## Phase 3 — Cloudflare Email Routing (Dashboard — no API)

> Cloudflare Email Routing setup is dashboard-only. The rules API requires a separate token scope.

1. Go to **Cloudflare Dashboard → [domain] → Email → Email Routing**
2. Click **Enable Email Routing**
3. CF shows a list of DNS records it will add — click **Done**

### ⚠️ SPF Conflict Fix

When you click Done, Cloudflare **overwrites** your combined SPF with its own weaker version
(`v=spf1 include:_spf.mx.cloudflare.net ~all`). Fix it immediately:

```bash
# Find the SPF record ID
curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=TXT&name=${DOMAIN}" \
  -H "Authorization: Bearer $CF_TOKEN" | python3 -c "
import json,sys
for r in json.load(sys.stdin)['result']:
    print(r['id'], r['content'])
"

# Restore the combined SPF
RECORD_ID="<id-from-above>"
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data "{\"content\": \"v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all\"}"
```

4. Back in Email Routing → **Routing Rules** tab:
   - Click **Create address**
   - Custom address: `support` → Destination: your inbox email
   - Add second rule: `noreply` → **Drop** (noreply should never receive)
5. Cloudflare sends verification email to destination — click the link

---

## Phase 4 — Store in SSM

```bash
aws ssm put-parameter \
  --name "/<project>/NOREPLY_EMAIL" \
  --value "noreply@<domain>" \
  --type "String" \
  --description "Transactional from-address (SES verified)" \
  --region us-east-1

# Store zone ID for future scripted DNS changes
aws ssm put-parameter \
  --name "/<project>/CLOUDFLARE_ZONE_ID" \
  --value "<zone-id>" \
  --type "String" \
  --region us-east-1
```

---

## Phase 5 — Update Clerk Email From Address

1. Go to **Clerk Dashboard → [project] → Emails → Configure**
2. For each email template (Invitation, Verification code, Magic link, etc.):
   - Set **From** to `noreply` @ `<domain>`
   - Set **Reply-to** to `<domain>` (or `support@<domain>`)
3. Save each template

---

## Phase 6 — Verify SES is Working

```bash
# Check verification status
aws sesv2 get-email-identity \
  --email-identity <domain> \
  --region us-east-1 \
  --query '{DkimStatus: DkimAttributes.Status, SendingEnabled: VerifiedForSendingStatus}'

# Expected:
# { "DkimStatus": "SUCCESS", "SendingEnabled": true }
```

---

## Final DNS State (claracode.ai example)

| Type | Name | Value |
|------|------|-------|
| MX | claracode.ai | route1/2/3.mx.cloudflare.net (priority 39/14/43) |
| TXT | claracode.ai | `v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all` |
| CNAME | `sl6wni...._domainkey` | `sl6wni....dkim.amazonses.com` |
| CNAME | `yrjkj7...._domainkey` | `yrjkj7....dkim.amazonses.com` |
| CNAME | `3hc7sk...._domainkey` | `3hc7sk....dkim.amazonses.com` |

---

## Gotchas

1. **Cloudflare Email Routing overwrites SPF** — always patch it back to the combined version after enabling Email Routing
2. **Wrangler can't manage DNS** — use the Cloudflare REST API with `CLOUDFLARE_DNS_TOKEN` from SSM
3. **NEXT_PUBLIC_ vars are build-time** — they must be present during `npm run pages:build`, not just as Wrangler runtime secrets
4. **SES sandbox mode** — new SES accounts start in sandbox (can only send to verified addresses). Submit a production access request in AWS SES console to lift the restriction
5. **Cloudflare Email Routing rules API** — requires `Email Routing: Edit` permission scope, separate from the DNS token

---

*Documented from claracode.ai setup — April 2026*
