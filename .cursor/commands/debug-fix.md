# Debug-Fix - Comprehensive Debugging and Bug Resolution

Orchestrated multi-agent command for investigating, diagnosing, and fixing bugs across your entire technology stack. This command coordinates specialized debugging agents to provide comprehensive troubleshooting capabilities for TypeScript, GraphQL, and general application issues.

## Agent Coordination

This command uses the **multi-agent-orchestrator** to coordinate three specialized debugging agents:

1. **app-troubleshooter**: Detective work for lost functionality, configuration drift, and performance degradation
2. **typescript-bug-fixer**: TypeScript compilation errors, type issues, and configuration problems
3. **graphql-bug-fixer**: GraphQL schema, resolver, query execution, and performance issues

The orchestrator intelligently routes your debugging request to the appropriate agent(s) based on the nature of the issue.

## When to Use This Command

Use `/debug-fix` when you need to:
- Investigate features that stopped working after recent changes
- Debug TypeScript compilation or type errors
- Resolve GraphQL schema or resolver issues
- Diagnose performance degradation or errors
- Fix configuration drift or environment issues
- Troubleshoot broken functionality with unknown root cause
- Analyze and resolve N+1 query problems
- Debug cross-cutting issues affecting multiple parts of the stack

## Command Usage

### Basic Debugging
```bash
/debug-fix "User authentication stopped working after deployment"
# Orchestrator activates app-troubleshooter to investigate regression
```

### TypeScript Errors
```bash
/debug-fix --typescript "Type error in GraphQL resolvers"
# Orchestrator activates typescript-bug-fixer for type issue resolution
```

### GraphQL Issues
```bash
/debug-fix --graphql "Cannot return null for non-nullable field errors"
# Orchestrator activates graphql-bug-fixer for schema/resolver debugging
```

### Performance Issues
```bash
/debug-fix --profile "Checkout API endpoint is 10x slower than last week"
# Orchestrator activates app-troubleshooter for performance analysis
# May coordinate with graphql-bug-fixer if N+1 queries detected
```

### Configuration Problems
```bash
/debug-fix --config "Staging environment works but production throws errors"
# Orchestrator activates app-troubleshooter for environment comparison
```

### Multi-Agent Coordination
```bash
/debug-fix "GraphQL queries failing with TypeScript type errors"
# Orchestrator activates BOTH graphql-bug-fixer AND typescript-bug-fixer
# Coordinates resolution across both issue types
```

## Debugging Workflows

### 1. Regression Investigation
When functionality that was previously working has stopped:
- Analyzes git history to identify changes
- Compares current state with known good state
- Identifies configuration drift
- Provides restoration strategies

### 2. TypeScript Debugging
When TypeScript compilation or type errors occur:
- Analyzes TypeScript configuration and dependencies
- Diagnoses type mismatches and conflicts
- Resolves module resolution issues
- Fixes build pipeline problems

### 3. GraphQL Debugging
When GraphQL operations fail or perform poorly:
- Analyzes schema definitions and resolvers
- Identifies N+1 query problems
- Debugs query execution issues
- Optimizes resolver performance

### 4. Performance Profiling
When application performance has degraded:
- Collects performance metrics
- Identifies bottlenecks
- Analyzes database query performance
- Provides optimization recommendations

### 5. Environment Debugging
When behavior differs across environments:
- Compares environment configurations
- Identifies missing or incorrect environment variables
- Validates deployment configurations
- Ensures consistency across environments

## Integration with Development Workflow

### With Process-Todos
```bash
# When a task encounters errors during implementation
/process-todos --task=AUTH-123
# If errors occur:
/debug-fix "Authentication middleware throwing JWT errors"
# Then continue:
/process-todos --task=AUTH-123 --continue
```

### With Git Workflow
```bash
# After identifying the problematic commit
/debug-fix "Feature broke between commit abc123 and def456"
# Orchestrator performs git bisect-style investigation
```

### With Testing
```bash
# When tests fail unexpectedly
/debug-fix "E2E tests failing in CI but passing locally"
# Orchestrator investigates environment differences
```

## Advanced Debugging Features

### Multi-Layer Analysis
The orchestrator coordinates agents to analyze issues across multiple layers:
- **Frontend**: React/Next.js component errors, hydration issues
- **GraphQL**: Query execution, caching, schema problems
- **Backend**: Express middleware, database queries, API errors
- **Infrastructure**: Deployment, environment, configuration issues

### Intelligent Agent Selection
The orchestrator automatically determines which agents to activate based on:
- Error message patterns
- File types involved
- Stack traces
- User-provided context

### Coordinated Resolution
When issues span multiple domains, the orchestrator:
- Activates multiple agents simultaneously
- Coordinates findings across agents
- Provides unified resolution strategy
- Ensures fixes don't introduce new issues

## Output and Reporting

### Investigation Report
- **Root Cause**: Identified source of the problem
- **Impact Analysis**: Affected functionality and users
- **Resolution Strategy**: Step-by-step fix approach
- **Prevention Recommendations**: How to avoid similar issues

### Fix Validation
- **Automated Testing**: Runs relevant tests to validate fixes
- **Manual Verification**: Provides checklist for manual testing
- **Rollback Plan**: Safety measures if fix causes issues

### Documentation Updates
- **CHANGELOG.md**: Automatic entry for bug fix
- **Technical Docs**: Updates if configuration changes required
- **Troubleshooting Guide**: Adds solution to common issues

## Best Practices

### Provide Context
```bash
# Good - provides specific context
/debug-fix "User login failing with 'Invalid token' error after deploying PR #456"

# Less helpful - too vague
/debug-fix "Login is broken"
```

### Include Error Messages
```bash
# Excellent - includes actual error
/debug-fix "GraphQL error: Cannot return null for non-nullable field 'user.email'"

# Better if you include full stack trace
```

### Specify When It Broke
```bash
# Very helpful - narrows investigation scope
/debug-fix "Checkout flow worked yesterday, broke after merging payment refactor"
```

### Describe Expected vs Actual
```bash
# Comprehensive description
/debug-fix "Expected: Cart total updates when quantity changes.
Actual: Cart total remains stale until page refresh.
Started after Redux Persist upgrade."
```

## Limitations and Constraints

- **Historical Data**: Can only analyze code and commits in git history
- **External Dependencies**: May not identify issues in third-party services
- **Concurrent Changes**: Multiple simultaneous changes complicate root cause analysis
- **Incomplete Logging**: Limited debugging if logging is insufficient

## Related Commands

- `/process-todos` - Continue development after debugging is complete
- `/test-automation` - Run comprehensive tests after fixes
- `/git-commit-docs-command` - Document bug fixes with proper changelog
- `/frontend-dev` - Frontend-specific development after debugging
- `/backend-dev` - Backend-specific development after debugging

## Emergency Debugging

For critical production issues:

```bash
/debug-fix --priority=critical --production "Payment processing failing in production"
# Orchestrator prioritizes fastest resolution path
# Coordinates all relevant agents simultaneously
# Provides immediate rollback strategy if needed
```

## Preventive Debugging

Run proactive checks to catch issues before they cause problems:

```bash
/debug-fix --audit --check-all
# Runs comprehensive health checks across the stack
# Identifies potential issues before they manifest
# Provides preventive maintenance recommendations
```

## Prerequisites

This command benefits from:
- **PRD Context**: `docs/PRD.md` provides system architecture understanding
- **Git History**: Clean commit history aids regression investigation
- **Test Coverage**: Tests help validate fixes
- **Logging**: Comprehensive logging aids debugging
- **Documentation**: Up-to-date docs help identify configuration drift

## Multi-Agent Orchestrator Benefits

The orchestrator provides:
- **Intelligent Routing**: Automatically selects appropriate debugging agents
- **Parallel Investigation**: Multiple agents can investigate simultaneously
- **Coordinated Resolution**: Ensures fixes across multiple domains are compatible
- **Comprehensive Analysis**: Leverages specialized knowledge from all debugging agents
- **Efficient Context Usage**: Only loads relevant agent contexts when needed
