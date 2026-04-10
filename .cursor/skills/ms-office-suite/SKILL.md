---
name: ms-office-suite
description: "Comprehensive Microsoft Office document generation with custom styling, image support, and bidirectional markdown conversion. Covers PowerPoint, Word, Excel, and PDF creation with JSON/YAML style configuration."
license: Proprietary. LICENSE.txt has complete terms
---

# Microsoft Office Suite - Document Generation

## Overview

This skill provides unified patterns for generating professional Microsoft Office documents (PowerPoint, Word, Excel, PDF) with support for:
- **Custom Styling** via JSON, YAML, or markdown front matter
- **Image Support** with automatic embedding and positioning
- **Bidirectional Conversion** between markdown and Office formats
- **Template Integration** for brand consistency

## Style Configuration

### JSON Style Configuration

Create a `document-styles.json` file in your project:

```json
{
  "global": {
    "primaryColor": "#2C3E50",
    "secondaryColor": "#3498DB",
    "accentColor": "#E74C3C",
    "fontFamily": "Arial",
    "fontSize": 11,
    "lineSpacing": 1.5
  },
  "presentation": {
    "theme": "corporate-blue",
    "slideWidth": 10,
    "slideHeight": 5.625,
    "titleFontSize": 44,
    "bodyFontSize": 24,
    "bulletFontSize": 20,
    "colors": {
      "background": "#FFFFFF",
      "title": "#2C3E50",
      "body": "#34495E",
      "accent": "#3498DB"
    },
    "fonts": {
      "title": "Arial Black",
      "body": "Arial",
      "code": "Courier New"
    }
  },
  "document": {
    "style": "professional",
    "margins": {
      "top": "1in",
      "bottom": "1in",
      "left": "1.25in",
      "right": "1in"
    },
    "colors": {
      "heading": "#2C3E50",
      "body": "#333333",
      "link": "#3498DB"
    },
    "fonts": {
      "heading": "Arial",
      "body": "Calibri",
      "code": "Consolas"
    },
    "sizes": {
      "h1": 24,
      "h2": 18,
      "h3": 14,
      "body": 11,
      "code": 10
    }
  },
  "spreadsheet": {
    "style": "financial",
    "colors": {
      "input": "#0000FF",
      "formula": "#000000",
      "header": "#2C3E50",
      "headerBg": "#ECF0F1",
      "alternate": "#F8F9FA"
    },
    "formats": {
      "currency": "$#,##0;($#,##0);-",
      "percentage": "0.0%",
      "date": "MM/DD/YYYY",
      "number": "#,##0"
    }
  },
  "pdf": {
    "pageSize": "letter",
    "orientation": "portrait",
    "margins": {
      "top": 72,
      "bottom": 72,
      "left": 72,
      "right": 72
    },
    "header": {
      "text": "",
      "fontSize": 9,
      "alignment": "center"
    },
    "footer": {
      "text": "Page {page} of {pages}",
      "fontSize": 9,
      "alignment": "center"
    }
  }
}
```

### YAML Style Configuration

Alternatively, use `document-styles.yaml`:

```yaml
global:
  primaryColor: "#2C3E50"
  secondaryColor: "#3498DB"
  accentColor: "#E74C3C"
  fontFamily: Arial
  fontSize: 11
  lineSpacing: 1.5

presentation:
  theme: corporate-blue
  slideWidth: 10
  slideHeight: 5.625
  colors:
    background: "#FFFFFF"
    title: "#2C3E50"
    body: "#34495E"
    accent: "#3498DB"
  fonts:
    title: Arial Black
    body: Arial
    code: Courier New

document:
  style: professional
  margins:
    top: 1in
    bottom: 1in
    left: 1.25in
    right: 1in
  fonts:
    heading: Arial
    body: Calibri
    code: Consolas

spreadsheet:
  style: financial
  headerRow:
    bold: true
    background: "#ECF0F1"
    border: true
  alternateRows: true
  alternateColor: "#F8F9FA"

pdf:
  pageSize: letter
  orientation: portrait
  watermark: ""
  password: ""
```

### Markdown Front Matter Styling

Embed styles directly in markdown files:

```markdown
---
title: "Quarterly Report Q4 2025"
format: pptx
style:
  theme: bold-tech
  primaryColor: "#FF3366"
  secondaryColor: "#00D9FF"
  fonts:
    title: Impact
    body: Arial
  background:
    type: gradient
    colors: ["#1a1a2e", "#16213e"]
images:
  logo: ./assets/company-logo.png
  background: ./assets/hero-image.jpg
---

# Quarterly Report

## Highlights
- Revenue up 25%
- New markets launched
```

## Image Support

### Image Syntax in Markdown

```markdown
# Standard image
![Alt text](path/to/image.png)

# Image with size
![Alt text](path/to/image.png){width=50%}

# Image with caption
![Alt text](path/to/image.png)
*Figure 1: Image caption*

# Image with position
![Alt text](path/to/image.png){align=center}

# Background image (presentations)
![background](path/to/background.jpg){type=background}

# Logo placement
![logo](path/to/logo.png){position=header-right}
```

### Image Configuration in JSON

```json
{
  "images": {
    "logo": {
      "path": "./assets/logo.png",
      "position": "header-right",
      "width": 100,
      "height": 40
    },
    "background": {
      "path": "./assets/bg.jpg",
      "opacity": 0.3,
      "stretch": true
    },
    "watermark": {
      "path": "./assets/watermark.png",
      "position": "center",
      "opacity": 0.1
    }
  },
  "imageDefaults": {
    "maxWidth": 600,
    "quality": 85,
    "format": "png"
  }
}
```

### Image Positions

| Position | Description | Formats |
|----------|-------------|---------|
| `inline` | Flow with text | All |
| `center` | Centered on line | All |
| `left` | Float left | docx, pdf |
| `right` | Float right | docx, pdf |
| `full-width` | Span full width | All |
| `background` | Slide/page background | pptx, pdf |
| `header-left` | Header area left | docx, pdf |
| `header-right` | Header area right | docx, pdf |
| `footer-left` | Footer area left | docx, pdf |
| `footer-right` | Footer area right | docx, pdf |
| `cover` | Cover entire slide | pptx |

## Format-Specific Styling

### PowerPoint (PPTX) Styling

```json
{
  "presentation": {
    "master": {
      "backgroundColor": "#FFFFFF",
      "titleSlide": {
        "titleColor": "#2C3E50",
        "titleFont": "Arial Black",
        "titleSize": 44,
        "subtitleColor": "#7F8C8D",
        "subtitleFont": "Arial",
        "subtitleSize": 24
      },
      "contentSlide": {
        "headerColor": "#2C3E50",
        "headerFont": "Arial",
        "headerSize": 32,
        "bodyColor": "#34495E",
        "bodyFont": "Arial",
        "bodySize": 18,
        "bulletColor": "#3498DB"
      }
    },
    "charts": {
      "colors": ["#3498DB", "#2ECC71", "#E74C3C", "#F39C12", "#9B59B6"],
      "fontFamily": "Arial",
      "fontSize": 11,
      "gridLines": true
    },
    "tables": {
      "headerBg": "#2C3E50",
      "headerColor": "#FFFFFF",
      "borderColor": "#BDC3C7",
      "alternateRow": "#ECF0F1"
    }
  }
}
```

### Word (DOCX) Styling

```json
{
  "document": {
    "pageSetup": {
      "size": "letter",
      "orientation": "portrait",
      "margins": {
        "top": 1440,
        "bottom": 1440,
        "left": 1800,
        "right": 1440
      }
    },
    "styles": {
      "Title": {
        "font": "Arial Black",
        "size": 36,
        "color": "#2C3E50",
        "spacing": { "after": 400 }
      },
      "Heading1": {
        "font": "Arial",
        "size": 28,
        "color": "#2C3E50",
        "bold": true,
        "spacing": { "before": 400, "after": 200 }
      },
      "Heading2": {
        "font": "Arial",
        "size": 22,
        "color": "#34495E",
        "bold": true,
        "spacing": { "before": 300, "after": 150 }
      },
      "Normal": {
        "font": "Calibri",
        "size": 22,
        "color": "#333333",
        "spacing": { "line": 276 }
      },
      "Code": {
        "font": "Consolas",
        "size": 20,
        "color": "#333333",
        "shading": "#F5F5F5"
      }
    },
    "tableOfContents": {
      "enabled": true,
      "depth": 3,
      "pageNumbers": true
    },
    "headerFooter": {
      "header": {
        "text": "",
        "alignment": "right",
        "image": "./assets/logo.png"
      },
      "footer": {
        "text": "Page {PAGE} of {NUMPAGES}",
        "alignment": "center"
      }
    }
  }
}
```

### Excel (XLSX) Styling

```json
{
  "spreadsheet": {
    "defaultFont": {
      "name": "Calibri",
      "size": 11
    },
    "headerStyle": {
      "font": {
        "bold": true,
        "color": "#FFFFFF"
      },
      "fill": {
        "type": "solid",
        "color": "#2C3E50"
      },
      "border": {
        "style": "thin",
        "color": "#000000"
      },
      "alignment": {
        "horizontal": "center",
        "vertical": "center"
      }
    },
    "dataStyle": {
      "border": {
        "style": "thin",
        "color": "#BDC3C7"
      }
    },
    "alternateRowStyle": {
      "fill": {
        "type": "solid",
        "color": "#F8F9FA"
      }
    },
    "numberFormats": {
      "currency": {
        "pattern": "$#,##0.00;[Red]($#,##0.00)",
        "columns": ["Revenue", "Cost", "Profit"]
      },
      "percentage": {
        "pattern": "0.0%",
        "columns": ["Growth", "Margin"]
      },
      "date": {
        "pattern": "YYYY-MM-DD",
        "columns": ["Date", "Created"]
      }
    },
    "conditionalFormatting": {
      "negativeRed": {
        "condition": "< 0",
        "style": { "font": { "color": "#FF0000" } }
      },
      "positiveGreen": {
        "condition": "> 0",
        "style": { "font": { "color": "#27AE60" } }
      }
    }
  }
}
```

### PDF Styling

```json
{
  "pdf": {
    "pageSize": [612, 792],
    "margins": [72, 72, 72, 72],
    "styles": {
      "title": {
        "fontName": "Helvetica-Bold",
        "fontSize": 24,
        "textColor": [44, 62, 80],
        "alignment": "center",
        "spaceBefore": 0,
        "spaceAfter": 24
      },
      "heading1": {
        "fontName": "Helvetica-Bold",
        "fontSize": 18,
        "textColor": [44, 62, 80],
        "spaceBefore": 18,
        "spaceAfter": 12
      },
      "heading2": {
        "fontName": "Helvetica-Bold",
        "fontSize": 14,
        "textColor": [52, 73, 94],
        "spaceBefore": 14,
        "spaceAfter": 8
      },
      "body": {
        "fontName": "Helvetica",
        "fontSize": 11,
        "textColor": [51, 51, 51],
        "leading": 16,
        "alignment": "justify"
      },
      "code": {
        "fontName": "Courier",
        "fontSize": 10,
        "textColor": [51, 51, 51],
        "backColor": [245, 245, 245]
      }
    },
    "header": {
      "height": 40,
      "text": "",
      "image": "",
      "fontSize": 9,
      "alignment": "right"
    },
    "footer": {
      "height": 30,
      "text": "Page {page}",
      "fontSize": 9,
      "alignment": "center"
    },
    "watermark": {
      "text": "",
      "fontSize": 72,
      "color": [200, 200, 200],
      "opacity": 0.3,
      "rotation": 45
    }
  }
}
```

## Complete Style Templates

### Corporate Template

```json
{
  "name": "Corporate Professional",
  "global": {
    "primaryColor": "#1C2833",
    "secondaryColor": "#2E4053",
    "accentColor": "#2980B9",
    "fontFamily": "Arial"
  },
  "presentation": {
    "theme": "corporate",
    "colors": {
      "background": "#FFFFFF",
      "title": "#1C2833",
      "body": "#2E4053",
      "accent": "#2980B9"
    }
  },
  "document": {
    "style": "professional",
    "fonts": {
      "heading": "Arial",
      "body": "Calibri"
    }
  },
  "spreadsheet": {
    "style": "financial",
    "colors": {
      "header": "#1C2833",
      "headerBg": "#ECF0F1"
    }
  }
}
```

### Modern Tech Template

```json
{
  "name": "Modern Tech",
  "global": {
    "primaryColor": "#FF3366",
    "secondaryColor": "#00D9FF",
    "accentColor": "#FFCC00",
    "fontFamily": "Inter"
  },
  "presentation": {
    "theme": "bold-tech",
    "colors": {
      "background": "#1a1a2e",
      "title": "#FFFFFF",
      "body": "#E0E0E0",
      "accent": "#FF3366"
    }
  },
  "document": {
    "style": "modern",
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    }
  }
}
```

### Elegant Minimal Template

```json
{
  "name": "Elegant Minimal",
  "global": {
    "primaryColor": "#2C3E50",
    "secondaryColor": "#95A5A6",
    "accentColor": "#C89666",
    "fontFamily": "Georgia"
  },
  "presentation": {
    "theme": "minimal",
    "colors": {
      "background": "#FAFAFA",
      "title": "#2C3E50",
      "body": "#555555"
    }
  },
  "document": {
    "style": "elegant",
    "fonts": {
      "heading": "Playfair Display",
      "body": "Georgia"
    }
  }
}
```

## Usage Examples

### Example 1: Styled Presentation

```bash
# Using JSON config
create-presentation docs/pitch.md --style-config ./styles/corporate.json

# Using inline front matter
# (see markdown front matter section above)

# Output with logo
create-presentation docs/pitch.md \
  --logo ./assets/logo.png \
  --background ./assets/bg-gradient.png
```

### Example 2: Branded Document

```bash
# With style configuration
create-document docs/proposal.md \
  --style-config ./styles/brand.json \
  --logo ./assets/logo.png \
  --header "CONFIDENTIAL"

# Result includes:
# - Company logo in header
# - Branded colors and fonts
# - Page numbers in footer
```

### Example 3: Financial Spreadsheet

```bash
# Financial model with custom formatting
create-spreadsheet docs/budget.md \
  --style-config ./styles/financial.json \
  --validate

# Applies:
# - Blue for inputs
# - Black for formulas
# - Currency formatting
# - Conditional formatting
```

### Example 4: Multi-Format Export

```bash
# Export all formats with consistent branding
docs-to-office docs/quarterly-report.md \
  --all-formats \
  --style-config ./styles/company.json \
  --logo ./assets/logo.png
```

## Best Practices

### 1. Centralize Styles
- Keep one `document-styles.json` per project
- Version control style configurations
- Share styles across team

### 2. Optimize Images
- Compress images before embedding
- Use appropriate formats (PNG for logos, JPEG for photos)
- Provide multiple sizes for responsive layouts

### 3. Test Across Formats
- Preview in actual applications (PowerPoint, Word, Excel)
- Check printing layout for PDFs
- Verify all images display correctly

### 4. Use Templates
- Create base templates for consistency
- Extend templates for specific needs
- Document template usage

## Dependencies

```bash
# All format support
npm install -g pptxgenjs docx sharp playwright
pip install openpyxl pandas reportlab pypdf pdfplumber Pillow

# Image processing
pip install Pillow sharp
npm install -g sharp

# Style parsing
pip install pyyaml
```

## Related Commands

- `/create-presentation` - PowerPoint generation
- `/create-document` - Word generation
- `/create-spreadsheet` - Excel generation
- `/create-pdf` - PDF generation
- `/docs-to-office` - Batch conversion

## Related Skills

- `pptx` - Core PowerPoint skill
- `docx` - Core Word skill
- `xlsx` - Core Excel skill
- `pdf` - Core PDF skill
- `frontend-design` - Design principles

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-14 | Initial creation |
