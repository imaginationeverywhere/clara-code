# Plan-Design - Comprehensive Planning & Design Orchestration

Orchestrated multi-agent command for business analysis, requirements gathering, technical planning, and product design. This command coordinates specialized agents to transform business requirements into actionable development plans with proper project management integration.

## Agent Coordination

This command uses the **multi-agent-orchestrator** to coordinate four specialized planning agents:

1. **business-analyst-bridge**: Business requirements analysis, ROI calculation, process optimization
2. **project-management-bridge**: Integration with JIRA, Linear, Asana, and other project management tools
3. **plan-mode-orchestrator**: Technical architecture planning, PRD integration, comprehensive project roadmaps
4. **product-design-specialist**: User-centered design, accessibility, design systems, prototyping

The orchestrator intelligently coordinates these agents to provide comprehensive planning capabilities from business requirements through technical implementation.

## When to Use This Command

Use `/plan-design` when you need to:
- Gather and analyze business requirements for new features
- Create comprehensive project plans with technical architecture
- Design user experiences with accessibility compliance
- Integrate planning with project management tools (JIRA, Linear, Asana, etc.)
- Build business cases with ROI analysis
- Develop design systems and component libraries
- Create product roadmaps with milestone tracking
- Coordinate planning across business, technical, and design domains

## Command Usage

### Business Requirements Analysis
```bash
/plan-design --business "Analyze requirements for multi-tenant SaaS platform"
# Orchestrator activates business-analyst-bridge for comprehensive analysis
# Generates business case, process maps, ROI projections
```

### Technical Planning
```bash
/plan-design --technical "Create implementation plan for payment processing system"
# Orchestrator activates plan-mode-orchestrator for technical architecture
# Applies PRD context, generates detailed implementation roadmap
```

### Product Design
```bash
/plan-design --design "Design accessible checkout flow with screen reader support"
# Orchestrator activates product-design-specialist for UX design
# Creates wireframes, accessibility audit, component specifications
```

### Full Planning Workflow
```bash
/plan-design "Build customer portal with self-service features"
# Orchestrator activates ALL agents in coordinated sequence:
# 1. business-analyst-bridge: Business requirements and ROI
# 2. product-design-specialist: User research and UX design
# 3. plan-mode-orchestrator: Technical architecture and roadmap
# 4. project-management-bridge: JIRA epics/stories creation
```

### Project Management Integration
```bash
/plan-design --pm-tool=jira "Create epic for inventory management system"
# Orchestrator coordinates with project-management-bridge for JIRA integration
# Creates complete epic with story breakdown and acceptance criteria

/plan-design --pm-tool=linear "Sync planning to Linear project"
# Orchestrator integrates with Linear for modern project tracking

/plan-design --pm-tool=asana "Create Asana tasks from implementation plan"
# Orchestrator creates Asana task structure from technical plan
```

### Design System Development
```bash
/plan-design --design-system "Create component library with accessibility standards"
# Orchestrator activates product-design-specialist for design system
# Generates design tokens, component specs, usage guidelines
```

## Planning Workflows

### 1. Business Requirements to Technical Plan
Complete workflow from business needs to implementation roadmap:
- **Phase 1**: Business analysis and requirements gathering
- **Phase 2**: User research and experience design
- **Phase 3**: Technical architecture planning
- **Phase 4**: Project management integration and tracking

### 2. User-Centered Design Process
Design thinking methodology with accessibility focus:
- User research and persona development
- Journey mapping and pain point analysis
- Wireframing and prototyping
- Accessibility auditing (WCAG 2.1 AA compliance)
- Usability testing and iteration

### 3. Technical Architecture Planning
Comprehensive technical planning with PRD integration:
- System architecture design
- Technology stack selection
- Database schema planning
- API design and documentation
- Deployment strategy
- Performance and scalability planning

### 4. Project Management Synchronization
Multi-platform project management integration:
- Epic and story creation across platforms
- Bidirectional synchronization
- Progress tracking and reporting
- Team coordination and dependency management

## Integration with Development Workflow

### With Process-Todos
```bash
# Create comprehensive plan
/plan-design "Build real-time notification system"
# Then execute plan
/process-todos --epic=PROJ-100
```

### With Spec-Kit Integration
```bash
# Create specifications from requirements
/plan-design --specs "Generate executable specifications for auth system"
# Orchestrator integrates with GitHub Spec-Kit methodology
```

### With PRD Context
```bash
# All planning automatically applies PRD.md context
/plan-design "Add multi-language support"
# Orchestrator ensures consistency with existing technology choices
```

## Advanced Planning Features

### Multi-Stakeholder Coordination
The orchestrator coordinates planning across different stakeholder perspectives:
- **Business Stakeholders**: ROI, business value, market positioning
- **Product Owners**: User needs, feature prioritization, roadmap
- **Development Teams**: Technical feasibility, effort estimation, dependencies
- **Design Teams**: UX consistency, accessibility, design system alignment

### Progressive Planning Methodology
Plans are developed iteratively with validation gates:
1. **Discovery**: Requirements gathering and analysis
2. **Design**: User experience and technical architecture
3. **Planning**: Detailed implementation roadmap
4. **Validation**: Stakeholder review and approval
5. **Execution**: Handoff to development with monitoring

### Cross-Domain Coordination
The orchestrator ensures alignment across domains:
- Business requirements inform technical decisions
- Technical constraints shape UX design
- Design specifications guide implementation
- Implementation feedback refines planning

## Output and Deliverables

### Business Analysis Outputs
- Requirements documentation with business context
- Process flow diagrams and optimization recommendations
- ROI calculations and business case documentation
- Stakeholder communication plans

### Product Design Outputs
- User personas and journey maps
- Wireframes and interactive prototypes
- Design system specifications
- Accessibility compliance reports
- Usability test plans and results

### Technical Planning Outputs
- System architecture diagrams
- Database schema designs
- API specifications (GraphQL/REST)
- Deployment architecture
- Performance and scaling strategies
- Implementation roadmaps with milestones

### Project Management Outputs
- Epics with comprehensive descriptions
- User stories with acceptance criteria
- Task breakdown with effort estimates
- Dependency maps and critical paths
- Progress tracking dashboards

## Project Management Platform Support

### JIRA Integration
```bash
/plan-design --pm-tool=jira --project=PROJ
# Complete JIRA integration with:
# - Epic creation with story breakdown
# - Bidirectional synchronization
# - Custom field support
# - Workflow automation
```

### Linear Integration (NEW)
```bash
/plan-design --pm-tool=linear --team=engineering
# Modern Linear integration with:
# - Project and issue creation
# - Cycle planning and tracking
# - GitHub integration
# - Real-time collaboration
```

### Asana Integration (NEW)
```bash
/plan-design --pm-tool=asana --project="Q1 Roadmap"
# Asana project management with:
# - Task hierarchy and dependencies
# - Custom fields and templates
# - Timeline and calendar views
# - Team workload management
```

### GitHub Projects Integration (NEW)
```bash
/plan-design --pm-tool=github --repo=myorg/myrepo
# GitHub-native project management:
# - Issues and pull request tracking
# - Project boards and roadmaps
# - Automation with GitHub Actions
# - Built-in code integration
```

### Multi-Platform Support
```bash
/plan-design --pm-sync=all
# Synchronize planning across multiple platforms
# Maintains consistency across JIRA, Linear, Asana, GitHub
```

## Best Practices

### Provide Clear Context
```bash
# Good - comprehensive context
/plan-design "Build inventory management system for multi-location retail chain
with real-time stock tracking, automated reordering, and supplier integration"

# Less helpful - too vague
/plan-design "Build inventory system"
```

### Specify Stakeholder Priorities
```bash
# Excellent - clarifies priorities
/plan-design --priority=accessibility "Design checkout flow
Primary concern: WCAG 2.1 AA compliance for screen readers
Secondary: Mobile-first responsive design"
```

### Include Business Constraints
```bash
# Very helpful - defines constraints
/plan-design "Payment processing integration
Budget: $50k | Timeline: 8 weeks | Compliance: PCI DSS Level 1"
```

### Leverage PRD Context
```bash
# Command automatically applies PRD.md context
# Ensure docs/PRD.md is complete for optimal planning
```

## Prerequisites

This command benefits from:
- **PRD Context**: `docs/PRD.md` provides project architecture and standards
- **Mockup Templates**: Frontend designs inform UX planning
- **Project Management Access**: API credentials for JIRA/Linear/Asana/GitHub
- **Stakeholder Input**: Clear business requirements and priorities

## Multi-Agent Orchestrator Benefits

The orchestrator provides:
- **Holistic Planning**: Coordinates business, design, and technical perspectives
- **Progressive Refinement**: Iterative planning with validation gates
- **Cross-Domain Alignment**: Ensures consistency across all planning domains
- **Stakeholder Communication**: Translates between business and technical language
- **Efficient Context Usage**: Only loads relevant agent contexts when needed

## Validation and Quality Gates

### Requirements Validation
- Completeness check for business requirements
- Feasibility analysis from technical perspective
- User research validation from design perspective

### Design Validation
- Accessibility compliance verification (WCAG 2.1 AA)
- Usability testing and user feedback
- Design system consistency checks
- Cross-browser and device compatibility

### Technical Validation
- Architecture review and security assessment
- Performance and scalability analysis
- Technology stack compatibility
- Deployment feasibility

### Planning Validation
- Effort estimation accuracy
- Dependency mapping completeness
- Risk identification and mitigation
- Stakeholder alignment confirmation

## Related Commands

- `/process-todos` - Execute implementation from planning
- `/spec-workflow` - Create executable specifications
- `/debug-fix` - Troubleshoot planning or design issues
- `/frontend-dev` - Frontend implementation from designs
- `/backend-dev` - Backend implementation from architecture

## Emergency Planning

For urgent planning needs:

```bash
/plan-design --priority=critical --fast-track "Production incident requires immediate architectural changes"
# Orchestrator prioritizes rapid planning with validation
# Coordinates all agents for accelerated decision-making
```

## Continuous Improvement

Plans are living documents that evolve:

```bash
/plan-design --retrospective --epic=PROJ-100
# Reviews completed work against original plan
# Identifies lessons learned and process improvements
# Updates planning methodology for future work
```
