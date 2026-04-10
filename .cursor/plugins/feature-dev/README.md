# Feature Development Plugin

> **Version:** 1.0.0
> **Category:** Development Workflow
> **Author:** Anthropic / Quik Nation AI
> **Source:** https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev

## Overview

A comprehensive, structured 7-phase workflow for building new features systematically. This plugin provides specialized agents and commands that guide you through discovery, codebase exploration, architecture design, implementation, and quality review.

## What's Included

### Commands
- **`feature-dev`** - Complete 7-phase feature development workflow

### Specialized Agents
- **`code-explorer`** - Deep codebase analysis specialist
- **`code-architect`** - Architecture design and blueprint generation
- **`code-reviewer`** - Quality assurance with confidence-based filtering

## The 7-Phase Workflow

```
Phase 1: Discovery 🔍
  ↓ Clarify requirements through dialogue
  ↓ Wait for user answers

Phase 2: Codebase Exploration 🔬
  ↓ Launch parallel code-explorer agents
  ↓ Read identified files
  ↓ Document patterns and conventions

Phase 3: Clarifying Questions ❓
  ↓ Present organized list of underspecified elements
  ↓ Wait for answers before design

Phase 4: Architecture Design 🏗️
  ↓ Present multiple approaches with trade-offs
  ↓ Request explicit user preference
  ↓ Wait for approval

Phase 5: Implementation 🛠️
  ↓ Follow chosen architecture
  ↓ Track progress with TodoWrite
  ↓ Implement incrementally

Phase 6: Quality Review 🔎
  ↓ Launch parallel reviewer agents
  ↓ Report high-confidence issues (≥80%)
  ↓ Provide actionable recommendations

Phase 7: Summary 📝
  ↓ Document accomplishments
  ↓ List technical decisions
  ↓ Summarize file changes
  ↓ Provide next steps
```

## Quick Start

### Basic Usage

```bash
# Start feature development workflow
feature-dev Add user authentication with OAuth

# With specific scope
feature-dev Implement shopping cart with checkout flow

# Complex features
feature-dev Build admin dashboard with analytics and reporting
```

### When to Use

✅ **Use feature-dev for:**
- New features touching multiple files
- Features requiring architectural decisions
- Complex integrations with existing code
- Unclear or evolving requirements
- Learning and maintaining codebase patterns

❌ **Don't use for:**
- Single-line bug fixes
- Trivial changes (typos, formatting)
- Well-defined simple tasks
- Urgent hotfixes
- Pure refactoring without new features

## Agent Descriptions

### code-explorer
**Purpose:** Deep codebase analysis by tracing execution paths

**Capabilities:**
- Feature discovery (entry points, routes, components)
- Code flow tracing (execution chains, data transformations)
- Architecture analysis (layers, patterns, abstractions)
- Implementation details (algorithms, error handling, security)
- Dependency mapping (internal, external, database)

**Deliverable:** Comprehensive analysis report with file paths and line numbers

### code-architect
**Purpose:** Senior software architect creating implementation blueprints

**Capabilities:**
- Pattern analysis (technology stack, architectural decisions)
- Architecture design (decisive choices aligned with patterns)
- Blueprint generation (specifications, component designs, file maps)

**Deliverable:** Complete implementation plan with phased checklists

### code-reviewer
**Purpose:** Quality assurance with confidence-based issue filtering

**Capabilities:**
- Convention adherence validation (CLAUDE.md guidelines)
- Functional bug detection (behavior issues)
- Security vulnerability assessment
- Quality concern evaluation

**Deliverable:** High-confidence issues only (≥80% confidence) with actionable fixes

## Key Principles

### 1. Ask, Don't Assume
Always ask clarifying questions before implementation. Wait for answers.

### 2. Understand Before Acting
Use code-explorer agents to understand existing patterns thoroughly.

### 3. Design Before Building
Present architecture options with trade-offs. Get explicit approval.

### 4. Review for Quality
Use automated reviewers to catch issues early.

### 5. Track Progress
Use TodoWrite throughout implementation to maintain visibility.

### 6. Follow Conventions
Match existing codebase patterns, don't introduce inconsistencies.

## Example Session

```
User: feature-dev Add user profile page with avatar upload

Assistant (Phase 1 - Discovery):
Let me understand the requirements:
- Should the profile page show only the current user or be viewable by others?
- What user information should be editable?
- Do we need avatar upload or also banner images?

User: Current user only, editable name/bio/email, avatar only

Assistant (Phase 2 - Codebase Exploration):
Launching code-explorer agents to analyze:
1. Existing auth patterns
2. File upload implementations
3. User data models
4. Form handling conventions

[Agents return findings]

Key patterns found:
- Using Clerk for auth (useUser hook)
- AWS S3 for file uploads
- React Hook Form + Zod validation

Assistant (Phase 3 - Clarifying Questions):
Before designing, I need to clarify:
1. Avatar file size limits?
2. Allowed formats (JPG, PNG, etc.)?
3. Error handling for failed uploads?
4. Should we crop/resize images?
5. Can users remove avatars (fallback to initials)?

User: 5MB limit, JPG/PNG only, show error toast, auto-crop to square, yes can remove

Assistant (Phase 4 - Architecture Design):
I recommend Approach 1 (matches existing patterns):

Approach 1: Dedicated ProfilePage with AvatarUpload component ⭐
+ Reuses existing uploadHelpers
+ Consistent with other form patterns
+ ShadCN UI components (Avatar, Form, Button)
- Requires new AvatarUpload component

Approach 2: Extend existing Settings page
+ Less code duplication
- Settings page already complex
- Mixes concerns

Proceed with Approach 1?

User: Yes

Assistant (Phase 5 - Implementation):
[TodoWrite: Implementation tasks]
Building ProfilePage component...
✅ Created frontend/src/app/profile/page.tsx
✅ Created frontend/src/components/Profile/AvatarUpload.tsx
✅ Updated backend/src/routes/user.ts
✅ Added avatar field to User model
✅ Implemented S3 upload logic

Assistant (Phase 6 - Quality Review):
Launching review agents...

Issues found:
🔴 Critical (1):
- Missing error boundary around AvatarUpload (could crash page)

🟡 Important (2):
- Avatar upload lacks loading state
- No file type validation on backend

Fix recommendations: [details]

Assistant (Phase 7 - Summary):
✅ Feature Complete: User Profile Page with Avatar Upload

Key Decisions:
- Used Clerk useUser for auth
- AWS S3 for avatar storage
- React Hook Form for profile editing
- Auto-crop images to 512x512

Files Modified:
- frontend/src/app/profile/page.tsx (new)
- frontend/src/components/Profile/AvatarUpload.tsx (new)
- backend/src/routes/user.ts (updated)
- backend/src/models/User.ts (updated)

Next Steps:
- Add E2E tests for upload flow
- Consider image optimization/CDN
- Add audit logging for profile changes
```

## Integration with Boilerplate

This plugin integrates seamlessly with:
- **PRD.md** - Extracts technology stack and conventions
- **CLAUDE.md files** - Reads project-specific guidelines
- **Testing frameworks** - References testing patterns
- **Git workflow** - Commits follow conventional commits
- **Multi-agent orchestration** - Coordinates with other agents

## Configuration

### Project-Specific Customization

Create `.claude/plugins/feature-dev/config.json`:
```json
{
  "skipPhases": [],
  "autoApprove": false,
  "parallelAgents": true,
  "confidenceThreshold": 80,
  "conventions": {
    "conventionalCommits": true,
    "testCoverage": 80
  }
}
```

## Related Commands

- `plan-design` - Business analysis and planning
- `frontend-dev` - Frontend-focused development
- `backend-dev` - Backend-focused development
- `test-automation` - Testing workflow

## Agent Orchestration

This command automatically coordinates three specialized agents:

| Agent | Purpose | When Used | Tools |
|-------|---------|-----------|-------|
| **code-explorer** | Deep codebase analysis | Phase 2 (parallel) | Glob, Grep, Read, WebFetch |
| **code-architect** | Architecture design | Phase 4 | Glob, Grep, Read, WebFetch |
| **code-reviewer** | Quality assurance | Phase 6 (parallel) | Glob, Grep, Read, WebFetch |

## Best Practices

1. **Always complete Phase 1** - Don't skip discovery even for "simple" features
2. **Launch explorers in parallel** - Multiple code-explorer instances for efficiency
3. **Wait for user approval** - Never proceed to implementation without explicit approval
4. **Use TodoWrite religiously** - Track every implementation step
5. **Review before claiming complete** - Run quality review even if confident
6. **Document decisions** - Phase 7 summary is valuable for future reference

## Troubleshooting

### Issue: Too many questions in Phase 3
- Solution: Group related questions, prioritize critical unknowns

### Issue: Exploration takes too long
- Solution: Focus code-explorer on specific feature boundaries

### Issue: Architecture options unclear
- Solution: Provide concrete code examples for each approach

### Issue: Review finds too many issues
- Solution: Adjust confidence threshold in config (default 80)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-13 | Initial integration from Anthropic plugin |

## Credits

**Original Author:** Sid Bidasaria (Anthropic)
**Email:** sbidasaria@anthropic.com
**Integrated By:** Quik Nation AI Team
**Source:** https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev

## Learn More

- [Original Plugin Documentation](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Boilerplate Agent System](../../agents/README.md)
- [Command System Documentation](../../CLAUDE.md)

---

**Ready to use?** Run `feature-dev [your feature description]` to get started!
