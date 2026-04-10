# tasks - Break Down and Implement Tasks

**Task breakdown and implementation command integrating GitHub Spec-Kit methodology with existing JIRA workflow**

## Purpose
Break down technical implementation plans into actionable development tasks, enhancing the existing `process-todos` workflow with Spec-Kit's systematic task management approach.

## Usage
```bash
tasks
tasks --from-plan [plan_file]
tasks --from-spec [spec_file]
tasks --workspace [frontend|backend|mobile]
```

## Examples
```bash
tasks
tasks --from-plan plans/user-auth-plan.md
tasks --from-spec specs/payment-system-spec.md
tasks --workspace frontend
```

## Command Behavior

### 1. Task Generation Process

#### Plan Analysis
- **Load Implementation Plan**: Read from `plans/` directory or create from current context
- **Task Identification**: Extract actionable development tasks
- **Dependency Mapping**: Identify task dependencies and execution order
- **Effort Estimation**: Provide development effort estimates

#### Task Structure Creation
Following the existing boilerplate todo structure:
```
todo/not-started/
└── [epic-name]/
    ├── epic-overview.md
    ├── [story-name]/
    │   ├── story-plan.md
    │   ├── task-1.md
    │   ├── task-2.md
    │   └── task-3.md
    └── [story-name-2]/
        └── ...
```

### 2. Enhanced Task Breakdown

#### Multi-Level Task Hierarchy
- **Epic Level**: Major feature or system component
- **Story Level**: User-facing functionality or technical component
- **Task Level**: Individual development actions (2-8 hours each)
- **Subtask Level**: Granular implementation steps

#### Task Categorization
Tasks are organized by:
- **Frontend Tasks**: React components, styling, state management
- **Backend Tasks**: APIs, database models, business logic
- **Integration Tasks**: Service connections, authentication, external APIs
- **Quality Tasks**: Testing, documentation, performance optimization

### 3. Task Content Structure

#### Individual Task Format
Each task includes:

##### Task Header
```markdown
# [JIRA-KEY] Task Title

**Epic**: [Epic Name]
**Story**: [Story Name]
**Workspace**: [frontend|backend|mobile]
**Estimated Effort**: [X hours]
**Dependencies**: [List of prerequisite tasks]
```

##### Implementation Details
- **Objective**: Clear description of what needs to be accomplished
- **Acceptance Criteria**: Specific conditions that define task completion
- **Technical Approach**: Implementation strategy and key considerations
- **File Changes**: Expected files to be created or modified

##### Integration Context
- **PRD Alignment**: How task supports PRD requirements
- **Specification Reference**: Links to relevant specifications
- **Architecture Notes**: Architectural decisions and patterns to follow
- **Agent Guidance**: Which sub-agents should be involved

### 4. Workspace-Specific Task Generation

#### Frontend Tasks (Next.js/React)
- **Component Development**: React component creation and styling
- **Page Implementation**: Next.js app router pages and layouts
- **State Management**: Redux actions, reducers, and selectors
- **UI Integration**: Tailwind CSS styling and responsive design

#### Backend Tasks (Express/GraphQL)
- **API Development**: GraphQL resolvers and type definitions
- **Database Tasks**: Sequelize models, migrations, and relationships
- **Authentication**: Clerk integration and context validation
- **Business Logic**: Service layer and domain logic implementation

#### Integration Tasks
- **External Services**: Stripe, Twilio, AWS service integration
- **Cross-System**: Frontend-backend communication and data flow
- **Security**: Authentication flows and data protection
- **Performance**: Optimization and caching strategies

### 5. JIRA Integration Enhancement

#### Automatic JIRA Preparation
- **Epic Creation**: Generate JIRA epics with proper structure
- **Story Breakdown**: Create stories with acceptance criteria
- **Task Assignment**: Prepare tasks for team assignment
- **Sprint Planning**: Organize tasks by estimated completion time

#### Enhanced Metadata
Each task includes:
- **JIRA Labels**: Technology stack, priority, team assignment
- **Components**: System components affected by the task
- **Fix Versions**: Target release or sprint
- **Story Points**: Effort estimation for sprint planning

### 6. Quality Assurance Integration

#### Testing Task Generation
- **Unit Testing**: Individual component and function testing
- **Integration Testing**: API and service integration validation
- **E2E Testing**: User journey and workflow testing
- **Performance Testing**: Load testing and optimization validation

#### Code Quality Tasks
- **TypeScript Implementation**: Type safety and interface definitions
- **Code Review**: Peer review and approval workflows
- **Documentation**: Code documentation and API documentation
- **Security Review**: Security validation and compliance checking

### 7. Advanced Task Management

#### Dependency Management
- **Prerequisite Identification**: Tasks that must be completed first
- **Parallel Execution**: Tasks that can be worked on simultaneously  
- **Critical Path Analysis**: Essential tasks for milestone completion
- **Resource Conflicts**: Tasks requiring same team members or resources

#### Progress Tracking
- **Status Updates**: Integration with existing todo status system
- **Completion Validation**: Automated checks for task completion
- **Milestone Tracking**: Progress toward epic and story completion
- **Blockers Management**: Identification and resolution of blocking issues

### 8. Implementation Examples

#### Example 1: User Authentication Tasks
```bash
tasks --from-spec specs/user-auth-spec.md
```

**Generated Task Structure:**
```
todo/not-started/
└── user-authentication-epic/
    ├── epic-overview.md
    ├── login-flow-story/
    │   ├── story-plan.md
    │   ├── AUTH-101-create-login-component.md
    │   ├── AUTH-102-implement-clerk-integration.md
    │   └── AUTH-103-add-login-validation.md
    └── user-profile-story/
        ├── story-plan.md
        ├── AUTH-201-create-profile-model.md
        └── AUTH-202-build-profile-interface.md
```

#### Example 2: E-commerce Feature Tasks
```bash
tasks --from-plan plans/product-catalog-plan.md
```

**Generated Tasks:**
- **Frontend**: Product listing component, search interface, filter system
- **Backend**: Product API, search indexing, inventory management
- **Integration**: Image storage, payment integration, analytics tracking

### 9. Workspace-Specific Examples

#### Frontend Workspace Tasks
```bash
tasks --workspace frontend
```
- Component library development
- Page layout implementation
- State management setup
- Responsive design implementation

#### Backend Workspace Tasks
```bash
tasks --workspace backend
```
- GraphQL schema development
- Database model implementation
- API endpoint creation
- Authentication middleware setup

### 10. Quality Gates and Validation

#### Task Validation
- **Completeness Check**: All required implementation details included
- **Feasibility Assessment**: Tasks are achievable within estimated time
- **Dependency Validation**: All prerequisites are properly identified
- **Resource Allocation**: Tasks match available team capacity

#### Automated Quality Checks
- **Specification Alignment**: Tasks support specification requirements
- **Architecture Compliance**: Tasks follow established patterns
- **Security Validation**: Security requirements are addressed
- **Performance Considerations**: Performance impact is evaluated

## Advanced Features

### Custom Task Templates
Create reusable task templates for common patterns:
- **Component Creation Template**: Standard React component development
- **API Endpoint Template**: GraphQL resolver implementation
- **Database Migration Template**: Sequelize migration tasks
- **Integration Template**: External service integration tasks

### Team Coordination
- **Assignment Suggestions**: Recommend team members based on expertise
- **Load Balancing**: Distribute tasks across team members
- **Skill Development**: Identify learning opportunities for team growth
- **Collaboration Planning**: Tasks requiring pair programming or collaboration

### Progress Monitoring
- **Velocity Tracking**: Monitor team completion rates
- **Burndown Charts**: Visual progress toward milestones
- **Bottleneck Identification**: Find and resolve workflow constraints
- **Quality Metrics**: Track defect rates and rework requirements

## Integration with Existing Commands

### Enhanced Process Todos
The `process-todos` command is enhanced to work with generated tasks:
- **Context Awareness**: Tasks include full specification and plan context
- **Agent Coordination**: Automatic sub-agent involvement based on task type
- **Quality Validation**: Automatic code review and testing integration
- **Progress Updates**: Real-time status updates and JIRA synchronization

### JIRA Workflow Integration
- **Automatic Epic Creation**: Generate JIRA epics from task breakdown
- **Story Management**: Sync stories with JIRA issues
- **Status Synchronization**: Bidirectional status updates
- **Sprint Planning**: Organize tasks for agile sprints

## Next Steps

After running `tasks`, typical workflow:
1. **Review Task Breakdown** - Validate completeness and effort estimates
2. **Team Planning** - Assign tasks and plan execution order
3. **Create JIRA Issues** - Use `create-jira-plan-todo --from-tasks`
4. **Begin Development** - Start with `process-todos` for first task
5. **Monitor Progress** - Use `update-todos` for status synchronization

## File References
- **Task Storage**: `todo/not-started/` - Generated development tasks
- **Plan Input**: `plans/` - Source implementation plans
- **Specification Context**: `specs/` - Feature specifications
- **JIRA Integration**: `todo/jira-config/` - Project management connection