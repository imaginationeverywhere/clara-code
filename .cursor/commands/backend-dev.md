# Backend-Dev - Comprehensive Backend Development Orchestration

Orchestrated multi-agent command for backend development across the entire Node.js stack. This command coordinates specialized agents to handle Express.js server architecture, GraphQL API development, TypeScript type safety, database operations, and runtime optimization with production-grade best practices.

## Agent Coordination

This command uses the **multi-agent-orchestrator** to coordinate six specialized backend agents:

1. **express-backend-architect**: Express.js server configuration, middleware, routing, HTTP security
2. **graphql-backend-enforcer**: Apollo Server, schema design, resolver patterns, authentication context
3. **nodejs-runtime-optimizer**: PM2 clustering, memory management, process optimization for shared EC2
4. **typescript-backend-enforcer**: Type-safe API development, strict type checking, backend patterns
5. **sequelize-orm-optimizer**: Database models, migrations, query optimization, relationships
6. **postgresql-database-architect**: Database schema design, indexing, performance tuning, monitoring

The orchestrator intelligently coordinates these agents to provide comprehensive backend development capabilities from API design through production deployment.

## When to Use This Command

Use `/backend-dev` when you need to:
- Implement Express.js API endpoints with proper middleware
- Design and implement GraphQL schemas and resolvers
- Create type-safe backend code with TypeScript
- Optimize Node.js runtime performance for production
- Design database schemas with Sequelize ORM
- Optimize PostgreSQL queries and database performance
- Implement authentication and authorization with Clerk
- Deploy to shared EC2 infrastructure with PM2 clustering
- Set up monitoring and logging for backend services

## Command Usage

### Full-Stack Backend Feature
```bash
/backend-dev "Implement user profile management API"
# Orchestrator activates ALL backend agents in coordinated sequence:
# 1. graphql-backend-enforcer: GraphQL schema and resolver design
# 2. typescript-backend-enforcer: Type-safe resolver implementation
# 3. sequelize-orm-optimizer: User profile database model
# 4. postgresql-database-architect: Database schema and indexing
# 5. express-backend-architect: REST endpoints if needed
# 6. nodejs-runtime-optimizer: Performance optimization validation
```

### GraphQL API Development
```bash
/backend-dev --graphql "Create order management GraphQL API"
# Orchestrator activates:
# - graphql-backend-enforcer: Schema design with authentication
# - typescript-backend-enforcer: Type-safe resolver implementation
# - sequelize-orm-optimizer: Order models and relationships
```

### Database Schema Design
```bash
/backend-dev --database "Design multi-tenant database schema with row-level security"
# Orchestrator activates:
# - postgresql-database-architect: Schema design and RLS policies
# - sequelize-orm-optimizer: ORM models and migrations
# - typescript-backend-enforcer: Type definitions for models
```

### Express Middleware
```bash
/backend-dev --express "Implement rate limiting and CORS middleware"
# Orchestrator activates:
# - express-backend-architect: Middleware implementation
# - typescript-backend-enforcer: Type-safe middleware patterns
# - nodejs-runtime-optimizer: Performance impact analysis
```

### Performance Optimization
```bash
/backend-dev --optimize "Optimize API response times and database queries"
# Orchestrator activates:
# - nodejs-runtime-optimizer: Runtime and memory optimization
# - postgresql-database-architect: Query optimization and indexing
# - graphql-backend-enforcer: N+1 query resolution with DataLoader
# - sequelize-orm-optimizer: ORM query optimization
```

### Production Deployment
```bash
/backend-dev --deploy "Configure PM2 clustering for shared EC2 deployment"
# Orchestrator activates:
# - nodejs-runtime-optimizer: PM2 ecosystem configuration
# - express-backend-architect: Production middleware setup
# - postgresql-database-architect: Connection pooling configuration
```

## Backend Development Workflows

### 1. GraphQL-First API Development
Modern GraphQL API implementation with type safety:
- **Schema Design**: Type-safe GraphQL schema with authentication context
- **Resolver Implementation**: CRITICAL context.auth?.userId pattern enforcement
- **DataLoader Integration**: N+1 query prevention with batching
- **Error Handling**: Structured error responses with proper status codes
- **Authentication**: Clerk integration with JWT validation

### 2. Database-Driven Development
PostgreSQL and Sequelize ORM best practices:
- **Schema Design**: Normalized design with appropriate indexing
- **Migration Management**: Zero-downtime schema evolution
- **Query Optimization**: Efficient queries with proper indexing
- **Connection Pooling**: Optimized database connection management
- **Row-Level Security**: Multi-tenant data isolation

### 3. Type-Safe Backend Development
TypeScript enforcement across the backend:
- **Strict Type Checking**: No implicit any, strict null checks
- **Type-Safe Resolvers**: GraphQL resolver type safety
- **Model Types**: Database model type definitions
- **API Contracts**: Request/response type validation
- **Error Types**: Structured error type definitions

### 4. Production Runtime Optimization
Node.js performance for shared EC2 deployment:
- **PM2 Clustering**: Multi-core utilization with intelligent load balancing
- **Memory Management**: Garbage collection tuning and leak prevention
- **Process Monitoring**: Health checks and automatic restart
- **Port Management**: Dynamic port allocation for shared infrastructure
- **Resource Limits**: CPU and memory constraints per instance

### 5. Express Server Architecture
Production-grade Express.js configuration:
- **Security Middleware**: Helmet, CORS, rate limiting, CSRF protection
- **Error Handling**: Centralized error middleware with proper logging
- **Request Validation**: Input sanitization and validation
- **Health Checks**: Liveness and readiness endpoints
- **Graceful Shutdown**: Clean process termination

## Integration with Development Workflow

### With Process-Todos
```bash
# Backend development tasks from todo system
/process-todos --workspace=backend
# Automatically applies backend-dev agent coordination
```

### With Plan-Design
```bash
# After creating technical architecture
/plan-design --technical "Design payment processing backend"
# Then implement with:
/backend-dev "Implement payment processing from plan PROJ-100"
```

### With Debug-Fix
```bash
# When backend issues occur
/debug-fix --graphql "N+1 query performance issue in user resolver"
# Then optimize with:
/backend-dev --optimize "Implement DataLoader for user relationships"
```

### With Deploy-Ops
```bash
# After backend implementation
/backend-dev "Complete order management API"
# Then deploy with:
/deploy-ops --backend "Deploy order API to staging EC2"
```

## Advanced Backend Features

### Multi-Tenant Architecture
```bash
/backend-dev --multi-tenant "Implement tenant-scoped data access"
# Orchestrator coordinates:
# - postgresql-database-architect: Row-level security policies
# - graphql-backend-enforcer: Tenant context in all resolvers
# - sequelize-orm-optimizer: Tenant-aware query scopes
```

### Real-Time Features
```bash
/backend-dev --realtime "Add GraphQL subscriptions for live updates"
# Orchestrator coordinates:
# - graphql-backend-enforcer: Subscription schema and resolvers
# - nodejs-runtime-optimizer: WebSocket connection management
# - express-backend-architect: WebSocket middleware
```

### Caching Strategy
```bash
/backend-dev --caching "Implement Redis caching for expensive queries"
# Orchestrator coordinates:
# - nodejs-runtime-optimizer: Redis client configuration
# - graphql-backend-enforcer: Resolver-level caching
# - postgresql-database-architect: Cache invalidation strategy
```

### API Versioning
```bash
/backend-dev --versioning "Implement GraphQL API versioning strategy"
# Orchestrator coordinates:
# - graphql-backend-enforcer: Schema versioning approach
# - express-backend-architect: API version routing
# - sequelize-orm-optimizer: Backward-compatible migrations
```

## Critical Security Patterns

### Authentication Enforcement
All backend development MUST enforce authentication:
```typescript
// CRITICAL PATTERN - Enforced by graphql-backend-enforcer
const resolver = async (parent, args, context: Context) => {
  if (!context.auth?.userId) {
    throw new Error('Unauthorized');
  }
  // Resolver implementation
}
```

### Input Validation
All user input MUST be validated:
```typescript
// Enforced by typescript-backend-enforcer
import { z } from 'zod';

const inputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100)
});
```

### SQL Injection Prevention
All database queries use parameterized queries:
```typescript
// Enforced by sequelize-orm-optimizer
const users = await User.findAll({
  where: { email: email } // Parameterized by Sequelize
});
```

## Performance Best Practices

### N+1 Query Prevention
```bash
/backend-dev --dataloader "Implement DataLoader for user relationships"
# Orchestrator ensures N+1 queries are eliminated
# Enforces batching and caching patterns
```

### Database Indexing
```bash
/backend-dev --indexing "Optimize frequently queried fields"
# postgresql-database-architect analyzes query patterns
# Creates appropriate indexes for performance
```

### Connection Pooling
```bash
/backend-dev --pooling "Configure optimal database connection pool"
# Orchestrator optimizes pool size for shared EC2 deployment
# Considers available resources and concurrent requests
```

## Output and Deliverables

### API Documentation
- GraphQL schema with comprehensive descriptions
- Resolver documentation with authentication requirements
- API endpoint documentation
- Example queries and mutations
- Error response documentation

### Database Documentation
- Entity-relationship diagrams
- Schema migration history
- Index optimization reports
- Query performance analysis

### Type Definitions
- Complete TypeScript type coverage
- GraphQL type definitions
- Database model interfaces
- API request/response types

### Deployment Configuration
- PM2 ecosystem configuration
- Environment variable documentation
- Port allocation for shared EC2
- Health check endpoints
- Monitoring and logging setup

## Shared EC2 Deployment Context

The orchestrator automatically applies shared EC2 context:
- **Dynamic Port Allocation**: Uses port-management.sh for conflict-free assignment
- **PM2 Clustering**: Optimized worker count for available resources
- **Resource Constraints**: CPU and memory limits per application
- **Process Isolation**: Separate PM2 ecosystems per project
- **Health Monitoring**: Project-specific health check endpoints

## Prerequisites

This command benefits from:
- **PRD Context**: `docs/PRD.md` provides backend architecture standards
- **Database Access**: PostgreSQL instance configuration
- **Clerk Configuration**: Authentication provider setup
- **EC2 Access**: SSH access to shared deployment server
- **Port Registry**: Available port range for deployment

## Multi-Agent Orchestrator Benefits

The orchestrator provides:
- **Full-Stack Coordination**: Coordinates all layers from GraphQL to PostgreSQL
- **Type Safety Enforcement**: Ensures TypeScript standards across backend
- **Performance Optimization**: Automatic performance analysis and recommendations
- **Security Compliance**: Enforces authentication and authorization patterns
- **Production Readiness**: Validates deployment configuration and monitoring
- **Efficient Context Usage**: Only loads relevant agent contexts when needed

## Best Practices

### Provide Clear Requirements
```bash
# Good - comprehensive backend requirements
/backend-dev "Implement order management API with:
- GraphQL mutations for create/update/cancel orders
- Real-time order status subscriptions
- Integration with payment processing
- Admin analytics queries with filtering
- Multi-tenant data isolation"

# Less helpful - too vague
/backend-dev "Build order API"
```

### Specify Performance Requirements
```bash
# Excellent - defines performance targets
/backend-dev "Optimize user search API
Target: <100ms response time for 10k users
Requirements: Full-text search, autocomplete, pagination"
```

### Include Security Context
```bash
# Very helpful - clarifies security requirements
/backend-dev "Customer data API with:
- Row-level security for multi-tenant isolation
- Clerk authentication required
- RBAC with admin/user/viewer roles
- Audit logging for all mutations"
```

## Related Commands

- `/process-todos` - Execute backend tasks from todo system
- `/plan-design` - Create technical architecture before implementation
- `/debug-fix` - Debug backend issues when they occur
- `/test-automation` - Comprehensive backend API testing
- `/deploy-ops` - Deploy backend to shared EC2 infrastructure
- `/integrations` - Integrate third-party services with backend

## Emergency Backend Support

For critical backend issues:

```bash
/backend-dev --emergency "Production API performance degradation"
# Orchestrator activates all agents for rapid diagnosis
# Provides immediate optimization recommendations
# Coordinates hotfix deployment if needed
```
