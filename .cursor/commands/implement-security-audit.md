# Implement Security Audit

Conduct comprehensive security audit and implement hardening measures following OWASP Top 10 guidelines and DreamiHairCare's production-tested security patterns.

## Command Usage

```
/implement-security-audit [options]
```

### Options
- `--full` - Complete security audit (default)
- `--dependencies` - Dependency vulnerability scan only
- `--headers` - Security headers audit only
- `--auth` - Authentication/authorization audit only
- `--code` - Code security review only
- `--report` - Generate audit report without fixes

### Severity Options
- `--fix-critical` - Auto-fix critical vulnerabilities
- `--fix-high` - Auto-fix critical and high vulnerabilities
- `--fix-all` - Auto-fix all vulnerabilities where possible

## Pre-Audit Checklist

### Requirements
- [ ] Access to source code
- [ ] Access to deployed environments
- [ ] Documentation of architecture
- [ ] List of external integrations

### Tools Installation
```bash
# Dependency scanning
npm install -D npm-audit-resolver snyk

# Static analysis
npm install -D eslint-plugin-security

# Secret scanning
npm install -D gitleaks

# SAST (optional)
npm install -D semgrep
```

## Audit Phases

### Phase 1: Dependency Vulnerability Scan

#### 1.1 npm Audit
```bash
# Run audit
npm audit

# Fix automatically where possible
npm audit fix

# Generate report
npm audit --json > security-audit-deps.json
```

#### 1.2 Snyk Analysis
```bash
# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor for new vulnerabilities
snyk monitor
```

#### 1.3 Review Results
- Critical vulnerabilities: Must fix immediately
- High vulnerabilities: Fix within 24 hours
- Medium vulnerabilities: Fix within 1 week
- Low vulnerabilities: Fix in next release

### Phase 2: Security Headers Audit

#### 2.1 Check Current Headers
```bash
# Test production headers
curl -I https://your-domain.com

# Expected headers:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Content-Security-Policy: ...
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
```

#### 2.2 Implement Missing Headers
See **security-best-practices-standard** skill for helmet configuration.

### Phase 3: Authentication & Authorization Audit

#### 3.1 Authentication Checks
- [ ] JWT token validation on every request
- [ ] Token expiration configured (< 24 hours)
- [ ] Refresh token rotation implemented
- [ ] Secure cookie settings (httpOnly, secure, sameSite)
- [ ] Password requirements enforced
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after failed attempts

#### 3.2 Authorization Checks
- [ ] RBAC properly implemented
- [ ] Role checks on all protected endpoints
- [ ] Resource ownership validation
- [ ] Admin routes protected
- [ ] API key scoping (if applicable)

#### 3.3 Session Management
- [ ] Session timeout configured
- [ ] Session invalidation on logout
- [ ] Concurrent session handling
- [ ] Session storage secure

### Phase 4: Input Validation Audit

#### 4.1 Check All Input Points
- [ ] API request bodies validated with Zod
- [ ] Query parameters sanitized
- [ ] File uploads validated (type, size, content)
- [ ] GraphQL input types properly defined
- [ ] Form inputs sanitized

#### 4.2 SQL Injection Prevention
```bash
# Search for raw queries
grep -r "sequelize.query" --include="*.ts" backend/
grep -r "raw:" --include="*.ts" backend/

# All raw queries must use parameterized replacements
```

#### 4.3 XSS Prevention
```bash
# Search for dangerous patterns
grep -r "innerHTML" --include="*.tsx" frontend/
grep -r "dangerouslySetInnerHTML" --include="*.tsx" frontend/

# Ensure all user content is sanitized
```

### Phase 5: Secret Scanning

#### 5.1 Scan Repository
```bash
# Using gitleaks
gitleaks detect --source . --report-format json --report-path secrets-report.json

# Check results
cat secrets-report.json | jq '.[] | .Description'
```

#### 5.2 Common Secrets to Check
- API keys (Stripe, Clerk, etc.)
- Database credentials
- JWT secrets
- AWS credentials
- Private keys

#### 5.3 Verify Secrets Management
- [ ] No secrets in source code
- [ ] .env files in .gitignore
- [ ] Secrets in AWS Parameter Store (production)
- [ ] Secrets rotated regularly

### Phase 6: OWASP Top 10 Checklist

| Risk | Status | Notes |
|------|--------|-------|
| A01 Broken Access Control | [ ] | RBAC, auth middleware |
| A02 Cryptographic Failures | [ ] | HTTPS, bcrypt, secure tokens |
| A03 Injection | [ ] | Zod validation, parameterized queries |
| A04 Insecure Design | [ ] | Threat modeling, secure defaults |
| A05 Security Misconfiguration | [ ] | Helmet, secure headers |
| A06 Vulnerable Components | [ ] | npm audit, Dependabot |
| A07 Auth Failures | [ ] | Clerk, rate limiting, MFA |
| A08 Integrity Failures | [ ] | Webhook signatures, CSP |
| A09 Logging Failures | [ ] | Sentry, structured logging |
| A10 SSRF | [ ] | Input validation, allowlists |

### Phase 7: Infrastructure Security

#### 7.1 HTTPS/TLS
- [ ] SSL certificate valid
- [ ] TLS 1.2+ only
- [ ] HSTS enabled
- [ ] SSL labs grade A+

#### 7.2 API Security
- [ ] Rate limiting configured
- [ ] CORS properly restricted
- [ ] API versioning implemented
- [ ] Deprecation headers for old versions

#### 7.3 Database Security
- [ ] Encrypted at rest
- [ ] Encrypted in transit
- [ ] Least privilege access
- [ ] Regular backups

## Security Audit Report Template

```markdown
# Security Audit Report

**Project:** [Project Name]
**Date:** [Audit Date]
**Auditor:** [Name]

## Executive Summary

- **Critical Issues:** X
- **High Issues:** X
- **Medium Issues:** X
- **Low Issues:** X

## Findings

### Critical

1. **[Issue Title]**
   - Description:
   - Impact:
   - Recommendation:
   - Status: [Open/Fixed]

### High

...

### Medium

...

### Low

...

## Recommendations

1. ...
2. ...

## Conclusion

...
```

## GitHub Actions Security Workflow

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=high

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  codeql-analysis:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

## Verification Checklist

### Dependencies
- [ ] npm audit shows 0 critical/high
- [ ] Snyk shows 0 critical
- [ ] Dependabot enabled
- [ ] Auto-merge for security patches

### Headers
- [ ] All security headers present
- [ ] CSP properly configured
- [ ] HSTS enabled

### Authentication
- [ ] Rate limiting active
- [ ] Session management secure
- [ ] MFA available for admins

### Code
- [ ] No hardcoded secrets
- [ ] Input validation on all endpoints
- [ ] SQL injection prevented
- [ ] XSS prevented

### Infrastructure
- [ ] TLS 1.2+ only
- [ ] Database encrypted
- [ ] Backups encrypted

## Related Skills

- **security-best-practices-standard** - Security implementation patterns
- **clerk-auth-standard** - Authentication patterns
- **error-monitoring-standard** - Security event logging

## Related Commands

- `/implement-testing` - Security test scenarios
- `/implement-ci-cd` - Security scanning in CI/CD
