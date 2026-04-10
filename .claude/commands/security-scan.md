# /security-scan — Wentworth Scans for Threats

**Powered by:** Wentworth (James Wentworth Lafayette) — Cybersecurity Agent
**Owned by:** Quik Nation (internal security division)

**EXECUTE IMMEDIATELY when invoked.** Scan the current project for security vulnerabilities.

## Usage
```
/security-scan                                 # Full scan
/security-scan --prompt-injection              # Prompt injection patterns only
/security-scan --owasp                         # OWASP Top 10 only
/security-scan --dependencies                  # npm audit / CVE check
/security-scan --secrets                       # Leaked secrets scan
/security-scan --quick                         # Fast scan (secrets + critical CVEs only)
```

## Execution Steps

### 1. Prompt Injection Scan
Search all `.md`, `.txt`, `.json` files for patterns that could manipulate AI agents:
- "Ignore previous instructions"
- "You are now..." / "Act as..."
- Hidden instructions in HTML comments
- Base64 encoded instructions
- Unicode homoglyphs hiding malicious text

### 2. OWASP Top 10
- SQL injection patterns in queries
- XSS vectors in frontend code
- Missing CSRF protection
- Auth bypass opportunities
- Missing input validation
- Insecure direct object references

### 3. Dependency Audit
```bash
cd backend && npm audit 2>/dev/null
cd frontend && npm audit 2>/dev/null
```
Flag: critical/high CVEs, outdated packages, known vulnerable versions.

### 4. Secret Detection
Search for accidentally committed secrets:
- API keys (patterns: `sk_`, `pk_`, `AKIA`, `Bearer `)
- .env files in git history
- Hardcoded passwords
- JWT tokens in code

### 5. Platform-Specific Checks
- `context.auth?.userId` present in all GraphQL resolvers
- `tenant_id` in all database queries
- Rate limiting on public endpoints
- CORS properly configured
- Helmet/security headers present

### 6. Report
```
SECURITY SCAN — Wentworth
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project: <name>
Scanned: <timestamp>

  CRITICAL: 0
  HIGH: 2
  MEDIUM: 5
  LOW: 3
  INFO: 8

  Findings:
  [HIGH] Missing rate limiting on /api/auth/login
  [HIGH] npm audit: lodash@4.17.19 has prototype pollution CVE
  ...

  Wentworth says: "2 items need immediate attention."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Related Commands
- `/armistead` — Talk to Wentworth about security
- `/gary` — Code review (quality) — runs alongside security scan
