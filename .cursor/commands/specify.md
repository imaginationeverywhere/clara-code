# specify - Create Executable Specifications

**Integration with GitHub Spec-Kit methodology for intent-driven development**

## Purpose
Transform user requirements into executable specifications that drive the entire development process, integrating with the existing PRD-driven workflow and JIRA project management system.

## Usage
```bash
specify [requirement_description]
```

## Examples
```bash
specify Build a user authentication system with social login
specify Create a product catalog with search and filtering
specify Implement a payment processing system with Stripe
```

## Command Behavior

### 1. Specification Creation Process
The command will:
- **Analyze the requirement** against existing PRD.md context
- **Generate detailed functional specification** using PRD technology stack
- **Create executable specification document** in `specs/` directory
- **Integrate with mockup template** selection (retail/booking/property-rental/restaurant/custom)
- **Validate against security and performance** requirements from PRD

### 2. File Structure Created
```
specs/
├── [feature-name]-spec.md          # Executable specification
├── [feature-name]-requirements.md  # Detailed requirements analysis
└── [feature-name]-validation.md    # Acceptance criteria
```

### 3. Specification Format
Each specification includes:

#### Functional Requirements
- **User Stories**: What users need to accomplish
- **Business Logic**: Core functionality and rules
- **Integration Points**: How it connects with existing systems
- **Data Requirements**: Models, relationships, validation

#### Technical Context
- **Technology Stack**: From PRD.md (Next.js, Express, PostgreSQL, etc.)
- **Authentication**: Clerk integration patterns
- **Database**: Sequelize models and migrations
- **API Design**: GraphQL schema and resolvers

#### UI/UX Specifications
- **Mockup Template Integration**: Uses selected template as baseline
- **Component Structure**: React/Next.js component hierarchy
- **Styling Approach**: Tailwind CSS patterns
- **Responsive Design**: Mobile-first considerations

#### Quality Requirements
- **Security**: Authentication, authorization, data protection
- **Performance**: Loading times, optimization strategies
- **Testing**: Unit, integration, e2e test requirements
- **Accessibility**: WCAG compliance standards

### 4. Integration with Existing Systems

#### PRD Integration
- Reads `docs/PRD.md` for project context
- Validates specification against PRD requirements
- Ensures technology stack consistency
- Applies security and performance standards

#### JIRA Preparation
- Creates epic/story structure outline
- Generates task breakdown suggestions
- Prepares for `create-jira-plan-todo --from-spec` workflow

#### Agent Coordination
- Triggers appropriate sub-agents based on technology stack
- Ensures specifications follow framework-specific patterns
- Validates against security and performance requirements

### 5. Validation and Refinement

#### Specification Review
- **Completeness Check**: All requirements covered
- **Technical Feasibility**: Can be implemented with chosen stack
- **Consistency Validation**: Aligns with existing codebase patterns
- **Security Review**: Meets compliance requirements

#### Interactive Refinement
- **Clarification Prompts**: Ask for missing details
- **Alternative Approaches**: Present implementation options
- **Constraint Validation**: Check against technical limitations
- **Stakeholder Review**: Prepare for team validation

## Advanced Features

### Multi-Phase Development Support

#### 0-to-1 Development
- Generate complete specifications from high-level requirements
- Create comprehensive technical implementation plans
- Establish project structure and architecture

#### Creative Exploration
- Support multiple implementation approaches
- Compare technology stack options
- Prototype different UI/UX approaches

#### Iterative Enhancement
- Extend existing specifications
- Modernize legacy feature requirements
- Plan incremental improvements

### Enterprise Integration

#### Team Collaboration
- **Specification Versioning**: Track changes and approvals
- **Stakeholder Review**: Enable team feedback cycles
- **Implementation Tracking**: Link to development progress

#### Compliance and Governance
- **Security Standards**: Enforce organizational security policies
- **Performance Requirements**: Apply SLA and performance targets
- **Architectural Consistency**: Maintain system coherence

## Implementation Notes

### Technical Implementation
The command uses the existing boilerplate infrastructure:
- **PRD Context Loading**: Reads and parses docs/PRD.md
- **Agent Coordination**: Invokes relevant sub-agents for validation
- **File System Integration**: Creates structured specification documents
- **Template Integration**: Applies mockup template patterns

### Error Handling
- **Missing PRD**: Prompts to create PRD.md first
- **Invalid Requirements**: Request clarification and refinement
- **Technology Conflicts**: Suggest resolution approaches
- **Resource Constraints**: Identify limitations and alternatives

### Performance Optimization
- **Specification Caching**: Store parsed specifications for reuse
- **Template Reuse**: Leverage existing patterns and components
- **Incremental Updates**: Support specification evolution
- **Parallel Processing**: Generate multiple specification sections simultaneously

## Integration Examples

### Example 1: E-commerce Feature
```bash
specify Build a product recommendation engine with machine learning
```

**Generated Specification:**
- Integrates with existing product catalog (from retail mockup template)
- Uses Clerk user data for personalization
- Leverages GraphQL API for data access
- Includes Tailwind CSS styling patterns
- Follows PostgreSQL data modeling standards

### Example 2: Service Booking
```bash
specify Create appointment scheduling with calendar integration
```

**Generated Specification:**
- Uses booking mockup template as UI baseline
- Integrates with Clerk user authentication
- Includes real-time availability checking
- Supports payment processing with Stripe
- Implements notification system with Twilio

## Next Steps

After running `specify`, typical workflow:
1. **Review Generated Specification** - Validate completeness and accuracy
2. **Run `plan`** - Create detailed technical implementation plan
3. **Execute `tasks`** - Break down into actionable development tasks
4. **Use `create-jira-plan-todo --from-spec`** - Create JIRA issues from specification
5. **Begin Development** - Use `process-todos` with specification context

## File References
- **PRD Context**: `docs/PRD.md` - Project requirements and technology stack
- **Mockup Templates**: `mockup/[template]/` - UI/UX baseline patterns
- **Specification Storage**: `specs/` - Generated executable specifications
- **JIRA Integration**: `todo/jira-config/` - Project management connection