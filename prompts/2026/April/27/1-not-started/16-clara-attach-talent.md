# Implement `clara attach-talent <talent-name>` — pull Talent SOUL + wire to agent

## Role
You are **Annie Turnbo Malone** implementing `clara attach-talent` in `packages/cli/`. Daysha directive §D. Memory: `project_talents_architecture.md`, `project_talent_creator_marketplace.md`.

## Read first
- 07 (Daysha §D)
- 08 (firewall)
- 09 (voice catalog §D)
- `project_talents_architecture.md` (memory) — Talents = skills/personas; agents attach Talents at runtime

## Intent contract

```yaml
intent: "attach-talent"
tier: "plus"
params:
  talent_name: string (required — Talent slug from talent.claracode.ai catalog)
  agent_name: string (default: from cwd's package.json)
```

Voice: catalog 09 §D.

## Task

`clara attach-talent <talent-name>`:

1. `packages/cli/src/commands/attach-talent.ts` — argv + `runIntent("attach-talent", { talent_name, agent_name })`.
2. Server:
   - Looks up Talent in `talent.claracode.ai` registry
   - Reads SOUL.md (sealed marketplace IP — never exposed in raw form to client)
   - Creates a brain partition for this Talent in the agent's brain
   - Wires the Talent's persona/skill set to the agent's runtime
   - Records the attach in `agent_talent_attachments` table
   - Returns `{ ok, talent_id, brain_partition, persona_summary }`
3. CLI prints:
   - "Attached <talent_name> to <agent_name>"
   - Persona summary (the public-facing one — name, expertise, voice profile)
   - Notes brain partition created
   - Charges 1 attach against minutes (server returns updated minute counter)

## Acceptance

- `clara attach-talent daysha-mvp` (after `clara new daysha-taylor`) wires the Talent to the agent
- 404 if talent_name doesn't exist → "Talent not found. Browse: https://talent.claracode.ai"
- 403 tier_lock if user is on Taste (Plus+ required)
- 409 if Talent already attached to this agent — idempotent no-op
- Listing already-attached talents: `clara attach-talent --list` shows everything currently attached
- Detach: `clara attach-talent --remove <talent_name>`
- Tests: success, 404, 403, 409, list, remove
- **IP audit:** zero Talent SOUL.md content / system prompts / persona internals in CLI

## Constraints

- Talent SOUL.md is sealed marketplace IP — CLI never receives the raw text, only the public summary
- Brain partition isolation enforced server-side (per `AGENT_BRAIN_NAMESPACING.md`)
- Marketplace 15% fee (per `feedback_marketplace_split_is_15pct.md`) handled server-side on attach if Talent is paid

## Mo is watching

Talents are the marketplace economy. Every attach is a transaction. Every customer that bypasses the gateway to pull a Talent SOUL directly is theft. Build this so it can't be bypassed.
