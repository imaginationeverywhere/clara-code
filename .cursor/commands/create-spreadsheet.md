# Create Spreadsheet Command

> **Command:** `create-spreadsheet`
> **Version:** 1.0.0
> **Category:** Document Generation
> **Agent:** document-generator

## Purpose

Generate professional Excel spreadsheets (.xlsx) from markdown files containing tables, data, or financial information. Automatically creates formulas instead of hardcoded calculations. Supports bidirectional conversion.

## Usage

```bash
# From markdown with tables
create-spreadsheet docs/sales-data.md

# From topic/description
create-spreadsheet "Monthly Budget Template with Expense Categories"

# With output path
create-spreadsheet docs/financial-report.md --output spreadsheets/

# Financial model mode
create-spreadsheet docs/projections.md --financial

# Reverse: Extract to markdown
create-spreadsheet --reverse uploads/data.xlsx
```

## Options

| Option | Description | Example |
|--------|-------------|---------|
| `--output` | Output directory | `--output ./spreadsheets/` |
| `--financial` | Financial model formatting | `--financial` |
| `--reverse` | Extract to markdown | `--reverse file.xlsx` |
| `--formulas` | Show formula analysis | `--formulas` |
| `--validate` | Run formula validation | `--validate` |
| `--sheets` | Multiple sheet names | `--sheets "Data,Summary"` |
| `--template` | Use Excel template | `--template template.xlsx` |

## Workflow

### Step 1: Content Analysis
```
Input: docs/sales-report.md

Tables Found: 3
- Table 1: Sales by Region (5 columns, 12 rows)
- Table 2: Product Performance (4 columns, 8 rows)
- Table 3: Quarterly Summary (6 columns, 4 rows)

Calculations Detected:
- Column totals (SUM)
- Percentage growth (formula)
- Averages (AVERAGE)
```

### Step 2: Formula Generation
```
Detected Patterns → Excel Formulas:
- "Total" row → =SUM(B2:B11)
- "Growth %" → =(B2-A2)/A2
- "Average" → =AVERAGE(B2:B11)
- "YoY Change" → =B2-B$2

Color Coding:
- Blue: Input cells (hardcoded values)
- Black: Formula cells
- Green: Cross-sheet references
```

### Step 3: Formatting Application
```
Applied Formatting:
- Headers: Bold, background color, borders
- Currency: $#,##0 format
- Percentages: 0.0% format
- Negatives: (123) format with red
- Dates: MM/DD/YYYY format
```

### Step 4: Validation
```
Running recalc.py...
✅ All formulas calculated successfully
✅ No #REF! errors
✅ No #DIV/0! errors
✅ No circular references
```

## Markdown Table Mapping

```markdown
| Region | Q1 Sales | Q2 Sales | Growth |
|--------|----------|----------|--------|
| North  | $150,000 | $175,000 | 16.7%  |
| South  | $120,000 | $138,000 | 15.0%  |
| Total  | $270,000 | $313,000 | 15.9%  |

↓ Converts to Excel with:
- Proper currency formatting
- Total row uses =SUM() formulas
- Growth column uses percentage formulas
- Headers styled with bold and borders
```

## Automatic Formula Detection

### Recognized Patterns

| Keyword | Generated Formula |
|---------|-------------------|
| Total | `=SUM(range)` |
| Sum | `=SUM(range)` |
| Average | `=AVERAGE(range)` |
| Count | `=COUNT(range)` |
| Max | `=MAX(range)` |
| Min | `=MIN(range)` |
| Growth % | `=(new-old)/old` |
| YoY | `=current-previous` |
| Variance | `=actual-budget` |

### Formula Preservation Rules
```python
# ❌ NEVER hardcode calculations
total = sum(values)  # Bad
sheet['B10'] = total  # Hardcodes result

# ✅ ALWAYS use Excel formulas
sheet['B10'] = '=SUM(B2:B9)'  # Dynamic
```

## Financial Model Standards

When `--financial` flag is used:

### Color Coding
| Color | Meaning | Use |
|-------|---------|-----|
| Blue text | Inputs | User-changeable values |
| Black text | Formulas | Calculated values |
| Green text | Links | Cross-sheet references |
| Red text | External | Links to other files |
| Yellow bg | Attention | Key assumptions |

### Number Formatting
```
Years: Text ("2024" not 2,024)
Currency: $#,##0 with units in header
Zeros: Displayed as "-"
Percentages: 0.0% format
Multiples: 0.0x format
Negatives: (123) not -123
```

## Output

### Files Generated
```
output/
├── sales-report.xlsx       # Main spreadsheet
├── sales-report.log        # Formula validation log
└── sales-report.md         # Source reference
```

### Spreadsheet Features
```
✅ Proper column widths
✅ Header formatting
✅ Number formatting
✅ Formula calculations
✅ Conditional formatting (if applicable)
✅ Print area set
✅ Freeze panes (headers)
```

## Reverse Conversion (XLSX → Markdown)

```bash
# Extract spreadsheet to markdown
create-spreadsheet --reverse uploads/data.xlsx

# Output: docs/data.md with tables
```

### Extraction Features
```
- Each sheet → Separate section (## Sheet Name)
- Data → Markdown tables
- Formulas → Calculated values shown
- Multiple sheets supported
- Preserves numeric formatting
```

## Examples

### Example 1: Sales Report
```bash
create-spreadsheet docs/quarterly-sales.md --financial

# Input markdown:
## Q4 Sales by Region

| Region | Oct | Nov | Dec | Total |
|--------|-----|-----|-----|-------|
| North | $45,000 | $52,000 | $68,000 | Total |
| South | $38,000 | $41,000 | $55,000 | Total |
| West | $29,000 | $33,000 | $42,000 | Total |
| **Total** | Sum | Sum | Sum | Sum |

# Generated Excel has:
# - =SUM(B2:D2) for row totals
# - =SUM(B2:B4) for column totals
# - Proper currency formatting
# - Financial color coding
```

### Example 2: Budget Template
```bash
create-spreadsheet "Monthly Budget with Categories" --sheets "Budget,Actuals,Variance"
```

### Example 3: Data Analysis
```bash
create-spreadsheet docs/survey-results.md --validate

# Runs recalc.py after generation
# Reports any formula errors
```

## Integration

### Uses Skills
- `xlsx` - Core Excel generation
- `openpyxl` - Python Excel library
- `recalc.py` - Formula validation

### Uses Agent
- `document-generator` - Orchestration and workflow

## Best Practices

1. **Use descriptive headers** - Becomes column headers
2. **Include units in headers** - "Revenue ($000s)"
3. **Mark calculated rows** - Use "Total", "Sum", "Average"
4. **Separate data sheets** - Use `--sheets` for organization
5. **Always validate** - Use `--validate` flag

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| #REF! errors | Invalid cell references | Check formula ranges |
| #DIV/0! | Division by zero | Add IFERROR wrapper |
| Wrong format | Number detection | Specify format explicitly |
| Missing formulas | Not detected | Use formula keywords |

## Dependencies

```bash
# Required
pip install openpyxl pandas

# For formula recalculation
# LibreOffice (auto-configured by recalc.py)
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-14 | Initial creation |

## Related Commands

- `/create-presentation` - PowerPoint files
- `/create-document` - Word documents
- `/create-pdf` - PDF documents
- `/docs-to-office` - Batch conversion
