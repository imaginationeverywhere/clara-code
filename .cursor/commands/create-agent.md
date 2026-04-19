# create-agent - Birth a New Agent Through Ossie & Ruby

Every agent in Quik Nation is born through **Ossie Davis** (structure) and **Ruby Dee** (identity). No exceptions. No hand-creating agent files.

**Ossie** builds: agent definition, command, skills, tools, registry entry.
**Ruby** builds: name research, avatar, 3D page, story, personality.

56 years of partnership. They didn't just perform — they CREATED.

## Usage
```
/create-agent --name "Aaron" --named-after "Aaron Douglas, Father of African-American Art" --role "Logo kit generation" --tier worker --tools "nano-banana-pro, s3-upload" --description "Generate and manage logo kits" --public

/create-agent --name "Booking" --role "Appointment scheduling and calendar management" --tier worker --description "Handle booking flows for service-based Herus"

/create-agent --role "Mobile build automation on QC1" --tier worker --description "Handle EAS builds, keychain, signing"
```

## Arguments
- `--name <name>` (optional) — If you already have a name picked. If omitted, Ruby selects one.
- `--named-after <figure>` (optional) — Historical figure. If omitted, Ruby researches and selects.
- `--role <role>` (required) — What this agent does.
- `--tier <tier>` (optional) — `core | worker | orchestrator | sentinel`. Defaults to `worker`.
- `--tools <tools>` (optional) — Comma-separated tools/capabilities the agent needs.
- `--description <desc>` (required) — Full description of what the agent handles.
- `--public` (optional) — Agent is visible to clients. Default: secret (internal only).
- `--counterpart <name>` (optional) — Specify Maat balance counterpart.
- `--skip-avatar` (optional) — Skip avatar generation (useful for batch creation).
- `--skip-3d` (optional) — Skip 3D page generation.

## What Gets Created

### Phase 1: Ossie (Structure)

1. **Check Registry** — Read `docs/AGENT_NAMING_REGISTRY.md`, verify no name conflict
2. **Agent Definition** — `.claude/agents/<name>.md`
   - Role, capabilities, when to invoke, patterns, Maat balance
3. **Command File** — `.claude/commands/<name>.md` + `.cursor/commands/<name>.md`
   - Usage examples, arguments, behavior description
4. **Skills Directory** (if tools specified) — `.claude/skills/<name>/`
   - Domain-specific templates, patterns, reference data
5. **Registry Update** — Add to `docs/AGENT_NAMING_REGISTRY.md`

### Phase 2: Ruby (Identity)

1. **Name Selection** (if not provided)
   - Research historical Black figures matching the role
   - Check registry for conflicts
   - Select name where the figure's work connects to the agent's function
2. **Write the Story** — "Named after" section with full history
3. **Generate Avatar** (unless `--skip-avatar`)
   - Use Nano Banana Pro for profile + clean versions
   - Save to `assets/agents/<name>-profile.png` and `<name>-clean.png`
4. **Create 3D Page** (unless `--skip-3d`)
   - HTML with animated representation
   - Upload to S3: `auset-platform-docs.s3.amazonaws.com/agents/<name>.html`
5. **Define Personality** — Tone, Slack style, communication patterns
6. **Classify** — PUBLIC (marketplace visible) or SECRET (internal only)

### Output Summary
```
AGENT CREATED: <Name>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Named After: <Historical Figure>
Role:        <What they do>
Tier:        <worker/core/orchestrator/sentinel>
Visibility:  <PUBLIC/SECRET>
Maat:        <Counterpart noted>

Files Created:
  .claude/agents/<name>.md
  .claude/commands/<name>.md
  .cursor/commands/<name>.md
  docs/AGENT_NAMING_REGISTRY.md (updated)
  assets/agents/<name>-profile.png (if avatar)
  assets/agents/<name>-clean.png (if avatar)

Story: <1-2 sentences about the historical figure>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Rules (NON-NEGOTIABLE)
1. **ALWAYS** check registry before assigning names
2. **NEVER** reuse a name that's taken
3. **Elijah Muhammad** is RESERVED for NOI LLM
4. **NO** living celebrities — historical figures only
5. Every agent gets **Maat balance** noted
6. Commands mirror to BOTH `.claude/` and `.cursor/`
7. Every "Named after" section is a **history lesson**
8. **PUBLIC vs SECRET** classification is required
9. Avatar style must match the Quik Nation agent aesthetic

## Examples

### Worker Agent
```
/create-agent --role "EAS mobile builds on QC1" --tier worker --tools "eas-cli, fastlane, keychain" --description "Handle all local EAS builds, keychain unlock, Apple signing, TestFlight submission" --public false
```
→ Ruby researches and selects a name. Ossie builds the structure. Full agent created.

### Public Agent with Name
```
/create-agent --name "Aaron" --named-after "Aaron Douglas, Father of African-American Art" --role "Logo kit generation" --tier worker --tools "nano-banana-pro, s3-upload, html-generation" --description "Generate and manage logo kits and brand presentations for all Heru projects" --public
```
→ Name pre-selected. Ossie validates and builds. Ruby creates avatar and 3D page.

### Orchestrator Agent
```
/create-agent --role "Coordinate frontend agents for full-page builds" --tier orchestrator --description "Orchestrate Katherine, Dorothy, Mary, and Phillis for complete frontend implementations"
```
→ Ruby selects a name fitting an orchestrator role. Full creation flow.

## Related Commands
- `/gran` — Talk to Granville (architecture)
- `/mary` — Talk to Mary (product)
- `/council` — Talk to both
- `/ship` — Full pipeline
