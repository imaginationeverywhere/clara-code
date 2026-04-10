# Auto Claude Plugin Configuration

> **Version:** 1.0.0
> **Last Updated:** 2025-12-24
> **Purpose:** Agent/Skill Matching and Revenue Model configuration

---

## Overview

This directory contains the core configuration files for the Auto Claude boilerplate-detection plugin. These files define how business patterns map to agents, skills, and pricing.

## Configuration Files

### pattern-mappings.json

**Purpose:** Defines the Agent/Skill Matching for each business pattern

```
MOCKUP_TEMPLATE_CHOICE → pattern-mappings.json → Agents + Skills + Features
```

**Structure:**
- `patterns` - Business pattern definitions (retail, booking, etc.)
- `agentRegistry` - Complete list of available agents
- `skillRegistry` - Complete list of available skills
- `mockupSources` - Where mockups can come from

**Usage:**
1. Client sets `MOCKUP_TEMPLATE_CHOICE` in their PRD
2. Plugin reads pattern-mappings.json
3. Activates corresponding agents and skills
4. Generates MASTER_TASKS.md with correct assignments

### service-tiers.json

**Purpose:** Defines the revenue model and pricing structure

```
Client Type → service-tiers.json → Pricing + Deliverables + Process
```

**Structure:**
- `serviceTiers` - Self-Service, Guided Custom, Full Custom, Enterprise
- `addOnServices` - Additional billable services
- `recurringRevenue` - Hosting, support, transaction fees
- `ipBuilding` - How custom work builds reusable IP

**Usage:**
1. Qualify client into appropriate tier
2. Reference pricing from service-tiers.json
3. Generate proposal with correct deliverables
4. Track revenue per tier

---

## Pattern Categories

| Pattern | Industries | Primary Use Case |
|---------|-----------|------------------|
| `retail` | E-commerce, shops | Product sales with cart/checkout |
| `booking` | Salons, fitness, medical | Appointment scheduling |
| `property-rental` | Real estate, car rental | Listings with availability |
| `restaurant` | Food service | Menu ordering |
| `transportation` | Rideshare, delivery | Real-time tracking |
| `marketplace` | Multi-vendor | Platform connecting buyers/sellers |
| `subscription` | SaaS, memberships | Recurring billing |
| `nonprofit` | Charities, social services | Case management |
| `construction` | Contractors | Project/estimate management |
| `healthcare` | Medical practices | HIPAA-compliant patient management |
| `fintech` | Financial services | PCI-compliant transactions |
| `custom` | Unique businesses | Full custom definition required |

---

## How Patterns Work

### 1. Client Provides PRD

```markdown
# In docs/PRD.md

MOCKUP_TEMPLATE_CHOICE: booking
MOCKUP_SOURCE: magic-patterns
MOCKUP_PATH: mockup/custom/my-salon/
```

### 2. Plugin Reads Pattern

```javascript
const pattern = patternMappings.patterns['booking'];
```

### 3. Agents Activated

```javascript
pattern.agents.primary = [
  'shadcn-ui-specialist',
  'graphql-apollo-frontend',
  'clerk-auth-enforcer',
  ...
];
```

### 4. Skills Loaded

```javascript
pattern.skills.required = [
  'clerk-auth-standard',
  'admin-panel-standard',
  'email-notifications-standard'
];
```

### 5. MASTER_TASKS.md Generated

Tasks are generated with correct agent assignments based on the pattern.

---

## Adding a New Pattern

When a Full Custom client has a unique business model:

### Step 1: Analyze Requirements

Review the PRD to identify:
- Core features needed
- Integrations required
- Database schema
- Compliance requirements

### Step 2: Create Pattern Entry

Add to `patterns` in pattern-mappings.json:

```json
"my-new-pattern": {
  "displayName": "My New Pattern",
  "description": "What this pattern does",
  "industries": ["industry1", "industry2"],
  "agents": {
    "primary": ["agent1", "agent2"],
    "secondary": ["agent3"],
    "backend": ["agent4", "agent5"],
    "testing": ["testing-automation-agent"]
  },
  "skills": {
    "required": ["skill1", "skill2"],
    "recommended": ["skill3"],
    "optional": ["skill4"]
  },
  "features": {
    "core": ["feature1", "feature2"],
    "recommended": ["feature3"],
    "advanced": ["feature4"]
  },
  "database": {
    "requiredTables": ["table1", "table2"],
    "optionalTables": ["table3"]
  },
  "timeline": {
    "minimum": 30,
    "typical": 45,
    "complex": 60
  },
  "pricing": {
    "templateTier": { "min": 15000, "max": 35000 },
    "customTier": { "min": 35000, "max": 75000 }
  }
}
```

### Step 3: Test Pattern

1. Create test PRD with new pattern
2. Run `/bootstrap-project`
3. Verify correct agents activated
4. Verify MASTER_TASKS.md generated correctly

### Step 4: Document Pattern

Add pattern to documentation:
- Update this README
- Add to INDUSTRY_INDEX.md if applicable
- Create PRD template if industry-specific

---

## Service Tier Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  CLIENT INQUIRY                                                             │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────────┐                                                        │
│  │ Qualification   │                                                        │
│  │ Call            │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                 │
│     ┌─────┴─────┬─────────────┬─────────────┐                               │
│     ▼           ▼             ▼             ▼                               │
│  ┌──────┐  ┌────────┐  ┌───────────┐  ┌────────────┐                        │
│  │Self- │  │Guided  │  │Full       │  │Enterprise  │                        │
│  │Service│  │Custom  │  │Custom     │  │            │                        │
│  └──┬───┘  └───┬────┘  └─────┬─────┘  └──────┬─────┘                        │
│     │          │             │               │                              │
│     ▼          ▼             ▼               ▼                              │
│  Template   Guided        Full           Custom                             │
│  PRD        Discovery     Discovery      MSA                                │
│     │          │             │               │                              │
│     ▼          ▼             ▼               ▼                              │
│  Template   Custom        Custom         Multiple                           │
│  Mockup     Design        Design         Projects                           │
│     │          │             │               │                              │
│     ▼          ▼             ▼               ▼                              │
│  Existing   Adapted       New            Ongoing                            │
│  Pattern    Pattern       Pattern        Partnership                        │
│     │          │             │               │                              │
│     ▼          ▼             ▼               ▼                              │
│  Auto       Auto+         White-         Dedicated                          │
│  Claude     Oversight     Glove          Team                               │
│     │          │             │               │                              │
│     └──────────┴─────────────┴───────────────┘                              │
│                      │                                                      │
│                      ▼                                                      │
│              RECURRING REVENUE                                              │
│              (Hosting + Support + Fees)                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## IP Building Strategy

Every Full Custom client builds reusable IP:

```
Full Custom Client #1          Pattern Created           Future Clients
─────────────────────         ────────────────          ──────────────
$75,000 (full cost)     →     new-pattern.json    →    $35,000 each
                                                        (80% less work)
```

### Pattern Ownership

- **Quik Nation** owns the pattern definition
- **Client** owns their specific implementation
- **Future clients** benefit from pattern reuse
- **Quik Nation** builds vertical expertise

---

## Configuration Validation

Before deploying configuration changes:

1. **Schema Validation**
   - Validate JSON structure
   - Check required fields
   - Verify agent/skill references exist

2. **Integration Testing**
   - Test with sample PRD
   - Verify agent activation
   - Check MASTER_TASKS.md generation

3. **Pricing Validation**
   - Verify pricing ranges make sense
   - Check tier progression
   - Confirm recurring revenue calculations

---

## Related Files

- `/docs/business/FULL-CUSTOM-WORKFLOW.md` - Complete Full Custom process
- `/docs/prd-templates/INDUSTRY_INDEX.md` - Industry PRD templates
- `/docs/prd-templates/QUESTION_DATABASE.md` - Discovery questions
- `/.claude/agents/README.md` - Agent documentation

---

*Configuration maintained by Quik Nation AI Team*
