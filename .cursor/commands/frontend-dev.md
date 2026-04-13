# Frontend-Dev - Comprehensive Frontend Development Orchestration

Orchestrated multi-agent command for frontend development across the entire Next.js 16 + React 19 stack. This command coordinates specialized agents to handle modern App Router patterns, UI component implementation, internationalization, mockup conversion, GraphQL integration, TypeScript type safety, and state management with production-grade best practices.

## Agent Coordination

This command uses the **multi-agent-orchestrator** to coordinate eight specialized frontend agents:

1. **nextjs-architecture-guide**: Next.js 16 App Router, Server/Client Components, performance optimization
2. **shadcn-ui-specialist**: ShadCN UI component library, accessibility, form handling with react-hook-form
3. **i18n-manager**: Internationalization, localization, multi-language support, RTL layouts
4. **ui-mockup-converter**: Convert visual designs/screenshots/mockups to functional Next.js code
5. **graphql-apollo-frontend**: Apollo Client, GraphQL queries/mutations, caching strategies, SSR integration
6. **typescript-frontend-enforcer**: Type-safe frontend development, strict type checking, interface definitions
7. **redux-persist-state-manager**: Redux state management, persistence across sessions, SSR hydration
8. **chrome-ui-debugger**: Live browser debugging, visual comparison, performance analysis, screenshot capture

The orchestrator intelligently coordinates these agents to provide comprehensive frontend development capabilities from mockup to production deployment on AWS Amplify, with live browser verification using Claude-in-Chrome.

## When to Use This Command

Use `/frontend-dev` when you need to:
- Implement Next.js 16 pages with App Router patterns
- Build accessible UI components with ShadCN UI
- Convert mockups or designs to functional React components
- Implement multi-language internationalization
- Integrate GraphQL queries and mutations with Apollo Client
- Create type-safe frontend code with TypeScript
- Implement persistent state management with Redux
- Optimize performance with Server Components and streaming SSR
- Deploy to AWS Amplify with proper build configuration

## Command Usage

### Full-Stack Frontend Feature
```bash
/frontend-dev "Implement product listing page with search and filtering"
# Orchestrator activates ALL frontend agents in coordinated sequence:
# 1. ui-mockup-converter: Convert mockup to component structure
# 2. nextjs-architecture-guide: App Router page and layout design
# 3. shadcn-ui-specialist: Accessible UI components
# 4. graphql-apollo-frontend: Product queries with caching
# 5. typescript-frontend-enforcer: Type-safe implementation
# 6. redux-persist-state-manager: Filter state persistence
# 7. i18n-manager: Multi-language product descriptions
```

### Mockup to Code Conversion
```bash
/frontend-dev --mockup "path/to/checkout-design.png"
# Orchestrator activates:
# - ui-mockup-converter: Pixel-perfect component conversion
# - shadcn-ui-specialist: Accessible form components
# - typescript-frontend-enforcer: Type definitions
# - nextjs-architecture-guide: Proper component architecture
```

### Internationalization
```bash
/frontend-dev --i18n "Add Spanish and French language support"
# Orchestrator activates:
# - i18n-manager: Translation file setup and locale routing
# - nextjs-architecture-guide: App Router i18n integration
# - typescript-frontend-enforcer: Type-safe translation keys
```

### GraphQL Integration
```bash
/frontend-dev --graphql "Implement user profile with mutations"
# Orchestrator activates:
# - graphql-apollo-frontend: Apollo Client setup and queries
# - typescript-frontend-enforcer: Generated GraphQL types
# - redux-persist-state-manager: Cache user data locally
# - shadcn-ui-specialist: Form components with validation
```

### State Management
```bash
/frontend-dev --state "Implement shopping cart with persistence"
# Orchestrator activates:
# - redux-persist-state-manager: Redux setup with persistence
# - typescript-frontend-enforcer: Type-safe Redux patterns
# - nextjs-architecture-guide: SSR hydration handling
```

### Component Library
```bash
/frontend-dev --components "Build design system with ShadCN components"
# Orchestrator activates:
# - shadcn-ui-specialist: Component installation and customization
# - typescript-frontend-enforcer: Component prop type definitions
# - i18n-manager: Translatable component text
# - nextjs-architecture-guide: Component organization patterns
```

### Performance Optimization
```bash
/frontend-dev --optimize "Optimize page load time and Core Web Vitals"
# Orchestrator activates:
# - nextjs-architecture-guide: Server Component optimization
# - graphql-apollo-frontend: Query optimization and caching
# - redux-persist-state-manager: State hydration optimization
# - chrome-ui-debugger: Live Core Web Vitals measurement
```

### Live Browser Debugging
```bash
/frontend-dev --chrome "Debug slow page load on product listing"
# Orchestrator activates:
# - chrome-ui-debugger: Opens page in Chrome, captures metrics
# - nextjs-architecture-guide: Identifies optimization opportunities
# - graphql-apollo-frontend: Analyzes network waterfall
# - typescript-frontend-enforcer: Validates component structure
```

### Visual Comparison Across Environments
```bash
/frontend-dev --compare "Compare checkout page local vs production"
# Orchestrator activates:
# - chrome-ui-debugger: Side-by-side comparison across environments
# - Captures screenshots of local, develop, production
# - Generates performance comparison table
# - Identifies visual regressions
```

## Frontend Development Workflows

### 1. Next.js 16 App Router Development
Modern App Router patterns with React 19:
- **Server Components**: Default for data fetching and static content
- **Client Components**: Strategic use for interactivity
- **Streaming SSR**: Progressive page rendering
- **Parallel Routes**: Simultaneous route rendering
- **Intercepting Routes**: Modal and overlay patterns
- **Route Handlers**: API routes with full TypeScript support

### 2. Component-Driven Development
Accessible, reusable component architecture:
- **ShadCN UI Integration**: Production-ready accessible components
- **Component Composition**: Atomic design principles
- **Accessibility**: WCAG 2.1 AA compliance by default
- **Form Handling**: react-hook-form with Zod validation
- **Responsive Design**: Mobile-first with Tailwind CSS

### 3. Type-Safe Frontend Development
TypeScript enforcement across the frontend:
- **Strict Type Checking**: No implicit any, strict null checks
- **GraphQL Type Generation**: Automatic types from schema
- **Component Props**: Proper type definitions for all props
- **API Contracts**: Type-safe API client integration
- **State Types**: Redux state and action type safety

### 4. GraphQL-First Data Layer
Apollo Client integration with Next.js:
- **Server-Side Rendering**: GraphQL queries in Server Components
- **Client-Side Queries**: Optimistic updates and caching
- **Mutation Handling**: Type-safe mutations with error handling
- **Cache Management**: Normalized cache with proper policies
- **Subscription Support**: Real-time data with WebSocket

### 5. Internationalization (i18n)
Multi-language support with Next.js App Router:
- **Locale Routing**: /en, /es, /fr route structure
- **Translation Management**: JSON translation files
- **RTL Support**: Right-to-left language layouts
- **Number/Date Formatting**: Locale-specific formatting
- **SEO Optimization**: Proper hreflang tags

### 6. State Management with Persistence
Redux Persist integration with Next.js SSR:
- **Cart Persistence**: Shopping cart survives page refresh
- **User Preferences**: Theme, language, settings persistence
- **Form Auto-Save**: Draft state preservation
- **SSR Hydration**: Proper state rehydration on server
- **Storage Strategy**: localStorage with encryption for sensitive data

## Integration with Development Workflow

### With Process-Todos
```bash
# Frontend development tasks from todo system
/process-todos --workspace=frontend
# Automatically applies frontend-dev agent coordination
```

### With Plan-Design
```bash
# After creating UX designs
/plan-design --design "Design accessible checkout flow"
# Then implement with:
/frontend-dev "Implement checkout from design PROJ-200"
```

### With Backend-Dev
```bash
# Coordinate with backend implementation
/backend-dev "Create order GraphQL API"
/frontend-dev "Integrate order GraphQL queries and mutations"
```

### With Debug-Fix
```bash
# When frontend issues occur
/debug-fix --typescript "Type error in Apollo Client hooks"
# Then fix with:
/frontend-dev "Fix Apollo Client TypeScript integration"
```

### With Deploy-Ops
```bash
# After frontend implementation
/frontend-dev "Complete product catalog page"
# Then deploy with:
/deploy-ops --frontend "Deploy to AWS Amplify staging"
```

## Advanced Frontend Features

### Server Component Patterns
```bash
/frontend-dev --server-components "Optimize data fetching with Server Components"
# Orchestrator coordinates:
# - nextjs-architecture-guide: Server Component architecture
# - graphql-apollo-frontend: Server-side GraphQL queries
# - typescript-frontend-enforcer: Async component types
```

### Client Component Interactivity
```bash
/frontend-dev --client-components "Add interactive features with Client Components"
# Orchestrator coordinates:
# - nextjs-architecture-guide: "use client" directive patterns
# - redux-persist-state-manager: Client-side state management
# - shadcn-ui-specialist: Interactive UI components
```

### Real-Time Features
```bash
/frontend-dev --realtime "Implement real-time notifications with GraphQL subscriptions"
# Orchestrator coordinates:
# - graphql-apollo-frontend: WebSocket subscription setup
# - nextjs-architecture-guide: Client Component for subscriptions
# - shadcn-ui-specialist: Toast notifications UI
```

### Progressive Web App (PWA)
```bash
/frontend-dev --pwa "Convert application to Progressive Web App"
# Orchestrator coordinates:
# - nextjs-architecture-guide: Service worker and manifest setup
# - redux-persist-state-manager: Offline data persistence
# - shadcn-ui-specialist: Install prompt UI
```

### Advanced Animations
```bash
/frontend-dev --animations "Implement smooth page transitions and micro-interactions"
# Orchestrator coordinates:
# - nextjs-architecture-guide: View Transitions API integration
# - shadcn-ui-specialist: Framer Motion animations
# - typescript-frontend-enforcer: Animation type definitions
```

## Critical Patterns and Best Practices

### Server vs Client Components
```typescript
// Server Component (default) - No "use client" needed
async function ProductList() {
  const products = await fetchProducts(); // Direct async/await
  return <div>{products.map(p => <ProductCard key={p.id} {...p} />)}</div>;
}

// Client Component - Requires "use client"
'use client';
function AddToCartButton({ productId }: { productId: string }) {
  const dispatch = useDispatch(); // Hooks require client component
  return <button onClick={() => dispatch(addToCart(productId))}>Add to Cart</button>;
}
```

### GraphQL Type Safety
```typescript
// Enforced by graphql-apollo-frontend + typescript-frontend-enforcer
import { gql, useQuery } from '@apollo/client';
import { GetProductsQuery, GetProductsQueryVariables } from '@/graphql/generated';

const GET_PRODUCTS = gql`
  query GetProducts($category: String!) {
    products(category: $category) {
      id
      name
      price
    }
  }
`;

const { data, loading } = useQuery<GetProductsQuery, GetProductsQueryVariables>(
  GET_PRODUCTS,
  { variables: { category: 'electronics' } }
);
```

### Accessibility Compliance
```typescript
// Enforced by shadcn-ui-specialist
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// All ShadCN components include proper ARIA attributes
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" aria-required="true" />
<Button aria-label="Submit form">Submit</Button>
```

## Performance Optimization

### Image Optimization
```bash
/frontend-dev --images "Optimize product images with Next.js Image component"
# nextjs-architecture-guide ensures proper Image usage
# Automatic WebP conversion, lazy loading, responsive srcset
```

### Code Splitting
```bash
/frontend-dev --code-splitting "Implement dynamic imports for heavy components"
# nextjs-architecture-guide enforces proper dynamic() usage
# Reduces initial bundle size
```

### Caching Strategies
```bash
/frontend-dev --caching "Implement optimal caching for static and dynamic content"
# Orchestrator coordinates:
# - nextjs-architecture-guide: Route segment caching
# - graphql-apollo-frontend: Apollo Client cache policies
# - redux-persist-state-manager: Local storage caching
```

## Mockup Template Integration

The orchestrator automatically applies mockup template context:
- **Retail Template**: Product catalogs, cart, checkout
- **Booking Template**: Calendar, appointment scheduling
- **Property Rental Template**: Listings, search, booking
- **Restaurant Template**: Menu, reservations, ordering
- **Custom Template**: User-provided designs in mockup/custom/

## AWS Amplify Deployment Context

The orchestrator automatically applies AWS Amplify context:
- **Build Configuration**: Optimized amplify.yml for monorepo
- **Environment Variables**: Proper env var configuration
- **Domain Management**: Custom domain setup with SSL
- **Branch Deployments**: Staging and production branches
- **Performance Monitoring**: CloudWatch integration

## Prerequisites

This command benefits from:
- **PRD Context**: `docs/PRD.md` provides frontend architecture standards
- **Mockup Template**: Selected UI/UX baseline for development
- **GraphQL Schema**: Backend GraphQL API documentation
- **AWS Amplify Access**: Deployment configuration and credentials
- **Design Assets**: Mockups, screenshots, or design system documentation

## Multi-Agent Orchestrator Benefits

The orchestrator provides:
- **Full-Stack Coordination**: Coordinates all layers from mockup to deployment
- **Type Safety Enforcement**: Ensures TypeScript standards across frontend
- **Accessibility Compliance**: Automatic WCAG 2.1 AA validation
- **Performance Optimization**: Automatic Core Web Vitals optimization
- **i18n Integration**: Seamless multi-language support
- **Efficient Context Usage**: Only loads relevant agent contexts when needed

## Best Practices

### Provide Clear Requirements
```bash
# Good - comprehensive frontend requirements
/frontend-dev "Implement user dashboard with:
- Server Component for user data fetching
- Client Components for interactive widgets
- Real-time notifications with GraphQL subscriptions
- Persistent dashboard layout preferences
- Mobile-responsive design with ShadCN UI
- Multi-language support (English, Spanish, French)"

# Less helpful - too vague
/frontend-dev "Build dashboard"
```

### Specify Design References
```bash
# Excellent - includes design context
/frontend-dev --mockup "mockup/retail/product-page.png" "
Implement product detail page matching mockup:
- Image gallery with zoom
- Add to cart with quantity selector
- Product reviews section
- Related products carousel"
```

### Include Accessibility Requirements
```bash
# Very helpful - clarifies accessibility needs
/frontend-dev "Shopping cart page with:
- WCAG 2.1 AA compliance
- Screen reader optimized
- Keyboard navigation support
- ARIA live regions for cart updates
- Focus management for modals"
```

## Output and Deliverables

### Component Implementation
- Next.js 16 page and layout components
- Reusable UI components with ShadCN
- Type-safe component prop interfaces
- Accessibility-compliant markup
- Responsive styling with Tailwind

### GraphQL Integration
- Apollo Client configuration
- Type-safe query and mutation hooks
- Generated TypeScript types from schema
- Optimized caching strategies
- Error handling patterns

### Internationalization
- Translation JSON files per locale
- Locale routing configuration
- RTL layout support
- Locale-specific formatting utilities

### State Management
- Redux store configuration
- Persist configuration for localStorage
- Type-safe action creators and reducers
- SSR hydration handling

### Deployment Configuration
- AWS Amplify amplify.yml
- Environment variable configuration
- Build optimization settings
- Domain and SSL setup

## Chrome Browser Integration

The frontend-dev command integrates with Claude-in-Chrome for live browser debugging:

### Available Chrome MCP Tools
- **tabs_context_mcp**: Get current browser tab context
- **navigate**: Navigate to URLs across environments
- **computer**: Take screenshots, interact with page elements
- **read_page**: Get accessibility tree and DOM structure
- **read_network_requests**: Analyze network waterfall
- **read_console_messages**: Monitor console output
- **javascript_tool**: Execute performance measurements
- **gif_creator**: Record debugging sessions

### Chrome Debugging Workflow
```bash
# Step 1: Compare across all environments
/frontend-dev --chrome-compare "/events/my-event"
# Opens local:3000, develop, production in Chrome tabs
# Captures performance metrics and screenshots

# Step 2: Analyze slow page
/frontend-dev --chrome-analyze "/products/category"
# Executes Core Web Vitals measurement
# Identifies slow API calls, large images, render-blocking resources

# Step 3: Fix and verify
/frontend-dev --chrome-verify "/checkout"
# After making fixes locally, compares before/after
# Generates performance improvement report
```

### Environment Configuration
Configure browser debugging in `.claude/config/browser-debug.json`:
```json
{
  "environments": {
    "local": { "baseUrl": "http://localhost:3000" },
    "develop": { "baseUrl": "https://develop.xxx.amplifyapp.com" },
    "production": { "baseUrl": "https://example.com" }
  }
}
```

## Related Commands

- `/process-todos` - Execute frontend tasks from todo system
- `/plan-design` - Create UX designs before implementation
- `/backend-dev` - Coordinate backend API development
- `/debug-fix` - Debug frontend issues when they occur
- `/test-automation` - Comprehensive frontend E2E testing
- `/deploy-ops` - Deploy frontend to AWS Amplify
- `/browser-debug` - Dedicated browser debugging and visual comparison (Vercel Agent Browser + Chrome MCP fallback)

## Emergency Frontend Support

For critical frontend issues:

```bash
/frontend-dev --emergency "Production deployment failing on Amplify"
# Orchestrator activates all agents for rapid diagnosis
# Provides immediate build configuration fixes
# Coordinates hotfix deployment if needed
```
