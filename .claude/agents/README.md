# Claude Code Agents

This directory contains specialized AI agents for different aspects of the development workflow.

## Agent Categories

### Architecture & Design
- **[nextjs-architecture-guide.md](nextjs-architecture-guide.md)** - Next.js architecture guidance
- **[express-backend-architect.md](express-backend-architect.md)** - Express.js backend architecture
- **[tailwind-design-system-architect.md](tailwind-design-system-architect.md)** - Tailwind CSS design system
- **[product-design-specialist.md](product-design-specialist.md)** - Product design guidance

### Frontend Development
- **[graphql-apollo-frontend.md](graphql-apollo-frontend.md)** - Apollo Client GraphQL frontend
- **[typescript-frontend-enforcer.md](typescript-frontend-enforcer.md)** - TypeScript frontend standards
- **[shadcn-ui-specialist.md](shadcn-ui-specialist.md)** - Shadcn/UI component specialist
- **[redux-persist-state-manager.md](redux-persist-state-manager.md)** - Redux state management

### Backend Development
- **[graphql-backend-enforcer.md](graphql-backend-enforcer.md)** - GraphQL backend standards
- **[typescript-backend-enforcer.md](typescript-backend-enforcer.md)** - TypeScript backend standards
- **[postgresql-database-architect.md](postgresql-database-architect.md)** - PostgreSQL database design
- **[sequelize-orm-optimizer.md](sequelize-orm-optimizer.md)** - Sequelize ORM optimization

### Testing & Quality
- **[testing-automation.md](testing-automation.md)** - Testing automation strategies
- **[playwright-test-executor.md](playwright-test-executor.md)** - Playwright test execution
- **[code-quality-reviewer.md](code-quality-reviewer.md)** - Code quality review
- **[typescript-bug-fixer.md](typescript-bug-fixer.md)** - TypeScript bug fixing

### DevOps & Infrastructure
- **[aws-cloud-services-orchestrator.md](aws-cloud-services-orchestrator.md)** - AWS services orchestration
- **[docker-port-manager.md](docker-port-manager.md)** - Docker port management
- **[mcp-server-manager.md](mcp-server-manager.md)** - MCP server management
- **[nodejs-runtime-optimizer.md](nodejs-runtime-optimizer.md)** - Node.js runtime optimization

### Integrations & Services
- **[clerk-auth-enforcer.md](clerk-auth-enforcer.md)** - Clerk authentication
- **[stripe-connect-specialist.md](stripe-connect-specialist.md)** - Stripe payment processing
- **[twilio-flex-communication-manager.md](twilio-flex-communication-manager.md)** - Twilio communication
- **[shippo-shipping-integration.md](shippo-shipping-integration.md)** - Shippo shipping integration
- **[google-analytics-implementation-specialist.md](google-analytics-implementation-specialist.md)** - Google Analytics setup

### Development Tools
- **[chrome-mcp-agent.md](chrome-mcp-agent.md)** - Chrome MCP integration
- **[playwright-mcp-agent.md](playwright-mcp-agent.md)** - Playwright MCP integration
- **[browserstack-mcp-agent.md](browserstack-mcp-agent.md)** - BrowserStack MCP integration
- **[ui-mockup-converter.md](ui-mockup-converter.md)** - UI mockup conversion

### Project Management
- **[multi-agent-orchestrator.md](multi-agent-orchestrator.md)** - Multi-agent coordination
- **[plan-mode-orchestrator.md](plan-mode-orchestrator.md)** - Planning mode coordination
- **[project-management-bridge.md](project-management-bridge.md)** - Project management integration
- **[business-analyst-bridge.md](business-analyst-bridge.md)** - Business analysis bridge

### Documentation & Communication
- **[claude-context-documenter.md](claude-context-documenter.md)** - Context documentation
- **[git-commit-docs-manager.md](git-commit-docs-manager.md)** - Git commit documentation
- **[slack-bot-notification-manager.md](slack-bot-notification-manager.md)** - Slack notifications
- **[i18n-manager.md](i18n-manager.md)** - Internationalization management

### Troubleshooting & Support
- **[app-troubleshooter.md](app-troubleshooter.md)** - Application troubleshooting
- **[graphql-bug-fixer.md](graphql-bug-fixer.md)** - GraphQL bug fixing
- **[boilerplate-update-manager.md](boilerplate-update-manager.md)** - Boilerplate updates

## Agent Usage

### Individual Agent Usage
Each agent can be invoked individually for specific tasks:

```bash
# Architecture guidance
@nextjs-architecture-guide help with Next.js 16 migration

# Frontend development
@typescript-frontend-enforcer review this React component

# Backend development
@graphql-backend-enforcer optimize this resolver

# Testing
@playwright-test-executor create E2E tests for login flow
```

### Multi-Agent Collaboration
Agents can work together on complex tasks:

```bash
# Full feature development
@multi-agent-orchestrator develop user authentication feature
- @nextjs-architecture-guide: Frontend architecture
- @express-backend-architect: Backend API design
- @postgresql-database-architect: Database schema
- @testing-automation: Test coverage
```

### Agent Specialization
Each agent has specific expertise areas:

- **Frontend**: React, Next.js, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Express.js, GraphQL, PostgreSQL, Sequelize
- **DevOps**: AWS, Docker, MCP servers
- **Testing**: Playwright, Jest, E2E testing
- **Integrations**: Stripe, Clerk, Twilio, Google Analytics

## Agent Development

### Creating New Agents
1. Create a new markdown file in this directory
2. Follow the agent template structure
3. Define clear responsibilities and capabilities
4. Include usage examples
5. Update this README

### Agent Template Structure
```markdown
# Agent Name

**Purpose**: Clear description of agent's role
**Context**: When and why to use this agent
**Capabilities**: Specific skills and knowledge
**Usage Examples**: How to invoke the agent
**Integration**: How it works with other agents
```

## Agent Coordination

### Orchestration Patterns
- **Sequential**: Agents work in sequence (A → B → C)
- **Parallel**: Agents work simultaneously on different aspects
- **Hierarchical**: Lead agent coordinates specialized agents
- **Collaborative**: Agents share context and iterate together

### Communication Protocols
- **Context Sharing**: Agents pass relevant context between tasks
- **Result Aggregation**: Combine outputs from multiple agents
- **Conflict Resolution**: Handle conflicting recommendations
- **Quality Assurance**: Cross-agent validation and review

---
*This index is automatically maintained by the organize-docs command.*