# generate-session-report - Comprehensive Session Documentation Generator

## Role
You are a technical documentation specialist analyzing the current development session to create comprehensive reports and identify documentation gaps.

## Task
Generate a detailed session report documenting all work completed, decisions made, blockers resolved, and identify what documentation needs to be updated across the project.

## Multi-Agent Orchestration

### Phase 1: Session Analysis (Explore Agent)
Use the **Explore agent** to analyze the current session:

```
Task for Explore agent:
- Analyze all files modified in this session (git diff)
- Identify features added, bugs fixed, and changes made
- Extract key decisions and architectural changes
- Note any new patterns or best practices discovered
- List all third-party integrations configured
- Identify testing performed and results
```

### Phase 2: Code Review (Code Quality Reviewer Agent)
Use the **code-quality-reviewer agent** to assess session work:

```
Task for Code Quality Reviewer:
- Review all modified files for production readiness
- Identify any technical debt introduced
- Note optimization opportunities
- Verify error handling and edge cases
- Check for security considerations
- Assess test coverage of new features
```

### Phase 3: Documentation Gap Analysis (Business Analyst Bridge)
Use the **business-analyst-bridge agent** to identify documentation needs:

```
Task for Business Analyst Bridge:
- Identify which CLAUDE.md files need updates
- Determine if README.md needs changes
- Check if new integration guides are needed
- Assess if PRD needs updates
- Identify if new user-facing docs are required
- Note any API documentation needs
```

### Phase 4: Report Generation

After gathering insights from all agents, generate a comprehensive session report.

## Report Structure

### 1. Executive Summary
```markdown
# Development Session Report
**Date:** [Current Date]
**Duration:** [Session Duration]
**Project:** [Project Name from PRD or directory]
**Developer:** [From git config or session]

## Summary
[2-3 sentence overview of what was accomplished]

## Key Metrics
- Files Modified: X
- Features Added: X
- Bugs Fixed: X
- Tests Added: X
- Documentation Updated: X
```

### 2. Accomplishments

#### A. Features Implemented
```markdown
## Features Implemented

### 1. [Feature Name]
**Status:** ✅ Complete / 🚧 In Progress / ⏸️ Blocked

**Description:**
[What was built and why]

**Files Modified:**
- `path/to/file1.ts` - [What changed]
- `path/to/file2.tsx` - [What changed]

**Technical Decisions:**
- [Decision 1 and rationale]
- [Decision 2 and rationale]

**Testing:**
- [Tests added/run]
- [Manual testing performed]

**Screenshots/Evidence:**
[If applicable]
```

#### B. Bugs Fixed
```markdown
## Bugs Fixed

### 1. [Bug Description]
**Severity:** Critical / High / Medium / Low

**Root Cause:**
[What caused the bug]

**Solution:**
[How it was fixed]

**Files Modified:**
- `path/to/file.ts:lineNumber` - [Change made]

**Verification:**
[How fix was verified]
```

#### C. Blockers Resolved
```markdown
## Blockers Resolved

### 1. [Blocker Description]
**Impact:** [What it was preventing]

**Resolution:**
[How it was resolved]

**Prevention:**
[How to avoid in future]
```

### 3. Technical Documentation Updates Needed

```markdown
## Documentation Updates Required

### Immediate (This Commit)
- [ ] Update `CLAUDE.md` - [Specific changes needed]
- [ ] Update `README.md` - [Specific sections]
- [ ] Create `docs/[topic]/GUIDE.md` - [New guide needed]

### Follow-Up (Separate Tasks)
- [ ] Update API documentation for [feature]
- [ ] Add integration guide for [service]
- [ ] Update deployment guide with [new steps]

### Boilerplate/Reusable Documentation
- [ ] Add pattern to boilerplate: [description]
- [ ] Create reusable example: [description]
- [ ] Update best practices: [description]
```

### 4. Code Quality Assessment

```markdown
## Code Quality Report

### Production Readiness
- **Overall Score:** [1-10]
- **Security:** ✅/⚠️/❌
- **Performance:** ✅/⚠️/❌
- **Error Handling:** ✅/⚠️/❌
- **Test Coverage:** XX%

### Technical Debt Introduced
- [Item 1] - Severity: Low/Medium/High
- [Item 2] - Severity: Low/Medium/High

### Optimization Opportunities
- [Opportunity 1]
- [Opportunity 2]

### Security Considerations
- [Consideration 1]
- [Consideration 2]
```

### 5. Integration & Configuration

```markdown
## Integrations Configured

### [Integration Name] (e.g., DocuSign, Stripe, etc.)
**Status:** ✅ Production Ready / 🚧 Development / ⏸️ Pending

**Configuration:**
- Environment variables added: X
- API keys configured: ✅/❌
- Webhooks set up: ✅/❌
- Testing completed: ✅/❌

**Documentation:**
- Integration guide created: `docs/[integration]/GUIDE.md`
- Code examples: `path/to/examples`
- Credentials stored in: [Location]

**Next Steps:**
- [ ] Production approval pending
- [ ] Additional testing needed
- [ ] Documentation review
```

### 6. Testing Summary

```markdown
## Testing Performed

### Manual Testing
- [x] Feature X tested successfully
- [x] Edge case Y verified
- [ ] Performance testing (pending)

### Automated Testing
- Unit tests added: X
- Integration tests: X
- E2E tests: X
- Coverage increase: XX%

### Issues Found During Testing
1. [Issue] - Status: Fixed/Open/Deferred
2. [Issue] - Status: Fixed/Open/Deferred
```

### 7. Lessons Learned

```markdown
## Lessons Learned

### What Worked Well
- [Success 1]
- [Success 2]

### Challenges Encountered
- [Challenge 1] → [How overcome]
- [Challenge 2] → [How overcome]

### Best Practices Discovered
- [Practice 1]
- [Practice 2]

### Patterns to Reuse
- [Pattern 1] - Applicable to: [scenarios]
- [Pattern 2] - Applicable to: [scenarios]

### Anti-Patterns to Avoid
- [Anti-pattern 1] - Why: [reason]
- [Anti-pattern 2] - Why: [reason]
```

### 8. Deployment Checklist

```markdown
## Deployment Readiness

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations ready (if applicable)
- [ ] Third-party services tested

### Deployment Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Post-Deployment Verification
- [ ] Smoke tests in production
- [ ] Monitor error logs
- [ ] Verify integrations working
- [ ] Check performance metrics

### Rollback Plan
[If needed, how to revert changes]
```

### 9. Next Steps

```markdown
## Recommended Next Steps

### Immediate (This Sprint)
1. [Task 1] - Priority: High/Medium/Low
2. [Task 2] - Priority: High/Medium/Low

### Short-Term (Next Sprint)
1. [Task 1]
2. [Task 2]

### Long-Term (Future Consideration)
1. [Task 1]
2. [Task 2]

### Technical Debt to Address
1. [Debt item 1] - Estimated effort: [hours/days]
2. [Debt item 2] - Estimated effort: [hours/days]
```

### 10. Knowledge Transfer

```markdown
## Knowledge Transfer

### New Patterns Introduced
**[Pattern Name]**
- Location: `path/to/code`
- Purpose: [Why this pattern]
- When to use: [Scenarios]
- Example: [Code snippet or reference]

### Configuration Changes
- [Config 1]: [What changed and why]
- [Config 2]: [What changed and why]

### Dependencies Added/Updated
- [Package name]: [Version] - [Why added]
- [Package name]: [Old → New] - [Why updated]
```

## Output Locations

### Session Report
Save the main report to the **session-reports/** subdirectory:
```
docs/reports/session-reports/[YYYY-MM-DD]-[topic-summary].md
```

Example: `docs/reports/session-reports/2025-10-25-docusign-approval-system.md`

**Also Update:**
- `docs/reports/session-reports/README.md` - Add session to index
- `docs/reports/session-reports/CHANGELOG.md` - Add entry under [Unreleased]
- `docs/reports/README.md` - Update "Latest Session" if parent level references it

### Documentation Updates
Create/update as identified based on subject:
```
CLAUDE.md (if architectural changes)
docs/[topic]/[GUIDE-NAME].md (new guides)
README.md (if major features added)
CHANGELOG.md (all changes)

# Subdirectory-specific updates
docs/reports/[subject-area]/README.md (if new report added)
docs/reports/[subject-area]/CHANGELOG.md (track report changes)
docs/reports/README.md (parent index if new subdirectory created)
```

### Boilerplate Contributions
If reusable patterns discovered:
```
/Users/amenra/Projects/AI/quik-nation-ai-boilerplate/docs/[topic]/
/Users/amenra/Projects/AI/quik-nation-ai-boilerplate/.claude/commands/ (if new command pattern)
```

## Agent Coordination Strategy

```typescript
// Pseudo-code for agent orchestration

1. Launch Explore agent (thorough mode):
   - Find all git changes since session start
   - Analyze modified files
   - Extract key changes and patterns

2. Wait for Explore results

3. Launch Code Quality Reviewer agent:
   - Review files identified by Explore agent
   - Assess production readiness
   - Identify technical debt

4. Wait for Code Quality results

5. Launch Business Analyst Bridge agent:
   - Analyze business impact of changes
   - Identify documentation gaps
   - Recommend knowledge transfer needs

6. Wait for Business Analyst results

7. Synthesize all agent reports into cohesive session report

8. Generate documentation update checklist

9. Create session report file

10. Present summary to user with next steps
```

## Success Criteria

A successful session report includes:
- ✅ Complete list of all files modified
- ✅ Clear explanation of what was built/fixed
- ✅ All blockers and their resolutions documented
- ✅ Specific documentation update checklist
- ✅ Code quality assessment
- ✅ Testing summary
- ✅ Deployment readiness checklist
- ✅ Knowledge transfer sections
- ✅ Next steps with priorities
- ✅ Lessons learned for future reference

## Example Usage

```bash
# At end of development session
/generate-session-report

# This will:
# 1. Analyze all session work using multiple agents
# 2. Generate comprehensive report
# 3. Create documentation update checklist
# 4. Identify patterns for boilerplate
# 5. Save report to docs/reports/
# 6. Present summary with next steps
```

## Integration with Other Commands

```bash
# Typical workflow:
1. Development session (coding, testing, debugging)
2. /generate-session-report (analyze and document)
3. Review generated report and checklists
4. Update documentation as recommended
5. /git-commit-docs-command (commit everything)
```

## Report Organization Pattern

### Hierarchical Subdirectory Structure

Reports are organized by subject area for scalability:

```
docs/reports/                          ← Parent level
├── CLAUDE.md                          ← Explains subdirectory pattern
├── README.md                          ← Index of all subdirectories
├── CHANGELOG.md                       ← Tracks subdirectory additions
├── session-reports/                   ← Subject area
│   ├── CLAUDE.md                      ← About session reports
│   ├── README.md                      ← Index of sessions
│   ├── CHANGELOG.md                   ← Session changes
│   └── 2025-10-25-docusign-system.md  ← Actual report
├── docusign-integration/              ← Another subject
│   ├── CLAUDE.md
│   ├── README.md
│   ├── CHANGELOG.md
│   └── [docusign reports]
└── event-approval-system/             ← Another subject
    ├── CLAUDE.md
    ├── README.md
    ├── CHANGELOG.md
    └── [approval reports]
```

### Why This Pattern

**Scalability:** Handles hundreds of reports organized by subject
**Discoverability:** Each subdirectory self-documenting with CLAUDE.md
**Maintainability:** Changes to one subject don't affect others

### When to Create New Subdirectory

Create new subdirectory when:
- 5+ reports on same subject
- Distinct topic area (integration, feature, infrastructure)
- Long-term tracking needed

**Steps to Create:**
1. `mkdir docs/reports/[subject-area]`
2. Create `CLAUDE.md` (explains what reports cover)
3. Create `README.md` (index of reports)
4. Create `CHANGELOG.md` (tracks changes)
5. Update parent `README.md` with new subdirectory
6. Update parent `CHANGELOG.md` noting addition

### Session Report Naming

```
[YYYY-MM-DD]-[topic-summary].md
```

Examples:
- `2025-10-25-docusign-approval-system.md`
- `2025-11-01-payment-processing-refactor.md`
- `2025-11-15-mobile-responsive-fixes.md`

## Output Example

```markdown
# Development Session Report
**Date:** October 25, 2025 14:30
**Duration:** 4 hours 15 minutes
**Project:** Site962 Event Management Platform

## Executive Summary
Completed DocuSign production approval setup, Docker development environment configuration, and comprehensive event creation flow fixes. Resolved 7 critical blockers preventing event submissions and implemented admin approval system with flexible Stripe Connect requirements.

## Key Metrics
- Files Modified: 13
- Features Added: 3 (DocuSign integration, Admin stipulations, Event creation fixes)
- Bugs Fixed: 5
- Integration Guides Created: 1 (DocuSign)
- Documentation Added: 3 guides (22KB)

## Accomplishments
[Detailed breakdown as per template above]

## Next Steps
1. Deploy changes to production
2. Test complete event creation → approval flow
3. Verify DocuSign production approval (wait 1-3 days)
...
```

---

**This command creates institutional knowledge** from every development session, making it easy to:
- Onboard new developers
- Track project evolution
- Maintain consistent documentation
- Build reusable pattern library
- Ensure nothing is forgotten

Would you like me to create this as a slash command file?