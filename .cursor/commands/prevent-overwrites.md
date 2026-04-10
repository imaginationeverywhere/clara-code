# prevent-overwrites - Proactive Functionality Protection System

## Overview
Proactively monitors, detects, and prevents accidental functionality overwrites during development through real-time analysis, pre-commit validation, test coverage enforcement, and CHANGELOG.md validation.

## Usage
```bash
prevent-overwrites [--init|--status|--watch|--validate|--config]
```

### Commands
- `prevent-overwrites --init` - Initialize protection system for the project
- `prevent-overwrites --status` - Show current protection status and coverage
- `prevent-overwrites --watch` - Start real-time monitoring (development mode)
- `prevent-overwrites --validate` - Run validation checks before commit
- `prevent-overwrites --config` - Configure protection rules and critical paths
- `prevent-overwrites --analyze` - Analyze current changes for potential overwrites
- `prevent-overwrites --report` - Generate protection coverage report

### Parameters
- `--critical-only` - Only monitor critical paths/functions
- `--auto-fix` - Automatically fix detected issues when possible
- `--strict` - Block commits that fail validation (default: warn only)
- `--learning-mode` - Learn from past restorations to improve detection
- `--team-mode` - Enable team collaboration features

## Architecture

### Protection Layers

```markdown
┌─────────────────────────────────────────────────────────┐
│                  Layer 1: Real-Time Monitoring           │
│  - File change detection                                 │
│  - AST comparison on save                                │
│  - Immediate warnings in IDE                             │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Layer 2: Pre-Commit Validation          │
│  - Git hooks integration                                 │
│  - Test coverage check                                   │
│  - CHANGELOG.md validation                               │
│  - Breaking change detection                             │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Layer 3: Code Review Integration        │
│  - PR checks and gates                                   │
│  - Team notifications                                    │
│  - Automated code review comments                        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Layer 4: Learning System                │
│  - Pattern recognition from past restorations            │
│  - Risk scoring for changes                              │
│  - Intelligent protection recommendations                │
└─────────────────────────────────────────────────────────┘
```

## Command Workflow

### Phase 1: Initialization (`--init`)

1. **Create Protection Configuration**
   ```bash
   # Creates .prevent-overwrites.json
   {
     "version": "1.0.0",
     "enabled": true,
     "strict_mode": false,
     "protected_paths": [
       "src/core/**/*.ts",
       "src/utils/critical/*.ts",
       "src/api/auth/**/*.ts"
     ],
     "critical_functions": [
       {
         "file": "src/utils/cart-calculations.ts",
         "functions": ["calculateCartTotal", "applyDiscounts"],
         "reason": "Core checkout functionality - DO NOT REMOVE",
         "owner": "payments-team"
       },
       {
         "file": "src/api/auth/session.ts",
         "functions": ["validateSession", "refreshToken"],
         "reason": "Security-critical authentication logic",
         "owner": "security-team"
       }
     ],
     "test_coverage": {
       "minimum": 80,
       "critical_paths_minimum": 100,
       "enforce_on_commit": true
     },
     "changelog": {
       "require_for_removals": true,
       "require_migration_guide": true,
       "enforce_deprecation_workflow": true
     },
     "notifications": {
       "slack_webhook": "https://hooks.slack.com/...",
       "email_alerts": ["team@company.com"]
     }
   }
   ```

2. **Install Git Hooks**
   ```bash
   # .husky/pre-commit
   #!/bin/sh
   . "$(dirname "$0")/_/husky.sh"

   # Run prevent-overwrites validation
   npx claude-code prevent-overwrites --validate

   # Exit code 1 blocks commit, 0 allows it
   ```

3. **Create Critical Functions Registry**
   ```bash
   # .prevent-overwrites/critical-registry.json
   {
     "functions": [
       {
         "signature": "calculateCartTotal(items: CartItem[]): number",
         "file": "src/utils/cart-calculations.ts",
         "hash": "a3f9c12...",
         "test_files": ["cart.test.ts", "checkout.test.ts"],
         "dependencies": ["applyDiscounts", "calculateTax"],
         "last_modified": "2025-01-15T10:30:00Z",
         "last_tested": "2025-01-20T14:45:00Z"
       }
     ],
     "exports": [
       {
         "name": "AuthProvider",
         "file": "src/providers/AuthProvider.tsx",
         "type": "component",
         "used_by": 23,
         "breaking_change_impact": "high"
       }
     ]
   }
   ```

4. **Configure IDE Integration** (Optional)
   ```json
   // .vscode/settings.json
   {
     "prevent-overwrites.enabled": true,
     "prevent-overwrites.realTimeWarnings": true,
     "prevent-overwrites.showCoverage": true
   }
   ```

### Phase 2: Real-Time Monitoring (`--watch`)

**Development Mode Protection**

```bash
# Start watching during development
prevent-overwrites --watch

# Output:
🔍 MONITORING: Real-time protection active
📂 Watching: 245 files in protected paths
🛡️  Critical functions: 18 protected
⚙️  Mode: Development (warnings only)
```

**Change Detection & Analysis**

```javascript
// When developer modifies file
const changeDetection = {
  file: "src/utils/cart-calculations.ts",
  action: "modify",

  analysis: {
    linesRemoved: 25,
    functionsDeleted: ["applyDiscounts"],
    exportsRemoved: ["DiscountType"],

    impact: {
      criticalFunctionRemoved: true,
      testCoverageImpacted: true,
      dependentFiles: 8,
      usageCount: 47
    }
  }
};
```

**Immediate IDE Warnings**

```markdown
⚠️  CRITICAL FUNCTION REMOVAL DETECTED

File: src/utils/cart-calculations.ts
Function: applyDiscounts()

Impact:
- This is a PROTECTED critical function
- Used in 47 locations across 8 files
- Core checkout functionality
- Owner: payments-team

Actions:
1. If intentional: Update CHANGELOG.md with migration guide
2. If refactoring: Ensure new implementation exists
3. If accidental: Undo changes (Cmd+Z)

[ View Usage ] [ Update CHANGELOG ] [ Ignore (not recommended) ]
```

### Phase 3: Pre-Commit Validation (`--validate`)

**Executed Automatically by Git Hook**

```bash
# Triggered by git commit
prevent-overwrites --validate

# Validation Steps:
1. Analyze staged changes
2. Check critical functions
3. Verify test coverage
4. Validate CHANGELOG.md
5. Run breaking change detection
6. Generate risk assessment
```

**Validation Output**

```markdown
🔍 PRE-COMMIT VALIDATION

📊 CHANGES DETECTED
- Files modified: 5
- Lines removed: 127
- Functions deleted: 2
- Exports removed: 1

⚠️  CRITICAL ISSUES FOUND

1. PROTECTED FUNCTION REMOVAL
   File: src/utils/cart-calculations.ts
   Function: calculateCartTotal()
   Status: ❌ CRITICAL - BLOCKING
   Reason: Core checkout functionality

   Required Actions:
   - [ ] Update CHANGELOG.md with removal reason
   - [ ] Create migration guide
   - [ ] Update 8 dependent files
   - [ ] Ensure replacement implementation exists
   - [ ] Get approval from: payments-team

2. TEST COVERAGE DROP
   File: src/api/payments/stripe.ts
   Coverage: 75% (was 92%)
   Status: ⚠️  WARNING
   Reason: Below minimum threshold (80%)

   Required Actions:
   - [ ] Add tests for new code
   - [ ] Restore test coverage to 80%+

3. CHANGELOG.md NOT UPDATED
   Status: ❌ BLOCKING (strict mode enabled)
   Reason: Functions removed without documentation

   Required Actions:
   - [ ] Add entries to CHANGELOG.md
   - [ ] Document breaking changes
   - [ ] Provide migration path

📈 RISK ASSESSMENT: HIGH
- Breaking changes: 1 critical, 0 minor
- Documentation missing: Yes
- Test coverage: Decreased
- Team approval: Required

❌ COMMIT BLOCKED
Fix issues above or use: git commit --no-verify (NOT RECOMMENDED)

To fix:
1. prevent-overwrites --auto-fix (attempt automatic fixes)
2. Update CHANGELOG.md manually
3. Get team approval: @payments-team
```

### Phase 4: Analysis & Reporting (`--analyze`, `--report`)

**Change Analysis**

```bash
prevent-overwrites --analyze

# Output:
📊 CHANGE ANALYSIS REPORT

Current Branch: feature/refactor-payments
Base Branch: main

🔍 DETECTED CHANGES
- Total files: 12 modified, 3 deleted
- Functions: 8 modified, 2 deleted, 5 added
- Exports: 3 removed, 7 added
- Test files: 4 modified

⚠️  POTENTIAL OVERWRITES DETECTED

1. Function Deletion: calculateShippingCost()
   File: src/utils/shipping.ts (DELETED)
   Risk: HIGH
   Reason: Function has 23 call sites
   Used by: checkout flow, order processing, shipping calculator
   Last modified: 2025-01-10 (recent)
   Test coverage: 95% (well-tested)

   Recommendation:
   - If refactoring: Ensure new implementation covers all use cases
   - If removing: Add deprecation notice first
   - If accidental: Restore immediately

2. Export Removal: PaymentProvider
   File: src/providers/payments/index.ts
   Risk: CRITICAL
   Reason: Public API - 47 imports across codebase
   Breaking change: YES

   Recommendation:
   - MUST update CHANGELOG.md
   - MUST provide migration guide
   - Consider phased deprecation

🎯 RECOMMENDATIONS
- Review 2 high-risk changes before committing
- Add tests for 3 new functions
- Update CHANGELOG.md (required)
- Get code review from: @payments-team, @security-team
```

**Protection Coverage Report**

```bash
prevent-overwrites --report

# Output:
📈 PROTECTION COVERAGE REPORT

Generated: 2025-01-20 14:30:00 UTC
Project: E-Commerce Platform

🛡️  PROTECTION STATUS
- Protection enabled: ✅ YES
- Strict mode: ⚠️  NO (warnings only)
- Real-time monitoring: ✅ ACTIVE
- Git hooks: ✅ INSTALLED

📂 PROTECTED PATHS
- src/core/**/*.ts (95 files) ✅
- src/utils/critical/*.ts (12 files) ✅
- src/api/auth/**/*.ts (23 files) ✅
- Total protected files: 130

🔒 CRITICAL FUNCTIONS
- Total registered: 18
- Test coverage: 18/18 (100%) ✅
- Documentation: 18/18 (100%) ✅
- Last verified: 2025-01-20

🧪 TEST COVERAGE
- Overall: 87% ✅
- Critical paths: 100% ✅
- Minimum threshold: 80% ✅

📝 CHANGELOG.md COMPLIANCE
- Format: Keep a Changelog ✅
- Last updated: 2025-01-18
- Removals documented: 12/12 (100%) ✅
- Migration guides: 8/8 (100%) ✅

📊 HISTORICAL DATA (Last 30 Days)
- Overwrites prevented: 7
- False positives: 2
- Team alerts sent: 15
- Average response time: 1.2 hours

🎯 RECOMMENDATIONS
1. Enable strict mode for production branches
2. Add 3 more critical functions to registry
3. Update protection config for new modules
4. Review false positives to improve detection
```

## Use Cases & Examples

### Use Case 1: Preventing Accidental Deletion During Refactoring

**Scenario**: Developer refactoring authentication system

```bash
# Developer working on auth refactor
# File: src/api/auth/session.ts

# Developer deletes old validateSession() function
- function validateSession(token: string): Session {
-   return jwt.verify(token);
- }

# Adds new implementation in different file
+ // src/api/auth/v2/session.ts
+ function validateSessionV2(token: string): Session {
+   return oauth.verify(token);
+ }

# prevent-overwrites detects immediately:
⚠️  CRITICAL FUNCTION DELETION DETECTED

Function: validateSession()
File: src/api/auth/session.ts
Status: PROTECTED (security-critical)

This function is used in 34 locations:
- src/middleware/auth.ts (12 calls)
- src/api/routes/protected.ts (8 calls)
- src/api/admin/dashboard.ts (6 calls)
- ... 8 more files

Did you create a replacement?
[x] Yes, new implementation exists at: src/api/auth/v2/session.ts
[ ] No, this was accidental

Actions needed:
1. Update all 34 call sites to use validateSessionV2()
2. Add migration guide to CHANGELOG.md
3. Create deprecation notice for validateSession()
4. Add forwarding function for backward compatibility

Would you like to:
- [ ] Auto-generate migration script
- [ ] Create deprecation wrapper
- [ ] See usage locations
- [ ] Cancel deletion
```

### Use Case 2: Pre-Commit Protection

**Scenario**: Developer tries to commit changes that remove functionality

```bash
git add .
git commit -m "refactor: improve checkout flow"

# prevent-overwrites hook runs:
🔍 ANALYZING COMMIT...

❌ COMMIT BLOCKED - CRITICAL ISSUES

Issue 1: Protected Function Removed
- File: src/utils/cart-calculations.ts
- Function: calculateCartTotal()
- Used by: 47 locations
- CHANGELOG.md: NOT UPDATED ❌

Issue 2: Test Coverage Drop
- File: src/api/payments/stripe.ts
- Coverage: 65% (minimum: 80%)
- Missing tests for: processRefund(), handleWebhook()

Issue 3: Breaking Change Not Documented
- Export removed: CartCalculator from utils/index.ts
- 23 imports will break
- No migration guide provided

To proceed, you must:
1. Update CHANGELOG.md with removal details
2. Add tests to restore coverage to 80%+
3. Provide migration guide for CartCalculator removal

Or run: prevent-overwrites --auto-fix
Then: git commit --amend

# Developer runs auto-fix:
prevent-overwrites --auto-fix

✅ CHANGELOG.md template created
✅ Test scaffolding generated
✅ Migration guide template created

Please fill in the templates and commit again.
```

### Use Case 3: Team Collaboration & Notifications

**Scenario**: Critical function modified, team needs to be notified

```bash
# Developer modifies payment processing logic
# File: src/api/payments/stripe.ts

# prevent-overwrites detects and sends notifications:

📧 SLACK NOTIFICATION (@payments-team)
⚠️  Critical Payment Function Modified

Developer: @john.doe
Branch: feature/update-payment-flow
File: src/api/payments/stripe.ts
Function: processPayment()

Changes:
- 47 lines modified
- Error handling updated
- New Stripe API version

Impact Assessment:
- Risk Level: HIGH
- Test Coverage: Maintained (95%)
- Breaking Changes: NO
- CHANGELOG.md: Updated ✅

Actions Required:
- [ ] Code review by @payments-lead
- [ ] QA testing in staging
- [ ] Approval before merge

[View Changes] [Review PR] [Run Tests]

---

📧 EMAIL ALERT (security-team@company.com)
Subject: Security-Critical Function Modified

A function marked as security-critical has been modified:
- Function: validatePaymentMethod()
- File: src/api/payments/validation.ts
- Developer: john.doe
- Branch: feature/update-payment-flow

Security review required before merge.
```

### Use Case 4: Learning from Past Restorations

**Scenario**: System learns from previous overwrites to improve detection

```bash
# prevent-overwrites learns from restore-functionality incidents

# Learning Data:
{
  "restoration_incidents": [
    {
      "date": "2025-01-15",
      "function": "calculateCartTotal",
      "file": "src/utils/cart-calculations.ts",
      "commit": "a3f9c12",
      "reason": "Accidental deletion during refactor",
      "impact": "Checkout flow broken for 4 hours",
      "pattern": "Function deleted while refactoring parent file"
    }
  ]
}

# New Protection Rule Generated:
{
  "rule_type": "learned",
  "pattern": "function_deletion_during_refactor",
  "trigger": "File has 3+ functions, 1+ deleted, 1+ added",
  "action": "warn_strict",
  "message": "Detected pattern similar to previous overwrite incident (2025-01-15)",
  "confidence": 0.87
}

# Next time developer refactors similar code:
⚠️  PATTERN MATCH: Similar to Previous Incident

This change matches a pattern that previously caused a 4-hour outage:
- Date: 2025-01-15
- Issue: calculateCartTotal accidentally deleted during refactor
- Impact: Checkout flow broken

Current changes:
- File: src/utils/shipping-calculations.ts
- Pattern: 1 function deleted, 2 added during refactor
- Risk: MEDIUM-HIGH

Recommended actions:
1. Verify replacement implementation covers all use cases
2. Run full test suite before committing
3. Add extra validation for shipping calculations
4. Consider feature flag for gradual rollout

Confidence: 87%
```

### Use Case 5: New Developer Onboarding Protection

**Scenario**: New developer unfamiliar with critical paths

```bash
# New developer joins team
# prevent-overwrites provides guidance

# When touching protected code:
ℹ️  CRITICAL CODE ZONE

You're modifying: src/api/auth/session.ts

This file contains security-critical functions:
- validateSession() - Used by all protected routes
- refreshToken() - Session management
- revokeToken() - Security cleanup

Owner: security-team
Documentation: docs/security/authentication.md

⚠️  Before modifying:
1. Read documentation linked above
2. Understand security implications
3. Get review from: @security-lead
4. Test thoroughly in staging

New to this area? Ask @security-team for guidance.

[Read Docs] [Contact Team] [Continue Carefully]
```

### Use Case 6: CI/CD Integration

**Scenario**: Automated checks in pull request pipeline

```yaml
# .github/workflows/prevent-overwrites.yml
name: Functionality Protection Check

on:
  pull_request:
    branches: [main, develop]

jobs:
  prevent-overwrites:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full history for analysis

      - name: Run Overwrite Prevention Analysis
        run: |
          npm install -g @claude/prevent-overwrites
          prevent-overwrites --analyze --strict

      - name: Post Results to PR
        uses: actions/github-script@v6
        with:
          script: |
            // Post analysis results as PR comment
            const results = require('./overwrite-analysis.json');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              body: generateCommentBody(results)
            });

      - name: Block Merge if Critical Issues
        run: |
          if [ -f ".overwrite-issues-critical" ]; then
            echo "❌ Critical overwrite issues detected"
            exit 1
          fi
```

**PR Comment Generated:**

```markdown
## 🛡️ Functionality Protection Analysis

**Status**: ⚠️ WARNINGS DETECTED

### Changes Analyzed
- **Files Modified**: 8
- **Functions Deleted**: 2
- **Functions Added**: 5
- **Risk Level**: MEDIUM

### ⚠️ Issues Found

#### 1. Function Removal Without Replacement
- **File**: `src/utils/calculations.ts`
- **Function**: `calculateShippingCost()`
- **Severity**: MEDIUM
- **Impact**: Used in 12 locations
- **Required Action**: Add migration guide to CHANGELOG.md

#### 2. Test Coverage Decreased
- **File**: `src/api/payments/stripe.ts`
- **Coverage**: 78% → 72% (-6%)
- **Severity**: LOW
- **Required Action**: Add tests for new code paths

### ✅ Positive Checks
- CHANGELOG.md updated ✅
- No critical function removals ✅
- Protected paths unchanged ✅
- Security-critical code untouched ✅

### Recommendations
1. Add tests to restore coverage above 80%
2. Document the calculateShippingCost removal
3. Consider adding replacement function reference

**Merge Recommendation**: Safe to merge after addressing warnings

---
*Generated by prevent-overwrites v1.0.0*
```

### Use Case 7: Deprecation Workflow Enforcement

**Scenario**: Enforcing proper deprecation before removal

```bash
# Developer tries to remove function without deprecation

# File: src/api/legacy/payments.ts
- function processLegacyPayment(data: PaymentData) {
-   // old implementation
- }

# prevent-overwrites checks deprecation history:
❌ IMPROPER REMOVAL DETECTED

Function: processLegacyPayment()
Status: No deprecation notice found

Proper deprecation workflow:
1. Version N: Add @deprecated JSDoc tag
2. Version N: Add console.warn() in function
3. Version N: Update CHANGELOG.md with deprecation notice
4. Version N+1: Mark as deprecated in API docs
5. Version N+2: Remove function (THIS STEP)

You are trying to skip directly to step 5.

Required actions:
1. Restore function
2. Add deprecation notice in current version
3. Wait 2 releases before removal
4. Update CHANGELOG.md with timeline

Or use: prevent-overwrites --force-deprecation
(Creates deprecation PRs for current version)

[ Restore Function ] [ Force Deprecation ] [ Override (requires approval) ]
```

## Configuration

### .prevent-overwrites.json

```json
{
  "version": "1.0.0",
  "enabled": true,
  "strict_mode": false,

  "protection": {
    "critical_functions": {
      "enabled": true,
      "auto_detect": true,
      "manual_registry": ".prevent-overwrites/critical-registry.json"
    },
    "protected_paths": [
      "src/core/**/*.{ts,tsx,js,jsx}",
      "src/utils/critical/**/*",
      "src/api/auth/**/*",
      "src/api/payments/**/*"
    ],
    "ignore_paths": [
      "**/*.test.ts",
      "**/*.spec.ts",
      "**/mocks/**",
      "**/__tests__/**"
    ]
  },

  "validation": {
    "test_coverage": {
      "enabled": true,
      "minimum_overall": 80,
      "minimum_critical": 100,
      "enforce_on_commit": true,
      "allow_decrease": false,
      "max_decrease_percent": 5
    },
    "changelog": {
      "require_for_removals": true,
      "require_for_modifications": false,
      "require_migration_guide": true,
      "enforce_deprecation": true,
      "format": "keep-a-changelog"
    },
    "breaking_changes": {
      "detect_export_removal": true,
      "detect_signature_changes": true,
      "detect_dependency_changes": true,
      "require_approval": true,
      "approval_teams": ["@security-team", "@api-team"]
    }
  },

  "monitoring": {
    "real_time": {
      "enabled": true,
      "debounce_ms": 500,
      "show_ide_warnings": true
    },
    "git_hooks": {
      "pre_commit": true,
      "pre_push": true,
      "commit_msg": true
    }
  },

  "learning": {
    "enabled": true,
    "learn_from_restorations": true,
    "confidence_threshold": 0.7,
    "pattern_database": ".prevent-overwrites/patterns.json"
  },

  "notifications": {
    "slack": {
      "enabled": true,
      "webhook_url": "${SLACK_WEBHOOK_URL}",
      "channels": {
        "critical": "#security-alerts",
        "warnings": "#dev-notifications"
      }
    },
    "email": {
      "enabled": false,
      "recipients": ["team@company.com"],
      "send_for": ["critical", "high"]
    },
    "github": {
      "enabled": true,
      "post_pr_comments": true,
      "block_merge_on_critical": true
    }
  },

  "teams": {
    "security-team": {
      "members": ["@alice", "@bob"],
      "owns": ["src/api/auth/**/*", "src/security/**/*"],
      "approval_required": true
    },
    "payments-team": {
      "members": ["@charlie", "@diana"],
      "owns": ["src/api/payments/**/*"],
      "approval_required": true
    }
  }
}
```

### Critical Functions Registry

```json
// .prevent-overwrites/critical-registry.json
{
  "functions": [
    {
      "name": "calculateCartTotal",
      "file": "src/utils/cart-calculations.ts",
      "signature": "calculateCartTotal(items: CartItem[], discounts?: Discount[]): number",
      "reason": "Core checkout functionality - DO NOT REMOVE without replacement",
      "owner": "payments-team",
      "created": "2024-06-01",
      "test_files": [
        "src/utils/cart-calculations.test.ts",
        "src/e2e/checkout.test.ts"
      ],
      "test_coverage": 100,
      "dependencies": ["applyDiscounts", "calculateTax", "validateCart"],
      "used_by_count": 47,
      "breaking_change_impact": "critical",
      "tags": ["checkout", "payments", "critical"],
      "documentation": "docs/payments/cart-calculations.md",
      "last_incident": null
    },
    {
      "name": "validateSession",
      "file": "src/api/auth/session.ts",
      "signature": "validateSession(token: string): Promise<Session>",
      "reason": "Security-critical authentication logic",
      "owner": "security-team",
      "created": "2024-05-15",
      "test_files": [
        "src/api/auth/session.test.ts",
        "src/e2e/auth.test.ts"
      ],
      "test_coverage": 100,
      "dependencies": ["verifyJWT", "checkSessionExpiry"],
      "used_by_count": 134,
      "breaking_change_impact": "critical",
      "tags": ["auth", "security", "critical"],
      "documentation": "docs/security/authentication.md",
      "last_incident": {
        "date": "2024-12-01",
        "type": "accidental_modification",
        "duration": "2 hours",
        "impact": "Authentication broken in production"
      }
    }
  ],
  "exports": [
    {
      "name": "CartCalculator",
      "file": "src/utils/cart/index.ts",
      "type": "class",
      "public_api": true,
      "used_by_count": 67,
      "breaking_change_impact": "high",
      "owner": "payments-team"
    }
  ],
  "metadata": {
    "last_updated": "2025-01-20T14:30:00Z",
    "total_protected_functions": 18,
    "total_protected_exports": 12,
    "last_verified": "2025-01-20T10:00:00Z"
  }
}
```

## Integration with Existing Commands

### Integration with restore-functionality

```bash
# When restore-functionality restores something:
restore-functionality "calculateCartTotal"

# After successful restoration:
✅ RESTORATION COMPLETE

🛡️  AUTO-PROTECTION ENABLED
Function calculateCartTotal() has been added to protection registry.

This will prevent future accidental overwrites of:
- calculateCartTotal()
- applyDiscounts() (detected dependency)
- validateCart() (detected dependency)

Protection configuration saved to:
.prevent-overwrites/critical-registry.json

Run 'prevent-overwrites --status' to see protection details.
```

### Integration with git-commit-docs-command

```bash
# Automatic validation before documentation update
/git-commit-docs-command

# prevent-overwrites validates first:
🔍 ANALYZING CHANGES...

✅ VALIDATION PASSED
- No critical functions removed
- Test coverage: 87% (maintained)
- CHANGELOG.md: Will be updated by git-commit-docs ✅
- Breaking changes: None

Proceeding with documentation update...
```

### Integration with process-todos

```bash
# Development workflow with protection
process-todos

# When working on tasks, prevent-overwrites monitors:
🛡️  PROTECTION ACTIVE
Monitoring your changes for potential overwrites...

[Working on task: "Refactor payment processing"]
...
⚠️  Warning: You're modifying protected function processPayment()
See: .prevent-overwrites/critical-registry.json

Continue with task? Protection will validate on commit.
```

## CLI Reference

### Installation

```bash
# Installed automatically with quik-nation-ai-boilerplate
# Or install separately:
npm install -g @claude/prevent-overwrites

# Verify installation:
prevent-overwrites --version
```

### Commands

```bash
# Initialize protection system
prevent-overwrites --init
prevent-overwrites --init --strict  # Enable strict mode
prevent-overwrites --init --team    # Enable team features

# Check status
prevent-overwrites --status
prevent-overwrites --status --detailed
prevent-overwrites --status --critical-only

# Start monitoring
prevent-overwrites --watch
prevent-overwrites --watch --critical-only
prevent-overwrites --watch --auto-fix

# Run validation (used by git hooks)
prevent-overwrites --validate
prevent-overwrites --validate --strict
prevent-overwrites --validate --auto-fix

# Analyze changes
prevent-overwrites --analyze
prevent-overwrites --analyze --branch feature/my-feature
prevent-overwrites --analyze --since main

# Generate reports
prevent-overwrites --report
prevent-overwrites --report --format json
prevent-overwrites --report --output report.html

# Configure protection
prevent-overwrites --config
prevent-overwrites --config --add-critical src/utils/critical.ts:myFunction
prevent-overwrites --config --remove-critical src/utils/old.ts:oldFunction
prevent-overwrites --config --show

# Learning mode
prevent-overwrites --learn
prevent-overwrites --learn --from-restorations
prevent-overwrites --learn --confidence 0.8

# Testing
prevent-overwrites --test
prevent-overwrites --test --dry-run
```

## Best Practices

### When to Use Strict Mode

```bash
# Development branches: warnings only (default)
prevent-overwrites --init

# Staging/production branches: strict mode
prevent-overwrites --init --strict

# Or configure per branch in .prevent-overwrites.json:
{
  "strict_mode": {
    "default": false,
    "branches": {
      "main": true,
      "develop": true,
      "staging": true,
      "production": true
    }
  }
}
```

### Defining Critical Functions

**Auto-Detection Criteria:**
- High usage count (50+ call sites)
- Security-related (auth, encryption, validation)
- Financial transactions (payments, pricing, billing)
- Data integrity (database operations, migrations)
- Public API exports
- Functions with 100% test coverage
- Functions in protected paths

**Manual Registration:**
```bash
# Add critical function manually
prevent-overwrites --config --add-critical \
  src/api/payments/stripe.ts:processPayment \
  --reason "Core payment processing" \
  --owner payments-team

# Or edit .prevent-overwrites/critical-registry.json directly
```

### Team Workflows

```bash
# Team lead configures protection
prevent-overwrites --init --team
prevent-overwrites --config --add-team security-team \
  --members "@alice,@bob" \
  --owns "src/api/auth/**/*" \
  --approval-required

# Developers get automatic protection
git clone repo
cd repo
# Protection automatically active via git hooks

# Team receives notifications
# Slack: @security-team when protected code modified
# Email: team@company.com for critical issues
# GitHub: PR comments with analysis
```

## Troubleshooting

### False Positives

```bash
# If prevention system flags legitimate changes:

# Option 1: Update configuration
prevent-overwrites --config --ignore-path "src/utils/temp/*"

# Option 2: Bypass for specific commit (requires justification)
git commit --no-verify -m "fix: update critical function

JUSTIFICATION: Function behavior unchanged, only internal optimization.
Reviewed by: @security-lead
Tests: All passing (100% coverage maintained)"

# Option 3: Adjust detection sensitivity
# Edit .prevent-overwrites.json:
{
  "learning": {
    "confidence_threshold": 0.9  // Higher = fewer false positives
  }
}
```

### Performance Issues

```bash
# If monitoring causes slowdowns:

# Option 1: Reduce monitored paths
prevent-overwrites --config --set-paths "src/core/**/*"

# Option 2: Increase debounce time
# Edit .prevent-overwrites.json:
{
  "monitoring": {
    "real_time": {
      "debounce_ms": 1000  // Wait longer between checks
    }
  }
}

# Option 3: Disable real-time monitoring
prevent-overwrites --config --disable-watch
# Only use git hooks for validation
```

### Hook Failures

```bash
# If git hooks fail unexpectedly:

# Check hook status
prevent-overwrites --status --hooks

# Reinstall hooks
prevent-overwrites --init --force

# View detailed error logs
cat .prevent-overwrites/hook-errors.log

# Temporary bypass (not recommended)
git commit --no-verify
```

## Advanced Features

### Pattern Learning from Incidents

```bash
# Learn from past restorations
prevent-overwrites --learn --from-restorations

# System analyzes:
- docs/restoration-reports/*.md
- Git history for reverts
- CHANGELOG.md restoration entries

# Generates protection rules:
{
  "learned_patterns": [
    {
      "pattern_id": "refactor-deletion",
      "description": "Function deleted during file refactoring",
      "incidents": 3,
      "avg_impact_hours": 2.5,
      "confidence": 0.89,
      "rule": {
        "trigger": "file_modified && function_count_decreased && function_count_increased",
        "action": "warn_strict",
        "message": "Pattern matches 3 previous incidents"
      }
    }
  ]
}
```

### Custom Validation Rules

```javascript
// .prevent-overwrites/custom-rules.js
module.exports = {
  rules: [
    {
      name: "payment-function-modification",
      description: "Extra validation for payment-related functions",
      trigger: (change) => {
        return change.file.includes('payments') &&
               change.functionsModified.some(f => f.includes('process'));
      },
      validate: async (change) => {
        // Custom validation logic
        const hasSecurityReview = await checkSecurityReview(change);
        const hasLoadTesting = await checkLoadTests(change);

        return {
          passed: hasSecurityReview && hasLoadTesting,
          message: "Payment functions require security review and load testing",
          severity: "critical"
        };
      }
    }
  ]
};
```

### Automated Recovery Suggestions

```bash
# When overwrite detected:
⚠️  POTENTIAL OVERWRITE DETECTED

Function: calculateDiscount()
Action: Deleted in current changes

🤖 AUTO-RECOVERY SUGGESTIONS:

Option 1: Restore from git history
  Command: git checkout HEAD~1 -- src/utils/discounts.ts
  Confidence: 95%

Option 2: Cherry-pick from feature branch
  Command: git cherry-pick abc123 (contains calculateDiscount)
  Confidence: 87%

Option 3: Restore from backup
  File: .prevent-overwrites/backups/discounts.ts.backup
  Confidence: 100%

[ Auto-Restore Option 1 ] [ Manual Recovery ] [ This is Intentional ]
```

## Output Examples

### Real-Time Monitoring Output

```bash
prevent-overwrites --watch

🛡️  PREVENT-OVERWRITES v1.0.0
Real-time functionality protection active

📂 Monitoring Configuration:
   Protected paths: 3 (130 files)
   Critical functions: 18
   Protected exports: 12
   Mode: Development (warnings only)

🔍 Watching for changes...

[14:23:15] ✅ File saved: src/utils/helpers.ts (no issues)
[14:23:47] ⚠️  File modified: src/api/auth/session.ts
           → Function validateSession() signature changed
           → Protected: YES (security-critical)
           → Tests still passing: ✅
           → CHANGELOG.md: Update recommended

[14:24:12] ❌ File modified: src/utils/cart-calculations.ts
           → Function calculateCartTotal() DELETED
           → Protected: YES (critical)
           → Used by: 47 locations
           → THIS IS A CRITICAL FUNCTION - RESTORE IMMEDIATELY
           → Owner: @payments-team notified

[14:24:45] ✅ File restored: src/utils/cart-calculations.ts
           → calculateCartTotal() restored
           → False alarm cleared

📊 Session Summary:
   Files changed: 8
   Warnings issued: 2
   Critical alerts: 1
   Auto-recoveries: 1

   Press Ctrl+C to stop monitoring
```

### Validation Report Output

```bash
prevent-overwrites --validate

🔍 PRE-COMMIT VALIDATION REPORT
Generated: 2025-01-20 14:30:00 UTC

📊 CHANGE SUMMARY
┌─────────────────────┬──────────┐
│ Metric              │ Value    │
├─────────────────────┼──────────┤
│ Files Modified      │ 5        │
│ Files Deleted       │ 0        │
│ Functions Modified  │ 3        │
│ Functions Deleted   │ 1        │
│ Functions Added     │ 2        │
│ Exports Removed     │ 0        │
│ Test Coverage       │ 87% (+2%)│
└─────────────────────┴──────────┘

✅ PASSED CHECKS (8/10)
✓ No critical function deletions
✓ Test coverage maintained
✓ No security-critical modifications
✓ Protected paths unchanged
✓ No breaking export changes
✓ Dependencies intact
✓ Type safety maintained
✓ Linting passed

⚠️  WARNINGS (2)
⚠️  Warning 1: CHANGELOG.md not updated
   → Functions modified: calculateShipping()
   → Recommendation: Add entry to CHANGELOG.md
   → Severity: LOW

⚠️  Warning 2: Function usage decreased
   → Function: formatCurrency() usage: 45 → 41 (-4)
   → Possibly replaced by new implementation
   → Verify: Is this intentional?
   → Severity: LOW

🎯 RISK ASSESSMENT
Overall Risk: LOW ✅
Breaking Changes: 0
Security Impact: None
Team Approval: Not required

✅ COMMIT ALLOWED
No blocking issues detected. Warnings can be addressed in follow-up commits.

To fix warnings:
1. prevent-overwrites --auto-fix
2. Update CHANGELOG.md manually

Commit now: git commit
View details: prevent-overwrites --report
```

## Future Enhancements

1. **AI-Powered Pattern Recognition**
   - Machine learning models for better detection
   - Predict likely overwrites before they happen
   - Personalized protection based on developer habits

2. **Visual Dashboard**
   - Web UI for monitoring protection status
   - Visual diff tools for reviewing changes
   - Real-time team collaboration features

3. **Integration with More Tools**
   - IDE plugins (VS Code, WebStorm, IntelliJ)
   - CI/CD platforms (CircleCI, Travis, GitLab)
   - Project management (JIRA, Linear, Asana)

4. **Advanced Analytics**
   - Protection effectiveness metrics
   - Team performance insights
   - Risk trending over time

5. **Automated Testing Generation**
   - Generate tests for unprotected critical functions
   - Achieve 100% coverage for important code
   - Integration with testing-automation-agent

---

**Related Commands:**
- [restore-functionality](./.claude/commands/restore-functionality.md) - Fix overwrites after they happen
- [git-commit-docs-command](./.claude/commands/git-commit-docs.md) - Comprehensive commit with documentation
- [testing-automation-agent](./.claude/agents/testing-automation-agent.md) - Automated test generation

**Documentation:**
- [CHANGELOG.md Standards](../CHANGELOG.md) - Keep a Changelog format
- [Code Review Guidelines](../docs/development/code-review.md) - Team review process
- [Testing Strategy](../docs/development/testing-strategy.md) - Comprehensive testing approach
