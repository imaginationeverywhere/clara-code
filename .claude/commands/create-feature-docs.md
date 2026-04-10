# create-feature-docs - Feature Documentation Generator

## Overview
Generates comprehensive documentation for completed features, including interactive HTML documentation for business users and markdown documentation for developers. Both types are accessible via the admin panel.

## Usage
```bash
create-feature-docs [OPTIONS]
```

### Options
- `--feature [name]` - Name of the feature to document
- `--business-only` - Generate only business user documentation
- `--dev-only` - Generate only developer documentation
- `--skip-navigation` - Don't update the docs navigation page
- `--preview` - Preview documentation structure without creating files

### Examples
```bash
# Generate docs for Home Content feature
create-feature-docs --feature "Home Content Management"

# Generate only developer docs
create-feature-docs --feature "Payment Integration" --dev-only

# Preview what will be generated
create-feature-docs --feature "User Authentication" --preview
```

## What This Command Does

### 1. Analyze Feature
```bash
# Gather information about the feature:
- Feature name and description
- Related files (frontend, backend, database)
- GraphQL schema changes
- API endpoints
- User-facing components
- Admin panel pages
```

### 2. Generate Business Documentation
Creates interactive HTML documentation for non-technical business users at:
`frontend/app/dashboard/docs/[feature-slug]/page.tsx`

**Features:**
- Expandable sections with visual previews
- Step-by-step guides with checkboxes
- Pro tips and best practices
- Screenshot placeholders
- Related documentation links

### 3. Generate Developer Documentation
Creates markdown documentation for technical users at:
`docs/[feature-slug]-guide.md`

**Rendered in admin panel at:**
`frontend/app/dashboard/docs/[feature-slug]-dev/page.tsx`

**Features:**
- GraphQL API documentation
- Database model schemas
- Authorization patterns
- File structure overview
- Code examples

### 4. Update Navigation
Adds entries to the docs navigation page at:
`frontend/app/dashboard/docs/page.tsx`

## Documentation Templates

### Business Documentation Structure
```typescript
// Interactive sections with:
- Overview with key benefits
- Section-by-section guides
- Visual previews
- Progress tracking checkboxes
- Pro tips callouts
- Related documentation links
```

### Developer Documentation Structure
```markdown
# [Feature Name] - Developer Guide

## Overview
[Brief technical description]

## Architecture
[System design and data flow]

## Database Models
[Schema definitions and relationships]

## GraphQL API
[Queries, mutations, types]

## Authorization
[Role requirements and access patterns]

## File Structure
[Key files and their purposes]

## Implementation Details
[Code patterns and best practices]

## Testing
[Test coverage and strategies]
```

## Command Workflow

### Phase 1: Feature Analysis
```bash
1. Prompt for feature name if not provided
2. Search codebase for related files
3. Identify GraphQL schema changes
4. Find related database models
5. Detect admin panel pages
6. Analyze frontend components
```

### Phase 2: Content Generation
```bash
1. Generate business documentation outline
2. Create interactive HTML page component
3. Generate developer markdown content
4. Create markdown rendering page component
5. Add custom styling for code blocks
```

### Phase 3: Navigation Update
```bash
1. Read existing docs navigation page
2. Add business docs entry with appropriate icon/color
3. Add developer docs entry with Code2 icon
4. Update featured flags if needed
5. Write updated navigation page
```

### Phase 4: Verification
```bash
1. Run TypeScript type checking
2. Verify all imports are correct
3. Check navigation links work
4. Display summary of created files
```

## File Naming Conventions

### Business Docs
- Directory: `frontend/app/dashboard/docs/[feature-slug]/`
- Page: `page.tsx`
- Loading: `loading.tsx`

### Developer Docs
- Markdown: `docs/[feature-slug]-guide.md`
- Render Page: `frontend/app/dashboard/docs/[feature-slug]-dev/page.tsx`
- Loading: `loading.tsx`

## Color Schemes

### Business Documentation
Default colors based on feature type:
- Content Management: `bg-pink-500/10`, `text-pink-400`
- User Management: `bg-blue-500/10`, `text-blue-400`
- Payment/Financial: `bg-green-500/10`, `text-green-400`
- Settings/Config: `bg-purple-500/10`, `text-purple-400`
- Integration: `bg-amber-500/10`, `text-amber-400`

### Developer Documentation
Standard colors:
- Background: `bg-cyan-500/10`
- Border: `border-cyan-500/20`
- Text: `text-cyan-400`
- Icon: Code2 from lucide-react

## Example Output

```
📝 CREATING FEATURE DOCUMENTATION

Feature: Home Content Management
Slug: home-content

🔍 ANALYZING FEATURE
- Found 12 related files
- GraphQL: 4 queries, 6 mutations
- Database: 1 model (FMOHomePageContent)
- Admin Pages: 1 page

📄 GENERATING BUSINESS DOCS
✓ Created frontend/app/dashboard/docs/home-content/page.tsx
✓ Created frontend/app/dashboard/docs/home-content/loading.tsx

📖 GENERATING DEVELOPER DOCS
✓ Created docs/home-content-management-guide.md
✓ Created frontend/app/dashboard/docs/home-content-dev/page.tsx
✓ Created frontend/app/dashboard/docs/home-content-dev/loading.tsx

🔗 UPDATING NAVIGATION
✓ Updated frontend/app/dashboard/docs/page.tsx
  - Added "Home Content Guide" (business)
  - Added "Home Content - Dev Guide" (developer)

✅ DOCUMENTATION COMPLETE

Next steps:
- Review generated documentation
- Add screenshots to business docs
- Update any placeholder content
- Commit with: git add . && git commit -m "docs: add Home Content documentation"
```

## Integration with Workflow

### After Feature Implementation
```bash
# 1. Complete feature implementation
# 2. Run tests and verify functionality
# 3. Generate documentation
create-feature-docs --feature "Feature Name"

# 4. Review and enhance generated docs
# 5. Commit all changes
git-commit-docs
```

## Related Commands
- `generate-docs` - Generate all documentation from definitions
- `organize-docs` - Maintain documentation structure
- `git-commit-docs` - Commit documentation changes

## Related Agents
- `admin-docs-generator` - Specialized agent for documentation generation
- `claude-context-documenter` - Updates CLAUDE.md files

## Related Skills
- `feature-documentation-standard` - Standards for feature documentation

## Best Practices

1. **Run after feature completion** - Generate docs once feature is stable
2. **Review generated content** - AI-generated docs may need refinement
3. **Add screenshots** - Replace placeholder images with actual screenshots
4. **Update pro tips** - Add real-world tips from implementation experience
5. **Keep docs in sync** - Update docs when feature changes
6. **Use consistent naming** - Follow slug conventions for all features

## Customization

### Project-Specific Settings
Create `.claude/feature-docs-config.json`:
```json
{
  "defaultColors": {
    "business": {
      "background": "bg-primary/10",
      "border": "border-primary/20",
      "text": "text-primary"
    },
    "developer": {
      "background": "bg-cyan-500/10",
      "border": "border-cyan-500/20",
      "text": "text-cyan-400"
    }
  },
  "navigationPath": "frontend/app/dashboard/docs/page.tsx",
  "markdownDocsPath": "docs/",
  "includeLoadingStates": true,
  "featuredByDefault": true
}
```

## Error Handling

```bash
# Feature not found
⚠️  Warning: No related files found for "Unknown Feature"
→ Please verify feature name or provide file hints

# Navigation page not found
⚠️  Warning: Docs navigation page not found
→ Creating default navigation page

# TypeScript errors
❌ Error: TypeScript compilation failed
→ Fix errors in generated files before committing
```
