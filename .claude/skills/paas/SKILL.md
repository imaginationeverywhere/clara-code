---
name: paas
description: Implement platform-as-a-service patterns including multi-tenant architecture, white-label solutions, API marketplaces, and platform monetization. Use when building SaaS platforms, white-label products, API services, or developer platforms. Triggers on requests for multi-tenant systems, white-label configuration, API monetization, or platform administration.
---

# Platform-as-a-Service (PaaS) Skills

## Overview

Production-ready patterns for platform-as-a-service systems:
- **Multi-tenant architecture** with data isolation and scaling
- **White-label solutions** with customizable branding
- **API marketplace** with developer portals and rate limiting
- **Platform monetization** with subscriptions and usage-based billing

## Available Skills

### paas-multitenancy-standard.md
Multi-tenant architecture with:
- Database isolation strategies
- Tenant provisioning workflows
- Resource allocation and limits
- Cross-tenant security
- Tenant-specific customizations

### paas-whitelabel-standard.md
White-label configuration with:
- Custom domain mapping
- Brand theming system
- Email template customization
- Feature flag management
- Partner portal administration

### paas-api-marketplace-standard.md
API marketplace with:
- Developer portal and documentation
- API key management
- Rate limiting and quotas
- Usage analytics
- Sandbox environments

### paas-monetization-standard.md
Platform monetization with:
- Subscription plan management
- Usage-based billing
- Metering and tracking
- Invoice generation
- Revenue sharing

## Implementation Workflow

1. **Design tenant model** - Shared vs isolated databases
2. **Build provisioning** - Automated tenant onboarding
3. **Configure branding** - Theme system and customization
4. **Create API layer** - Developer portal and documentation
5. **Set up billing** - Stripe subscriptions and metering

## Technology Stack

- **Frontend:** Next.js 16, React 19, ShadCN UI
- **Backend:** Express.js, Apollo Server, PostgreSQL
- **Payments:** Stripe Billing, Connect for revenue sharing
- **Auth:** Clerk with multi-tenant RBAC
- **Domains:** Custom domain handling with SSL
- **Docs:** Mintlify or ReadMe for API docs
