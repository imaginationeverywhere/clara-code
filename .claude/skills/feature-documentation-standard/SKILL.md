---
name: feature-documentation-standard
description: Generate comprehensive feature documentation for admin panel access. Creates interactive HTML guides for business users and markdown documentation for developers. Use when documenting completed features, creating admin panel documentation, or establishing documentation patterns for new functionality. Triggers on requests for feature docs, admin documentation, user guides, developer guides, or technical documentation accessible in the admin panel.
---

# Feature Documentation Standard

## Overview

This skill provides production-tested patterns for generating comprehensive feature documentation that is accessible through the admin panel. It creates two types of documentation:

1. **Business Documentation** - Interactive HTML guides for non-technical users
2. **Developer Documentation** - Markdown guides rendered in the admin panel

## Documentation Structure

### Business Documentation

**Location:** `frontend/app/dashboard/docs/[feature-slug]/page.tsx`

Interactive documentation featuring:
- Expandable/collapsible sections
- Step-by-step guides with checkboxes
- Visual preview placeholders
- Pro tips callouts
- Related documentation links
- Progress tracking

### Developer Documentation

**Markdown Location:** `docs/[feature-slug]-guide.md`
**Render Page:** `frontend/app/dashboard/docs/[feature-slug]-dev/page.tsx`

Technical documentation featuring:
- GraphQL API documentation
- Database model schemas
- Authorization patterns
- File structure overview
- Code examples
- Implementation details

## Implementation Workflow

### 1. Create Business Documentation Page

```typescript
// frontend/app/dashboard/docs/[feature-slug]/page.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Lightbulb, ArrowLeft, [FeatureIcon] } from 'lucide-react';
import Link from 'next/link';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

const [FeatureName]GuidePage = (): JSX.Element => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const sections: GuideSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: [OverviewIcon],
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            [Feature overview description]
          </p>
          <div className="bg-dark-500/50 rounded-lg p-4 border border-primary/10">
            <h4 className="text-primary font-semibold mb-2">Key Benefits</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                [Benefit 1]
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                [Benefit 2]
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'section-1',
      title: '[Section 1 Title]',
      icon: [SectionIcon],
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">[Section description]</p>

          {/* Step-by-step Guide */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                1
              </span>
              <div>
                <p className="text-white font-medium">[Step 1 title]</p>
                <p className="text-gray-400 text-sm">[Step 1 description]</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                2
              </span>
              <div>
                <p className="text-white font-medium">[Step 2 title]</p>
                <p className="text-gray-400 text-sm">[Step 2 description]</p>
              </div>
            </div>
          </div>

          {/* Visual Preview Placeholder */}
          <div className="bg-dark-500/50 rounded-lg p-6 border border-dashed border-gray-600 text-center">
            <p className="text-gray-500">Visual preview placeholder</p>
          </div>

          {/* Pro Tip */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-medium text-sm">Pro Tip</p>
              <p className="text-gray-300 text-sm">[Pro tip content]</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-dark-500">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/docs"
            className="inline-flex items-center text-primary hover:text-primary-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documentation
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[color]-500/20 rounded-lg flex items-center justify-center">
              <[FeatureIcon] className="w-5 h-5 text-[color]-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">[Feature Name] Guide</h1>
              <p className="text-primary mt-1">
                [Feature tagline/description]
              </p>
            </div>
          </div>
        </div>

        {/* Expandable Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(section.id);
            return (
              <div
                key={section.id}
                className="bg-dark-400/50 border border-primary/20 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-dark-400/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-lg font-semibold text-white">
                      {section.title}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-primary/10 pt-4">
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Related Documentation */}
        <div className="mt-8 bg-dark-400/50 border border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Related Documentation</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/docs/[feature-slug]-dev"
              className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-2 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
            >
              Developer Guide
            </Link>
            <Link
              href="/dashboard/docs/admin-guide"
              className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-300 hover:bg-purple-500/20 transition-colors"
            >
              Admin Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default [FeatureName]GuidePage;
```

### 2. Create Developer Documentation Markdown

```markdown
# [Feature Name] - Developer Guide

## Overview

[Technical overview of the feature]

## Architecture

### Data Flow
[Describe how data flows through the system]

### Component Structure
[Describe key components]

## Database Models

### [ModelName]

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| [field] | [type] | [description] |

## GraphQL API

### Queries

#### get[FeatureName]
```graphql
query Get[FeatureName]($id: ID!) {
  get[FeatureName](id: $id) {
    id
    # fields...
  }
}
```

### Mutations

#### update[FeatureName]
```graphql
mutation Update[FeatureName]($input: [FeatureName]Input!) {
  update[FeatureName](input: $input) {
    status
    message
    data {
      id
      # fields...
    }
  }
}
```

## Authorization

### Required Roles
- `SITE_OWNER` - Full access
- `SUPER_ADMIN` - Full access
- `ADMIN` - Read-only access

### Access Patterns
```typescript
const canManage[FeatureName] = (userRoles: string[] = []): boolean => {
  return userRoles.includes('Site Owner') || userRoles.includes('Super Admin');
};
```

## File Structure

```
frontend/
├── app/dashboard/[feature-slug]/
│   ├── page.tsx           # Main page
│   ├── loading.tsx        # Loading state
│   └── components/
│       └── [Component].tsx
├── lib/gqlSchema/mutations/
│   └── [feature].ts       # GraphQL operations
└── types/
    └── [feature].ts       # TypeScript types

backend/
├── graphql/resolvers/[feature]/
│   ├── index.ts           # Resolvers
│   ├── controller.ts      # Business logic
│   ├── dbService.ts       # Database operations
│   └── types.ts           # GraphQL types
└── db/models/
    └── [Model].ts         # Database model
```

## Implementation Notes

[Any important implementation details]

## Testing

### Unit Tests
[Testing approach for unit tests]

### Integration Tests
[Testing approach for integration tests]
```

### 3. Create Developer Documentation Render Page

```typescript
// frontend/app/dashboard/docs/[feature-slug]-dev/page.tsx
import { readFileSync } from 'fs';
import { join } from 'path';
import React from 'react';
import { ArrowLeft, Code2 } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

const [FeatureName]DevGuidePage = (): JSX.Element => {
  let markdownContent = '';
  try {
    const filePath = join(process.cwd(), 'docs', '[feature-slug]-guide.md');
    markdownContent = readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Error reading guide file:', error);
    markdownContent = '# [Feature Name] - Developer Guide\n\nError loading guide content.';
  }

  return (
    <div className="min-h-screen bg-dark-500">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/docs"
            className="inline-flex items-center text-primary hover:text-primary-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documentation
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">[Feature Name] - Developer Guide</h1>
              <p className="text-primary mt-1">
                Technical documentation for developers
              </p>
            </div>
          </div>
        </div>

        {/* Developer Badge */}
        <div className="mb-6 inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-cyan-300 font-medium">Developer Documentation</span>
        </div>

        {/* Markdown Content */}
        <div className="bg-dark-400/50 border border-primary/20 rounded-lg p-6 backdrop-blur-sm">
          <div className="prose prose-invert prose-primary max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-white mb-6 border-b border-primary/20 pb-3">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-primary/10 pb-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-primary mt-6 mb-3">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-lg font-medium text-white mt-4 mb-2">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-300 ml-4">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="text-white font-semibold">
                    {children}
                  </strong>
                ),
                code: ({ className, children }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-gray-700 text-cyan-400 px-2 py-1 rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="block bg-gray-900 text-gray-300 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-gray-300 my-4 bg-cyan-500/5 py-2 rounded-r">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border border-gray-700 rounded-lg overflow-hidden">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-800">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-sm font-semibold text-white border-b border-gray-700">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                    {children}
                  </td>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>

        {/* Related Docs */}
        <div className="mt-8 bg-dark-400/50 border border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Related Documentation</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/docs/[feature-slug]"
              className="inline-flex items-center gap-2 bg-[color]-500/10 border border-[color]-500/30 rounded-lg px-4 py-2 text-[color]-300 hover:bg-[color]-500/20 transition-colors"
            >
              Business Guide
            </Link>
            <Link
              href="/dashboard/docs/admin-guide"
              className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-lg px-4 py-2 text-purple-300 hover:bg-purple-500/20 transition-colors"
            >
              Admin Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default [FeatureName]DevGuidePage;
```

### 4. Create Loading States

```typescript
// loading.tsx (same for both business and developer docs)
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-primary text-lg font-moonshiner animate-pulse tracking-wider">
          Loading...
        </p>
      </div>
    </div>
  );
}
```

### 5. Update Navigation Page

Add entries to `frontend/app/dashboard/docs/page.tsx`:

```typescript
const docItems = [
  // ... existing items

  // Business documentation
  {
    title: '[Feature Name] Guide',
    description: '[User-friendly description for business users]',
    href: '/dashboard/docs/[feature-slug]',
    icon: [FeatureIcon],
    color: 'bg-[color]-500/10 border-[color]-500/20',
    iconColor: 'text-[color]-400',
    featured: true,
  },

  // Developer documentation
  {
    title: '[Feature Name] - Dev Guide',
    description: 'Technical documentation for developers: [brief technical description]',
    href: '/dashboard/docs/[feature-slug]-dev',
    icon: Code2,
    color: 'bg-cyan-500/10 border-cyan-500/20',
    iconColor: 'text-cyan-400',
    featured: true,
  },
];
```

## Resources

### references/
- `documentation-patterns.md` - Comprehensive documentation patterns
- `markdown-components.md` - Full list of styled markdown components

### assets/
- `templates/BusinessDocPage.tsx` - Copy-ready business doc template
- `templates/DevDocPage.tsx` - Copy-ready developer doc template
- `templates/loading.tsx` - Copy-ready loading component
- `templates/feature-guide.md` - Copy-ready markdown template
