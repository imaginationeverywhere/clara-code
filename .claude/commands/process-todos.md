# Process Todos - Enhanced with PRP Framework Integration

Execute implementation work from your structured todo files with intelligent personal filtering that focuses on your assigned tasks while maintaining awareness of team coordination needs and project context. Now enhanced with PRP (Product Requirement Prompt) Framework for validation-driven development and progressive success methodology.

## Prerequisites

⚠️ **REQUIRED**: A `docs/PRD.md` file must exist to use this command effectively.

The PRD.md file provides essential project context including:
- **Monorepo Structure**: Frontend, backend, and mobile workspace configurations
- **Technology Stack**: Next.js 16 + React 19 (frontend), Express + Apollo Server (backend)
- **Deployment Targets**: AWS Amplify (frontend), Shared EC2 (backend)
- **Security and Compliance**: Authentication, authorization, and data protection
- **Performance Targets**: Load times, API response times, concurrent users
- **Team Structure**: Roles, responsibilities, and coordination patterns
- **Business Objectives**: Success criteria and project goals
- **Frontend Mockup Template**: Selected baseline for UI/UX development

## Intelligent Capability Detection and Personal Filtering

When you run `process-todos`, the command performs sophisticated analysis to determine the optimal execution mode:

1. **PRD Context Loading**: Extracts project-wide requirements and technical standards
2. **Jira Integration Check**: Examines `todo/jira-config/` for integration capabilities
3. **Personal Configuration**: Loads `personal-config.json` for assignment filtering
4. **Todo Summary Context**: Checks for related work in `todo-summaries/`
5. **Mockup Template Loading**: For frontend tasks, loads selected mockup template context

**Personal Assignment Analysis:** The system connects to your [PROJECT_KEY] Jira project and analyzes current assignments to identify tasks that are directly assigned to you, tasks assigned to your teams, and tasks that affect your assigned work through dependency relationships. All technical implementation follows PRD specifications automatically.

**Mockup-Aware Frontend Processing:** For frontend development tasks, the system loads your selected mockup template (retail, booking, property-rental, restaurant, or custom) and provides context-aware guidance that maps mockup components to your implementation. This ensures UI/UX consistency while transforming the mockup patterns to your Next.js 16 architecture.

**Context-Aware Filtering:** Based on your personal configuration, PRD requirements, mockup template, and current assignments, the system applies intelligent filtering that shows you exactly the right level of project context. Your directly assigned tasks receive primary focus, while PRD requirements and mockup patterns ensure consistent implementation across all features.

## PRP Framework Integration

**Validation-Driven Development:** The enhanced command now includes comprehensive validation gates at every phase of development, following the PRP Framework methodology for progressive success. Each task includes built-in syntax validation, unit testing requirements, integration testing checkpoints, and quality assurance metrics.

**Progressive Success Methodology:** Implementation follows a structured approach:
1. **Start Simple**: Begin with basic, working implementation
2. **Validate**: Run comprehensive validation checks (syntax, types, lint, tests)
3. **Enhance**: Add features and optimizations incrementally
4. **Validate Again**: Continuous validation ensures quality throughout development

**Context Engineering:** Tasks automatically receive dense, comprehensive context from:
- **AI Documentation**: Complete technology stack and architecture patterns
- **PRP Templates**: Structured implementation guides with validation checkpoints
- **Code Snippets**: Proven patterns and examples for common scenarios
- **Validation Scripts**: Automated quality assurance and testing integration

## Enhanced Execution Modes with Personal Focus

**Integrated Personal Mode** (when Jira integration and personal config are available):
The command processes your personally assigned todos with real-time [PROJECT_KEY] project synchronization, automatic progress updates that flow through the task-story-epic hierarchy, intelligent coordination alerts when your work affects team members, time tracking that syncs to your assigned Jira tasks, and enhanced context from epic and story information that relates to your assignments.

**Team Coordination Mode** (when working on team-assigned tasks):
The system provides enhanced coordination features including automatic detection of coordination needs with other team members, progress sharing that keeps your team informed of your contributions, dependency tracking that alerts you when your work unblocks other team members, and collaborative context that helps you understand how your individual work contributes to team objectives.

**Focus Mode** (when you need maximum concentration):
The command can operate in enhanced focus mode that minimizes all coordination interruptions while maintaining essential progress tracking, defers non-critical updates until designated sync windows, suppresses low-priority notifications that might interrupt deep work sessions, and preserves all coordination information for review during planned break periods.

**Offline Mode** (when integration is temporarily unavailable):
The system continues functioning with full local capabilities while queuing all Jira updates for the next successful connection, maintaining your complete development workflow without any interruption, and building comprehensive sync backlogs that ensure no progress information is lost during offline periods.

## Command Usage with Personal Filtering

**Process Your Assigned Tasks:**
```bash
process-todos
# Automatically focuses on tasks assigned to you
# Applies PRD context for frontend (Amplify) and backend (EC2) development
# Updates Jira progress for your tasks in real-time
# Handles monorepo workspace-specific configurations
# Alerts you to coordination needs with your team members
```

**Process Frontend Tasks:**
```bash
process-todos --workspace=frontend
# Focuses on Next.js/React frontend development tasks
# Applies AWS Amplify deployment context
# Uses frontend-specific build and testing workflows
# Integrates with Apollo Client and Redux Persist
# References selected mockup template for UI/UX guidance
# Maps mockup components to Next.js implementation
```

**Process Backend Tasks:**
```bash
process-todos --workspace=backend
# Focuses on Express.js backend development tasks
# Applies shared EC2 deployment context with port management
# Uses backend-specific database and GraphQL configurations
# Integrates with Apollo Server and PM2 ecosystem
```

**Process Specific Epic or Story:**
```bash
process-todos --epic=[PROJECT_KEY]-200
# Processes all your assigned tasks within the Client Management epic
# Shows how your work contributes to epic-level objectives
# Coordinates with other team members working on the same epic
# Provides business context that helps guide technical decisions
```

**Team Collaboration Mode:**
```bash
process-todos --team-mode
# Includes tasks assigned to your teams in addition to personal assignments
# Enhanced coordination features for team-based development
# Progress sharing that keeps your team synchronized
# Dependency tracking across team member assignments
```

**Enhanced Focus Session:**
```bash
process-todos --focus-mode
# Minimizes coordination interruptions during deep work
# Batches updates and notifications for designated review periods
# Maintains essential progress tracking without workflow disruption
# Preserves all team coordination information for later review
```

**PRP Framework Modes:**
```bash
process-todos --prp-mode
# Activates full PRP Framework validation and progressive methodology
# Applies comprehensive validation gates at every development phase
# Uses PRP templates for structured implementation guidance
# Enables one-pass implementation success with dense context provision

process-todos --validation-only
# Runs comprehensive validation checks without implementation
# Syntax validation, type checking, linting, and formatting
# Unit test validation and integration test checkpoints
# Quality metrics reporting and compliance verification

process-todos --progressive-enhancement
# Implements progressive success methodology
# Phase 1: Basic implementation with validation
# Phase 2: Feature enhancement with testing
# Phase 3: Optimization and final validation
```

## Intelligent Task Prioritization and Coordination

The enhanced command includes sophisticated prioritization logic that considers multiple factors when determining the optimal order for processing your assigned tasks. Personal assignment priority takes precedence, ensuring that tasks directly assigned to you receive appropriate attention based on their business priority and deadline constraints.

**Dependency-Aware Prioritization:** The system analyzes dependency relationships between your assigned tasks and work assigned to other team members, automatically prioritizing tasks that will unblock other team members when completed. This dependency awareness helps optimize overall team productivity while maintaining focus on your individual responsibilities.

**Business Context Integration:** Your personal filtering configuration includes business priority information from your [PROJECT_KEY] project that helps the system suggest optimal task ordering based on current stakeholder priorities and project timeline constraints. This business context integration ensures that your individual technical work aligns with current project objectives.

**Coordination Opportunity Detection:** The command identifies opportunities for efficient coordination with other team members, suggesting when it might be beneficial to collaborate on related tasks or when completing certain tasks in specific sequences might benefit overall team productivity.

## Real-Time Progress Coordination

As you complete tasks during your development session, the enhanced command manages sophisticated real-time coordination that keeps your team and stakeholders informed while minimizing interruptions to your development flow. This coordination happens automatically in the background, ensuring that team alignment occurs without disrupting your productive development patterns.

**Automatic Progress Broadcasting:** Task completion automatically updates corresponding Jira tasks with appropriate status changes that flow through your team's established workflow processes. Story and epic progress automatically recalculates based on your individual task completion, providing stakeholders with current project visibility without requiring separate reporting effort from you.

**Smart Coordination Alerts:** When your progress affects other team members' work or when dependency relationships change based on your task completion, the system generates intelligent coordination alerts that provide appropriate context without overwhelming recipients with unnecessary technical details.

**Stakeholder Communication:** The system automatically generates appropriate progress communication for project stakeholders that translates your technical advancement into business-relevant updates. These communications highlight business value delivery and project momentum while maintaining appropriate abstraction from technical implementation complexity.

## Enhanced Context Management with Personal Filtering

The command's context management capabilities combine PRD requirements, personal filtering, and project history to create an optimal development environment:

**PRD Context Application:** Every task automatically receives:
- **Monorepo Configuration**: Workspace-specific technology stacks and deployment targets
- **Frontend Context**: Next.js 16, React 19, Tailwind v4, AWS Amplify deployment settings
- **Backend Context**: Express.js, Apollo Server, shared EC2 with dynamic port assignment
- **Security Requirements**: Clerk Auth integration, JWT validation, RBAC implementation
- **Performance Targets**: Frontend load times (<2s), API response times (<400ms)
- **Architectural Patterns**: GraphQL-first API design, Redux Persist state management
- **Testing Requirements**: Jest, React Testing Library, API testing strategies
- **Mockup Template Context**: Selected UI/UX baseline with component mappings

**Personal Context Preservation:** The system maintains rich context about your assigned work including technical decisions you've made, implementation patterns you've discovered, and coordination activities you've participated in. All preserved context aligns with PRD standards.

**Team Context Integration:** While maintaining focus on your assigned work, the system provides appropriate context about related team activities that might affect your assignments or benefit from your expertise. PRD team structure informs coordination suggestions.

**Project Context Awareness:** The enhanced command maintains awareness of broader project context from the PRD including business priorities, stakeholder concerns, and strategic objectives that influence your assigned work. This ensures all technical decisions align with PRD-defined project goals.

## Command Implementation

When invoked, the enhanced process-todos command with PRP Framework integration performs several sophisticated operations:

1. **PRD Verification and Loading**:
   - Checks for `docs/PRD.md` existence
   - Loads project specifications and requirements
   - Applies PRD context to all implementation decisions
   - Validates PRD completeness for PRP Framework compatibility

2. **PRP Framework Initialization**:
   - Loads AI documentation from `ai_docs/` directory
   - Initializes validation scripts from `PRPs/scripts/`
   - Prepares PRP templates from `PRPs/templates/`
   - Sets up progressive success methodology checkpoints

3. **Personal Configuration Setup**:
   - Loads personal filtering preferences
   - Analyzes current JIRA assignments
   - Establishes task prioritization with PRP context
   - Configures validation gates for assigned tasks

4. **Context Engineering**:
   - Applies comprehensive context from AI documentation
   - Searches todo-summaries for related patterns
   - Loads PRP templates for task-specific guidance
   - Ensures consistency with previous work
   - For frontend tasks: Loads mockup template components with PRP validation
   - Maps mockup UI patterns to Next.js structure with quality gates

5. **Validation Gateway Setup**:
   - Configures syntax validation checkpoints
   - Prepares unit testing requirements
   - Sets up integration testing gates
   - Establishes quality metrics monitoring

6. **Progressive Task Processing**:
   - **Phase 1**: Basic implementation with validation
     - Presents tasks with full PRD and PRP context
     - Applies syntax validation before code generation
     - Runs immediate quality checks on implementation
   - **Phase 2**: Enhancement with testing
     - Adds advanced features with validation gates
     - Implements comprehensive testing requirements
     - Validates against performance and security standards
   - **Phase 3**: Optimization and final validation
     - Applies performance optimizations
     - Runs complete quality audit
     - Ensures production readiness

7. **Continuous Validation**:
   - Runs validation scripts at each checkpoint
   - Monitors code quality metrics in real-time
   - Applies automated testing and quality assurance
   - Provides immediate feedback on implementation quality

8. **Progress Tracking with Quality Metrics**:
   - Updates task/story/epic status with validation results
   - Generates stakeholder communications with quality metrics
   - Creates summaries for completed work with validation evidence
   - Maintains relationships.json with quality tracking
   - Documents validation results and lessons learned

This enhanced implementation ensures that every line of code written aligns with PRD requirements while maintaining developer productivity through intelligent context management and automation.

## PRD and PRP Framework Requirements Notice

If the `docs/PRD.md` file doesn't exist, the command will:
1. Alert you to create it from the template
2. Provide instructions for setup
3. Explain the benefits of PRD-driven development
4. Guide you through PRP Framework initialization

The PRD ensures consistent, high-quality implementation across all features by providing a single source of truth for project requirements, while the PRP Framework enhances this with:

**Enhanced AI Context Provision**:
- Dense, comprehensive context from `ai_docs/` directory
- Proven implementation patterns and code examples
- Technology-specific guidance and best practices
- Security, performance, and quality standards

**Validation-Driven Development**:
- Multi-level validation gates (syntax, types, lint, tests)
- Progressive success methodology for reduced iteration
- Quality metrics monitoring and reporting
- Automated testing integration and validation

**Improved Development Outcomes**:
- Higher code quality through built-in validation
- Faster development cycles with comprehensive context
- Reduced debugging and rework through progressive validation
- Better team coordination through standardized approaches

If PRP Framework components are missing, the command will:
1. Initialize `ai_docs/` directory structure
2. Create basic PRP templates in `PRPs/templates/`
3. Set up validation scripts in `PRPs/scripts/`
4. Configure progressive success methodology
5. Provide guidance for customizing PRP components to your project

This integrated approach transforms development from reactive coding to proactive, quality-driven implementation with comprehensive AI assistance.