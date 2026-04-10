# Integrations - Third-Party Service Integration Orchestration

Orchestrated multi-agent command for integrating third-party services into your application. This command coordinates specialized agents to handle shipping, authentication, payments, analytics, notifications, and communication services with production-grade best practices.

## Agent Coordination

This command uses the **multi-agent-orchestrator** to coordinate six specialized integration agents:

1. **shippo-shipping-integration**: Multi-carrier shipping, label generation, tracking, returns management
2. **clerk-auth-enforcer**: Authentication, RBAC, user management, session handling, OAuth providers
3. **stripe-connect-specialist**: Payment processing, marketplace payments, Stripe Connect, subscription billing
4. **google-analytics-implementation-specialist**: GA4 tracking, e-commerce analytics, conversion optimization
5. **slack-bot-notification-manager**: Slack notifications, bot integration, workflow automation
6. **twilio-flex-communication-manager**: SMS, Voice, Video, WhatsApp messaging, multi-tenant communication

The orchestrator intelligently coordinates these agents to provide comprehensive third-party service integration capabilities with proper error handling, security, and monitoring.

## When to Use This Command

Use `/integrations` when you need to:
- Implement shipping and fulfillment with multi-carrier support
- Set up authentication with Clerk and multiple OAuth providers
- Integrate Stripe payments with Connect for marketplaces
- Implement Google Analytics tracking and e-commerce analytics
- Create Slack notification workflows and bot integrations
- Add SMS, Voice, or Video communication with Twilio
- Configure webhooks and event handling for services
- Implement proper error handling and retry logic
- Set up monitoring and alerting for integrations

## Command Usage

### Complete Integration Setup
```bash
/integrations "Set up complete e-commerce integrations"
# Orchestrator activates ALL integration agents in coordinated sequence:
# 1. clerk-auth-enforcer: User authentication and RBAC
# 2. stripe-connect-specialist: Payment processing setup
# 3. shippo-shipping-integration: Shipping and fulfillment
# 4. google-analytics-implementation-specialist: E-commerce tracking
# 5. slack-bot-notification-manager: Order notifications
# 6. twilio-flex-communication-manager: SMS order confirmations
```

### Authentication Integration
```bash
/integrations --auth "Implement Clerk authentication with Google and GitHub OAuth"
# Orchestrator activates:
# - clerk-auth-enforcer: Clerk setup, OAuth providers, RBAC
# - google-analytics-implementation-specialist: User tracking events
```

### Payment Processing
```bash
/integrations --payments "Set up Stripe Connect for marketplace payments"
# Orchestrator activates:
# - stripe-connect-specialist: Connect onboarding workflows
# - clerk-auth-enforcer: Link user accounts with Stripe
# - google-analytics-implementation-specialist: Purchase tracking
# - slack-bot-notification-manager: Payment notifications
```

### Shipping Integration
```bash
/integrations --shipping "Implement multi-carrier shipping with Shippo"
# Orchestrator activates:
# - shippo-shipping-integration: Shippo API, rate shopping, label generation
# - google-analytics-implementation-specialist: Shipping conversion tracking
# - twilio-flex-communication-manager: SMS shipping notifications
```

### Analytics Tracking
```bash
/integrations --analytics "Implement GA4 e-commerce tracking with conversion optimization"
# Orchestrator activates:
# - google-analytics-implementation-specialist: GA4 setup, events, conversions
# - clerk-auth-enforcer: User ID tracking integration
# - stripe-connect-specialist: Revenue tracking integration
```

### Communication Services
```bash
/integrations --communications "Add SMS and email notifications with Twilio"
# Orchestrator activates:
# - twilio-flex-communication-manager: SMS/Email setup
# - slack-bot-notification-manager: Internal team notifications
# - clerk-auth-enforcer: User communication preferences
```

### Webhook Management
```bash
/integrations --webhooks "Set up webhook processing for Stripe and Clerk"
# Orchestrator activates:
# - stripe-connect-specialist: Stripe webhook handling
# - clerk-auth-enforcer: Clerk webhook processing
# - slack-bot-notification-manager: Webhook event alerts
```

## Integration Workflows

### 1. E-Commerce Complete Stack
Full e-commerce platform integration:
- **Authentication**: Clerk with email/OAuth providers
- **Payments**: Stripe Checkout and Connect for sellers
- **Shipping**: Shippo multi-carrier rate shopping and labels
- **Analytics**: GA4 e-commerce tracking with enhanced events
- **Notifications**: Slack for team, SMS/Email for customers

### 2. Marketplace Platform
Multi-vendor marketplace integration:
- **User Management**: Clerk with role-based access (buyer/seller/admin)
- **Seller Onboarding**: Stripe Connect Express/Standard accounts
- **Payment Processing**: Platform fees and split payments
- **Shipping**: Seller-specific shipping configurations
- **Analytics**: Multi-tenant analytics with seller dashboards

### 3. SaaS Application
Software-as-a-Service integration stack:
- **Authentication**: Clerk with SSO and SAML
- **Billing**: Stripe subscriptions with usage-based pricing
- **Analytics**: GA4 with custom SaaS metrics
- **Communication**: Twilio for SMS MFA and alerts
- **Notifications**: Slack for team collaboration

### 4. Service Booking Platform
Appointment and service booking integrations:
- **Authentication**: Clerk with calendar integration
- **Payments**: Stripe with payment intents and refunds
- **Notifications**: SMS reminders via Twilio
- **Analytics**: Conversion tracking for bookings
- **Communication**: Two-way SMS for confirmations

## Integration Best Practices

### Error Handling and Retries
```bash
/integrations --error-handling "Implement robust error handling for all integrations"
# Orchestrator ensures:
# - Exponential backoff retry logic
# - Dead letter queues for failed operations
# - Comprehensive error logging and monitoring
# - Graceful degradation strategies
```

### Webhook Security
```bash
/integrations --webhook-security "Secure webhook endpoints with signature verification"
# Orchestrator implements:
# - Signature verification (Stripe, Clerk, Shippo)
# - IP allowlisting where applicable
# - Idempotency handling
# - Rate limiting and throttling
```

### API Rate Limiting
```bash
/integrations --rate-limiting "Implement rate limiting for third-party API calls"
# Orchestrator configures:
# - Request throttling per service
# - Queue management for batch operations
# - Cache strategies to reduce API calls
# - Monitoring for rate limit warnings
```

### Multi-Environment Configuration
```bash
/integrations --environments "Configure integrations for dev, staging, production"
# Orchestrator sets up:
# - Environment-specific API keys
# - Test mode for development
# - Staging webhooks and endpoints
# - Production monitoring and alerts
```

## Service-Specific Features

### Clerk Authentication
```bash
# Multi-provider OAuth setup
/integrations --clerk-oauth "Add Google, GitHub, Microsoft OAuth providers"

# Role-based access control
/integrations --clerk-rbac "Implement admin, seller, customer roles"

# Custom session management
/integrations --clerk-sessions "Configure session timeout and security"
```

### Stripe Payments
```bash
# Subscription billing
/integrations --stripe-subscriptions "Implement tiered subscription plans"

# Marketplace payments
/integrations --stripe-connect "Set up Connect onboarding for sellers"

# Payment methods
/integrations --stripe-methods "Support cards, ACH, Apple Pay, Google Pay"
```

### Shippo Shipping
```bash
# Multi-carrier integration
/integrations --shippo-carriers "Enable USPS, UPS, FedEx, DHL shipping"

# International shipping
/integrations --shippo-international "Add customs forms and international rates"

# Returns management
/integrations --shippo-returns "Implement return label generation"
```

### Google Analytics
```bash
# E-commerce tracking
/integrations --ga4-ecommerce "Track purchases, cart, checkout events"

# Custom events
/integrations --ga4-custom "Create custom events for SaaS metrics"

# Conversion optimization
/integrations --ga4-conversions "Set up conversion goals and funnels"
```

### Slack Notifications
```bash
# Order notifications
/integrations --slack-orders "Send new order alerts to #orders channel"

# Error monitoring
/integrations --slack-errors "Alert #engineering on critical errors"

# Bot commands
/integrations --slack-bot "Create /order-status bot command"
```

### Twilio Communications
```bash
# SMS notifications
/integrations --twilio-sms "Send order confirmations via SMS"

# Voice calls
/integrations --twilio-voice "Implement customer support calling"

# WhatsApp integration
/integrations --twilio-whatsapp "Add WhatsApp Business messaging"
```

## Integration with Development Workflow

### With Backend-Dev
```bash
# Backend implements API endpoints for integrations
/backend-dev "Create webhook handlers for Stripe and Clerk"
/integrations --webhooks "Configure webhook processing and validation"
```

### With Frontend-Dev
```bash
# Frontend implements UI for integrations
/frontend-dev "Build Clerk authentication UI components"
/integrations --auth "Configure Clerk frontend SDK"
```

### With Deploy-Ops
```bash
# After integration implementation
/integrations "Complete payment and shipping setup"
# Then deploy with:
/deploy-ops "Deploy with integration environment variables"
```

### With Debug-Fix
```bash
# When integration issues occur
/debug-fix "Stripe webhook not processing correctly"
/integrations --fix "Debug Stripe webhook signature verification"
```

## Monitoring and Observability

### Integration Health Checks
```bash
/integrations --health-check "Verify all third-party service connections"
# Orchestrator validates:
# - API key validity
# - Webhook endpoint accessibility
# - Service status and availability
# - Rate limit headroom
```

### Error Tracking
```bash
/integrations --error-tracking "Set up error monitoring for integrations"
# Orchestrator configures:
# - Sentry integration for error tracking
# - Slack alerts for critical failures
# - CloudWatch metrics for AWS services
# - Custom dashboards for integration health
```

### Usage Analytics
```bash
/integrations --usage-analytics "Track integration API usage and costs"
# Orchestrator implements:
# - API call counting and tracking
# - Cost estimation per service
# - Usage trend analysis
# - Budget alerts and notifications
```

## Security and Compliance

### PCI DSS Compliance (Payments)
```bash
/integrations --pci-compliance "Ensure Stripe integration meets PCI DSS"
# Orchestrator validates:
# - No card data storage
# - Stripe.js for secure tokenization
# - HTTPS enforced
# - Webhook signature verification
```

### GDPR Compliance
```bash
/integrations --gdpr "Implement GDPR-compliant data handling"
# Orchestrator ensures:
# - User data export capabilities
# - Right to deletion implementation
# - Consent management
# - Data processing agreements
```

### SOC 2 Compliance
```bash
/integrations --soc2 "Configure integrations for SOC 2 compliance"
# Orchestrator implements:
# - Audit logging for all operations
# - Encryption at rest and in transit
# - Access control and authentication
# - Incident response procedures
```

## Prerequisites

This command benefits from:
- **PRD Context**: `docs/PRD.md` provides integration requirements
- **API Credentials**: Service account credentials for each integration
- **Environment Configuration**: Proper env var setup for all environments
- **Webhook URLs**: Public endpoints for receiving webhooks
- **SSL Certificates**: HTTPS endpoints for secure communication

## Multi-Agent Orchestrator Benefits

The orchestrator provides:
- **Unified Integration**: Coordinates all services for seamless operation
- **Error Coordination**: Cross-service error handling and recovery
- **Security Enforcement**: Consistent security patterns across all integrations
- **Monitoring Integration**: Centralized monitoring and alerting
- **Cost Optimization**: Efficient API usage across all services
- **Efficient Context Usage**: Only loads relevant agent contexts when needed

## Best Practices

### Provide Integration Context
```bash
# Good - comprehensive integration requirements
/integrations "E-commerce platform with:
- Clerk authentication (Google, GitHub OAuth)
- Stripe payments with Connect for marketplace
- Shippo shipping (USPS, UPS, FedEx)
- GA4 e-commerce tracking
- Slack order notifications
- Twilio SMS for confirmations"

# Less helpful - too vague
/integrations "Add payments"
```

### Specify Service Tiers
```bash
# Excellent - clarifies service levels
/integrations --stripe "
Payment processing requirements:
- Stripe Connect Standard for sellers
- Payment Intents API for 3D Secure
- Subscriptions with usage-based billing
- Webhook processing with retries"
```

### Include Compliance Requirements
```bash
# Very helpful - defines compliance needs
/integrations "Payment integration with:
- PCI DSS Level 1 compliance
- GDPR data handling
- SOC 2 audit trail
- Encryption at rest and in transit"
```

## Output and Deliverables

### Integration Documentation
- Service configuration guides
- API credential management
- Webhook endpoint documentation
- Error handling strategies
- Testing procedures

### Code Implementation
- Service client configuration
- Webhook processors with validation
- Error handling and retry logic
- Type-safe API wrappers
- Comprehensive test coverage

### Monitoring Setup
- Health check endpoints
- Error tracking integration
- Usage metrics and dashboards
- Alert configurations
- Incident response procedures

## Related Commands

- `/backend-dev` - Backend implementation for integration APIs
- `/frontend-dev` - Frontend UI for integration features
- `/debug-fix` - Debug integration issues
- `/test-automation` - Test integration workflows
- `/deploy-ops` - Deploy with integration configuration

## Emergency Integration Support

For critical integration failures:

```bash
/integrations --emergency "Stripe webhook processing failing in production"
# Orchestrator activates rapid response mode
# Immediate diagnostic and recovery procedures
# Coordinates with monitoring and alerting
```
