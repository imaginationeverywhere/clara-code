# Update Jira Todos - Bidirectional Project Synchronization Hub

Maintain seamless synchronization between your local [PROJECT_NAME] development workflow and your [PROJECT_KEY] Jira project board, handling progress tracking, file organization, conflict resolution, and team coordination automatically.

## Prerequisites

⚠️ **REQUIRED**: 
1. A `docs/PRD.md` file must exist to provide project context and standards
2. JIRA configuration must be completed using `sync-jira --connect`
3. Personal configuration should be set up for assignment filtering

## Overview

This enhanced command serves as the coordination center for your integrated development and project management workflow. It combines PRD requirements with JIRA synchronization to maintain harmony between your local file-based development process and your team's project management process.

The command ensures that:
- All synchronization maintains PRD compliance
- Technology choices from PRD are consistently applied
- Security and performance requirements are validated
- Team coordination follows PRD structure
- Summary generation includes PRD context

The power of this integration lies in its ability to handle complex coordination tasks while ensuring everything aligns with your project's PRD standards.

## Command Usage

**Complete Synchronization:**
```bash
update-jira-todos
# Performs comprehensive bidirectional sync
# Organizes files based on completion status
# Exports session summaries with Jira context
# Resolves conflicts automatically using configured strategies
# Updates relationships and dependencies across epics and stories
```

**Jira-to-Local Synchronization:**
```bash
update-jira-todos --sync-from-jira
# Pulls latest changes from [PROJECT_KEY] project board
# Updates local files with new priorities, assignments, due dates
# Creates new todos for recently added Jira tasks
# Resolves conflicts where both local and Jira changes exist
```

**Local-to-Jira Synchronization:**
```bash
update-jira-todos --sync-to-jira
# Pushes all local progress to Jira board
# Updates task statuses, progress percentages, time estimates
# Posts technical progress summaries to stories
# Coordinates dependency changes across related items
```

**Organizational Operations:**
```bash
update-jira-todos --organize-only        # File organization without sync
update-jira-todos --export-summaries     # Generate comprehensive summaries
update-jira-todos --resolve-conflicts    # Handle sync conflicts interactively
update-jira-todos --update-relationships # Refresh epic/story relationships
```

**Session Management:**
```bash
update-jira-todos --session-summary      # Create detailed session progress report
update-jira-todos --next-session-prep    # Prepare workspace for next development session
update-jira-todos --context-cleanup      # Optimize context for efficient future sessions
```

## Sophisticated Bidirectional Synchronization

The enhanced synchronization process represents one of the most complex and valuable aspects of the integrated system. Understanding how this works helps you appreciate the sophistication of coordination happening automatically in the background.

**Change Detection and Analysis:** The system continuously monitors both your local files and your QAC Jira project for changes, using sophisticated analysis to determine what has changed since the last synchronization. This includes not just obvious changes like task completion, but subtle changes like priority adjustments, deadline modifications, or new dependencies that affect your development work.

**Conflict Resolution Intelligence:** When both local and Jira changes affect the same items, the system applies intelligent conflict resolution strategies that preserve the strengths of both systems. For example, local changes to technical implementation details take precedence, while Jira changes to business priorities and deadlines are respected. This approach ensures that neither technical work nor business coordination is compromised by synchronization conflicts.

**Dependency Cascade Management:** Changes in one story or epic often affect related work throughout your project. The system automatically identifies these dependency relationships and coordinates updates across all affected items, ensuring that changes propagate appropriately throughout your project structure without requiring manual coordination effort.

**Context Preservation:** During synchronization, the system carefully preserves important context from both systems. Technical implementation context from your local files is maintained while business context from Jira is integrated, creating a unified view that serves both development and project management needs.

## Enhanced File Organization with Jira Integration

The command's file organization capabilities extend far beyond simple directory management to create a sophisticated project organization system that mirrors your team's project management structure:

**Epic-Story-Task Hierarchy Maintenance:** As work progresses and Jira items change status, the system automatically maintains the proper epic/story/task hierarchy in your local directory structure. **CRITICAL: When moving tasks between status directories (not-started/in-progress/completed), the entire epic directory structure must be preserved.** For example: `todo/not-started/QAC-1-home-page/QAC-2-*.md` must move to `todo/completed/QAC-1-home-page/QAC-2-*.md` maintaining the epic container directory. This ensures that your file organization always reflects current project organization without breaking epic/story relationships.

**Status-Based Organization:** The familiar not-started/in-progress/completed directory structure now operates at multiple levels simultaneously. Individual tasks move between status directories while maintaining their position within the epic/story hierarchy, creating both workflow organization and logical project organization.

**Relationship-Aware Organization:** The system understands relationships between different epics and stories, organizing files in ways that make dependencies and coordination needs visible through directory structure. Related work items are positioned to make coordination opportunities obvious during development.

**Summary Integration:** As files move between status directories, corresponding summaries are automatically created, moved, and updated in the todo-summaries structure. This creates a comprehensive historical record of project development that serves both technical and project management documentation needs.

## Advanced Summary Export System

The enhanced summary export capabilities create comprehensive documentation that serves multiple organizational needs simultaneously:

**Multi-Perspective Summaries:** Each summary includes both technical development perspective (what was implemented, challenges encountered, solutions discovered) and project management perspective (business value delivered, timeline impact, stakeholder communication needs). This dual perspective ensures summaries serve both developer knowledge preservation and stakeholder communication needs.

**Relationship Context Integration:** Summaries automatically include context about related work happening in parallel, dependencies that affect timeline planning, and coordination needs that influence future development work. This relationship context makes summaries valuable for project planning and coordination beyond just historical documentation.

**Trend Analysis:** The system analyzes patterns across summaries to identify trends in development velocity, common challenge patterns, and successful solution approaches. This analysis helps improve future project planning and identifies opportunities for development process optimization.

**Stakeholder Communication Ready:** Summaries are automatically formatted to be appropriate for stakeholder communication, with technical details organized to support business discussions without overwhelming non-technical team members with implementation complexity.

## Context Management Strategy Enhancement

The enhanced system combines PRD requirements with project-level context coordination:

**PRD-Driven Epic Context:** When working across multiple stories within an epic, the system maintains PRD-compliant architectural decisions and ensures consistency with project standards. This prevents sub-optimization where individual stories might make technical choices that conflict with PRD specifications.

**Cross-Epic Dependency Management:** The system identifies and manages dependencies between different epics while ensuring all architectural decisions align with PRD technology choices and performance requirements.

**Business Context Integration:** Current business priorities from JIRA automatically integrate with PRD business objectives, ensuring that technical work remains aligned with both immediate project needs and long-term PRD goals.

**PRD-Compliant Historical Context:** Important technical decisions and implementation patterns from completed work are preserved and validated against PRD standards, creating institutional knowledge that improves development efficiency while maintaining project consistency.

**Summary Generation with PRD Context:** All summaries automatically include:
- How implementation aligns with PRD technology stack
- Validation against PRD security and performance requirements
- Consistency with PRD architectural patterns
- Compliance with PRD team structure and processes

## Intelligent Conflict Resolution

The conflict resolution system represents a sophisticated approach to maintaining synchronization between two different paradigms of work management:

**Priority-Based Resolution:** Different types of changes receive different priority during conflict resolution. Business priority changes from project management take precedence over technical priority assessments, while technical implementation details from local development take precedence over business estimates of technical complexity.

**Context-Aware Decisions:** Conflict resolution considers broader project context when making decisions. A change that might seem minor in isolation could have broader implications for epic delivery or stakeholder commitments that influence how conflicts should be resolved.

**Human-in-the-Loop Options:** For conflicts that involve significant decisions or unclear trade-offs, the system can engage you in the resolution process with structured questions that help make informed decisions quickly without requiring deep analysis of conflicting information.

**Learning Integration:** The system learns from previous conflict resolution decisions to improve automatic conflict handling over time, reducing the frequency of situations that require manual intervention while improving the quality of automatic resolution decisions.

## Session Continuity and Transition Management

The enhanced command provides sophisticated support for maintaining productivity across development sessions and team coordination:

**Session State Preservation:** At the end of each development session, the system creates comprehensive state snapshots that include not just what work was completed, but what context was active, what decisions were being considered, and what coordination needs were identified. This enables seamless session transitions without productivity loss.

**Team Coordination Preparation:** Before ending a session, the system identifies coordination needs with other team members and automatically prepares coordination requests, dependency notifications, and progress updates that need to be communicated through your team's Jira workflow.

**Next Session Optimization:** The system analyzes current project state and upcoming priorities to prepare optimal starting context for your next development session, including pre-loading relevant epic context, identifying priority tasks, and preparing any coordination information needed for efficient session startup.

**Context Transition Intelligence:** When transitioning between related todos (using /compact) or unrelated todos (using /clear), the system provides intelligent recommendations based on the relationship analysis from your Jira project structure and the specific context needs of upcoming work.

## Enhanced Stakeholder Communication

The command automatically generates stakeholder communication that bridges the gap between technical development progress and business project management needs:

**Progress Translation:** Technical implementation progress is automatically translated into business-relevant progress narratives that help stakeholders understand project advancement without requiring technical knowledge to interpret development progress.

**Risk and Opportunity Identification:** The system identifies risks and opportunities discovered during development work and automatically generates appropriate communication for project management consideration, including suggested approaches for risk mitigation and opportunity capture.

**Coordination Facilitation:** When development work reveals needs for coordination with other teams, business stakeholders, or external dependencies, the system automatically generates coordination requests through appropriate Jira workflows with sufficient context for efficient coordination.

**Success Amplification:** Significant development achievements are automatically communicated to stakeholders in terms that highlight business value delivery and project momentum, creating positive stakeholder engagement and project support.

## Command Implementation

When invoked, I will:

1. **Analyze Current State**: Assess local file status and fetch latest Jira project state
2. **Detect Changes**: Identify all changes in both local files and Jira items since last sync
3. **Resolve Conflicts**: Apply intelligent conflict resolution for simultaneous changes
4. **Organize Files**: Move files between status directories based on completion progress **WITH HIERARCHY PRESERVATION** - always move entire epic directories (e.g., `QAC-1-home-page/`) to maintain task relationships
5. **Export Summaries**: Generate comprehensive summaries with Jira integration context
6. **Update Relationships**: Refresh epic/story/task relationships and dependencies
7. **Coordinate Updates**: Push local progress to Jira and pull Jira changes to local files
8. **Prepare Context**: Optimize workspace context for efficient future development sessions
9. **Generate Reports**: Create session progress reports and stakeholder communication
10. **Plan Next Steps**: Identify priorities and coordination needs for upcoming work

## Integration Benefits

This enhanced synchronization system delivers compounding benefits that improve over time:

**Productivity Protection:** By handling project management coordination automatically, the system protects your development productivity from administrative overhead while ensuring that business coordination needs are met comprehensively.

**Team Alignment:** Automatic synchronization ensures that your technical progress is always visible to project stakeholders, while business priority changes are immediately reflected in your development context, creating unprecedented team alignment.

**Knowledge Preservation:** Comprehensive summaries and relationship tracking create institutional knowledge that benefits future development work and helps new team members understand project context quickly.

**Process Optimization:** Analysis of development patterns and project coordination needs enables continuous improvement of both development efficiency and project management effectiveness.

This enhanced coordination system transforms your individual development work into a connected team process that serves both technical productivity and business coordination needs, creating sustainable alignment between development execution and project management without compromising the development patterns that make you most productive.

## PRD Integration and Summary Generation

This command's power comes from its integration of PRD requirements with JIRA synchronization and summary generation:

**PRD Compliance Validation:** Every synchronization operation validates that:
- Technical implementations use PRD technology stack
- Security requirements from PRD are maintained
- Performance targets are being met
- Team coordination follows PRD structure

**Enhanced Summary Creation:** Generates summaries in `todo-summaries/completed/` that include:
- PRD compliance verification details
- Implementation patterns that align with PRD standards
- Team coordination strategies from PRD structure
- Technical decisions validated against PRD requirements

**Pattern Library Building:** Builds a repository of PRD-compliant patterns:
- Authentication approaches that meet PRD security standards
- API designs that follow PRD architectural choices
- Database implementations that support PRD performance targets
- UI components that align with PRD technology selections

**Relationship Tracking:** Updates `todo-summaries/relationships.json` with:
- Epic/story/task hierarchies that reflect PRD priorities
- Technical dependencies aligned with PRD architecture
- Team coordination patterns from PRD structure
- Cross-functional relationships defined in PRD

## PRD Requirement Notice

⚠️ **CRITICAL**: This command requires `docs/PRD.md` to function effectively.

Without PRD.md, the command cannot:
- Validate technical implementations against project standards
- Generate PRD-compliant summaries
- Ensure consistency across team coordination
- Build reusable patterns aligned with project requirements

If PRD.md is missing, the command will prompt you to create it from `docs/PRD-TEMPLATE.md` and fill in your project-specific information before proceeding with synchronization operations.