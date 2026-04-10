# Vibe Docs - Generate Documentation from Natural Language

**Version:** 1.0.0
**Agent:** vibe-coder
**Category:** documentation

## Purpose

Describe what you want documented in plain English and let Claude generate comprehensive documentation.

## Usage

```bash
/vibe-docs "Document the authentication system"

/vibe-docs "Create API docs for the order endpoints"

/vibe-docs "Explain how the payment processing works"

/vibe-docs "Write a guide for setting up local development"
```

## What Gets Generated

| Doc Type | Description |
|----------|-------------|
| **Technical Docs** | Architecture, data flows, system design |
| **API Docs** | Endpoints, parameters, responses, examples |
| **User Guides** | How-to guides for features |
| **Setup Guides** | Installation and configuration |
| **Code Comments** | Inline documentation for complex code |

## Examples

### Example 1: System Documentation

```bash
/vibe-docs "Document the notification system"
```

**Generated Documentation:**

```markdown
# Notification System

## Overview
The notification system handles user notifications across email, SMS, and in-app channels.

## Architecture
```
User Action → NotificationService → Channel Router → Delivery
                                          ↓
                             [Email | SMS | In-App | Push]
```

## Components
- **NotificationService** - Core orchestration
- **EmailChannel** - SendGrid integration
- **SMSChannel** - Twilio integration
- **InAppChannel** - WebSocket delivery

## Configuration
...

## Examples
...
```

### Example 2: API Documentation

```bash
/vibe-docs "Create API docs for product management"
```

**Generated Documentation:**

```markdown
# Product API

## Queries

### getProducts
Fetch paginated product list.

```graphql
query GetProducts($limit: Int, $offset: Int, $categoryId: ID) {
  products(limit: $limit, offset: $offset, categoryId: $categoryId) {
    nodes {
      id
      name
      price
      inventory
    }
    pageInfo {
      hasNextPage
      totalCount
    }
  }
}
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| limit | Int | No | Items per page (default: 20) |
| offset | Int | No | Pagination offset |
| categoryId | ID | No | Filter by category |

**Response:**
...

## Mutations

### createProduct
...
```

### Example 3: User Guide

```bash
/vibe-docs "Write a guide for managing discounts"
```

**Generated Documentation:**

```markdown
# Managing Discount Codes

## Creating a Discount Code

1. Navigate to **Admin → Marketing → Discounts**
2. Click **Create Discount**
3. Fill in the details:
   - **Code**: The code customers will enter
   - **Type**: Percentage or Fixed Amount
   - **Value**: Discount amount
   - **Minimum Order**: Optional minimum
   - **Expiration**: When the code expires

## Discount Types

### Percentage Discounts
Reduces the order total by a percentage...

### Fixed Amount Discounts
Subtracts a fixed amount...

## Tracking Usage

View discount performance in the Analytics tab...
```

### Example 4: Setup Guide

```bash
/vibe-docs "Document how to set up the development environment"
```

**Generated Documentation:**

```markdown
# Development Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm 8+

## Quick Start

```bash
# Clone the repository
git clone [repo-url]
cd project-name

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations
cd backend && npm run db:migrate

# Start development servers
cd .. && pnpm dev
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection | postgresql://... |
| CLERK_SECRET_KEY | Clerk API key | sk_test_... |
...
```

## Describing Documentation Needs

### Good Descriptions

```bash
# Be specific about audience
/vibe-docs "Write developer docs for the payment integration"

# Specify the format
/vibe-docs "Create a quick reference for GraphQL queries"

# Focus on a problem
/vibe-docs "Document common deployment issues and solutions"
```

### What to Mention

- **Audience** - Developers, users, admins?
- **Purpose** - Reference, tutorial, explanation?
- **Scope** - Specific feature or entire system?
- **Format** - Guide, API docs, README?

## Options

| Flag | Description |
|------|-------------|
| `--format=markdown` | Output format (markdown, html, pdf) |
| `--include-diagrams` | Add Mermaid diagrams |
| `--api-spec` | Generate OpenAPI/GraphQL spec |
| `--update-existing` | Update existing docs |

## Output Locations

| Doc Type | Location |
|----------|----------|
| Technical | `docs/technical/` |
| API | `docs/api/` |
| Guides | `docs/guides/` |
| Admin | `docs/admin/` (syncs to admin panel) |

## Related Commands

- `/vibe` - General vibe coding
- `/generate-docs` - Automated doc generation
- `/sync-docs-to-admin` - Sync to admin panel
