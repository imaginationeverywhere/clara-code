# Create Document Command

> **Command:** `create-document`
> **Version:** 1.0.0
> **Category:** Document Generation
> **Agent:** document-generator

## Purpose

Generate professional Word documents (.docx) from markdown files, topics, or content. Supports bidirectional conversion - can also extract Word documents back to markdown with tracked changes support.

## Usage

```bash
# From markdown file
create-document docs/technical-spec.md

# From topic
create-document "Project Proposal for Client X"

# With output path
create-document docs/report.md --output documents/

# With template
create-document docs/contract.md --template templates/legal-template.docx

# Reverse: Extract to markdown
create-document --reverse uploads/document.docx

# With tracked changes preserved
create-document --reverse uploads/reviewed.docx --track-changes
```

## Options

| Option | Description | Example |
|--------|-------------|---------|
| `--output` | Output directory | `--output ./documents/` |
| `--template` | Use existing template | `--template template.docx` |
| `--reverse` | Extract to markdown | `--reverse file.docx` |
| `--track-changes` | Preserve tracked changes | `--track-changes` |
| `--toc` | Generate table of contents | `--toc` |
| `--headers` | Add headers/footers | `--headers "Company Name"` |
| `--style` | Document style preset | `--style "professional"` |

## Workflow

### Step 1: Content Analysis
```
Input: docs/technical-spec.md

Analysis:
- H1 headings: 1 (document title)
- H2 headings: 6 (main sections)
- H3 headings: 15 (subsections)
- Paragraphs: 45
- Code blocks: 8
- Tables: 3
- Images: 5

Document Type: Technical Specification
```

### Step 2: Structure Generation
```
Document Structure:
├── Title Page
├── Table of Contents (if --toc)
├── Section 1: Introduction
│   ├── 1.1 Purpose
│   └── 1.2 Scope
├── Section 2: Requirements
│   ├── 2.1 Functional
│   └── 2.2 Non-Functional
└── Appendices
```

### Step 3: Styling Application
```
Styles Applied:
- Title: Heading 1, 24pt, Bold
- Sections: Heading 2, 18pt, Bold
- Subsections: Heading 3, 14pt, Bold
- Body: Normal, 11pt
- Code: Courier New, 10pt, Gray background
- Tables: Grid style with header row
```

## Markdown Structure Mapping

```markdown
# Document Title → Title (Heading 1)

## Section → Heading 2

### Subsection → Heading 3

Paragraph text → Normal paragraph

**Bold** → Bold text
*Italic* → Italic text
`code` → Inline code style

```code block``` → Code block with background

- Bullet → Bulleted list
1. Number → Numbered list

| Table | → Word table with styling

> Blockquote → Indented quote style

[Link](url) → Hyperlink

![Image](path) → Inline image
```

## Document Styles

### Built-in Styles

| Style | Best For | Features |
|-------|----------|----------|
| `professional` | Business docs | Clean, corporate look |
| `technical` | Specs, manuals | Code-friendly, structured |
| `legal` | Contracts | Numbered sections, formal |
| `academic` | Papers, theses | Citations, references |
| `creative` | Proposals | Modern, colorful |
| `minimal` | Simple docs | Clean, minimal formatting |

### Custom Styling
```bash
create-document docs/report.md \
  --font "Calibri" \
  --heading-font "Arial" \
  --font-size 11 \
  --line-spacing 1.5
```

## Output

### Files Generated
```
output/
├── technical-spec.docx     # Main document
└── technical-spec.md       # Source reference
```

### Document Features
```
✅ Proper heading hierarchy
✅ Table of contents (if requested)
✅ Formatted code blocks
✅ Styled tables
✅ Embedded images
✅ Hyperlinks preserved
✅ Page numbers
✅ Headers/footers (if specified)
```

## Reverse Conversion (DOCX → Markdown)

```bash
# Basic extraction
create-document --reverse uploads/document.docx

# With tracked changes
create-document --reverse uploads/reviewed.docx --track-changes

# Output includes:
# - Insertions marked with {++text++}
# - Deletions marked with {--text--}
```

### Extraction Mapping
```
Heading 1 → # Heading
Heading 2 → ## Heading
Heading 3 → ### Heading
Normal → Paragraph
Bold → **text**
Italic → *text*
Bulleted List → - item
Numbered List → 1. item
Table → | Markdown | Table |
Hyperlink → [text](url)
Image → ![alt](path)
Comment → <!-- Comment -->
Track Insert → {++inserted++}
Track Delete → {--deleted--}
```

## Examples

### Example 1: Technical Specification
```bash
create-document docs/api-spec.md --style technical --toc

# Input markdown:
# API Specification v2.0

## Overview
This document describes the REST API endpoints...

## Authentication
### OAuth 2.0
All requests must include...

### API Keys
For server-to-server...

## Endpoints
### GET /users
Returns a list of users...

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit     | int  | No       | Max results |
```

### Example 2: Contract Document
```bash
create-document docs/service-agreement.md --style legal --headers "CONFIDENTIAL"
```

### Example 3: From Template
```bash
create-document docs/proposal.md --template templates/company-proposal.docx
```

### Example 4: Extract with Redlines
```bash
create-document --reverse uploads/contract-reviewed.docx --track-changes
# Output shows all tracked changes in markdown format
```

## Integration

### Uses Skills
- `docx` - Core Word document generation
- `docx-js.md` - JavaScript document creation
- `ooxml.md` - XML manipulation for templates

### Uses Agent
- `document-generator` - Orchestration and workflow

## Best Practices

1. **Use proper heading levels** - Maintains document structure
2. **Include front matter** - Title, author, date as YAML
3. **Use semantic markup** - Bold for emphasis, not size
4. **Reference images properly** - Relative paths work best
5. **Review complex tables** - May need manual adjustment

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Missing images | Invalid paths | Use absolute paths |
| Table formatting | Complex tables | Simplify or use HTML |
| Code not styled | Missing language | Add language to code blocks |
| TOC empty | No headings | Ensure ## syntax used |

## Dependencies

```bash
# For document creation
npm install -g docx

# For text extraction
sudo apt-get install pandoc

# For advanced editing
pip install defusedxml
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-14 | Initial creation |

## Related Commands

- `/create-presentation` - PowerPoint files
- `/create-spreadsheet` - Excel files
- `/create-pdf` - PDF documents
- `/docs-to-office` - Batch conversion
