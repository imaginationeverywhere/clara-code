# Feature Development Command

> **Command:** `feature-dev`
> **Version:** 1.0.0
> **Category:** Development Workflow
> **Plugin:** feature-dev
> **Author:** Anthropic / Quik Nation AI

## Purpose

A comprehensive, structured 7-phase workflow for building new features systematically. This command guides you through discovery, codebase exploration, architecture design, implementation, and quality review with specialized agents.

## Usage

```bash
# Start feature development workflow
feature-dev Add user authentication with OAuth

# With specific scope
feature-dev Implement shopping cart with checkout flow

# Complex features
feature-dev Build admin dashboard with analytics and reporting
```

## The 7-Phase Workflow

### Phase 1: Discovery 🔍
**Goal:** Understand what needs to be built

- Clarify feature requirements through dialogue
- Identify constraints and dependencies
- Define success criteria
- **Wait for user answers** before proceeding

**Example Questions:**
- What is the primary user goal for this feature?
- Are there existing features this should integrate with?
- What are the must-have vs nice-to-have elements?

---

### Phase 2: Codebase Exploration 🔬
**Goal:** Understand existing patterns and architecture

**Actions:**
1. Launch **parallel code-explorer agents** targeting:
   - Similar existing features
   - Related architectural layers
   - Relevant abstractions and patterns
   - Key dependencies

2. **Read identified files** for comprehensive understanding
3. Document patterns, conventions, and design decisions

**Agents Used:** `code-explorer` (parallel instances)

---

### Phase 3: Clarifying Questions ❓
**Goal:** Fill knowledge gaps before design

**Present organized list of underspecified elements:**
- Edge cases and error scenarios
- Error handling strategies
- Scope boundaries and exclusions
- Performance requirements
- Security considerations
- Testing expectations

**Critical:** **Wait for answers** before proceeding to design phase

---

### Phase 4: Architecture Design 🏗️
**Goal:** Design implementation approach

**Actions:**
1. Present **multiple implementation approaches** with:
   - Trade-offs analysis
   - Pros and cons
   - Recommended approach with rationale

2. **Request explicit user preference**
3. Only proceed after approval

**Agents Used:** `code-architect`

**Example Output:**
```
Approach 1: Component-based with hooks ⭐ (Recommended)
+ Matches existing patterns
+ Better testability
- More initial setup

Approach 2: Context-based state management
+ Simpler initial implementation
- Diverges from project conventions
```

---

### Phase 5: Implementation 🛠️
**Goal:** Build the feature

**Only after explicit approval:**
1. Follow chosen architecture
2. Adhere to codebase conventions
3. Use TodoWrite to track progress
4. Implement incrementally with validation

**Key Principles:**
- Write readable, maintainable code
- Follow established patterns
- Add appropriate error handling
- Include inline documentation

---

### Phase 6: Quality Review 🔎
**Goal:** Ensure code quality and correctness

**Launch parallel reviewer agents** checking for:
1. **Simplicity** - Is code unnecessarily complex?
2. **Correctness** - Are there bugs or logic errors?
3. **Conventions** - Does it follow project standards?

**Agents Used:** `code-reviewer` (parallel instances)

**Consolidate findings** and present:
- High-confidence issues (≥80% confidence)
- Actionable recommendations
- Severity grouping (Critical vs Important)

---

### Phase 7: Summary 📝
**Goal:** Document accomplishments

**Deliverables:**
- Feature accomplishments
- Key technical decisions made
- Files modified with change summary
- Next steps and considerations
- Testing recommendations

---

## When to Use

### ✅ Use feature-dev for:
- New features touching multiple files
- Features requiring architectural decisions
- Complex integrations with existing code
- Unclear or evolving requirements
- Learning and maintaining codebase patterns

### ❌ Don't use for:
- Single-line bug fixes
- Trivial changes (typos, formatting)
- Well-defined simple tasks
- Urgent hotfixes
- Pure refactoring without new features

---

## Agent Orchestration

This command automatically coordinates three specialized agents:

| Agent | Purpose | When Used |
|-------|---------|-----------|
| **code-explorer** | Deep codebase analysis | Phase 2 (parallel) |
| **code-architect** | Architecture design | Phase 4 |
| **code-reviewer** | Quality assurance | Phase 6 (parallel) |

---

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

Reading identified files...
- frontend/src/components/Auth/UserContext.tsx
- backend/src/models/User.ts
- frontend/src/lib/uploadHelpers.ts

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
I recommend **Approach 1** (matches existing patterns):

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

---

## Key Principles

### 1. **Ask, Don't Assume**
Always ask clarifying questions before implementation. Wait for answers.

### 2. **Understand Before Acting**
Use code-explorer agents to understand existing patterns thoroughly.

### 3. **Design Before Building**
Present architecture options with trade-offs. Get explicit approval.

### 4. **Review for Quality**
Use automated reviewers to catch issues early.

### 5. **Track Progress**
Use TodoWrite throughout implementation to maintain visibility.

### 6. **Follow Conventions**
Match existing codebase patterns, don't introduce inconsistencies.

---

## Integration with Boilerplate

This command integrates seamlessly with:
- **PRD.md** - Extracts technology stack and conventions
- **CLAUDE.md files** - Reads project-specific guidelines
- **Testing frameworks** - References testing patterns
- **Git workflow** - Commits follow conventional commits

---

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

---

## Related Commands

- `plan-design` - Business analysis and planning
- `frontend-dev` - Frontend-focused development
- `backend-dev` - Backend-focused development
- `test-automation` - Testing workflow

---

## Related Agents

- `code-explorer` - Codebase exploration specialist
- `code-architect` - Architecture design specialist
- `code-reviewer` - Quality review specialist

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-13 | Initial integration from Anthropic plugin |

---

## Credits

**Original Authors:** Sid Bidasaria (Anthropic)
**Integrated By:** Quik Nation AI Team
**Source:** https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev
