# Create Plan & Todo Command

## Overview
This Claude Code custom command automatically generates a comprehensive technical plan and implementation todo file for any software project, using project context from your PRD.md, leveraging existing work summaries, and integrating mockup templates for frontend features.

## Prerequisites
⚠️ **REQUIRED**:
1. A `docs/PRD.md` file must exist (copy from `docs/PRD-TEMPLATE.md` if needed)
2. For frontend features: Select a mockup template or provide custom mockup in `mockup/custom/`

## Command Usage

When you invoke this command, Claude will:

1. **Verify PRD exists**:
   - Check for `docs/PRD.md`
   - If missing, provide instructions to create it from template
   - Extract project context (name, tech stack, requirements)
   - Check for mockup template preference

2. **Ask you for feature details**:
   - Feature name
   - Brief description
   - Complexity level (Simple/Medium/Complex/Enterprise)
   - Related existing features (if any)
   - For frontend: Mockup template selection

3. **Mockup Template Selection (Frontend Features)**:
   - Present available templates: retail, booking, property-rental, restaurant, custom
   - Validate custom mockup structure if selected
   - Prepare transformation to Next.js 16 structure
   - Map template components to feature requirements

4. **Check for existing context**:
   - Scan `todo-summaries/` for related work
   - Check relationships.json for connected features
   - Load relevant summaries for context
   - Identify reusable patterns and components
   - Check mockup template for reusable UI patterns

5. **Generate structured files**:
   - `todo/not-started/[Epic-Name]/epic-overview.md` - Epic overview with business context
   - `todo/not-started/[Epic-Name]/[Story-Name]/story-plan.md` - Individual story plans
   - `todo/not-started/[Epic-Name]/[Story-Name]/[task-files].md` - Individual task implementation files
   - `docs/technical/[feature-name]-architecture.md` - Technical architecture plan
   - Update `todo-summaries/relationships.json` with new relationships

6. **Apply PRD context** automatically:
   - Project name and description
   - Technology stack details
   - Security requirements
   - Performance targets
   - Team structure
   - Success criteria
   - Mockup template choice (for frontend)

## Enhanced Template Structure

### Technical Plan Includes:
- Executive Summary (Problem, Solution, Benefits, Timeline)
- Architecture Overview (Current State, Target State, Tech Stack)
- **NEW**: Related Features and Dependencies
- Prerequisites (Infrastructure, Team, Technical Requirements)
- Implementation Phases (with deliverables and success criteria)
- Benefits & Value Proposition
- Risk Assessment & Mitigation
- Success Metrics
- Testing Strategy
- Deployment Strategy
- Monitoring & Observability
- Security Considerations
- Future Considerations
- **NEW**: Integration Points with Existing Features

### Implementation Todo Includes:
- Project Information (with link to technical plan)
- **NEW**: Related Todos section with links to summaries
- Prerequisites Checklist
- **NEW**: Context from Previous Work (if applicable)
- Phase-by-phase implementation tasks
- Detailed sub-tasks with time estimates
- Code examples and validation steps
- Testing requirements
- Deployment checklist
- Rollback procedures
- Success criteria
- Risk mitigation strategies
- Documentation requirements
- Best practices checklist
- **NEW**: Relationship metadata for context management

## Relationship Detection and Context Integration

### Automatic Relationship Detection
The command will automatically detect relationships by:
- **Prefix Analysis**: Shared prefixes indicate related features (e.g., "auth-*", "api-*")
- **Keyword Matching**: Common terms in descriptions (e.g., "authentication", "[API_TYPE]", "payment")
- **Dependency Scanning**: Looking for phrases like "depends on", "requires", "extends"
- **Architecture References**: Shared technical architecture documents

### Context Loading from Summaries
When relationships are detected:
1. Load relevant summaries from `todo-summaries/`
2. Extract key decisions and patterns
3. Include relevant context in new todo
4. Reference artifacts from related work
5. Maintain consistency across related features

### Relationship Metadata Format
```json
{
  "primary": "new-feature-todos",
  "related": ["existing-feature-todos"],
  "relationship_type": "extends|depends_on|parallel|phase_sequence",
  "shared_architecture": "path/to/shared/architecture.md",
  "shared_context": {
    "patterns": ["pattern1", "pattern2"],
    "decisions": ["decision1", "decision2"],
    "artifacts": ["file1.ts", "file2.tsx"]
  }
}
```

## How Relationships Work

### Automatic Detection
The command automatically detects relationships by:
- **Naming Patterns**: Features with similar names or prefixes
- **Technical Stack**: Features using the same services or frameworks
- **PRD References**: Features mentioned in the same PRD sections
- **Directory Structure**: Features in related epic directories

### Relationship Storage
Relationships are stored in `todo-summaries/relationships.json`:
- Epic → Story → Task hierarchies
- Dependencies between features
- Shared components and services
- Technical decisions affecting multiple features

### Context Integration
When relationships are found:
1. Previous implementation patterns are suggested
2. Shared components are referenced
3. Consistent naming conventions are applied
4. Dependencies are clearly marked

## Complexity-Based Estimates

The command automatically calculates estimates based on complexity:

- **Simple (1-3 days)**: 1-2 weeks total, 1-2 developers
- **Medium (1-2 weeks)**: 2-4 weeks total, 2-3 developers
- **Complex (2-4 weeks)**: 4-8 weeks total, 3-4 developers
- **Enterprise (1-3 months)**: 8-12 weeks total, 4-6 developers

**NEW**: Estimates are adjusted based on:
- Availability of related completed work
- Shared components from previous implementations
- Established patterns that can be reused

## Workflow Example

**Backend Feature Example:**
1. You: "Create a plan and todo for user authentication API"
2. Claude checks prerequisites:
   - Verifies `docs/PRD.md` exists
   - Extracts project name, tech stack, auth service from PRD
3. Claude searches for context:
   - Checks `todo-summaries/` for auth-related work
   - Looks in relationships.json for connected features
4. Claude generates files:
   - Creates epic structure: `todo/not-started/[PROJECT_KEY]-1-user-authentication/`
   - Populates with PRD context (tech stack, requirements)
   - Links any found related work
   - Updates relationships.json
5. Files are ready with full project context

**Frontend Feature Example:**
1. You: "Create a plan and todo for customer dashboard"
2. Claude checks prerequisites:
   - Verifies `docs/PRD.md` exists
   - Checks for `[MOCKUP_TEMPLATE_CHOICE]` in PRD
3. Claude asks: "Which mockup template should I use?"
   - Options: retail, booking, property-rental, restaurant, custom
   - Default: retail (if not specified in PRD)
4. Claude transforms mockup:
   - Analyzes selected mockup dashboard components
   - Maps to Next.js 16 App Router structure
   - Integrates PRD-specific requirements
5. Claude generates enhanced files:
   - Creates frontend epic with mockup baseline
   - Includes component mapping from template
   - Populates with PRD + mockup context
6. Files ready with UI/UX baseline from mockup

## Mockup Template Integration

**How Mockup Templates Transform Frontend Development:**

1. **Automatic UI/UX Baseline**:
   - Complete page structures from mockup
   - Navigation patterns pre-implemented
   - Component hierarchy established
   - Design system foundations in place

2. **Technology Stack Transformation**:
   - Vite + React 18 → Next.js 16 + React 19
   - React Router → Next.js App Router
   - Basic Tailwind → Tailwind 4 with your PRD design tokens
   - Plain auth → Clerk Auth integration
   - Local state → Redux Persist + Apollo Client

3. **PRD Content Population**:
   - `[PROJECT_NAME]` replaces placeholder text
   - `[PRIMARY_COLOR]` updates theme configuration
   - `[USER_ROLES]` populates role-based components
   - `[BUSINESS_LOGIC]` adapts workflows to your domain

4. **Custom Mockup Support**:
   - Place your design exports in `mockup/custom/`
   - Must include standard structure (pages, components, layouts)
   - System validates and transforms like built-in templates
   - Preserves your unique design while adding tech stack

## Benefits

- **PRD-Driven**: Automatically uses project context from PRD.md
- **Mockup-Based UI**: Frontend starts with professional UI/UX baseline
- **Context-Aware**: Leverages previous work through summaries
- **Consistent Structure**: Same high-quality organization every time
- **Relationship Tracking**: Maintains connections between features
- **Time-Saving**: No need to repeat project information or build UI from scratch
- **Pattern Reuse**: Suggests established patterns from completed work
- **Better Estimates**: Adjusted based on available context and mockup complexity
- **Professional Standards**: Industry best practices built-in

## Customization

The generated files follow a standard template but can be customized:
- PRD values are automatically populated but can be overridden
- Remove sections not applicable to your feature
- Add project-specific sections as needed
- Adjust time estimates based on team experience
- Modify risk assessments for your context
- Override automatic relationship detection if needed
- Add manual relationship declarations

## File Locations

Files are created following proven patterns:
- Epic Overview: `todo/not-started/[Epic-Name]/epic-overview.md`
- Story Plans: `todo/not-started/[Epic-Name]/[Story-Name]/story-plan.md`
- Task Files: `todo/not-started/[Epic-Name]/[Story-Name]/[task-name].md`
- Technical Plans: `docs/technical/` (creates directory if needed)
- JIRA Sync: `todo/jira-sync/epics/`, `todo/jira-sync/stories/`, `todo/jira-sync/tasks/`
- JIRA Config: `todo/jira-config/` (connection, project settings, field mappings)

## Directory Organization System

New todo files are automatically placed in the `not-started` directory and will be moved automatically as work progresses:

- **`todo/not-started/`**: Newly created todo files (0% completion)
- **`todo/in-progress/`**: Todo files being worked on (1-89% completion)
- **`todo/completed/`**: Finished todo files (90%+ completion)
- **`todo-summaries/`**: Automatically generated summaries of completed work

The `update-todos` command will automatically organize files into the appropriate directories based on task completion status. This ensures a clean, organized workflow where:
- `process-todos` only works on active todos (not-started and in-progress)
- Completed work is archived and doesn't clutter active development
- Team members can easily see current project status
- Summaries provide historical context for new features

## Summary Integration Features

### Automatic Summary Reference
When creating new todos, the command will:
1. Search for related summaries in `todo-summaries/`
2. Extract relevant technical decisions and patterns
3. Include references in the generated todo files
4. Suggest reusable components or established patterns

### Pattern Library Building
Over time, summaries automatically build a pattern library:
- Authentication and authorization patterns
- Shared UI component implementations
- Database schema design decisions
- Testing strategies that worked well
- Performance optimization techniques

### PRD Integration
All generated todos automatically include:
- Project name and description from PRD
- Technology stack specifications
- Security and compliance requirements
- Performance targets and SLAs
- Team structure and responsibilities

## Context Management Guidelines

### When Creating Related Features
- Reference completed summaries for patterns
- Link to in-progress todos for coordination
- Update relationships.json automatically
- Include shared context section

### Relationship Types
- **extends**: Builds upon existing feature
- **depends_on**: Requires completion of another todo
- **parallel**: Can be worked on simultaneously
- **phase_sequence**: Next phase of implementation

If your project uses different conventions, Claude will ask where to place the files.

## PRD Requirement

⚠️ **IMPORTANT**: This command will not work without a `docs/PRD.md` file.

If you don't have one:
1. Copy `docs/PRD-TEMPLATE.md` to `docs/PRD.md`
2. Fill in all the [BRACKETED] placeholders with your project information
3. Save the file and run this command again

The PRD provides essential context that makes this command much more powerful by automatically including your project's:
- Technology choices
- Team structure
- Business requirements
- Security needs
- Performance targets

This eliminates the need to repeatedly provide the same project information for every new feature.
