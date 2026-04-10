# Docs to Office Command

> **Command:** `docs-to-office`
> **Version:** 1.0.0
> **Category:** Document Generation
> **Agent:** document-generator

## Purpose

Bidirectional conversion between Markdown files in the `docs/` directory and Microsoft Office formats (PowerPoint, Word, Excel, PDF). Batch process multiple files or maintain synchronized documentation.

## Usage

```bash
# Convert all markdown in docs/ to Office formats
docs-to-office

# Convert specific file
docs-to-office docs/proposal.md

# Convert to specific format
docs-to-office docs/slides.md --format pptx
docs-to-office docs/report.md --format docx
docs-to-office docs/data.md --format xlsx
docs-to-office docs/final.md --format pdf

# Reverse: Convert Office files back to markdown
docs-to-office --reverse output/presentation.pptx
docs-to-office --reverse-all output/

# Bidirectional sync (watch mode)
docs-to-office --sync

# Batch convert entire directory
docs-to-office docs/ --output office-exports/ --all-formats
```

## Options

| Option | Description | Example |
|--------|-------------|---------|
| `--format` | Target format(s) | `--format pptx,docx` |
| `--output` | Output directory | `--output ./exports/` |
| `--reverse` | Office → Markdown | `--reverse file.pptx` |
| `--reverse-all` | Batch reverse | `--reverse-all ./office/` |
| `--sync` | Watch and sync | `--sync` |
| `--all-formats` | Generate all formats | `--all-formats` |
| `--auto-detect` | Auto-detect best format | `--auto-detect` |
| `--recursive` | Include subdirectories | `--recursive` |
| `--dry-run` | Preview without converting | `--dry-run` |

## Bidirectional Sync Workflow

### Markdown → Office (Forward Conversion)

```
docs/
├── presentation-slides.md    → output/presentation-slides.pptx
├── technical-spec.md         → output/technical-spec.docx
├── sales-data.md             → output/sales-data.xlsx
├── final-report.md           → output/final-report.pdf
└── project-plan.md           → output/project-plan.docx
```

### Office → Markdown (Reverse Conversion)

```
uploads/
├── quarterly-report.pptx     → docs/quarterly-report.md
├── contract-v2.docx          → docs/contract-v2.md
├── budget-2025.xlsx          → docs/budget-2025.md
└── proposal-final.pdf        → docs/proposal-final.md
```

## Auto-Detection Rules

When using `--auto-detect`, the format is chosen based on content:

| Content Pattern | Detected Format |
|-----------------|-----------------|
| Multiple H2 sections, bullet-heavy | `.pptx` (Presentation) |
| Long paragraphs, formal structure | `.docx` (Document) |
| Tables with numeric data, calculations | `.xlsx` (Spreadsheet) |
| "Final", "Print", form fields | `.pdf` (PDF) |
| Mixed content | `.docx` (Default) |

### Detection Keywords

```yaml
presentation_keywords:
  - slide
  - presentation
  - deck
  - pitch
  - talk

document_keywords:
  - report
  - proposal
  - specification
  - contract
  - manual

spreadsheet_keywords:
  - data
  - budget
  - financial
  - sales
  - metrics
  - calculations

pdf_keywords:
  - final
  - print
  - form
  - certificate
  - invoice
```

## Front Matter Support

Add YAML front matter to markdown files for explicit format control:

```markdown
---
title: "Q4 Sales Presentation"
format: pptx
theme: corporate-blue
output: presentations/q4-sales.pptx
---

# Q4 Sales Report

## Revenue Overview
- Total revenue: $2.1M
- Growth: +15% YoY
```

### Front Matter Options

```yaml
---
# Required
title: "Document Title"

# Format selection
format: pptx | docx | xlsx | pdf

# Output control
output: path/to/output.pptx
output_dir: ./exports/

# Presentation options (pptx)
theme: corporate-blue
slides: 10

# Document options (docx)
style: professional
toc: true
headers: "CONFIDENTIAL"

# Spreadsheet options (xlsx)
financial: true
sheets: "Data,Summary"

# PDF options
watermark: "DRAFT"
password: "secret"
fillable: false
---
```

## Batch Processing

### Convert All Docs
```bash
# Convert all .md files in docs/
docs-to-office docs/ --auto-detect

# Output structure:
output/
├── pptx/
│   ├── presentation-1.pptx
│   └── pitch-deck.pptx
├── docx/
│   ├── technical-spec.docx
│   └── proposal.docx
├── xlsx/
│   └── sales-data.xlsx
└── pdf/
    └── final-report.pdf
```

### Generate All Formats
```bash
# Generate all formats for a single file
docs-to-office docs/comprehensive-report.md --all-formats

# Output:
output/
├── comprehensive-report.pptx
├── comprehensive-report.docx
├── comprehensive-report.xlsx
└── comprehensive-report.pdf
```

## Sync Mode (Watch)

```bash
# Start sync mode
docs-to-office --sync

# Output:
📁 Watching docs/ for changes...
🔄 docs/proposal.md changed → Regenerating proposal.docx
✅ output/proposal.docx updated
🔄 docs/data.md changed → Regenerating data.xlsx
✅ output/data.xlsx updated
```

### Sync Configuration

Create `.docs-to-office.json` in project root:

```json
{
  "watch_dir": "docs/",
  "output_dir": "output/",
  "auto_detect": true,
  "formats": {
    "docs/presentations/": "pptx",
    "docs/reports/": "docx",
    "docs/data/": "xlsx",
    "docs/final/": "pdf"
  },
  "exclude": [
    "docs/drafts/",
    "docs/archive/"
  ],
  "on_change": "regenerate"
}
```

## Reverse Conversion Examples

### PowerPoint to Markdown
```bash
docs-to-office --reverse uploads/quarterly.pptx

# Output: docs/quarterly.md
# Structure:
# # Quarterly Report (from slide 1)
# ## Section Title (from slide 2)
# - Bullet point
# - Another point
```

### Word to Markdown
```bash
docs-to-office --reverse uploads/contract.docx --track-changes

# Output: docs/contract.md
# Tracked changes preserved:
# This is {++new++} text and {--deleted--} text.
```

### Excel to Markdown
```bash
docs-to-office --reverse uploads/budget.xlsx

# Output: docs/budget.md
# Each sheet as section:
# ## Sheet: Budget
# | Category | Amount |
# |----------|--------|
# | Salaries | $50,000 |
```

### PDF to Markdown
```bash
docs-to-office --reverse uploads/report.pdf --ocr

# Output: docs/report.md
# OCR for scanned documents
# Tables extracted where possible
```

## Directory Structure Convention

Recommended project structure:

```
project/
├── docs/                    # Source markdown files
│   ├── presentations/       # → PPTX
│   ├── reports/             # → DOCX
│   ├── data/                # → XLSX
│   └── final/               # → PDF
├── output/                  # Generated Office files
│   ├── pptx/
│   ├── docx/
│   ├── xlsx/
│   └── pdf/
├── uploads/                 # Office files to convert to MD
└── .docs-to-office.json     # Configuration
```

## Integration

### Uses Commands
- `/create-presentation` - PowerPoint generation
- `/create-document` - Word generation
- `/create-spreadsheet` - Excel generation
- `/create-pdf` - PDF generation

### Uses Agent
- `document-generator` - Orchestration

### Uses Skills
- `pptx`, `docx`, `xlsx`, `pdf` - Format-specific skills

## Examples

### Example 1: Convert Documentation Site
```bash
# Convert all docs to Office formats
docs-to-office docs/ --recursive --auto-detect --output exports/

# Result:
exports/
├── getting-started.docx
├── api-reference.docx
├── release-notes.pptx
├── pricing-comparison.xlsx
└── terms-of-service.pdf
```

### Example 2: Bidirectional Workflow
```bash
# 1. Create presentation from markdown
docs-to-office docs/pitch.md --format pptx

# 2. Edit in PowerPoint...

# 3. Extract changes back to markdown
docs-to-office --reverse output/pitch.pptx

# 4. Review diffs in docs/pitch.md
```

### Example 3: Automated Documentation Pipeline
```bash
# In CI/CD pipeline
docs-to-office docs/ \
  --output dist/docs/ \
  --all-formats \
  --recursive
```

## Best Practices

1. **Use front matter** - Explicit format control is clearer
2. **Organize by format** - Keep presentations, reports, data separate
3. **Version control markdown** - Office files are derived artifacts
4. **Review reverse conversions** - May need manual cleanup
5. **Use sync mode during development** - Auto-regenerate on save

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Wrong format detected | Content ambiguous | Use front matter or --format |
| Missing content | Extraction failed | Try different extraction tool |
| Sync not detecting | Watch not started | Run with --sync flag |
| Large batch slow | Many files | Use --dry-run first |

## Dependencies

All dependencies from individual format commands:

```bash
# PowerPoint
npm install -g pptxgenjs playwright sharp

# Word
npm install -g docx

# Excel
pip install openpyxl pandas

# PDF
pip install reportlab pypdf pdfplumber

# Extraction
pip install "markitdown[all]"
sudo apt-get install pandoc tesseract-ocr poppler-utils
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-14 | Initial creation |

## Related Commands

- `/create-presentation` - PowerPoint only
- `/create-document` - Word only
- `/create-spreadsheet` - Excel only
- `/create-pdf` - PDF only
