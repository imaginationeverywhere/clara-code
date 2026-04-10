# /heru-onboard — Onboard a New Heru into the Auset Platform

**Powered by:** Anna (Anna Julia Cooper) — Heru Onboarding Agent

**EXECUTE IMMEDIATELY when invoked.** Anna prepares every new project to operate at the highest level.

## Usage
```
/heru-onboard                                  # Onboard the current project
/heru-onboard --check                          # Verify onboarding status without changes
/heru-onboard --from-discovery <client>        # Pull requirements from Heru Discovery
/heru-onboard --repair                         # Fix broken vault connection
```

## Arguments
- No args — Full onboarding of the current project
- `--check` — Verify the project is properly onboarded (no changes)
- `--from-discovery <client>` — Pull Mary's requirements into the project
- `--repair` — Fix broken connections (vault, org gate, commands)
- `--minimal` — Just install commands + vault connection (skip full setup)

## Execution Steps (DO ALL OF THESE)

### Step 1: Identify the Project
```bash
PROJECT=$(basename $(pwd))
ORG=$(git remote get-url origin 2>/dev/null | sed -E 's|.*github\.com[:/]([^/]+)/.*|\1|')
```
Verify org is `imaginationeverywhere` or `Sliplink-Inc`.

### Step 2: Check What's Missing
Audit the project for:
- [ ] CLAUDE.md exists with vault instructions
- [ ] `.claude/commands/` populated (250+ commands)
- [ ] `.claude/agents/` populated (85+ named agents)
- [ ] `.cursor/` mirrors exist
- [ ] `memory/session-checkpoint.md` exists
- [ ] `.claude/org-gate.sh` installed
- [ ] `.boilerplate-manifest.json` exists
- [ ] CLAUDE.md references `~/auset-brain/` for cross-project context

### Step 3: Install Missing Components
For each missing item, copy from the boilerplate:
```bash
BOILERPLATE="/Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate"
# or from S3 if boilerplate not local
```

### Step 4: Configure CLAUDE.md
Ensure the project's CLAUDE.md includes:
- Auset Brain vault connection (`~/auset-brain/`)
- Session start/end instructions
- Org gate reference
- Link back to central hub
- Project-specific context (what this Heru does, who the client is)

### Step 5: Verify or Provision Neon Database
Check if this Heru has a Neon database. If not, create one:

```bash
# List existing Neon projects
neonctl projects list --org-id org-young-hall-74190661 --output json

# If project NOT found, create it:
neonctl projects create --name "${PROJECT}" --region-id aws-us-east-1 --org-id org-young-hall-74190661 --output json

# Get connection string
neonctl connection-string --project-id <id> --org-id org-young-hall-74190661

# Write to .env files (if backend/ exists)
echo "DATABASE_URL=<connection-string>" >> backend/.env.local
echo "DATABASE_URL=<connection-string>" >> backend/.env.develop

# For production (create branch if needed)
neonctl branches create --name production --project-id <id> --org-id org-young-hall-74190661
neonctl connection-string --project-id <id> --branch production --org-id org-young-hall-74190661
echo "DATABASE_URL=<prod-connection-string>" >> backend/.env.production
```

**ALWAYS use `--org-id org-young-hall-74190661`** (Quik Nation org).

### Step 6: Pull Project Context from Vault
Check `~/auset-brain/` for existing context about this project:
- Client requirements (from Heru Discovery / Mary)
- Previous session notes
- Sprint priorities
- Any decisions or feedback specific to this Heru

### Step 7: Register in Heru Registry
Add a row to `~/auset-brain/heru-registry.md` if not already there.

### Step 7: Verify with /session-start
Run `/session-start` to confirm everything works — vault syncs, tracker reads, Slack checks.

### Step 8: Report
```
HERU ONBOARDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Project: camp-al-kebulan
  Org: imaginationeverywhere ✓

  Installed:
  ✓ CLAUDE.md with vault connection
  ✓ 252 commands in .claude/commands/
  ✓ 87 agents in .claude/agents/
  ✓ .cursor/ mirrors created
  ✓ Org gate installed
  ✓ Session checkpoint template
  ✓ Registered in heru-registry.md

  Vault Context Found:
  - Client: Camp Al-Kebulan (Keyes)
  - Last session: Mar 17 — initial setup
  - Priority: Show to Keyes

  Anna says: "Project ready. Run /session-start."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Related Commands
- `/anna` — Talk to Anna about onboarding
- `/session-start` — Start a session (run after onboarding)
- `/sync-herus` — Keep existing projects updated (Marcus handles this)
- `/marcus` — Talk to Marcus about platform sync
