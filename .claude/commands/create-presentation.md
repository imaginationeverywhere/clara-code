# Create Presentation Command

> **Command:** `create-presentation`
> **Version:** 1.0.0
> **Category:** Document Generation
> **Agent:** document-generator

## Purpose

Generate professional PowerPoint presentations from markdown files, topics, or outlines. Supports bidirectional conversion - can also extract presentations back to markdown.

## Usage

```bash
# From markdown file
create-presentation docs/project-overview.md

# From topic/outline
create-presentation "Quarterly Sales Report Q4 2025"

# With output path
create-presentation docs/pitch-deck.md --output presentations/

# With design theme
create-presentation docs/tech-talk.md --theme "bold-tech"

# Reverse: Extract to markdown
create-presentation --reverse uploads/existing.pptx
```

## Options

| Option | Description | Example |
|--------|-------------|---------|
| `--output` | Output directory | `--output ./presentations/` |
| `--theme` | Design theme | `--theme "corporate-blue"` |
| `--reverse` | Extract to markdown | `--reverse file.pptx` |
| `--template` | Use existing template | `--template template.pptx` |
| `--slides` | Max slides | `--slides 10` |
| `--thumbnails` | Generate preview | `--thumbnails` |

## Workflow

### Step 1: Content Analysis
```
Input: docs/quarterly-report.md

Analysis:
- H1 headings: 1 (title slide)
- H2 headings: 4 (section slides)
- Bullet lists: 12 (content points)
- Tables: 2 (data slides)
- Images: 3 (visual slides)

Recommended: 8-10 slides
```

### Step 2: Design Selection
```
Content Type: Business Report
Recommended Theme: Professional Blue (#1C2833, #2E4053, #AAB7B8)

Alternative Themes:
- Corporate Teal (#5EA8A7, #277884)
- Bold Red (#C0392B, #E74C3C)
- Elegant Gold (#BF9A4A, #000000)
```

### Step 3: Slide Generation
```
Slide 1: Title - "Quarterly Report Q4 2025"
Slide 2: Agenda - Overview of sections
Slide 3-6: Content sections from H2 headings
Slide 7: Data visualization (from tables)
Slide 8: Summary/Conclusion
```

### Step 4: Validation
```
✅ Generated thumbnails for review
✅ Checked text overflow
✅ Verified image placement
✅ Confirmed consistent styling
```

## Markdown Structure Mapping

```markdown
# Title → Title Slide

## Section → Section Divider Slide

### Subsection → Content Slide Title

- Bullet point → Slide bullet
- Another point → Slide bullet

| Table | Data | → Data slide or chart
|-------|------|
| Row 1 | Val  |

![Image](path) → Image slide
```

## Design Themes

### Built-in Themes

| Theme | Primary | Secondary | Best For |
|-------|---------|-----------|----------|
| `corporate-blue` | #1C2833 | #2E4053 | Business, Finance |
| `bold-tech` | #FF3366 | #00D9FF | Tech, Startups |
| `elegant-gold` | #BF9A4A | #000000 | Luxury, Premium |
| `fresh-teal` | #5EA8A7 | #277884 | Healthcare, Wellness |
| `vibrant-orange` | #F96D00 | #222831 | Marketing, Creative |
| `forest-green` | #1E5128 | #4E9F3D | Environment, Organic |
| `warm-blush` | #EED6D3 | #A49393 | Fashion, Beauty |
| `deep-purple` | #B165FB | #181B24 | Entertainment, Events |

### Custom Theme
```bash
create-presentation docs/pitch.md \
  --primary "#FF5733" \
  --secondary "#2C3E50" \
  --accent "#F1C40F"
```

## Output

### Files Generated
```
output/
├── quarterly-report.pptx      # Main presentation
├── quarterly-report-thumbs/   # Thumbnail images (if --thumbnails)
│   ├── slide-0.jpg
│   ├── slide-1.jpg
│   └── ...
└── quarterly-report.md        # Source tracking
```

### Presentation Structure
```
Slide 0: Title slide
Slide 1: Agenda/Overview
Slides 2-N: Content slides
Final Slide: Thank you/Contact
```

## Reverse Conversion (PPTX → Markdown)

```bash
# Extract presentation to markdown
create-presentation --reverse uploads/presentation.pptx

# Output: docs/presentation.md
```

### Extraction Mapping
```
Title Slide → # Title
Section Slides → ## Section
Content → - Bullet points
Tables → | Markdown | Tables |
Speaker Notes → > Blockquotes
```

## Examples

### Example 1: Sales Report
```bash
create-presentation docs/sales-q4.md --theme corporate-blue

# Input markdown:
# Q4 2025 Sales Report

## Executive Summary
- Revenue up 15%
- New customers: 1,200
- Market expansion complete

## Regional Performance
| Region | Revenue | Growth |
|--------|---------|--------|
| North  | $2.1M   | +18%   |
| South  | $1.8M   | +12%   |

## Next Quarter Goals
- Launch new product line
- Expand to 3 new markets
```

### Example 2: Tech Pitch
```bash
create-presentation "AI Platform Pitch Deck" --theme bold-tech --slides 12
```

### Example 3: From Template
```bash
create-presentation docs/proposal.md --template templates/company-template.pptx
```

## Integration

### Uses Skills
- `pptx` - Core PowerPoint generation
- `frontend-design` - Design principles and aesthetics

### Uses Agent
- `document-generator` - Orchestration and workflow

## Best Practices

1. **Structure your markdown well** - Clear headings create better slides
2. **Keep bullet points concise** - 5-7 words per point ideal
3. **Include images** - Reference images for visual slides
4. **Use tables for data** - Auto-converted to charts/data slides
5. **Review thumbnails** - Always check generated preview

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Text overflow | Too much content | Reduce text or split slides |
| Missing images | Invalid paths | Use absolute paths or copy to output |
| Poor design | Content mismatch | Try different theme |
| Slow generation | Large files | Reduce image sizes |

## Dependencies

```bash
# Required
npm install -g pptxgenjs playwright sharp

# For text extraction (reverse)
pip install "markitdown[pptx]"
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-14 | Initial creation |

## Related Commands

- `/create-document` - Word documents
- `/create-spreadsheet` - Excel files
- `/create-pdf` - PDF documents
- `/docs-to-office` - Batch conversion
