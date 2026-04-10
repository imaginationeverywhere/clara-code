---
name: federation
description: Implement GraphQL federation and microservices architecture including subgraph design, gateway configuration, and distributed data management. Use when building federated GraphQL APIs, microservices with Apollo Federation, or distributed backend systems. Triggers on requests for GraphQL federation, subgraph architecture, API gateway, or microservices coordination.
---

# GraphQL Federation Skills

## Overview

Production-ready patterns for GraphQL federation and microservices:
- **Subgraph design** with entity ownership and boundaries
- **Gateway configuration** with Apollo Router
- **Distributed data** with entity resolution and references
- **Performance optimization** with query planning and batching

## Available Skills

### federation-gateway-standard.md
Apollo Gateway setup with:
- Router configuration
- Subgraph composition
- Query planning optimization
- Error handling and fallbacks
- Health checks and monitoring

### federation-subgraph-standard.md
Subgraph implementation with:
- Entity definitions and keys
- Reference resolvers
- External fields and directives
- Type ownership patterns
- Testing federated queries

### federation-entities-standard.md
Entity management with:
- Entity ownership boundaries
- Cross-subgraph references
- @key and @external directives
- Entity resolution strategies
- N+1 prevention with DataLoader

### federation-deployment-standard.md
Production deployment with:
- Blue-green deployments
- Schema registry management
- Breaking change detection
- Rollback strategies
- Multi-region configuration

## Implementation Workflow

1. **Design boundaries** - Identify domain services and entity ownership
2. **Create subgraphs** - Build individual GraphQL services
3. **Configure gateway** - Set up Apollo Router with composition
4. **Implement entities** - Add @key directives and resolvers
5. **Deploy and monitor** - Production deployment with observability

## Technology Stack

- **Gateway:** Apollo Router / Apollo Gateway
- **Subgraphs:** Apollo Server with @apollo/subgraph
- **Registry:** Apollo Studio / GraphOS
- **Monitoring:** Apollo Studio, Datadog, New Relic
- **Deployment:** Docker, Kubernetes, AWS ECS
