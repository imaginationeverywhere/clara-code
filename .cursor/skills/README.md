# Claude Code Skills System

This directory contains domain-specific knowledge bases (skills) that provide standardized implementation patterns for the Quik Nation AI Boilerplate.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SLASH COMMANDS                                     │
│  /implement-admin-panel  /implement-clerk  /implement-stripe  etc.          │
│  User-invoked commands that trigger development workflows                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SPECIALIZED AGENTS                                      │
│  Technology-specific agents that enforce best practices                      │
│  Located in: .claude/agents/                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SKILLS (Knowledge Bases)                           │
│  Production-tested patterns, code examples, and implementation guides        │
│  Located in: .claude/skills/                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## How It Works

1. **User invokes a slash command** (e.g., `/implement-clerk-standard`)
2. **Command triggers one or more specialized agents** (e.g., `clerk-auth-enforcer`)
3. **Agents reference their designated skills** as knowledge bases
4. **Skills provide production-tested code and patterns** to implement

## Key Distinction: Commands vs Skills

| Aspect | Slash Commands | Skills |
|--------|---------------|--------|
| **Invocation** | User-invoked (explicit) | Model-invoked (automatic) |
| **Location** | `.claude/commands/` | `.claude/skills/` |
| **Purpose** | Trigger workflows | Provide knowledge |
| **Format** | Markdown prompts | SKILL.md with frontmatter |
| **When Used** | When user types `/command` | When agent needs patterns |

## Skill File Structure

Each skill follows this structure:

```
.claude/skills/{skill-name}/
├── SKILL.md                    # Main skill definition (REQUIRED)
│   ├── name: string           # Skill identifier
│   ├── description: string    # What this skill provides
│   └── [instructions]         # Implementation patterns
├── templates/                  # Code templates (optional)
├── checklists/                # Implementation checklists (optional)
├── anti-patterns/             # What NOT to do (optional)
├── code-snippets/             # Copy-paste ready code (optional)
└── references/                # Production examples (optional)
```

### SKILL.md Frontmatter (Required)

```yaml
---
name: skill-name
description: Brief description of what this skill provides
---

# Skill Name

[Detailed implementation patterns and code examples]
```

## Skills Inventory (63 Skills)

### Tier 1: Core Platform Skills
| Skill | Agent | Purpose |
|-------|-------|---------|
| `admin-panel-standard` | - | Dashboard, Sidebar, RBAC, Navigation |
| `admin-dashboard-standard` | - | Admin dashboard patterns |
| `clerk-auth-standard` | `clerk-auth-enforcer` | Authentication with Clerk |
| `user-management-standard` | - | User CRUD, roles, permissions |

### Tier 2: E-Commerce Skills
| Skill | Agent | Purpose |
|-------|-------|---------|
| `stripe-connect-standard` | `stripe-connect-specialist` | Multi-tenant payments |
| `shopping-cart-standard` | `redux-persist-state-manager` | Cart state persistence |
| `checkout-flow-standard` | `stripe-connect-specialist`, `redux-persist-state-manager` | Checkout process |
| `product-catalog-standard` | - | Product management |
| `order-management-standard` | - | Order lifecycle |

### Tier 3: Database & Backend Skills
| Skill | Agent | Purpose |
|-------|-------|---------|
| `database-query-optimization-standard` | `sequelize-orm-optimizer` | Query performance |
| `database-migration-standard` | `sequelize-orm-optimizer` | Zero-downtime migrations |
| `caching-standard` | - | Redis/memory caching |
| `realtime-updates-standard` | - | WebSocket patterns |

### Tier 4: DevOps & Infrastructure Skills
| Skill | Agent | Purpose |
|-------|-------|---------|
| `aws-deployment-standard` | `aws-cloud-services-orchestrator` | EC2, Amplify, deployment |
| `docker-containerization-standard` | `aws-cloud-services-orchestrator` | Docker patterns |
| `ci-cd-pipeline-standard` | `aws-cloud-services-orchestrator` | GitHub Actions |
| `mobile-deployment-standard` | - | App store deployment |

### Tier 5: Testing & Quality Skills
| Skill | Agent | Purpose |
|-------|-------|---------|
| `testing-strategy-standard` | `testing-automation` | Three-tier testing pyramid |
| `debugging-standard` | - | Debugging patterns |
| `error-monitoring-standard` | - | Sentry integration |
| `performance-optimization-standard` | - | Performance tuning |

### Tier 6: Analytics & Tracking Skills
| Skill | Agent | Purpose |
|-------|-------|---------|
| `analytics-tracking-standard` | `google-analytics-implementation-specialist` | GA4 tracking |
| `reporting-standard` | - | Business reporting |

### Tier 7: Communication Skills
| Skill | Agent | Purpose |
|-------|-------|---------|
| `email-notifications-standard` | - | SendGrid integration |
| `sms-notifications-standard` | - | Twilio SMS |

### Tier 8: Security Skills
| Skill | Agent | Purpose |
|-------|-------|---------|
| `security-best-practices-standard` | - | Security patterns |
| `multi-tenancy-standard` | - | Tenant isolation |

### Tier 9: Domain-Specific Skills
| Skill | Domain | Purpose |
|-------|--------|---------|
| `barbershop` | Beauty | Salon/barbershop patterns |
| `construction` | Construction | Estimation, project mgmt |
| `delivery` | Logistics | Delivery tracking |
| `events` | Events | Ticketing, venues |
| `federation` | Architecture | GraphQL federation |
| `fintech` | Finance | Payment processing |
| `luxury` | Premium | Luxury service patterns |
| `music` | Entertainment | Music industry patterns |
| `nonprofit` | Charity | Donation, impact tracking |
| `paas` | Platform | Multi-tenant SaaS |
| `rental` | Marketplace | Vehicle/property rental |
| `social` | Social Media | Feeds, messaging |
| `transportation` | Mobility | Ride-sharing, dispatch |
| `video` | Media | Streaming, conferencing |

### Tier 10: Utility Skills (Anthropic Managed)
| Skill | Purpose |
|-------|---------|
| `pdf` | PDF manipulation |
| `xlsx` | Spreadsheet operations |
| `docx` | Document creation |
| `pptx` | Presentation creation |
| `algorithmic-art` | Generative art |
| `brand-guidelines` | Brand design |
| `canvas-design` | Visual design |
| `doc-coauthoring` | Documentation |
| `frontend-design` | UI/UX design |
| `internal-comms` | Internal communications |
| `mcp-builder` | MCP server creation |
| `skill-creator` | Skill development |
| `slack-gif-creator` | Slack GIFs |
| `theme-factory` | Theme creation |
| `web-artifacts-builder` | Web artifacts |
| `webapp-testing` | Playwright testing |

## Agent-to-Skill Mapping

The following agents have KNOWLEDGE BASE skill references:

| Agent | Skills Referenced |
|-------|------------------|
| `clerk-auth-enforcer` | clerk-auth-standard |
| `stripe-connect-specialist` | stripe-connect-standard, checkout-flow-standard |
| `google-analytics-implementation-specialist` | analytics-tracking-standard |
| `redux-persist-state-manager` | shopping-cart-standard, checkout-flow-standard |
| `testing-automation` | testing-strategy-standard |
| `aws-cloud-services-orchestrator` | aws-deployment-standard, docker-containerization-standard, ci-cd-pipeline-standard |
| `sequelize-orm-optimizer` | database-query-optimization-standard, database-migration-standard |

## Adding KNOWLEDGE BASE References to Agents

When an agent should reference skills, add this section to the agent's markdown file:

```markdown
**KNOWLEDGE BASE - REQUIRED SKILL REFERENCE:**
Before implementing any [domain] patterns, you MUST read and apply the implementation details from:
- `.claude/skills/{skill-name}/SKILL.md` - Contains [description]

This skill file is your authoritative source for:
- [Pattern 1]
- [Pattern 2]
- [Pattern 3]
```

## Creating New Skills

1. **Create skill directory:**
   ```bash
   mkdir -p .claude/skills/{skill-name}
   ```

2. **Create SKILL.md with frontmatter:**
   ```markdown
   ---
   name: skill-name
   description: Brief description
   ---

   # Skill Name

   ## Purpose
   [What this skill provides]

   ## Implementation Patterns
   [Code examples and patterns]
   ```

3. **Update corresponding agent** with KNOWLEDGE BASE reference

4. **Update this README** with the new skill

## Related Documentation

- **[../agents/README.md](../agents/README.md)** - Agent system documentation
- **[../CLAUDE.md](../CLAUDE.md)** - Command system overview
- **[../../docs/STANDARDIZATION_STRATEGY.md](../../docs/STANDARDIZATION_STRATEGY.md)** - Architecture strategy
- **[../../docs/plans/DOMAIN_SPECIFIC_SKILLS_COMMANDS_AGENTS_PLAN.md](../../docs/plans/DOMAIN_SPECIFIC_SKILLS_COMMANDS_AGENTS_PLAN.md)** - Complete skills/commands/agents plan

## Current Limitations

As of December 2024, Claude Code's `Skill` tool only recognizes "managed" skills (pdf, xlsx, docx, etc.). Custom project skills must be referenced through agents using the KNOWLEDGE BASE pattern. See [GitHub Issue #14138](https://github.com/anthropics/claude-code/issues/14138) for the feature request to support custom skills.

---

*Document Version: 1.0.0*
*Last Updated: 2024-12-16*
*Maintained By: Quik Nation AI Team*
