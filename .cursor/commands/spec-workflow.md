# spec-workflow - Complete Spec-Kit Development Workflow

**Integrated GitHub Spec-Kit workflow combining specify, plan, and tasks commands with existing boilerplate systems**

## Purpose
Provide a complete end-to-end specification-driven development workflow that integrates GitHub Spec-Kit methodology with the existing PRD-driven, JIRA-integrated, monorepo-aware Claude boilerplate system.

## Usage
```bash
spec-workflow [requirement_description]
spec-workflow --interactive
spec-workflow --from-epic [epic_name]
```

## Examples
```bash
spec-workflow Build a complete e-commerce checkout flow with Stripe payments
spec-workflow --interactive
spec-workflow --from-epic todo/not-started/user-management-epic/
```

## Workflow Phases

### Phase 1: Specification-Driven Requirements (0-to-1 Development)

#### 1.1 Requirement Analysis
- **Input Processing**: Analyze user requirements and business objectives
- **PRD Integration**: Align requirements with existing PRD.md specifications
- **Stakeholder Clarification**: Identify unclear requirements and gather additional details
- **Scope Definition**: Define feature boundaries and integration points

#### 1.2 Executable Specification Creation
Automatically executes: `specify [requirement_description]`
- **Functional Requirements**: Detailed user stories and business logic
- **Technical Specifications**: API contracts, data models, component structure  
- **Quality Requirements**: Performance, security, accessibility standards
- **Integration Specifications**: External service and internal system connections

#### 1.3 Specification Validation
- **PRD Compliance**: Ensure alignment with project requirements document
- **Technology Stack Validation**: Confirm compatibility with chosen technologies
- **Resource Assessment**: Evaluate feasibility within project constraints
- **Stakeholder Review**: Present for business and technical approval

### Phase 2: Technical Implementation Planning

#### 2.1 Architecture Planning
Automatically executes: `plan --from-spec specs/[generated-spec].md`
- **System Architecture**: High-level design and component interaction
- **Technology Integration**: Framework-specific implementation approach
- **Database Design**: Data models, relationships, and migration strategy
- **Security Architecture**: Authentication, authorization, and data protection

#### 2.2 Multi-Workspace Planning
- **Frontend Planning**: Next.js components, pages, and state management
- **Backend Planning**: Express.js APIs, GraphQL resolvers, database models
- **Mobile Planning**: React Native components and native integrations
- **Infrastructure Planning**: AWS deployment, monitoring, and scaling

#### 2.3 Plan Validation and Refinement
- **Technical Review**: Architecture and approach validation by sub-agents
- **Performance Modeling**: Estimate system performance characteristics
- **Risk Assessment**: Identify technical risks and mitigation strategies
- **Resource Planning**: Validate against available development capacity

### Phase 3: Task Breakdown and Implementation

#### 3.1 Actionable Task Generation
Automatically executes: `tasks --from-plan plans/[generated-plan].md`
- **Epic Structure**: High-level feature groupings aligned with business value
- **Story Breakdown**: User-facing functionality and technical components
- **Task Granularity**: Individual development actions (2-8 hour chunks)
- **Dependency Mapping**: Task prerequisites and execution order

#### 3.2 JIRA Integration
- **Epic Creation**: Generate JIRA epics with comprehensive descriptions
- **Story Management**: Create stories with acceptance criteria and estimates
- **Task Organization**: Structure tasks for sprint planning and assignment
- **Metadata Enhancement**: Add labels, components, and technical classifications

#### 3.3 Development Workflow Integration
Seamlessly connects with existing boilerplate commands:
- **process-todos**: Enhanced with specification context and quality gates
- **update-todos**: Bidirectional JIRA sync with specification traceability  
- **create-jira-plan-todo**: Enhanced with specification-driven issue creation

## Advanced Workflow Features

### Creative Exploration Support
For exploring different implementation approaches:

#### Alternative Architecture Evaluation
```bash
spec-workflow --explore Build user authentication system
```
- **Multiple Approaches**: Generate several technical implementation options
- **Technology Comparison**: Compare frameworks, libraries, and patterns
- **Prototype Planning**: Quick validation and proof-of-concept strategies
- **Trade-off Analysis**: Evaluate pros/cons of different approaches

#### Parallel Implementation Paths
- **A/B Implementation**: Develop multiple solutions simultaneously
- **Technology Experimentation**: Test different frameworks or approaches
- **Performance Comparison**: Benchmark different implementation strategies
- **Team Learning**: Enable skill development through diverse approaches

### Iterative Enhancement Workflow
For enhancing existing systems:

#### Legacy Integration Planning
```bash
spec-workflow --enhance-existing todo/completed/legacy-system-epic/
```
- **Current State Analysis**: Evaluate existing implementation
- **Enhancement Specification**: Define new capabilities and improvements
- **Migration Strategy**: Plan gradual enhancement and modernization
- **Backward Compatibility**: Ensure continuity during enhancement

#### Modernization Workflow
- **Technology Upgrade**: Plan framework and library updates
- **Architecture Evolution**: Enhance system architecture incrementally
- **Performance Optimization**: Systematic performance improvement planning
- **Security Hardening**: Add modern security practices and standards

### Enterprise Integration Features

#### Team Collaboration Workflow
- **Multi-Team Coordination**: Coordinate specifications across teams
- **Stakeholder Management**: Include business stakeholders in review process
- **Documentation Standards**: Ensure consistent specification documentation
- **Review and Approval**: Structured approval workflow for specifications

#### Compliance and Governance
- **Regulatory Compliance**: Ensure specifications meet regulatory requirements
- **Security Standards**: Apply organizational security policies
- **Performance Requirements**: Enforce SLA and performance targets
- **Architectural Governance**: Maintain system coherence and standards

## Workflow Configuration

### PRD-Driven Configuration
The workflow automatically adapts based on PRD.md settings:

#### Technology Stack Integration
- **Frontend Framework**: Next.js 16 + React 19 + TypeScript
- **Backend Framework**: Express.js + Apollo Server + TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: Clerk integration with RBAC
- **Deployment**: AWS Amplify (frontend) + Shared EC2 (backend)

#### Mockup Template Integration
Based on MOCKUP_TEMPLATE_CHOICE in PRD.md:
- **retail**: E-commerce patterns with product catalog and checkout
- **booking**: Service appointment patterns with calendar integration
- **property-rental**: Real estate patterns with search and filtering
- **restaurant**: Food service patterns with menu and ordering
- **custom**: Custom mockup patterns from mockup/custom/

### Quality Gate Configuration

#### Automated Quality Checks
- **Specification Completeness**: Verify all requirements are addressed
- **Technical Feasibility**: Validate implementation approach
- **Security Compliance**: Ensure security requirements are met
- **Performance Standards**: Verify performance requirements are addressed

#### Code Quality Integration
- **TypeScript Standards**: Ensure type safety throughout the stack
- **Testing Requirements**: Define comprehensive testing strategy
- **Documentation Standards**: Ensure proper documentation is planned
- **Accessibility Compliance**: Verify WCAG standards are addressed

## Interactive Workflow Mode

### Guided Specification Creation
```bash
spec-workflow --interactive
```

#### Interactive Prompts
- **Requirement Clarification**: Guided questions to clarify requirements
- **Technology Choices**: Present options based on PRD configuration
- **Integration Planning**: Guide through system integration decisions
- **Quality Requirements**: Ensure non-functional requirements are addressed

#### Real-Time Validation
- **Immediate Feedback**: Real-time validation during specification creation
- **Constraint Checking**: Validate against technical and business constraints
- **Suggestion Engine**: Provide recommendations based on best practices
- **Error Prevention**: Catch issues early in the specification process

### Collaborative Review Process
- **Stakeholder Involvement**: Include business and technical stakeholders
- **Iterative Refinement**: Support multiple rounds of specification refinement
- **Change Management**: Track specification changes and approvals
- **Version Control**: Maintain specification version history

## Integration Examples

### Complete E-commerce Feature Example
```bash
spec-workflow Build complete product catalog with search, filtering, and recommendations
```

**Generated Workflow:**
1. **Specification**: Complete e-commerce catalog specification with search and ML recommendations
2. **Planning**: Frontend (Next.js catalog pages), Backend (GraphQL product API), Database (optimized product models)
3. **Tasks**: 15 development tasks across frontend, backend, and integration workstreams
4. **JIRA Integration**: 1 epic, 4 stories, 15 tasks with proper estimation and assignment

### Service Integration Example  
```bash
spec-workflow Integrate Twilio SMS notifications for order updates and marketing
```

**Generated Workflow:**
1. **Specification**: SMS integration with order lifecycle and marketing campaigns
2. **Planning**: Webhook handling, message templating, compliance requirements
3. **Tasks**: API integration, webhook endpoints, admin panel controls
4. **Quality Gates**: Security review, compliance validation, testing strategy

## Performance and Optimization

### Workflow Performance
- **Specification Caching**: Cache generated specifications for reuse
- **Template Reuse**: Leverage existing patterns and templates
- **Parallel Processing**: Generate specification sections simultaneously
- **Incremental Updates**: Support specification evolution and updates

### Development Efficiency
- **Pattern Recognition**: Identify and reuse common implementation patterns
- **Code Generation**: Generate boilerplate code from specifications
- **Automated Testing**: Generate test skeletons from specifications
- **Documentation Generation**: Create documentation from specifications

## Next Steps Integration

### Development Workflow Continuity
After `spec-workflow` completion:
1. **Review and Approval**: Stakeholder review of complete specification and plan
2. **Team Assignment**: Distribute tasks across development team
3. **Sprint Planning**: Organize tasks into development sprints
4. **Development Execution**: Begin development with `process-todos`
5. **Progress Monitoring**: Use `update-todos` for status tracking and JIRA sync

### Continuous Integration
- **Specification Evolution**: Update specifications as requirements change
- **Plan Adaptation**: Adapt plans based on development insights
- **Task Refinement**: Refine tasks based on implementation experience
- **Quality Feedback**: Incorporate quality feedback into future specifications

## File References and Organization

### Generated File Structure
```
specs/                           # Executable specifications
├── [feature-name]-spec.md
├── [feature-name]-requirements.md
└── [feature-name]-validation.md

plans/                           # Technical implementation plans
├── [feature-name]-plan.md
├── [feature-name]-architecture.md
├── [feature-name]-frontend-plan.md
└── [feature-name]-backend-plan.md

todo/not-started/               # Generated development tasks
└── [feature-epic]/
    ├── epic-overview.md
    └── [story-name]/
        ├── story-plan.md
        └── task-files.md
```

### Integration Points
- **PRD Context**: `docs/PRD.md` - Project requirements and technology stack
- **Mockup Templates**: `mockup/[template]/` - UI/UX baseline patterns
- **JIRA Configuration**: `todo/jira-config/` - Project management integration
- **Agent System**: `.claude/agents/` - Technology-specific guidance and validation