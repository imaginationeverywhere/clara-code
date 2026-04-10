# /legal-doc — Generate Legal Documents

**Agent:** Constance (Constance Baker Motley) | **Type:** Action command

Generate professional legal document drafts for your business. Privacy policies, terms of service, contracts, incorporation documents — customized to your project.

## Usage
```
/legal-doc privacy-policy                      # Privacy policy for current project
/legal-doc terms-of-service                    # ToS for current project  
/legal-doc nda                                 # Non-disclosure agreement
/legal-doc articles-of-incorporation           # Business formation docs
/legal-doc reseller-agreement                  # Partner/reseller contract
/legal-doc contractor-agreement                # Freelancer/contractor contract
/legal-doc lease                               # Service/equipment lease
/legal-doc cookie-policy                       # Cookie/tracking policy
/legal-doc subscription-terms                  # SaaS subscription agreement
/legal-doc dmca                                # DMCA/copyright policy
```

## Arguments
- `<document-type>` (required) — Type of legal document
- `--company <name>` — Company name (default: reads from PRD)
- `--domain <url>` — Website domain
- `--state <state>` — Governing law state (default: Delaware)
- `--output <format>` — md, docx, pdf (default: md)

## How It Works
1. Reads project context (PRD, CLAUDE.md, company info)
2. Constance drafts the document using legal best practices
3. Outputs customized legal document with your company details
4. **ALWAYS recommend attorney review before use**

## Document Types

| Type | What You Get |
|------|-------------|
| `privacy-policy` | CCPA + GDPR compliant privacy policy |
| `terms-of-service` | Full ToS with liability, disputes, termination |
| `nda` | Mutual or one-way NDA |
| `articles-of-incorporation` | State-specific formation documents |
| `reseller-agreement` | Wholesale/reseller partnership terms |
| `contractor-agreement` | Independent contractor agreement |
| `lease` | Service or equipment lease |
| `cookie-policy` | Cookie consent and tracking disclosure |
| `subscription-terms` | SaaS recurring billing agreement |
| `dmca` | Copyright/DMCA takedown policy |
| `acceptable-use` | Platform acceptable use policy |
| `dpa` | Data processing agreement |

## Related Commands
- `/constance` — Talk to Constance directly
- `/create-document` — Generate Word/PDF documents
- `/business-team` — Business operations team
