---
name: documentation-admin-sync
description: Synchronize documentation between codebase files and admin panel database. Supports bidirectional sync of BUSINESS, DEVELOPER, and INTERACTIVE documentation types with version tracking, frontmatter parsing, and interactive component support. Use when syncing docs to admin panel, exporting admin docs to files, or managing documentation workflows.
---

# Documentation Admin Sync

## Overview

This skill provides comprehensive documentation synchronization between the codebase `docs/` directory and the admin panel database. It enables:

- **Business users**: Edit documentation directly in admin panel
- **Developers**: Keep technical docs in sync with codebase
- **Content teams**: Manage interactive docs with checklists and quizzes

## Document Types

### BUSINESS Documents
**Editable in admin panel** - User-facing content managed by business teams.

```yaml
# Frontmatter
---
title: Product Features Guide
type: business
category: Product
description: Overview of product features
published: true
---
```

**Typical locations:**
- `docs/business/`
- `docs/guides/`
- `docs/marketing/`
- `docs/help/`

### DEVELOPER Documents
**Read-only in admin** - Technical documentation synced from codebase.

```yaml
# Frontmatter
---
title: API Reference
type: developer
category: API
description: Complete API documentation
published: true
---
```

**Typical locations:**
- `docs/technical/`
- `docs/deployment/`
- `docs/detailed/`
- `docs/api/`

### INTERACTIVE Documents
**Enhanced admin experience** - Docs with progress tracking and interactivity.

```yaml
# Frontmatter
---
title: Developer Onboarding
type: interactive
category: Onboarding
description: Step-by-step onboarding guide
published: true
---

# Developer Onboarding

## Setup Checklist

- [ ] Clone repository
- [ ] Install dependencies
- [ ] Configure environment
- [ ] Run migrations
- [ ] Start development server
```

## Sync Workflow

### Forward Sync (Files → Database)

```bash
# Check what would be synced
sync-docs-to-admin --check

# Sync all documentation
sync-docs-to-admin

# Sync with auto-publish
sync-docs-to-admin --publish

# Force overwrite
sync-docs-to-admin --force
```

**Process:**
1. Scan `docs/` directory for markdown files
2. Parse frontmatter to extract metadata
3. Detect document type (auto or explicit)
4. Compare with existing database records
5. Create or update documents
6. Track version history

### Reverse Sync (Database → Files)

```bash
# Export all admin docs to files
sync-docs-to-admin --reverse

# Export specific category
sync-docs-to-admin --reverse --category "Business"
```

**Process:**
1. Query all documentation from database
2. Group by type and category
3. Generate markdown with frontmatter
4. Write to appropriate directories

## Frontmatter Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Document title (auto: filename) |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | enum | auto | BUSINESS, DEVELOPER, INTERACTIVE |
| `category` | string | directory | Grouping category |
| `description` | string | first para | Brief description |
| `slug` | string | filename | URL-friendly identifier |
| `icon` | string | FileText | Lucide icon name |
| `color` | string | blue | Theme color |
| `published` | boolean | false | Public visibility |
| `featured` | boolean | false | Featured on dashboard |
| `order` | number | 0 | Sort order |

### Example Frontmatter

```yaml
---
title: Getting Started Guide
type: business
category: Guides
description: Quick start guide for new users
slug: getting-started
icon: BookOpen
color: green
published: true
featured: true
order: 1
---
```

## Directory Structure

### Recommended Organization

```
docs/
├── README.md                 # (excluded from sync)
├── CLAUDE.md                 # (excluded from sync)
├── CHANGELOG.md              # (excluded from sync)
├── PRD.md                    # → type: BUSINESS
│
├── business/                 # All → type: BUSINESS
│   ├── features/
│   │   └── feature-overview.md
│   ├── pricing/
│   │   └── pricing-guide.md
│   └── marketing/
│       └── product-brief.md
│
├── guides/                   # All → type: BUSINESS
│   ├── getting-started.md
│   └── user-manual.md
│
├── technical/                # All → type: DEVELOPER
│   ├── architecture.md
│   ├── api-reference.md
│   └── database-schema.md
│
├── deployment/               # All → type: DEVELOPER
│   ├── aws-setup.md
│   └── docker-guide.md
│
└── onboarding/               # All → type: INTERACTIVE
    ├── developer-setup.md    # (with checklists)
    └── team-welcome.md       # (with quizzes)
```

### Category Mapping

| Directory | Default Type | Default Category |
|-----------|--------------|------------------|
| `docs/business/*` | BUSINESS | Directory name |
| `docs/guides/*` | BUSINESS | Guides |
| `docs/help/*` | BUSINESS | Help |
| `docs/technical/*` | DEVELOPER | Technical |
| `docs/deployment/*` | DEVELOPER | Deployment |
| `docs/api/*` | DEVELOPER | API |
| `docs/onboarding/*` | INTERACTIVE | Onboarding |
| `docs/tutorials/*` | INTERACTIVE | Tutorials |

## Interactive Components

### Checkbox Lists

Automatically converted to trackable checklists:

```markdown
## Setup Tasks

- [ ] Clone repository
- [x] Install Node.js (completed)
- [ ] Run npm install
```

**Admin Panel Features:**
- Progress persistence per user
- Completion percentage display
- Mark all complete button

### Quiz Blocks

Custom quiz component syntax:

```markdown
:::quiz id="setup-quiz"
question: What command starts the dev server?
options:
  - npm start
  - npm run dev (correct)
  - docker up
  - yarn serve
hint: Check package.json scripts
:::
```

**Admin Panel Features:**
- Interactive selection
- Instant feedback
- Progress tracking

### Collapsible Sections

Hide detailed content:

```markdown
:::collapse title="Advanced Configuration"
Detailed configuration steps that most users won't need...
:::
```

### Code Playground

Interactive code examples:

```markdown
:::playground language="typescript"
// Try editing this code
const greeting = "Hello!";
console.log(greeting);
:::
```

## GraphQL Schema

### Types

```graphql
enum DocumentationType {
  BUSINESS
  DEVELOPER
  INTERACTIVE
}

type Documentation {
  id: ID!
  slug: String!
  title: String!
  description: String
  type: DocumentationType!
  content: String!
  interactiveContent: JSON
  category: String
  icon: String
  color: String
  isPublished: Boolean!
  isFeatured: Boolean!
  order: Int!
  version: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Sync Mutation

```graphql
mutation SyncDocumentationFromSource($input: DocumentationSyncInput!) {
  syncDocumentationFromSource(input: $input) {
    status
    message
    created
    updated
    unchanged
    errors
  }
}

input DocumentationSyncInput {
  sourceDirectory: String!
  dryRun: Boolean
  force: Boolean
  typeFilter: DocumentationType
  categoryFilter: String
  autoPublish: Boolean
}
```

## Admin Panel Integration

### Documentation List Page

Located at `/dashboard/documentation-management`:

**Features:**
- Filter by type (BUSINESS, DEVELOPER, INTERACTIVE)
- Toggle publish/featured status
- Edit documentation
- Delete with confirmation
- View version history

### Edit Page

Located at `/dashboard/documentation-management/[id]/edit`:

**Features:**
- Markdown editor with preview
- Frontmatter field editing
- Version history sidebar
- Restore previous versions
- Change note tracking

### New Document Page

Located at `/dashboard/documentation-management/new`:

**Features:**
- Type selection
- Auto-slug generation
- Markdown editor
- Publish options

## Configuration

### Sync Config File

Create `.doc-sync-config.json` in project root:

```json
{
  "sourceDirectory": "docs",
  "excludePatterns": [
    "**/README.md",
    "**/CHANGELOG.md",
    "**/CLAUDE.md",
    "**/_*.md"
  ],
  "typeMapping": {
    "business": ["business/**", "guides/**", "help/**"],
    "developer": ["technical/**", "deployment/**", "api/**"],
    "interactive": ["onboarding/**", "tutorials/**"]
  },
  "defaultCategory": {
    "business": "General",
    "developer": "Technical",
    "interactive": "Tutorials"
  },
  "autoPublish": false,
  "conflictResolution": "source-wins"
}
```

### Environment Variables

```bash
# Verbose sync output
DOC_SYNC_VERBOSE=true

# Auto-publish synced docs
DOC_SYNC_AUTO_PUBLISH=true

# Conflict resolution strategy
DOC_SYNC_CONFLICT=source-wins
```

## Integration Workflow

### With generate-docs

```bash
# 1. Generate docs from commands/agents
generate-docs

# 2. Sync to admin panel
sync-docs-to-admin
```

### With organize-docs

```bash
# 1. Organize documentation structure
organize-docs --fix

# 2. Sync organized docs
sync-docs-to-admin
```

### With git-commit-docs

```bash
# 1. Sync docs
sync-docs-to-admin

# 2. Commit changes
git-commit-docs
```

### CI/CD Integration

```yaml
# GitHub Actions
- name: Sync Documentation
  run: |
    npm run sync-docs-to-admin -- --check
    npm run sync-docs-to-admin
```

## Error Handling

### Common Errors

**Invalid Frontmatter:**
```
❌ Error: Invalid YAML in docs/guide.md
   Line 3: Expected 'type' to be one of: BUSINESS, DEVELOPER, INTERACTIVE
```
**Solution:** Fix frontmatter YAML syntax

**Duplicate Slug:**
```
❌ Error: Slug 'getting-started' already exists
   Conflicting files: docs/guide.md, docs/intro.md
```
**Solution:** Add explicit `slug` field to frontmatter

**Missing GraphQL Endpoint:**
```
❌ Error: Failed to connect to GraphQL endpoint
```
**Solution:** Ensure backend is running and NEXT_PUBLIC_GRAPHQL_URL is set

## Security

- Only SITE_OWNER and ADMIN roles can sync
- Content sanitized for XSS
- Interactive components validated
- All operations logged for audit

## Related

### Commands
- `/sync-docs-to-admin` - Execute sync operations
- `/generate-docs` - Generate docs from definitions
- `/organize-docs` - Organize doc structure

### Agents
- `documentation-sync-manager` - Manages sync operations
- `claude-context-documenter` - Creates CLAUDE.md files
- `git-commit-docs-manager` - Commits documentation changes
