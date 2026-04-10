# sync-docs-to-admin - Documentation Sync to Admin Panel

## Overview

Synchronizes documentation from the `docs/` directory to the admin panel database, making all project documentation accessible and editable through the admin interface. This bidirectional system allows:

- **Business users**: Edit business documentation directly in admin panel
- **Developers**: Technical docs stay in sync with codebase
- **Interactive docs**: Rich markdown with checklists, quizzes, and interactive elements

## Usage

```bash
sync-docs-to-admin [OPTIONS]
```

### Options

- `--check` - Preview what would be synced without making changes
- `--dry-run` - Same as --check, preview mode
- `--force` - Overwrite existing documentation (default: skip unchanged)
- `--type [BUSINESS|DEVELOPER|INTERACTIVE]` - Sync only specific type
- `--category [name]` - Sync only specific category
- `--specific [filename]` - Sync single file by name
- `--publish` - Auto-publish synced documentation
- `--verbose` - Show detailed sync progress
- `--reverse` - Export admin panel docs back to files (admin → files)

### Examples

```bash
# Preview what would be synced
sync-docs-to-admin --check

# Sync all documentation
sync-docs-to-admin

# Sync only business documentation
sync-docs-to-admin --type BUSINESS

# Sync and auto-publish
sync-docs-to-admin --publish

# Force overwrite all docs
sync-docs-to-admin --force

# Export admin docs back to files
sync-docs-to-admin --reverse
```

## Document Type Detection

### Automatic Type Classification

The command automatically determines document type based on:

**BUSINESS Documents** (Editable in Admin):
- Files in `docs/business/`
- Files in `docs/guides/` (user-facing)
- Files containing frontmatter: `type: business`
- Marketing, pricing, feature descriptions
- User manuals and help content

**DEVELOPER Documents** (Read-only in Admin):
- Files in `docs/technical/`
- Files in `docs/deployment/`
- Files in `docs/detailed/`
- Files containing frontmatter: `type: developer`
- API documentation, architecture guides
- Code examples and implementation details

**INTERACTIVE Documents** (Rich Admin Experience):
- Files with frontmatter: `type: interactive`
- Files containing checkbox lists (`- [ ]`)
- Files with custom components (`:::quiz`, `:::checklist`)
- Onboarding guides, tutorials with progress tracking

### Frontmatter Format

```markdown
---
title: Getting Started Guide
type: business
category: Guides
description: Quick start guide for new users
icon: BookOpen
color: blue
published: true
featured: false
order: 1
---

# Getting Started Guide

Content here...
```

### Supported Frontmatter Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | string | filename | Document title |
| `type` | enum | auto-detect | BUSINESS, DEVELOPER, INTERACTIVE |
| `category` | string | directory name | Grouping category |
| `description` | string | first paragraph | Brief description |
| `icon` | string | FileText | Lucide icon name |
| `color` | string | blue | Theme color |
| `published` | boolean | false | Visibility in public API |
| `featured` | boolean | false | Featured on dashboard |
| `order` | number | 0 | Sort order within category |
| `slug` | string | filename | URL-friendly identifier |

## Sync Workflow

### Phase 1: Discovery

```bash
1. Scan docs/ directory recursively
2. Identify all .md files
3. Parse frontmatter from each file
4. Determine document type for each
5. Build sync manifest
```

### Phase 2: Comparison

```bash
For each discovered file:
1. Check if document exists in database (by slug)
2. Compare content hash to detect changes
3. Categorize: new, changed, unchanged, deleted
4. Build sync plan
```

### Phase 3: Synchronization

```bash
For new documents:
1. Create database record
2. Store content (markdown + parsed HTML)
3. Generate interactive content (if applicable)
4. Set version to 1

For changed documents:
1. Archive current version to history
2. Update content and metadata
3. Increment version number
4. Store change note ("Synced from source file")

For deleted documents (with --cleanup flag):
1. Mark as unpublished
2. Optionally soft-delete
```

### Phase 4: Verification

```bash
1. Verify all documents synced
2. Check for broken internal links
3. Validate interactive components
4. Report sync results
```

## Directory Structure Mapping

```
docs/
├── PRD.md                    → type: BUSINESS, category: Project
├── business/                 → type: BUSINESS
│   ├── features/            → category: Features
│   │   └── *.md
│   ├── pricing/             → category: Pricing
│   └── marketing/           → category: Marketing
├── guides/                   → type: BUSINESS, category: Guides
│   ├── GETTING-STARTED.md
│   └── USER-MANUAL.md
├── technical/                → type: DEVELOPER
│   ├── ARCHITECTURE.md      → category: Architecture
│   ├── API-REFERENCE.md     → category: API
│   └── DATABASE-SCHEMA.md   → category: Database
├── detailed/                 → type: DEVELOPER, category: Technical
├── deployment/               → type: DEVELOPER, category: Deployment
└── onboarding/              → type: INTERACTIVE, category: Onboarding
    └── DEVELOPER-ONBOARDING.md (with checklists)
```

## Interactive Document Features

### Checkbox Lists (Auto-tracked)

```markdown
## Setup Checklist

- [ ] Clone repository
- [ ] Install dependencies
- [ ] Configure environment
- [ ] Run migrations
```

When synced, these become trackable checklists in the admin panel with user progress persistence.

### Quiz Components

```markdown
:::quiz
question: What command starts the development server?
options:
  - npm start
  - npm run dev (correct)
  - docker-compose up
  - yarn start
:::
```

### Collapsible Sections

```markdown
:::collapse title="Advanced Configuration"
Advanced configuration options...
:::
```

### Code Playground

```markdown
:::playground language="typescript"
// Interactive code example
const greeting = "Hello, World!";
console.log(greeting);
:::
```

## GraphQL Integration

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

# Input type
input DocumentationSyncInput {
  sourceDirectory: String!
  dryRun: Boolean
  force: Boolean
  typeFilter: DocumentationType
  categoryFilter: String
  autoPublish: Boolean
}
```

### Example Sync Call

```typescript
const result = await apolloClient.mutate({
  mutation: SYNC_DOCUMENTATION_FROM_SOURCE,
  variables: {
    input: {
      sourceDirectory: 'docs',
      dryRun: false,
      force: false,
      autoPublish: false,
    },
  },
});
```

## Output Examples

### Check Mode Output

```
📚 SYNC PREVIEW: Documentation → Admin Panel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Source: docs/
📋 Target: Documentation Management

Discovery:
  📄 Found 45 documentation files
  ✅ BUSINESS: 12 files
  ✅ DEVELOPER: 28 files
  ✅ INTERACTIVE: 5 files

Sync Plan:
  🆕 New: 8 documents
  🔄 Changed: 12 documents
  ⏸️  Unchanged: 25 documents

New Documents:
  + docs/guides/NEW-FEATURE.md → Guides / New Feature
  + docs/technical/API-V2.md → API / API Reference v2
  + docs/business/PRICING-2024.md → Pricing / 2024 Pricing
  ... (5 more)

Changed Documents:
  ~ docs/PRD.md (content updated)
  ~ docs/technical/ARCHITECTURE.md (frontmatter changed)
  ... (10 more)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run without --check to apply changes.
```

### Sync Execution Output

```
📚 SYNCING: Documentation → Admin Panel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1: Discovery
  📄 Scanning docs/ directory...
  ✅ Found 45 files

Phase 2: Comparison
  🔍 Comparing with database...
  ✅ Identified 8 new, 12 changed, 25 unchanged

Phase 3: Synchronization
  Creating documents:
  ✅ NEW-FEATURE.md → created (v1)
  ✅ API-V2.md → created (v1)
  ... (6 more)

  Updating documents:
  ✅ PRD.md → updated (v3 → v4)
  ✅ ARCHITECTURE.md → updated (v2 → v3)
  ... (10 more)

Phase 4: Verification
  ✅ All 20 operations successful
  ✅ No broken links detected
  ✅ Interactive components validated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SYNC COMPLETE

Summary:
  📥 Created: 8 documents
  🔄 Updated: 12 documents
  ⏸️  Skipped: 25 documents (unchanged)
  ❌ Errors: 0

Next Steps:
  1. Review synced docs: /dashboard/documentation-management
  2. Publish docs: Toggle published status in admin
  3. Commit changes: /git-commit-docs
```

## Reverse Sync (Admin → Files)

### Usage

```bash
# Export all admin docs to files
sync-docs-to-admin --reverse

# Export specific category
sync-docs-to-admin --reverse --category "Business"

# Export with overwrites
sync-docs-to-admin --reverse --force
```

### Workflow

```bash
1. Query all documentation from database
2. Group by type and category
3. Generate markdown with frontmatter
4. Write to appropriate directories
5. Preserve formatting and structure
```

### Output

```
📤 EXPORTING: Admin Panel → Documentation Files
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Exporting 45 documents...

Business Documents → docs/business/
  ✅ docs/business/features/NEW-FEATURE.md
  ✅ docs/business/pricing/2024-PRICING.md
  ... (10 more)

Developer Documents → docs/technical/
  ✅ docs/technical/API-V2.md
  ✅ docs/technical/ARCHITECTURE.md
  ... (25 more)

Interactive Documents → docs/onboarding/
  ✅ docs/onboarding/DEVELOPER-SETUP.md
  ... (5 more)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ EXPORT COMPLETE

Exported: 45 documents
Skipped: 0 (already current)
Next: Review changes with git diff docs/
```

## Integration with Other Commands

### With generate-docs

```bash
# 1. Generate documentation from commands/agents
generate-docs

# 2. Sync generated docs to admin
sync-docs-to-admin
```

### With organize-docs

```bash
# 1. Organize documentation structure
organize-docs --fix

# 2. Sync organized docs to admin
sync-docs-to-admin
```

### With git-commit-docs

```bash
# 1. Sync docs to admin
sync-docs-to-admin

# 2. Commit any generated changes
git-commit-docs
```

## Configuration

### Sync Config File (`.doc-sync-config.json`)

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
    "business": ["business/**", "guides/**", "marketing/**"],
    "developer": ["technical/**", "detailed/**", "deployment/**"],
    "interactive": ["onboarding/**", "tutorials/**"]
  },
  "defaultCategory": {
    "business": "General",
    "developer": "Technical",
    "interactive": "Tutorials"
  },
  "autoPublish": false,
  "syncOnStartup": false,
  "conflictResolution": "source-wins"
}
```

### Environment Variables

```bash
# Enable verbose logging
DOC_SYNC_VERBOSE=true

# Auto-publish synced docs
DOC_SYNC_AUTO_PUBLISH=true

# Source directory override
DOC_SYNC_SOURCE=./docs

# Conflict resolution: source-wins, admin-wins, manual
DOC_SYNC_CONFLICT=source-wins
```

## Error Handling

### Common Errors

**Error**: "GraphQL mutation failed"
**Solution**: Ensure backend is running and GraphQL endpoint accessible

**Error**: "Invalid frontmatter in file.md"
**Solution**: Check YAML syntax in frontmatter block

**Error**: "Document type not recognized"
**Solution**: Add explicit `type` field in frontmatter or move to typed directory

**Error**: "Conflicting slug detected"
**Solution**: Add unique `slug` field in frontmatter

### Conflict Resolution

When document exists in both source and database with different content:

- **source-wins** (default): Source file overwrites database
- **admin-wins**: Database version preserved, skip source
- **manual**: Prompt for resolution

## Best Practices

1. **Use frontmatter**: Always include frontmatter for control
2. **Run checks first**: Use `--check` before actual sync
3. **Organize before sync**: Run `organize-docs` to ensure structure
4. **Version control**: Commit documentation changes before sync
5. **Regular syncs**: Include in CI/CD for automatic updates
6. **Review in admin**: Always review synced docs in admin panel

## Security Considerations

- Only admins with SITE_OWNER or ADMIN role can sync
- Source files validated for markdown safety
- XSS protection on interactive components
- Audit log of all sync operations

## Related Commands

- [generate-docs](generate-docs.md) - Generate docs from definitions
- [organize-docs](organize-docs.md) - Organize documentation structure
- [git-commit-docs](git-commit-docs.md) - Commit documentation changes

## Agent Support

This command works with the following specialized agents:

- **claude-context-documenter** - Creates CLAUDE.md files
- **feature-documentation-standard** - Generates feature docs
- **documentation-sync-manager** - Manages sync operations

---

**This command bridges the gap between developer documentation in the codebase and admin-accessible documentation in the application, enabling a true collaborative documentation workflow.**
