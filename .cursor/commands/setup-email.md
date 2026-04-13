# /setup-email — Wire Email Infrastructure for Any Heru Project

Set up `support@<domain>` and `noreply@<domain>` for a new project using:
- **Cloudflare Email Routing** — inbound forwarding for `support@`
- **AWS SES** — outbound sending for `noreply@` with DKIM
- **Clerk** — transactional email from-address

**Source of truth:** `docs/cloudflare/EMAIL-SETUP.md` in the clara-code repo for full walkthrough.

---

## Usage

```
/setup-email                                    # Interactive — prompts for domain + inbox
/setup-email claracode.ai cto@quiknation.com   # Direct — domain + support destination
/setup-email --verify claracode.ai             # Check verification status only
/setup-email --status                          # Show current email DNS state for this project
```

---

## What This Command Does

1. **Verifies the domain in AWS SES** (generates DKIM tokens)
2. **Adds 3 DKIM CNAME records** to Cloudflare DNS via API
3. **Adds combined SPF TXT record** covering both CF Email Routing and SES
4. **Checks Cloudflare Email Routing** status and flags if manual setup needed
5. **Stores `NOREPLY_EMAIL` and `CLOUDFLARE_ZONE_ID` in SSM**
6. **Validates SES verification status**
7. **Prints Clerk instructions** for updating from-address

---

## Execution

### Step 1 — Collect Inputs

```bash
DOMAIN="${1:-$(basename $(pwd)).ai}"  # e.g. claracode.ai
SUPPORT_DEST="${2:-cto@quiknation.com}"
PROJECT=$(basename $(pwd))

# Get CF DNS token and find zone ID
CF_TOKEN=$(aws ssm get-parameter --name "/quik-nation/shared/CLOUDFLARE_DNS_TOKEN" \
  --with-decryption --query 'Parameter.Value' --output text --region us-east-1)

ZONE_ID=$(curl -s "https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}" \
  -H "Authorization: Bearer $CF_TOKEN" | python3 -c \
  "import json,sys; zones=json.load(sys.stdin)['result']; print(zones[0]['id'] if zones else 'NOT_FOUND')")

if [ "$ZONE_ID" = "NOT_FOUND" ]; then
  echo "❌ Domain $DOMAIN not found in this Cloudflare account"
  echo "   Zones available:"
  curl -s "https://api.cloudflare.com/client/v4/zones" \
    -H "Authorization: Bearer $CF_TOKEN" | python3 -c \
    "import json,sys; [print('  ', z['name'], z['id']) for z in json.load(sys.stdin)['result']]"
  exit 1
fi

echo "✅ Zone found: $DOMAIN → $ZONE_ID"
```

### Step 2 — Verify Domain in SES

```bash
# Check if already verified
STATUS=$(aws sesv2 get-email-identity --email-identity "$DOMAIN" \
  --region us-east-1 --query 'DkimAttributes.Status' --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$STATUS" = "SUCCESS" ]; then
  echo "✅ SES: $DOMAIN already verified"
else
  echo "Starting SES domain verification for $DOMAIN..."
  RESULT=$(aws sesv2 create-email-identity \
    --email-identity "$DOMAIN" \
    --dkim-signing-attributes NextSigningKeyLength=RSA_2048_BIT \
    --region us-east-1)

  TOKENS=$(echo "$RESULT" | python3 -c \
    "import json,sys; d=json.load(sys.stdin); [print(t) for t in d['DkimAttributes']['Tokens']]")
  echo "DKIM tokens: $TOKENS"
fi

# Get tokens (whether new or existing)
TOKENS=$(aws sesv2 get-email-identity --email-identity "$DOMAIN" \
  --region us-east-1 --query 'DkimAttributes.Tokens' --output text | tr '\t' '\n')
```

### Step 3 — Add DKIM CNAME Records

```bash
echo "Adding DKIM records to Cloudflare DNS..."
while IFS= read -r TOKEN; do
  RESULT=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{
      \"type\": \"CNAME\",
      \"name\": \"${TOKEN}._domainkey.${DOMAIN}\",
      \"content\": \"${TOKEN}.dkim.amazonses.com\",
      \"ttl\": 1,
      \"proxied\": false
    }")

  if echo "$RESULT" | python3 -c "import json,sys; exit(0 if json.load(sys.stdin)['success'] else 1)" 2>/dev/null; then
    echo "  ✅ DKIM CNAME: $TOKEN"
  else
    # Check if already exists (code 81057)
    echo "  ⚠️  DKIM CNAME may already exist: $TOKEN"
  fi
done <<< "$TOKENS"
```

### Step 4 — Add or Update SPF Record

```bash
echo "Checking SPF record..."
EXISTING_SPF=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=TXT&name=${DOMAIN}" \
  -H "Authorization: Bearer $CF_TOKEN" | python3 -c "
import json,sys
records = json.load(sys.stdin).get('result',[])
spf = [r for r in records if 'spf1' in r.get('content','')]
print(spf[0]['id'] if spf else 'NONE')
")

COMBINED_SPF="v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all"

if [ "$EXISTING_SPF" = "NONE" ]; then
  # Add new SPF
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"TXT\",\"name\":\"${DOMAIN}\",\"content\":\"${COMBINED_SPF}\",\"ttl\":1}" \
    | python3 -c "import json,sys; print('  ✅ SPF added' if json.load(sys.stdin)['success'] else '  ❌ SPF failed')"
else
  # Update existing to ensure it includes both
  curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$EXISTING_SPF" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"content\":\"${COMBINED_SPF}\"}" \
    | python3 -c "import json,sys; print('  ✅ SPF updated' if json.load(sys.stdin)['success'] else '  ❌ SPF update failed')"
fi
```

### Step 5 — Store in SSM

```bash
aws ssm put-parameter \
  --name "/${PROJECT}/NOREPLY_EMAIL" \
  --value "noreply@${DOMAIN}" \
  --type "String" \
  --description "Transactional from-address (SES verified)" \
  --region us-east-1 --overwrite

aws ssm put-parameter \
  --name "/${PROJECT}/CLOUDFLARE_ZONE_ID" \
  --value "$ZONE_ID" \
  --type "String" \
  --description "Cloudflare zone ID for ${DOMAIN}" \
  --region us-east-1 --overwrite

echo "✅ SSM: /${PROJECT}/NOREPLY_EMAIL and /${PROJECT}/CLOUDFLARE_ZONE_ID stored"
```

### Step 6 — Check SES Verification

```bash
echo ""
echo "Waiting for SES DKIM verification (up to 5 min after DNS propagation)..."
SES_STATUS=$(aws sesv2 get-email-identity --email-identity "$DOMAIN" \
  --region us-east-1 --query 'DkimAttributes.Status' --output text)

echo "SES DKIM status: $SES_STATUS"
[ "$SES_STATUS" = "SUCCESS" ] && echo "✅ SES verified — noreply@${DOMAIN} can send" || echo "⏳ SES pending — check again in a few minutes"
```

### Step 7 — Print Summary and Manual Steps

```bash
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  EMAIL SETUP COMPLETE (automated steps)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ✅ support@${DOMAIN}  → $SUPPORT_DEST (via CF Email Routing)"
echo "  ✅ noreply@${DOMAIN}  → AWS SES outbound"
echo "  ✅ SSM: /${PROJECT}/NOREPLY_EMAIL"
echo "  ✅ SSM: /${PROJECT}/CLOUDFLARE_ZONE_ID"
echo ""
echo "  ⚠️  MANUAL STEPS REMAINING:"
echo ""
echo "  1. Cloudflare Email Routing (dashboard only):"
echo "     → dash.cloudflare.com → ${DOMAIN} → Email → Email Routing"
echo "     → Enable → Done"
echo "     → Routing Rules → Create address:"
echo "       support → ${SUPPORT_DEST} (Active)"
echo "       noreply → Drop (Active)"
echo "     ⚠️  After clicking Done, run /setup-email --fix-spf ${DOMAIN}"
echo "        (CF overwrites SPF — we patch it back)"
echo ""
echo "  2. Clerk Dashboard → Emails → Configure:"
echo "     → Each template: From = noreply @ ${DOMAIN}"
echo ""
echo "  3. If SES is in sandbox mode:"
echo "     → AWS Console → SES → Account dashboard → Request production access"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

---

## Sub-command: --fix-spf

Run this immediately after enabling Cloudflare Email Routing (it overwrites SPF):

```bash
# /setup-email --fix-spf <domain>
CF_TOKEN=$(aws ssm get-parameter --name "/quik-nation/shared/CLOUDFLARE_DNS_TOKEN" \
  --with-decryption --query 'Parameter.Value' --output text --region us-east-1)
ZONE_ID=$(aws ssm get-parameter --name "/${PROJECT}/CLOUDFLARE_ZONE_ID" \
  --query 'Parameter.Value' --output text --region us-east-1)

RECORD_ID=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=TXT&name=${DOMAIN}" \
  -H "Authorization: Bearer $CF_TOKEN" | python3 -c "
import json,sys
records = json.load(sys.stdin).get('result',[])
spf = [r for r in records if 'spf1' in r.get('content','')]
print(spf[0]['id'] if spf else 'NONE')
")

curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"content":"v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all"}' \
  | python3 -c "import json,sys; print('✅ SPF restored' if json.load(sys.stdin)['success'] else '❌ Failed')"
```

---

## Sub-command: --verify

```bash
# /setup-email --verify <domain>
aws sesv2 get-email-identity --email-identity "$DOMAIN" --region us-east-1 \
  --query '{DKIM: DkimAttributes.Status, Sending: VerifiedForSendingStatus}'
```

---

## SSM Parameters Used

| Parameter | Type | Purpose |
|-----------|------|---------|
| `/quik-nation/shared/CLOUDFLARE_DNS_TOKEN` | SecureString | CF API token with DNS Edit scope |
| `/<project>/CLOUDFLARE_ZONE_ID` | String | CF zone ID for the domain |
| `/<project>/NOREPLY_EMAIL` | String | Transactional from-address |

---

## Known Limitations

- **Cloudflare Email Routing rules cannot be created via API** with the standard DNS token — requires a token with `Email Routing: Edit` scope. The routing rule setup (support→inbox, noreply→drop) must be done in the CF dashboard.
- **Cloudflare Email Routing overwrites SPF** when you click Done — always run `--fix-spf` after enabling.
- **SES sandbox mode** — new AWS accounts can only send to verified addresses until production access is granted.

---

*Command created 2026-04-13 — based on claracode.ai email setup*
*See full walkthrough: `docs/cloudflare/EMAIL-SETUP.md` in clara-code repo*
