# Update Todos - Enhanced with Personal Filtering and Bidirectional Jira Synchronization

Maintain seamless synchronization between your personal assigned work and your [PROJECT_KEY] Jira project board, with intelligent filtering that focuses on your responsibilities while handling progress tracking, file organization, conflict resolution, and team coordination automatically.

## Prerequisites

⚠️ **REQUIRED**: 
1. A `docs/PRD.md` file must exist to provide project context
2. JIRA configuration must be completed using `sync-jira --connect`
3. Personal configuration should be set up for assignment filtering

## Enhanced Personal Synchronization Hub

This enhanced command serves as your personalized coordination center that maintains harmony between your local file-based development process and your team's Jira-based project management process. It combines PRD requirements with personal filtering to create a focused productivity assistant.

The command operates with sophisticated understanding of:
- **PRD Context**: Project requirements, technology choices, and standards
- **Personal Assignment Context**: Your specific tasks and responsibilities
- **Todo Summary History**: Previous implementations and established patterns
- **Team Coordination Needs**: Dependencies and collaboration requirements

This multi-source awareness ensures that synchronization operations enhance your productivity while maintaining PRD compliance and team coordination.

## Intelligent Personal Assignment Detection

The enhanced command begins each synchronization session by performing comprehensive analysis of your current assignment context within your [PROJECT_KEY] project. This analysis goes beyond simple task assignment to understand the complete ecosystem of work that affects your productivity and coordination needs.

**Direct Assignment Analysis:** The system identifies all tasks that are explicitly assigned to your Jira user account, analyzing their current status, priority levels, due dates, and dependency relationships. This direct assignment analysis forms the core of your personalized synchronization focus, ensuring that all work specifically assigned to you receives appropriate attention and coordination.

**Team Assignment Context:** Beyond direct assignments, the system analyzes work assigned to teams you belong to, identifying tasks that might require your coordination or expertise even if they're not directly assigned to your individual account. This team context analysis helps you understand when your collaboration might be needed while maintaining focus on your primary responsibilities.

**Dependency Relationship Mapping:** The command performs sophisticated analysis of dependency relationships that connect your assigned work to other tasks throughout the project. This dependency mapping ensures that you're aware of work that might block your progress or work that depends on your completion, enabling proactive coordination without overwhelming you with irrelevant project details.

**Review and Approval Workflows:** Based on your role assignments in the personal configuration, the system identifies tasks that require your review, approval, or technical expertise. These workflow-based assignments often don't appear as direct task assignments but represent important responsibilities that affect project progress and team coordination.

## Enhanced Bidirectional Synchronization with Personal Focus

The synchronization process operates with intelligent understanding of your personal assignment context, prioritizing coordination activities that affect your work while maintaining comprehensive project awareness for team coordination purposes. This personal focus ensures that synchronization serves your productivity needs while facilitating necessary collaborative coordination.

**Personal Change Detection:** The system continuously monitors your local files for changes that affect your assigned work, using sophisticated analysis to determine what changes require immediate synchronization versus changes that can be batched for efficiency. Task completion, blocker discovery, and deadline concerns receive immediate synchronization attention, while progress notes and technical details synchronize through regular batch operations.

**Assignment-Aware Conflict Resolution:** When conflicts arise between your local changes and Jira updates, the system applies personal assignment context to conflict resolution decisions. Changes to your assigned work receive priority for local precedence, while business priority changes and deadline adjustments from project management receive appropriate integration into your development context.

**Coordination Impact Analysis:** The command analyzes how your local progress affects other team members' work, automatically generating appropriate coordination communication when your task completion unblocks other assignments or when your discoveries affect parallel development work. This coordination analysis ensures that your individual productivity contributes to team efficiency without requiring manual coordination tracking.

**Context Preservation:** During synchronization operations, the system carefully preserves important personal context including technical decisions you've made, implementation patterns you've discovered, and coordination relationships you've established. This context preservation creates continuity across synchronization sessions and helps maintain your development momentum.

## Enhanced File Organization with Personal Assignment Structure

The command's file organization capabilities extend beyond simple directory management to create sophisticated personal workspace organization that reflects your assignment relationships and team coordination needs. This personal organization approach ensures that your local development environment optimally supports your individual productivity patterns.

**Assignment-Based Hierarchy:** Files organize within the epic-story-task hierarchy with visual and structural emphasis on work that's assigned to you. Your assigned tasks receive prominent positioning and clear visual indicators, while related context work appears in supporting positions that provide necessary coordination information without overwhelming your primary focus.

**Personal Priority Ordering:** Within each status directory, tasks organize according to personal priority algorithms that consider assignment relationships, dependency constraints, deadline pressures, and business priorities. This intelligent ordering ensures that your most important work appears prominently while maintaining access to supporting context and coordination information.

**Coordination Context Integration:** The enhanced organization includes special handling for tasks that require coordination with other team members, grouping related coordination needs to facilitate efficient team communication while maintaining focus on your individual development responsibilities.

**Dynamic Reorganization:** As assignments change and project priorities shift, the system automatically reorganizes your personal workspace to reflect current assignment relationships. New assignments appear in appropriate positions with necessary context, while completed or reassigned work moves to archive locations without cluttering your active development focus.

## Comprehensive Summary Export with PRD Context

The enhanced summary export system creates documentation that serves both your personal knowledge preservation needs and team coordination requirements, with intelligent integration of PRD requirements and established patterns.

**PRD-Compliant Progress Documentation:** Summaries focus on progress related to your assigned work while ensuring all technical decisions align with PRD requirements. Documentation includes:
- Technology stack implementation details from PRD
- Security and compliance validation against PRD standards
- Performance target achievement verification
- Architectural pattern consistency with PRD specifications

**Pattern Library Generation:** The system automatically documents:
- Reusable implementation patterns that can benefit future work
- PRD compliance approaches that worked well
- Technical decisions that align with project standards
- Coordination strategies that improved team efficiency

**Context-Rich Summary Creation:** Generated summaries include:
- Personal assignment progress with PRD context
- Team coordination activities and outcomes
- Established patterns for `todo-summaries/` directory
- Relationship updates for `relationships.json`

**Stakeholder Communication:** Summaries automatically generate appropriate stakeholder communication that translates technical progress into business terms while highlighting PRD compliance and value delivery.

## Command Usage with Personal Filtering

**Complete Personal Synchronization:**
```bash
update-todos
# Synchronizes all your assigned work with QAC project
# Organizes files based on your assignment relationships
# Generates personal progress summaries with team context
# Resolves conflicts with priority on your assigned work
```

**Focus on Specific Assignment Context:**
```bash
update-todos --epic=QAC-200
# Synchronizes work within Client Management epic that affects you
# Coordinates with team members working on related stories
# Updates epic progress based on your individual contributions
# Maintains awareness of epic-level business objectives
```

**Team Coordination Synchronization:**
```bash
update-todos --team-sync
# Includes coordination activities with your team assignments
# Synchronizes shared work and collaborative progress
# Updates team-level progress metrics and coordination status
# Facilitates team communication and dependency management
```

**Assignment Change Management:**
```bash
update-todos --refresh-assignments
# Analyzes current assignment changes and updates personal context
# Reorganizes workspace based on new assignment relationships
# Preserves context for reassigned or completed work
# Optimizes personal workspace for current responsibilities
```

## Dynamic Assignment Adaptation and Personal Workspace Evolution

The enhanced command includes sophisticated capabilities for handling the dynamic nature of project assignments, ensuring that your personal development environment automatically adapts to changing responsibilities while preserving important context and coordination relationships.

**Assignment Change Detection:** The system continuously monitors your QAC project for assignment changes that affect your personal workspace organization. New assignments automatically appear in your development environment with appropriate context and priority positioning, while reassigned work transitions to archive locations with preserved context for future reference.

**Role-Based Assignment Analysis:** Beyond direct task assignments, the system analyzes role-based work that might require your attention based on your technical expertise, team position, or project responsibilities. Architecture reviews, technical consultations, and senior developer approvals automatically appear in your personal workspace when they require your attention.

**Sprint Transition Management:** As your team moves between sprints, the system intelligently manages the transition of your personal workspace to reflect new sprint assignments while preserving completed work and maintaining context for ongoing longer-term assignments that span multiple sprints.

**Workload Balance Awareness:** The command analyzes your current assignment load and provides insights about workload balance, helping you understand when your assignment context might benefit from coordination with project management or when you might have capacity for additional collaborative opportunities.

## Team Coordination Features with Personal Focus

Personal filtering enhances rather than limits team coordination capabilities, providing sophisticated features that facilitate collaboration while maintaining your individual productivity focus. Understanding how personal filtering improves team coordination helps you appreciate the collaborative benefits of the integrated system.

**Selective Coordination Alerts:** The system generates coordination alerts specifically relevant to your assigned work, filtering out coordination needs that don't affect your responsibilities while ensuring that important team coordination opportunities receive appropriate attention. This selective coordination reduces notification noise while maintaining essential team connectivity.

**Assignment-Aware Progress Sharing:** Your progress automatically shares with team members who need coordination information about your work, while you receive progress updates about work that affects your assignments. This selective progress sharing creates efficient team communication patterns that respect individual focus needs.

**Collaborative Context Sessions:** The system supports temporary expansion of your personal filtering for specific team coordination activities, allowing you to participate effectively in team planning sessions or collaborative problem-solving while returning to your focused personal view afterward.

**Dependency Coordination Automation:** When your work affects other team members through dependency relationships, the system automatically facilitates appropriate coordination without requiring you to manually track and communicate every dependency change. This automation ensures that your individual productivity contributes to team efficiency.

## Integration with Enhanced Development Workflow

The personal filtering capabilities integrate seamlessly with all aspects of your enhanced development workflow, creating a comprehensive development environment that serves both individual productivity and team coordination needs while maintaining the familiar workflow patterns that make you most effective.

**Context-Aware Command Integration:** All enhanced commands automatically respect your personal filtering configuration, ensuring that process-todos, update-todos, and other workflow commands provide consistent personal focus while maintaining necessary team coordination capabilities.

**Intelligent Context Switching:** The system supports efficient transitions between individual focus work and collaborative coordination activities, preserving your personal development context while providing appropriate team context when collaboration is needed.

**Personal Knowledge Accumulation:** The enhanced workflow creates cumulative personal knowledge preservation that serves both your individual development acceleration and team institutional knowledge building, ensuring that your experience and discoveries benefit both personal productivity and team capability development.

This comprehensive personal filtering integration transforms your update-todos command into a sophisticated personal productivity and team coordination tool that respects your individual workflow preferences while facilitating the collaborative coordination necessary for successful team-based software development. The result is a development environment that enhances both individual effectiveness and team productivity through intelligent personal filtering and coordination automation.

## Summary Generation and Pattern Library Building

A key feature of this command is its ability to automatically generate comprehensive summaries that build a knowledge base for future development:

**Automatic Summary Creation:** When work is completed, the command automatically generates summaries in `todo-summaries/completed/` that include:
- Implementation approaches that worked well
- PRD compliance strategies
- Technical decisions and their rationale
- Team coordination patterns
- Performance and security validation approaches

**Relationship Tracking:** Updates `todo-summaries/relationships.json` with:
- New epic/story/task relationships
- Shared components and services discovered
- Technical dependencies established
- Coordination patterns that emerged

**Pattern Recognition:** The system builds a library of reusable patterns:
- Authentication implementations that meet PRD security requirements
- API designs that follow PRD architectural standards
- UI components that align with PRD technology choices
- Database schemas that support PRD performance targets

**Future Context Loading:** These summaries become context for future `create-plan-todo` and `create-jira-plan-todo` commands, enabling:
- Faster planning based on established patterns
- Consistent implementation approaches across features
- Reduced redundancy in technical decisions
- Better estimates based on similar previous work

## PRD Integration Notice

⚠️ **IMPORTANT**: This command requires `docs/PRD.md` to function at full effectiveness.

Without PRD.md, the command cannot:
- Apply consistent technology standards
- Validate security and compliance requirements
- Generate PRD-compliant summaries
- Ensure architectural consistency

If PRD.md is missing, the command will guide you through creating it from the template to unlock the full power of context-aware development.