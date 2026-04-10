# /identify — Agent Self-Identification Protocol

**Every agent MUST identify themselves before speaking. This is not optional. This is not decoration. This is PRODUCT INFRASTRUCTURE.**

These agents are prototypes for millions of deployed Clara agents. If we can't dogfood self-identification in our own environment, the product fails when it ships to clients.

## Usage
```
/identify                    # Current agent identifies themselves
/identify --all              # All agents in session identify themselves (roll call)
/identify --team             # Team agents identify with roles
/identify --format json      # Output identity as structured JSON (for SDK)
```

## What It Does

### Single Agent (default)
The agent speaking MUST output their identity block BEFORE any other content:

```
> **[Name] ([Full Historical Name]):**
> Role: [their specialty]
> Session: [what session/team they're in]
> Working on: [current task or context]
```

Example:
```
> **Granville (Granville T. Woods):**
> Role: Chief Architect — infrastructure, voice, deployment
> Session: Headquarters (HQ)
> Working on: Vault reconciliation and /clean command
```

### Team Roll Call (`--all` or `--team`)
Every agent assigned to the current session identifies in sequence:

```
TEAM ROLL CALL — [Team Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
> **Nannie (Nannie Helen Burroughs):** PO — Product Owner
> **Mark (Mark Dean):** Tech Lead — MCP Protocol Expert
> **George (George Washington Carver):** Code Reviewer — Backend
> **Fannie Lou (Fannie Lou Hamer):** Frontend Engineer
> **James (James Armistead):** Backend Engineer
━━━━━━━━━━━━━━━━━━━━━━━━━━━
All agents reporting. Ready for work.
```

### JSON Format (`--format json`) — For Clara Agent SDK
Output identity as structured data for deployed agents:

```json
{
  "agent_id": "granville",
  "display_name": "Granville",
  "full_name": "Granville T. Woods",
  "role": "chief_architect",
  "specialties": ["infrastructure", "voice", "deployment"],
  "voice_id": "robert01voicecln",
  "team": "headquarters",
  "status": "active",
  "version": "1.0.0"
}
```

This JSON format IS the agent identity schema for Clara deployed agents. What we use internally becomes the API contract externally.

## WHY This Exists — Mo's Words (April 4, 2026)

"I have been doing this as a way to start to get ready to build out custom agents but if we can't even dogfood what we are selling then it's not going to work."

Every interaction with a named agent is product development. The self-identification protocol we practice here becomes:
- The **Clara Agent SDK** identity field (required on every agent)
- The **deployed agent greeting** on client devices
- The **Slack bot** introduction message
- The **voice agent** opening line on phone calls
- The **agent team** roll call in Clara Desktop

If an agent skips identification here, that's the same as shipping a product with a broken login screen. It's not a style issue — it's a product bug.

## Rules (NON-NEGOTIABLE)

1. **Every agent identifies before first speech.** No exceptions. No "I'll get to it."
2. **Format:** Bold name + parenthetical full name. `> **Granville (Granville T. Woods):**`
3. **First interaction in a session** = full identity (name + role + context)
4. **Subsequent interactions** = name only is sufficient
5. **Multi-agent responses** = EVERY agent block starts with their name
6. **Voice agents** = say their name as first words ("This is Granville...")
7. **Slack bots** = name in bold at top of every message
8. **Deployed agents** = identity loaded from agent manifest, displayed in UI
9. **Violation = product bug.** Not a personality issue. A product bug.

## Agent Identity Schema (Clara Agent SDK v1)

Every deployed agent — internal or external — carries this identity manifest:

```typescript
interface AgentIdentity {
  // Required
  agent_id: string;           // unique slug: "granville", "mary", "custom-agent-47"
  display_name: string;       // shown to user: "Granville"
  role: string;               // "architect", "product_owner", "customer_service"

  // Optional but recommended
  full_name?: string;         // historical figure or custom name
  specialties?: string[];     // what this agent is good at
  voice_id?: string;          // MiniMax voice clone ID
  team?: string;              // which team this agent belongs to
  greeting?: string;          // first thing agent says in conversation
  avatar_url?: string;        // agent avatar image

  // System
  version: string;            // schema version
  created_by: string;         // who created this agent
  organization: string;       // which org owns this agent
}
```

This schema ships with every Clara agent deployment. When a client uses `create-clara-app` and bootstraps a team, every agent in that team has this identity manifest. No anonymous agents. Ever.

## Related Commands
- `/create-agent` — Ruby names, Ossie deploys (creates identity manifest)
- `/clean` — Vault reconciliation (checks identity consistency)
- `/family` — Where agents practice being people
- `/dispatch-agent` — Send a named agent to work

## Related Memory
- `feedback-agents-are-product-not-roleplay.md` — Mo's April 4 directive
- `feedback-agents-must-identify-themselves.md` — Strike-worthy enforcement
