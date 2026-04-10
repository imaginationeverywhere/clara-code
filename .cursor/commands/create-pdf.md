# Create PDF Command

> **Command:** `create-pdf`
> **Version:** 1.0.0
> **Category:** Document Generation
> **Agent:** document-generator

## Purpose

Generate professional PDF documents from markdown files, topics, or content. Supports various layouts, styling options, and PDF-specific features like forms, watermarks, and password protection. Supports bidirectional conversion.

## Usage

```bash
# From markdown file
create-pdf docs/proposal.md

# From topic
create-pdf "Executive Summary Report"

# With output path
create-pdf docs/contract.md --output pdfs/

# With styling
create-pdf docs/report.md --style "professional" --header "CONFIDENTIAL"

# With form fields
create-pdf docs/application-form.md --fillable

# Reverse: Extract to markdown
create-pdf --reverse uploads/document.pdf
```

## Options

| Option | Description | Example |
|--------|-------------|---------|
| `--output` | Output directory | `--output ./pdfs/` |
| `--style` | Document style preset | `--style "professional"` |
| `--reverse` | Extract to markdown | `--reverse file.pdf` |
| `--fillable` | Create fillable form | `--fillable` |
| `--watermark` | Add watermark | `--watermark "DRAFT"` |
| `--password` | Password protect | `--password "secret"` |
| `--header` | Page header text | `--header "Company Name"` |
| `--footer` | Page footer text | `--footer "Page {page}"` |
| `--landscape` | Landscape orientation | `--landscape` |
| `--margins` | Custom margins | `--margins "1in,1in,1in,1in"` |

## Workflow

### Step 1: Content Analysis
```
Input: docs/proposal.md

Analysis:
- Title: Project Proposal
- Sections: 5 main sections
- Paragraphs: 28
- Tables: 2
- Images: 4
- Code blocks: 0

Recommended: Professional style, portrait
Estimated pages: 8-10
```

### Step 2: Layout Planning
```
Page Layout:
├── Page 1: Title page
├── Page 2: Table of contents
├── Pages 3-7: Content sections
├── Page 8: Appendix/Tables
└── Footer: Page numbers
```

### Step 3: Styling Application
```
Styles Applied:
- Title: 24pt, Bold, Centered
- Headings: 16pt, Bold, Blue (#2C3E50)
- Body: 11pt, Black, Justified
- Tables: Bordered, Header row shaded
- Images: Centered, Caption below
- Code: Monospace, Gray background
```

### Step 4: PDF Generation
```
Using: reportlab (Python)
Features:
✅ Multi-page support
✅ Automatic page breaks
✅ Table of contents
✅ Page numbers
✅ Headers/footers
✅ Embedded images
```

## Markdown Structure Mapping

```markdown
# Document Title → Title page or main heading

## Section → Section heading with page break option

### Subsection → Subsection heading

Paragraph text → Body text, justified

**Bold** → Bold text
*Italic* → Italic text
`code` → Monospace inline

- Bullet → Bulleted list
1. Number → Numbered list

| Table | → PDF table with borders

> Blockquote → Indented, styled quote

![Image](path) → Embedded image

---

Horizontal rule → Page break (optional)
```

## Document Styles

### Built-in Styles

| Style | Best For | Features |
|-------|----------|----------|
| `professional` | Business docs | Clean, corporate |
| `modern` | Marketing | Bold colors, modern fonts |
| `academic` | Papers | Formal, references |
| `minimal` | Simple docs | Clean, minimal |
| `report` | Reports | Structured, TOC |
| `invoice` | Invoices | Grid layout, totals |

### Custom Styling
```bash
create-pdf docs/report.md \
  --font "Helvetica" \
  --font-size 11 \
  --primary-color "#2C3E50" \
  --margins "1.25in,1in,1in,1in"
```

## PDF Features

### Table of Contents
```bash
create-pdf docs/manual.md --toc
# Generates clickable TOC from headings
```

### Watermarks
```bash
create-pdf docs/draft.md --watermark "DRAFT"
create-pdf docs/confidential.md --watermark "CONFIDENTIAL"
```

### Password Protection
```bash
create-pdf docs/sensitive.md --password "userpass" --owner-password "ownerpass"
# User can view, owner can edit
```

### Fillable Forms
```bash
create-pdf docs/application.md --fillable
# Converts form markers to fillable fields
```

Form field syntax in markdown:
```markdown
Name: [__text_field__]
Email: [__email_field__]
Date: [__date_field__]
[x] I agree to terms [__checkbox__]
```

### Headers and Footers
```bash
create-pdf docs/report.md \
  --header "Company Name | {date}" \
  --footer "Page {page} of {pages}"
```

## Output

### Files Generated
```
output/
├── proposal.pdf            # Main PDF document
└── proposal.md             # Source reference
```

### PDF Features Included
```
✅ Searchable text (not image-based)
✅ Clickable links
✅ Table of contents (if requested)
✅ Embedded fonts
✅ Compressed images
✅ PDF/A compliant (optional)
```

## Reverse Conversion (PDF → Markdown)

```bash
# Basic text extraction
create-pdf --reverse uploads/document.pdf

# With table extraction
create-pdf --reverse uploads/report.pdf --extract-tables

# OCR for scanned PDFs
create-pdf --reverse uploads/scanned.pdf --ocr
```

### Extraction Features
```
- Text preserved with structure
- Tables converted to markdown
- Images extracted to folder
- Links preserved
- OCR for scanned documents
```

## Examples

### Example 1: Business Proposal
```bash
create-pdf docs/client-proposal.md --style professional --toc --header "PROPOSAL"

# Input markdown:
# Project Proposal

## Executive Summary
Lorem ipsum dolor sit amet...

## Project Scope
### Phase 1: Discovery
- Requirements gathering
- Stakeholder interviews

### Phase 2: Development
- Frontend development
- Backend API

## Timeline
| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Discovery | 2 weeks | Requirements doc |
| Development | 8 weeks | Working software |

## Investment
Total project cost: $75,000
```

### Example 2: Invoice
```bash
create-pdf docs/invoice-template.md --style invoice
```

### Example 3: Fillable Form
```bash
create-pdf docs/application-form.md --fillable

# Markdown:
## Application Form

**Name:** [__text_field:name__]
**Email:** [__email_field:email__]
**Phone:** [__text_field:phone__]

**Position Applied For:**
[ ] Software Engineer [__checkbox:position_se__]
[ ] Product Manager [__checkbox:position_pm__]
[ ] Designer [__checkbox:position_design__]

**Cover Letter:**
[__textarea:cover_letter__]
```

### Example 4: Watermarked Draft
```bash
create-pdf docs/contract.md --watermark "DRAFT" --password "review123"
```

## Integration

### Uses Skills
- `pdf` - Core PDF generation
- `reportlab` - Python PDF library
- `pypdf` - PDF manipulation
- `pdfplumber` - Text extraction

### Uses Agent
- `document-generator` - Orchestration and workflow

## Best Practices

1. **Use clear heading hierarchy** - Creates proper TOC
2. **Optimize images first** - Large images slow generation
3. **Test form fields** - Verify fillable fields work
4. **Check page breaks** - Use `---` for manual breaks
5. **Review before sharing** - Generate preview first

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Missing images | Invalid paths | Use absolute paths |
| Bad page breaks | Long content | Add manual breaks |
| Form fields missing | Syntax error | Check field markers |
| Slow generation | Large images | Compress images first |
| OCR errors | Poor scan quality | Improve source quality |

## Dependencies

```bash
# For PDF creation
pip install reportlab pypdf

# For text extraction
pip install pdfplumber

# For table extraction
pip install pandas

# For OCR (scanned PDFs)
pip install pytesseract pdf2image
sudo apt-get install tesseract-ocr poppler-utils
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-14 | Initial creation |

## Related Commands

- `/create-presentation` - PowerPoint files
- `/create-document` - Word documents
- `/create-spreadsheet` - Excel files
- `/docs-to-office` - Batch conversion
