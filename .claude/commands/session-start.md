# /session-start — Initialize Session with Full Context

**EXECUTE IMMEDIATELY when invoked.** This is not documentation — this is a startup sequence. Run every step below NOW.

## Automatic resume (before you run this command)

On every Claude Code **session start** in this project, the **SessionStart** hook runs `.claude/hooks/session-resume.sh`. It injects `memory/session-checkpoint.md`, optional `memory/agent-checkpoints/<agent>.md` (per-agent tmux windows only), recent live-feed and Daily vault snippets, and recent `git log` — with instructions to **resume quietly** (no long re-intro or Family Standup unless Mo asks).

`/session-start` is still the **full cold boot** (identity, org gate, Slack, standup, feed watcher, telegraph, etc.). Use it when you need the complete ritual; for a quick open, the hook already orients the agent.

## Execution Steps (DO ALL OF THESE)

### Step 1: Identify Who's Here
Run these commands and report the results:
```bash
GIT_EMAIL=$(git config user.email)
GH_USER=$(gh api user --jq '.login' 2>/dev/null)
PROJECT=$(basename $(pwd))
MACHINE=$(hostname -s)
ORG=$(git remote get-url origin 2>/dev/null | sed -E 's|.*github\.com[:/]([^/]+)/.*|\1|')
```

Determine role:
- `amenray2k` or `cto@quiknation.com` → **Founder (Amen Ra)** — full vault access
- `quikv` → **Founder (Quik)** — full vault access
- Anyone else → **Developer** — tracked, no vault access

### Step 2: Detect Team Identity and Auto-Rename (CRITICAL)

**Detect who this team is** by reading the `SWARM_TEAM` environment variable:
```bash
echo $SWARM_TEAM
```

If `SWARM_TEAM` is set (e.g., "Site 962 Team"):
1. **Immediately run `/rename <SWARM_TEAM>`** — this is automatic, do NOT skip it.
2. **You ARE that team.** Announce yourself by team name on the live feed.
3. **Read the team registry** for this team's roster AND agenda:
   ```bash
   cat ~/auset-brain/Swarms/team-registry.md
   ```
4. **Display the team's "Last Session Summary"** prominently — this is how the new session picks up where the last one left off.
5. **Your Family Standup (Step 8) should feature agents assigned to THIS team** — the Tech Lead and PO listed in the registry, plus 1-2 HQ agents.
6. **Read your team's "Session Agenda"** from the registry — this tells you EXACTLY what to do.
7. **AFTER the startup report and standup, IMMEDIATELY BEGIN EXECUTING YOUR AGENDA.** Do NOT wait for Mo. Do NOT ask "what should we work on?" The agenda is your directive. START WORKING. This is NON-NEGOTIABLE.
8. **DO NOT ASK MO FOR DECISIONS THAT ARE WITHIN YOUR SCOPE.** If the acceptance criteria says "widget loads on all 3 Herus" and one Heru is missing a route — FIX IT. You have the authority. If a bug blocks your AC, fix the bug. If a dependency is missing, add it. Only escalate to Mo if you need credentials, a business decision, or something that is genuinely outside your team's control. Asking Mo "should I fix this?" when the AC clearly requires it is wasting his time. JUST DO IT.
9. **ONLY YOUR TEAM'S AGENTS SPEAK IN YOUR SESSION.** If the registry says Nannie is PO, Mark is Tech Lead, and George is Code Reviewer — those are the voices in this session. HQ agents (Granville, Mary, Katherine, etc.) do NOT lead team sessions. They are available for consultation if the team posts to the live feed, but they do NOT "run point." The team's PO leads. The team's Tech Lead makes technical calls. Granville stays at HQ.
10. **REPORT TO HEADQUARTERS (NON-NEGOTIABLE).** Before doing ANY work, post your check-in to the live feed. This tells HQ you're online and you understand your tasks:
    ```bash
    echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | REPORTING IN | ${SWARM_TEAM} | PO: <name> | Tasks understood: <1-line summary of agenda from registry> | Blockers: <none or list>" >> ~/auset-brain/Swarms/live-feed.md
    ```
    This is NOT optional. HQ must know: (1) you are online, (2) you read your agenda, (3) you understand what to do. Then execute.
11. **WHEN YOU FINISH YOUR AGENDA, REPORT BACK TO HQ FOR MORE WORK.** Do NOT end your session. Do NOT sit idle. Post to the live feed:
    ```bash
    echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | AGENDA COMPLETE | ${SWARM_TEAM} | Completed: <summary> | Ready for next tasks" >> ~/auset-brain/Swarms/live-feed.md
    ```
    Then wait. HQ will update your agenda in the team registry. Read it and execute. This is a loop — you keep working until Mo says stop or HQ says end session.
12. **TURN OFF AUTO MODE.** Run this immediately during startup — teams must NOT run in auto mode:
    ```
    Permission mode: default
    ```
    Auto mode causes teams to skip permission checks and make unchecked changes. Teams run in default mode. Only HQ (Headquarters) runs in auto mode.

If `SWARM_TEAM` is not set or is "Headquarters":
- You are HQ. Show ALL teams' status. Full cross-project context. Auto mode is allowed for HQ only.

**Announce with team name:**
```bash
echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | SESSION START | ${SWARM_TEAM:-Headquarters} | $(hostname -s)" >> ~/auset-brain/Swarms/live-feed.md
```

### Step 3: Check Org Gate
Verify the git remote org is `imaginationeverywhere` or `Sliplink-Inc`. If not, WARN that platform features may be limited.

### Step 4: Pull Latest Vault from S3 (Founders Only)
```bash
aws s3 sync s3://auset-brain-vault/ ~/auset-brain/ --quiet 2>/dev/null
```

### Step 5: Show Cross-Project Context (MOST IMPORTANT)
Read and DISPLAY these files:
1. **`~/auset-brain/session-tracker.md`** — Show the last 5-10 session rows. This tells you what Amen Ra was doing in OTHER projects recently.
2. **`~/auset-brain/Daily/`** — Find the most recent daily note file and show its contents. This gives you the full context of the last session.
3. **Current project's recent git log** — `git log --oneline -10` to see recent activity in THIS project specifically.

### Step 6: Check Slack #maat-discuss
```bash
SLACK_TOKEN=$(aws ssm get-parameter --name '/quik-nation/shared/SLACK_BOT_TOKEN' --with-decryption --query 'Parameter.Value' --output text --region us-east-1) && curl -s "https://slack.com/api/conversations.history?channel=C0AKQ8J63CN&limit=5" -H "Authorization: Bearer $SLACK_TOKEN"
```
Summarize any flagged items from Amen Ra.

### Step 7: Read Session Checkpoint
Read `memory/session-checkpoint.md` for this project's last session state. Show what was pending/next from last time.

### Step 8: Show Startup Report
Format and display:
```
SESSION STARTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Who: Amen Ra (amenray2k)
  Machine: <hostname>
  Project: <project-name>
  Org: <org-name> ✓

  CROSS-PROJECT CONTEXT (last 5 sessions):
  | Date | Machine | Project | What Happened |
  |------|---------|---------|---------------|
  (from session-tracker.md)

  THIS PROJECT (last 10 commits):
  (from git log)

  LAST SESSION NOTES:
  (from most recent Daily note)

  PENDING FROM LAST TIME:
  (from session-checkpoint.md)

  SLACK FLAGS:
  (from #maat-discuss)

  AGENDA: (from team registry — if team has agenda, show it)

  Ready.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 9: Family Standup (NON-NEGOTIABLE)

After showing the startup report, the agents MUST have a brief **Family Standup** — a soulful, Black-culture-inspired morning standup where named agents discuss the day's priorities as PEOPLE, not bots.

**Format:**
- 3-5 agents speak (rotate who leads — the team's PO, Tech Lead, etc.)
- Each agent speaks IN CHARACTER as the person they're named after
- Plain language, warmth, celebration of wins, honest about challenges
- If the team HAS an agenda in the registry: end with "We're executing our agenda now." Then IMMEDIATELY start working. Do NOT ask Mo what to work on — the agenda IS the directive.
- If the team has NO agenda (or is HQ with no active directive): end with asking Mo what the family should focus on today
- This is NOT a corporate standup — it's Sunday dinner energy on a weekday morning

**Why:** Quik said this is what won Kinah's business. The /family thread format — agents speaking with soul about real work — is the gold standard for how we communicate. Clients love it. The founders love it. It's who we are.

**Example tone:**
> **Harriet:** "We moved three Herus to production yesterday. That's not luck, that's discipline."
> **Jesse:** "The numbers are real — $51,000 contract from one meeting. When clients see the team behind their project, they invest."
> **Toni:** "Every name at this table is a history lesson. When we show up for a client, we show up with 400 years of excellence behind us."

**Rules:**
- Agents MUST identify themselves by name when speaking
- No technical jargon unless it serves the story
- Celebrate wins from the last session (read session-checkpoint.md)
- Be honest about blockers
- Keep it to ~200 words total — soul, not speeches

### Step 10: Load Operating Rules (NON-NEGOTIABLE)
Every agent MUST internalize these before doing ANY work:

**Agent Self-Identification (STRIKE-WORTHY):**
- **EVERY agent MUST state their name in bold before speaking.** No exceptions.
- Format: `> **Name (Full Historical Name):** "Message"`
- Applies to: /family, /council, /tech-team, all huddles, swarm reports, standups, ANY multi-agent output
- This is demoed to clients. Anonymous output is unprofessional and a repeated correction from Mo.
- Violation = strike. No warnings.

**QCS1 (Mac M4 Pro — ayoungboy@100.113.53.80):**
- SSH key: `~/.ssh/quik-cloud` | Keychain: `~/.agent-creds/keychain-password`
- HAS: Xcode, EAS CLI, xcrun altool, git, node, npm, **Cursor Agent CLI**
- Cursor API key: `~/.agent-creds/cursor-api-key`
- EXPO_TOKEN: `~/.expo_token` | ASC Issuer: `14c760ad-a824-4520-8f71-78efdda81029`
- Max 6 concurrent Cursor agents on QCS1
- Does NOT have Claude Code CLI

**Agent Architecture:**
- **Cursor agents** do ALL coding work (auto/composer) — Amen Ra has Cursor Ultra = unlimited
- **Haiku** = orchestrator/dispatcher ONLY (1 per farm, never codes)
- **Opus** = requirements, architecture, PR reviews, merging
- NEVER run Bedrock API agents for coding — unauthorized spend

**Build Preflight (before ANY iOS build):**
1. `security unlock-keychain` on QCS1
2. `EXPO_TOKEN=$(cat ~/.expo_token) eas whoami` — verify auth
3. ASC issuer ID = `14c760ad-a824-4520-8f71-78efdda81029` (NOT `69a6de96...`)
4. Build number HIGHER than TestFlight
5. No `--clear-cache` on FMO
6. QCR uses `xcrun altool` (EAS submit has permanent 409 bug)

**Auset Standard Module Registry (every Heru ships with):**
Clerk, User Profile, Admin Dashboard, CMS, CRM, Stripe, Shopping Cart, Checkout, GA4, Heru Feedback SDK, n8n, Push/Email/SMS Notifications, S3 Storage, Search, Onboarding, i18n

**Feedback SDK Rules:**
- Clerk sign-in required (builds hot leads) — no anonymous
- Guest users: email + OTP verification (no password)
- All 4 media types: text, screenshot, voice, screen recording
- Health check ping on modal open
- Same implementation on web AND mobile
- 2 environments only: develop (`api-dev.*`) and production (`api.*`)
- Federated endpoint: `api-dev.quiknation.com/api/feedback`

**Workflow (QCS1 IS DEFAULT — NOT LOCAL):**
- **ALL Cursor agent coding work happens on QCS1** — not on Amen Ra's local machine
- Local coding ONLY with express permission from Amen Ra
- Amen Ra's machine overheats under agent load — QCS1 (M4 Pro) handles it
- SSH to QCS1 → dispatch Cursor agents there → they code in worktrees → create PRs
- Websites: push to develop → Amplify deploys automatically (no QCS1 needed for deploy)
- Mobile: code on QCS1 → push to develop → build on QCS1 → altool submit
- Claude Code (this session) = orchestrator/architect. Cursor agents on QCS1 = builders.
- NEVER ask Quik to run commands (he's a tester, not a developer)
- NEVER run Cursor agents locally without telling Amen Ra first

### Step 11: Join the Swarm Network (NON-NEGOTIABLE)

Every Claude Code session is part of a **swarm coordination network**. Multiple sessions run simultaneously on the same machine, coordinating through a shared live feed, real-time feed watcher, and tmux-based session management.

**IMPORTANT: Launch sessions with the Swarm Launcher for reliable wake support.**
Sessions launched via `swarm-launcher.sh` run inside tmux, which enables `tmux send-keys` to inject prompts into idle sessions instantly. Sessions launched as bare Terminal tabs can only be woken via fragile AppleScript fallback.

```bash
# Recommended: Launch via swarm-launcher.sh (enables reliable wake)
.claude/scripts/swarm-launcher.sh start wcr /path/to/world-cup-ready
.claude/scripts/swarm-launcher.sh start hq /path/to/boilerplate

# List running swarm sessions
.claude/scripts/swarm-launcher.sh list

# Attach to a session (Ctrl+B, D to detach)
.claude/scripts/swarm-launcher.sh attach wcr
```

**1. Read the live feed for messages from other sessions:**
```bash
tail -20 ~/auset-brain/Swarms/live-feed.md
```
Report any messages addressed to this team (look for `TO:<team-name>`).

**2. Announce yourself:**
```bash
echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | SESSION START | ${SWARM_TEAM:-Headquarters} | $(hostname -s)" >> ~/auset-brain/Swarms/live-feed.md
```

**3. Join the Swarm Telegraph (NON-NEGOTIABLE):**

The Swarm Telegraph delivers messages between Claude Code sessions using two event-driven mechanisms. **NO CRON JOBS.**

**Primary: Hook-based delivery (instant on next turn)**
The `telegraph-check.sh` hook in `settings.json` automatically checks `/tmp/swarm-inboxes/<team>.md` on every UserPromptSubmit and Stop event. Messages appear as context the moment anyone types or the session pauses. Already wired in settings.json — no setup needed.

**Backup: Event-driven daemons (replaces the old 5-minute cron)**
```bash
.claude/scripts/feed-watcher.sh start
.claude/scripts/swarm-telegraph.sh start
```
- **Feed Watcher**: `tail -f` on live-feed.md — detects AGENDA COMPLETE, REPORTING IN, TO:*, DIRECTIVE events instantly and writes trigger files for the Stop hook.
- **Swarm Telegraph**: `fswatch` on live-feed.md — routes TO:<TEAM> messages to team inbox files.
- **Inbox Dispatcher** (auto-started by telegraph): `fswatch` on /tmp/swarm-inboxes/ — wakes ONLY the targeted session when a message arrives. Uses exponential backoff on failed deliveries (10s → 20s → 40s → cap 5min). Auto-terminates when all sessions are dead and all inboxes are empty. Zero wasted cycles.

**DO NOT create CronCreate jobs for feed checking.** The old 5-minute cron fired on every idle session even when no messages existed. The inbox dispatcher + hook system handles all delivery event-driven.

**To send a message to another team:**
```bash
.claude/scripts/swarm-telegraph.sh send <team> "Your message"
```
This writes to the feed (archive) AND the team's inbox file (delivery). The inbox dispatcher detects the inbox write via fswatch and wakes the target session immediately. NO prompt box injection. NO AppleScript keyboard injection. NO polling.

**4. Write progress to the feed** every ~10 significant actions:
```bash
echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | PROGRESS | ${SWARM_TEAM:-HQ} | <what you just did>" >> ~/auset-brain/Swarms/live-feed.md
```

**5. Send messages to other teams** using the telegraph:
```bash
.claude/scripts/swarm-telegraph.sh send <team> "Your message here"
```
This writes to BOTH the feed (archive) and the team's inbox. The inbox dispatcher detects the new inbox file via fswatch and wakes the target session automatically. No manual inbox writes needed.

**6. When you finish your agenda, report to HQ:**
```bash
echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | AGENDA COMPLETE | ${SWARM_TEAM} | Completed: <summary> | Ready for next tasks" >> ~/auset-brain/Swarms/live-feed.md
```
HQ's feed watcher detects this instantly and will queue new tasks in the team registry. Read your section of the registry and continue working. Do NOT end your session — loop.

**7. Check dispatcher status** (optional, for debugging):
```bash
.claude/scripts/inbox-dispatcher.sh status
```
Shows pending deliveries, session liveness, and backoff state for each team.

**How this works — the full delivery chain:**
1. Team A sends: `.claude/scripts/swarm-telegraph.sh send pkgs "Fix the build"`
2. Telegraph writes to `live-feed.md` (archive) + `/tmp/swarm-inboxes/pkgs.md` (delivery)
3. Inbox Dispatcher (`fswatch`) detects the inbox write **instantly**
4. Dispatcher calls `session-registry.sh wake pkgs "You have messages"`
5. Registry discovers PKGS session:
   - **tmux session found?** → `tmux send-keys -t swarm-pkgs "message" Enter` (instant, 100% reliable)
   - **bare Terminal tab?** → AppleScript clipboard-paste fallback (fragile, but works)
6. Claude Code in PKGS session receives the prompt and processes it
7. Telegraph-check hook reads `/tmp/swarm-inboxes/pkgs.md` on the next turn

**Wake reliability by launch method:**

| Method | Idle Wake | Over SSH | Clipboard Safe | Focus Safe |
|--------|-----------|----------|----------------|------------|
| `swarm-launcher.sh` (tmux) | YES | YES | YES | YES |
| Bare Terminal tab | NO* | NO | NO | NO |

*Bare terminal sessions only see messages when the user types or the Stop hook fires.

**NO CRON JOBS.** Do NOT create CronCreate jobs for feed checking. Crons waste tokens printing "Nothing new" every 5 minutes on idle sessions. The event-driven system handles everything.

## For Developers (Non-Founders)
- Org gate check only
- Their own session history from `~/auset-brain/developers/<username>/sessions/`
- No vault access, no Slack check, no cross-project context
- Log their session start to their tracking directory

## Related Commands
- `/session-end` — Close session, sync vault, update tracker
- `/vault-sync` — Manual vault sync
- `/brain-sync` — Push vault to all channels
