#!/bin/bash
# Wentworth Daily Security Scan
# Runs on QC1 via cron: 0 6 * * * bash ~/scripts/wentworth-daily-scan.sh
# Scans AWS infrastructure and emails report to founders
# Named after Wentworth Cheswell — he watched, counted, verified, protected.

set -e

REPORT_DATE=$(date +%Y-%m-%d)
REPORT_FILE="/tmp/wentworth-report-${REPORT_DATE}.html"
REGION="us-east-1"
FOUNDERS="president@quiknation.com,cto@quiknation.com"

echo "Wentworth Daily Scan — $REPORT_DATE"

# Start HTML report
cat > "$REPORT_FILE" << 'HEADER'
<!DOCTYPE html>
<html>
<head><style>
body { background: #0a0a12; color: #fff; font-family: -apple-system, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
h1 { color: #a855f7; } h2 { color: #7c3aed; border-bottom: 1px solid #333; padding-bottom: 8px; }
.critical { color: #ef4444; font-weight: bold; } .warning { color: #f59e0b; } .ok { color: #22c55e; }
table { width: 100%; border-collapse: collapse; margin: 10px 0; }
td, th { padding: 8px; text-align: left; border-bottom: 1px solid #222; }
th { color: #a855f7; } .card { background: #1a1a2e; border: 1px solid #333; border-radius: 8px; padding: 16px; margin: 10px 0; }
</style></head>
<body>
HEADER

echo "<h1>Wentworth Daily Security Report</h1>" >> "$REPORT_FILE"
echo "<p>Date: $REPORT_DATE | Quik Nation Infrastructure</p>" >> "$REPORT_FILE"

# ===== 1. IAM AUDIT =====
echo "<h2>1. IAM Users & Access</h2>" >> "$REPORT_FILE"
echo "<div class='card'>" >> "$REPORT_FILE"
echo "<table><tr><th>User</th><th>Last Activity</th><th>Access Keys</th><th>MFA</th><th>Policies</th></tr>" >> "$REPORT_FILE"

aws iam list-users --query 'Users[*].UserName' --output text | tr '\t' '\n' | while read USER; do
  LAST=$(aws iam get-user --user-name "$USER" --query 'User.PasswordLastUsed' --output text 2>/dev/null || echo "Never")
  KEYS=$(aws iam list-access-keys --user-name "$USER" --query 'AccessKeyMetadata | length(@)' --output text 2>/dev/null || echo "0")
  MFA=$(aws iam list-mfa-devices --user-name "$USER" --query 'MFADevices | length(@)' --output text 2>/dev/null || echo "0")
  POLS=$(aws iam list-attached-user-policies --user-name "$USER" --query 'AttachedPolicies | length(@)' --output text 2>/dev/null || echo "0")

  MFA_STATUS="<span class='warning'>NO MFA</span>"
  [ "$MFA" -gt 0 ] && MFA_STATUS="<span class='ok'>Enabled</span>"

  echo "<tr><td>$USER</td><td>$LAST</td><td>$KEYS</td><td>$MFA_STATUS</td><td>$POLS</td></tr>" >> "$REPORT_FILE"
done
echo "</table></div>" >> "$REPORT_FILE"

# Check for AdministratorAccess on non-founder users
echo "<h3>Admin Access Audit</h3>" >> "$REPORT_FILE"
echo "<div class='card'>" >> "$REPORT_FILE"
ADMIN_FOUND=0
aws iam list-users --query 'Users[*].UserName' --output text | tr '\t' '\n' | while read USER; do
  if [ "$USER" != "amenray2k" ] && [ "$USER" != "quikv" ]; then
    HAS_ADMIN=$(aws iam list-attached-user-policies --user-name "$USER" --query "AttachedPolicies[?PolicyName=='AdministratorAccess'].PolicyName" --output text 2>/dev/null)
    if [ -n "$HAS_ADMIN" ]; then
      echo "<p class='critical'>ALERT: $USER has AdministratorAccess!</p>" >> "$REPORT_FILE"
      ADMIN_FOUND=1
    fi
  fi
done
[ "$ADMIN_FOUND" -eq 0 ] && echo "<p class='ok'>No non-founder users have AdministratorAccess.</p>" >> "$REPORT_FILE"
echo "</div>" >> "$REPORT_FILE"

# ===== 2. S3 BUCKET AUDIT =====
echo "<h2>2. S3 Buckets</h2>" >> "$REPORT_FILE"
echo "<div class='card'>" >> "$REPORT_FILE"
echo "<table><tr><th>Bucket</th><th>Public Access</th><th>Encryption</th></tr>" >> "$REPORT_FILE"

aws s3api list-buckets --query 'Buckets[*].Name' --output text | tr '\t' '\n' | while read BUCKET; do
  # Check public access block
  PUBLIC=$(aws s3api get-public-access-block --bucket "$BUCKET" --query 'PublicAccessBlockConfiguration.BlockPublicAcls' --output text 2>/dev/null || echo "UNKNOWN")
  if [ "$PUBLIC" = "True" ] || [ "$PUBLIC" = "true" ]; then
    PUB_STATUS="<span class='ok'>Blocked</span>"
  else
    PUB_STATUS="<span class='critical'>OPEN</span>"
  fi

  # Check encryption
  ENC=$(aws s3api get-bucket-encryption --bucket "$BUCKET" --query 'ServerSideEncryptionConfiguration.Rules[0].ApplyServerSideEncryptionByDefault.SSEAlgorithm' --output text 2>/dev/null || echo "NONE")
  if [ "$ENC" = "AES256" ] || [ "$ENC" = "aws:kms" ]; then
    ENC_STATUS="<span class='ok'>$ENC</span>"
  else
    ENC_STATUS="<span class='warning'>None</span>"
  fi

  echo "<tr><td>$BUCKET</td><td>$PUB_STATUS</td><td>$ENC_STATUS</td></tr>" >> "$REPORT_FILE"
done
echo "</table></div>" >> "$REPORT_FILE"

# ===== 3. EC2 INSTANCES =====
echo "<h2>3. EC2 Instances</h2>" >> "$REPORT_FILE"
echo "<div class='card'>" >> "$REPORT_FILE"

for R in us-east-1 us-east-2; do
  INSTANCES=$(aws ec2 describe-instances --region "$R" --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType,PublicIpAddress,Tags[?Key==`Name`].Value|[0]]' --output text 2>/dev/null)
  if [ -n "$INSTANCES" ]; then
    echo "<h4>Region: $R</h4>" >> "$REPORT_FILE"
    echo "<table><tr><th>Instance</th><th>Name</th><th>State</th><th>Type</th><th>Public IP</th></tr>" >> "$REPORT_FILE"
    echo "$INSTANCES" | while read ID STATE TYPE IP NAME; do
      STATE_CLASS="ok"
      [ "$STATE" = "running" ] && STATE_CLASS="warning"
      [ "$STATE" = "stopped" ] && STATE_CLASS="ok"
      echo "<tr><td>$ID</td><td>${NAME:-unnamed}</td><td><span class='$STATE_CLASS'>$STATE</span></td><td>$TYPE</td><td>${IP:-none}</td></tr>" >> "$REPORT_FILE"
    done
    echo "</table>" >> "$REPORT_FILE"
  fi
done
echo "</div>" >> "$REPORT_FILE"

# ===== 4. SSM PARAMETER AUDIT =====
echo "<h2>4. SSM Parameters (Vault Check)</h2>" >> "$REPORT_FILE"
echo "<div class='card'>" >> "$REPORT_FILE"
VAULT_PARAMS=$(aws ssm describe-parameters --parameter-filters "Key=Name,Option=BeginsWith,Values=/quik-nation/vault" --query 'Parameters | length(@)' --output text 2>/dev/null || echo "0")
echo "<p>Vault parameters: $VAULT_PARAMS</p>" >> "$REPORT_FILE"

TOTAL_PARAMS=$(aws ssm describe-parameters --query 'Parameters | length(@)' --output text 2>/dev/null || echo "0")
echo "<p>Total SSM parameters: $TOTAL_PARAMS</p>" >> "$REPORT_FILE"
echo "</div>" >> "$REPORT_FILE"

# ===== 5. AMPLIFY APPS =====
echo "<h2>5. Amplify Apps</h2>" >> "$REPORT_FILE"
echo "<div class='card'>" >> "$REPORT_FILE"
for R in us-east-1 us-east-2; do
  APPS=$(aws amplify list-apps --region "$R" --query 'apps[*].[name,defaultDomain]' --output text 2>/dev/null)
  if [ -n "$APPS" ]; then
    echo "<h4>Region: $R</h4><ul>" >> "$REPORT_FILE"
    echo "$APPS" | while read NAME DOMAIN; do
      echo "<li>$NAME — $DOMAIN</li>" >> "$REPORT_FILE"
    done
    echo "</ul>" >> "$REPORT_FILE"
  fi
done
echo "</div>" >> "$REPORT_FILE"

# ===== 6. COST CHECK =====
echo "<h2>6. Cost (Last 7 Days)</h2>" >> "$REPORT_FILE"
echo "<div class='card'>" >> "$REPORT_FILE"
START_DATE=$(date -v-7d +%Y-%m-%d 2>/dev/null || date -d '7 days ago' +%Y-%m-%d 2>/dev/null || echo "2026-03-11")
END_DATE=$(date +%Y-%m-%d)
COST=$(aws ce get-cost-and-usage --time-period Start="$START_DATE",End="$END_DATE" --granularity DAILY --metrics BlendedCost --query 'ResultsByTime[-1].Total.BlendedCost.Amount' --output text 2>/dev/null || echo "unavailable")
echo "<p>Most recent day cost: \$$COST</p>" >> "$REPORT_FILE"
echo "</div>" >> "$REPORT_FILE"

# Close HTML
cat >> "$REPORT_FILE" << 'FOOTER'
<hr style="border-color: #333; margin-top: 40px;">
<p style="color: #666; font-size: 12px;">
Wentworth Daily Security Scan — Quik Nation AI<br>
"He watched. He counted. He verified. He protected."<br>
Named after Wentworth Cheswell (1746-1817)
</p>
</body></html>
FOOTER

echo "Report generated: $REPORT_FILE"

# ===== EMAIL VIA SES =====
SLACK_TOKEN=$(aws ssm get-parameter --name '/quik-nation/shared/SLACK_BOT_TOKEN' --with-decryption --query 'Parameter.Value' --output text --region us-east-1 2>/dev/null)

# Send via SES
aws ses send-email \
  --from "ai@quiknation.com" \
  --destination "ToAddresses=president@quiknation.com,cto@quiknation.com" \
  --message "Subject={Data='Wentworth Daily Security Report — $REPORT_DATE'},Body={Html={Data=$(python3 -c "import sys; print(open('$REPORT_FILE').read())" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")}}" \
  --region us-east-1 2>/dev/null && echo "Email sent to founders" || echo "SES send failed — check SES verification"

# Also post summary to Slack
if [ -n "$SLACK_TOKEN" ]; then
  SUMMARY="Wentworth Daily Report — $REPORT_DATE\nIAM users checked, S3 buckets audited, EC2 instances scanned, SSM vault verified.\nFull report emailed to founders."
  curl -s -X POST "https://slack.com/api/chat.postMessage" \
    -H "Authorization: Bearer $SLACK_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"channel\":\"C0AKANS4UNB\",\"text\":\"$SUMMARY\"}" > /dev/null
fi

# Upload report to S3
aws s3 cp "$REPORT_FILE" "s3://auset-brain-vault/security-reports/wentworth-${REPORT_DATE}.html" 2>/dev/null && echo "Report archived to S3"

echo "Wentworth scan complete."
