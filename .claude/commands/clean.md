# /clean — Vault Reconciliation & Conflict Resolution

**Audit the entire vault for contradictions, stale decisions, and outdated references. Surface conflicts, reconcile them with Mo, and leave the vault clean.**

This is NOT a destructive command. It reads everything, finds problems, presents them, and only writes changes after Mo approves.

## Usage
```
/clean                     # Full vault audit — find ALL conflicts
/clean voice               # Audit voice-related decisions only
/clean providers            # Audit third-party provider decisions
/clean pricing              # Audit pricing/revenue decisions
/clean architecture         # Audit architecture/stack decisions
/clean --auto               # Auto-resolve obvious conflicts (newer wins) — still shows Mo
/clean --report             # Generate report without fixing anything
```

## What It Does

### Phase 1: Scan — Read Every Memory File
```bash
# Count what we're working with
ls memory/*.md | wc -l
```
Read ALL memory files. For each file, extract:
- **Topic** (from filename + description)
- **Date** (from content or file modification)
- **Key claims** (decisions, rules, provider names, prices, architecture choices)
- **Type** (decision, feedback, project, reference, user)

### Phase 2: Detect — Find Conflicts

Group memories by topic and look for:

1. **Direct Contradictions** — Two files say opposite things
   - Example: "Use Vapi" vs "LiveKit replaces Vapi"
   - Example: "Use SendGrid" vs "AWS SES only"

2. **Superseded Decisions** — Newer decision overrides older one but old file still exists
   - Example: Pricing from March 17 vs pricing from April 3
   - Example: Architecture from March 19 vs architecture from March 27

3. **Stale References** — Memory references something that no longer exists
   - Example: References to Vapi when LiveKit is the standard
   - Example: References to SendGrid when SES is the standard
   - Example: References to Daily.co when LiveKit replaced it

4. **Orphan Files** — Memory files not indexed in MEMORY.md

5. **Duplicate Content** — Two files covering the same topic

6. **MEMORY.md Bloat** — Index approaching 200-line limit

### Phase 3: Present — Show Mo the Conflicts

For each conflict found, present:
```
CONFLICT #1: Voice Agent Platform
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE A: decision-livekit-voice-platform.md (March 27, 2026)
  Says: "LiveKit replaces Vapi. Do not reference Vapi."

FILE B: setup-voice-agent.md (command file)
  Says: "Configure Vapi Voice Agent for a Heru"

FILE C: feedback-heru-feedback-mandatory.md (March 15)
  Says: "Layer 4: Interactive Feedback Agent (Vapi)"

RECOMMENDATION: LiveKit won (March 27 is newer). Update Files B & C.
  OR: Vapi stays for customer-facing, LiveKit for internal.

MO'S CALL: [wait for input]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Phase 4: Reconcile — Apply Mo's Decisions

For each conflict Mo resolves:
1. **Update the winning file** with reconciliation note + date
2. **Update or remove the losing file** — either:
   - Add redirect: "SUPERSEDED — see [winning-file.md]"
   - Delete if truly obsolete
3. **Update any commands/agents** that reference the old decision
4. **Update MEMORY.md index** — remove stale entries, add missing ones

### Phase 5: Report — Summary of Changes

```
VAULT CLEAN COMPLETE
━━━━━━━━━━━━━━━━━━━━
Scanned: 127 memory files
Conflicts found: 8
Resolved: 8
Files updated: 12
Files removed: 3
Files redirected: 2
MEMORY.md entries: 142 → 135 (7 removed)
Commands updated: 2
━━━━━━━━━━━━━━━━━━━━
```

## Known Conflict Categories to Check

These are the areas where the vault has accumulated contradictions over 60+ sessions:

### Provider Stack
- **Email:** SendGrid vs AWS SES (RESOLVED: SES only)
- **SMS:** Twilio vs AWS SNS (RESOLVED: SNS for SMS, Twilio voice only)
- **Voice Platform:** Vapi vs LiveKit vs Pipecat vs custom (NEEDS RECONCILIATION)
- **TTS:** ElevenLabs vs MiniMax vs Kokoro (NEEDS RECONCILIATION)
- **STT:** Deepgram vs Whisper vs Google Speech (NEEDS RECONCILIATION)
- **LLM for voice:** Groq vs Nova Sonic vs Bedrock Haiku (NEEDS RECONCILIATION)

### Architecture
- **Clara Desktop vs Quik Huddle** — absorb was decided but files may conflict
- **Voice server architecture** — multiple iterations documented
- **Conference calls** — Daily.co vs Quik Huddle vs LiveKit

### Pricing
- **Clara tiers** — multiple pricing documents from different dates
- **Reseller pricing** — evolved over sessions
- **Voice minutes** — different numbers in different files

### Commands & Agents
- **Commands referencing deprecated providers** (SendGrid, Vapi in wrong contexts)
- **Agent files referencing old architecture**

## Rules

- NEVER delete a file without Mo's approval
- NEVER change a decision — only surface the conflict
- Newer date wins by DEFAULT but Mo can override
- If a topic has 3+ files, recommend MERGING into one authoritative file
- Always preserve the WHY — even if the WHAT changed
- Run this at the START of each sprint (Sprint 3 = April 16)
- After cleaning, push vault to S3: `aws s3 sync ~/auset-brain/ s3://auset-brain-vault/`

## Recommended Cadence

| When | What |
|------|------|
| Sprint start | Full `/clean` audit |
| After major decisions | `/clean <topic>` for affected area |
| Before onboarding new Heru | `/clean providers` to ensure stack is current |
| Before demos/pitches | `/clean pricing` to ensure numbers are right |

## Related Commands
- `/remember <topic>` — Deep vault retrieval
- `/save <fact>` — Write to vault immediately
- `/vault-sync` — Push/pull vault to/from S3
- `/session-end` — Updates vault at session close
