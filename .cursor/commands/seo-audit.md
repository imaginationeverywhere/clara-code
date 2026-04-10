---
name: seo-audit
description: Comprehensive SEO audit and implementation for Next.js applications. Checks sitemap, robots.txt, metadata, Open Graph, Twitter Cards, JSON-LD, and Core Web Vitals. Can fix missing elements automatically.
---

# SEO Audit Command

Comprehensive SEO auditing and implementation for Next.js 15+ applications with App Router.

## Usage

```bash
# Full SEO audit (read-only)
/seo-audit

# Audit with auto-fix for missing elements
/seo-audit --fix

# Audit specific category
/seo-audit --category=metadata
/seo-audit --category=sitemap
/seo-audit --category=structured-data
/seo-audit --category=social

# Generate page inventory documentation
/seo-audit --inventory

# Check a specific page
/seo-audit --page=/about
```

## Command Parameters

| Parameter | Description |
|-----------|-------------|
| `--fix` | Automatically create/update missing SEO elements |
| `--category` | Audit specific category: metadata, sitemap, structured-data, social, robots |
| `--inventory` | Generate/update docs/seo/pages/README.md with page inventory |
| `--page` | Check SEO status of a specific page |
| `--verbose` | Show detailed information for each check |

## Audit Categories

### 1. Metadata Audit
- Root layout metadata configuration
- metadataBase for absolute URLs
- Title template configuration
- Meta descriptions (length validation)
- Keywords array
- Per-page metadata coverage
- noIndex for admin/auth pages

### 2. Sitemap Audit
- sitemap.ts existence and configuration
- All public pages included
- Proper priority assignments
- changeFrequency settings
- Admin routes excluded

### 3. Robots.txt Audit
- robots.ts existence
- Admin routes blocked
- API routes blocked
- Authentication routes blocked
- Sitemap reference included

### 4. Structured Data Audit
- JSON-LD presence in layout
- Organization schema
- WebSite schema
- Business-specific schemas
- Schema validation

### 5. Social Sharing Audit
- Open Graph tags complete
- Twitter Card tags complete
- OG image dimensions (1200x630)
- Social handles configured

### 6. PWA/Manifest Audit
- manifest.json existence
- Required icon sizes
- Theme colors configured
- Start URL set

### 7. Image Assets Audit
- og-image.png exists
- Favicon icons exist
- Apple touch icon exists
- Proper dimensions

## Output Format

```
SEO AUDIT REPORT
================

Project: [Project Name]
URL: https://example.com
Date: 2026-01-05

SUMMARY
-------
Total Pages: 39
SEO Coverage: 92%
Critical Issues: 2
Warnings: 5
Passed: 45

CRITICAL ISSUES
---------------
[X] Missing sitemap.ts
[X] No JSON-LD structured data

WARNINGS
--------
[!] OG image not found at /public/images/og-image.png
[!] Twitter handle not configured
[!] 3 pages missing unique descriptions

PASSED CHECKS
-------------
[OK] Root layout metadata configured
[OK] Title template set
[OK] robots.ts blocking admin routes
[OK] Per-page metadata for public pages
[OK] manifest.json configured
...

RECOMMENDATIONS
---------------
1. Create sitemap.ts with all public routes
2. Add JSON-LD structured data to root layout
3. Create og-image.png (1200x630)
4. Add Twitter handles to metadata
```

## Auto-Fix Capabilities

When running with `--fix`, the command will:

1. **Create sitemap.ts** if missing
   - Scans app directory for all pages
   - Assigns appropriate priorities
   - Excludes admin and auth routes

2. **Create robots.ts** if missing
   - Blocks /admin, /api, /_next, auth routes
   - Adds sitemap reference

3. **Update root layout** with missing metadata
   - Adds metadataBase
   - Configures title template
   - Adds Open Graph tags
   - Adds Twitter Card tags

4. **Create per-page layout.tsx** for pages needing metadata
   - Detects 'use client' pages
   - Creates separate layout for metadata

5. **Add JSON-LD structured data** if missing
   - Organization schema
   - WebSite schema

6. **Create manifest.json** if missing
   - Basic PWA configuration

7. **Update documentation**
   - Creates/updates docs/seo/pages/README.md

## Integration with SEO Agent

This command automatically invokes the `seo-implementation-specialist` agent for:
- Complex SEO implementations
- Custom structured data schemas
- Industry-specific SEO requirements
- Core Web Vitals optimization

## Related Commands

- `/analytics-setup` - Configure Google Analytics 4
- `/performance-audit` - Audit Core Web Vitals
- `/accessibility-audit` - Check WCAG compliance

## Examples

### Full Audit
```bash
/seo-audit

# Output:
# Running comprehensive SEO audit...
# Checking metadata configuration...
# Checking sitemap generation...
# Checking robots.txt rules...
# [Full report follows]
```

### Fix Missing Elements
```bash
/seo-audit --fix

# Output:
# Running SEO audit with auto-fix enabled...
# [X] sitemap.ts missing - CREATING...
# [OK] Created frontend/app/sitemap.ts
# [X] JSON-LD missing - ADDING...
# [OK] Added JSON-LD to frontend/app/layout.tsx
# [!] OG image missing - Please create manually
# ...
```

### Generate Inventory
```bash
/seo-audit --inventory

# Output:
# Scanning all routes in app directory...
# Found 39 pages total
# Generating docs/seo/pages/README.md...
# [OK] Page inventory documentation created
```

## Skill Reference

This command uses patterns from:
- `.claude/skills/seo-standard/SKILL.md` - Core SEO implementation patterns
- `.claude/agents/seo-implementation-specialist.md` - Complex SEO tasks

## Checklist Output

When complete, generates a checklist:

```markdown
## SEO Implementation Checklist

### Technical SEO
- [x] sitemap.ts configured
- [x] robots.ts configured
- [x] metadataBase set
- [x] Title template configured

### Metadata
- [x] Root layout metadata
- [x] Per-page metadata (39/39)
- [x] noIndex for admin pages
- [ ] Custom OG images per page

### Structured Data
- [x] Organization schema
- [x] WebSite schema
- [ ] Product schemas (if applicable)
- [ ] Article schemas (if applicable)

### Social Sharing
- [x] Open Graph tags
- [x] Twitter Cards
- [ ] OG image created

### Assets
- [ ] og-image.png (1200x630)
- [ ] icon-16.png
- [ ] icon-32.png
- [ ] icon-192.png
- [ ] icon-512.png
- [ ] apple-touch-icon.png

### Verification
- [ ] Google Search Console verified
- [ ] Sitemap submitted
- [ ] Rich Results tested
```

## Version History

- **v1.0.0** (2026-01-05) - Initial release with full audit and fix capabilities
