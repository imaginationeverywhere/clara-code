# progress - Quick Platform Progress Dashboard

Quick, lightweight progress check against micro plan files. Runs in seconds. For deep analysis, use `/gap-analysis`.

**Agent:** `progress-tracker`

## Usage
```
/progress                        # Full platform summary (all epics)
/progress --epic 16              # One epic's stories
/progress --feature payments     # Cross-cutting keyword across all epics
/progress --phase 0              # Stories in a specific execution phase
```

## Arguments
- `--epic <number>` — Focus on a single epic (01-16)
- `--feature <keyword>` — Search across all epics for a keyword (e.g., "payments", "yapit", "auth", "clara")
- `--phase <number>` — Filter by execution phase (0=Platform Work, 1=Foundation, 2=Active Projects, 3=Deep Modules, 4=Global)

## Execution Steps

### Step 1: Load Plan Files

Read all micro plan files from `.claude/plans/micro/`:
```bash
ls .claude/plans/micro/*.md
```

If `--epic` specified, only load that epic's file (e.g., `16-auset-platform-activation.md`).
If `--feature` specified, load all files and grep for the keyword.

### Step 2: Parse Stories

For each plan file, extract:
- Epic number and title (from filename and first heading)
- Story count (count `### Story X.Y` headings)
- Story titles and IDs
- Expected files listed in each story (look for file paths in code blocks and bullet lists)

### Step 3: Quick Code Existence Check

For each story's expected files, check if they exist in the codebase:
```bash
# For each expected file path found in the plan
test -f <filepath>
```

Scoring per story:
- **DONE** — All expected files exist (or 90%+ if many files)
- **PARTIAL** — Some expected files exist (20-89%)
- **NOT STARTED** — No expected files exist (or <20%)

### Step 4: Calculate Progress

For each epic:
```
progress = (done_stories * 100 + partial_stories * 50) / total_stories
```

### Step 5: Display Dashboard

#### Full Platform View (default)
```
AUSET PLATFORM PROGRESS — [DATE]

  Epic | Name                        | Stories | Progress
  00   | Master Plan Index           |   —     | Current
  01   | Clara AI Platform           |  6      |           0%
  02   | Ali AI Platform             |  8      |           0%
  ...
  16   | Auset Activation            | 12      | ####      38%

  TOTAL: 114 stories | X done | Y partial | Z not started
  ACTIVE: Epic 16 (Phase 0 — Make the Platform Work)
  NEXT: Epic 11 (IP/Legal) + Epic 01 (Clara) — Phase 1
```

#### Single Epic View (`--epic 16`)
```
EPIC 16: Auset Platform Activation — [DATE]
Progress: ####          38% (5/12 stories)

  Story | Title                    | Status
  16.1  | Activation API           | PARTIAL
  16.2  | Dynamic Schema           | DONE
  16.3  | Dynamic Routes           | DONE
  ...
  16.12 | Frontend Feature System  | NOT YET

  DONE: 5 | PARTIAL: 2 | NOT STARTED: 5
```

#### Feature View (`--feature payments`)
```
FEATURE: "payments" across all epics — [DATE]

  Epic | Story  | Title                          | Status
  03   | 03.5   | Payment Config                 | NOT YET
  05   | 05.2   | Distribution Tracking          | NOT YET
  06   | 06.2   | Subscription Commerce          | NOT YET
  09   | 09.2   | Multi-Product Payments         | NOT YET
  13   | 13.1   | Transaction Dashboard          | NOT YET
  16   | 16.10  | Payments/Sobek Dual Provider   | NOT YET

  6 stories mention "payments" | 0 done | 0 partial | 6 not started
```

### Step 6: Identify Next Actions

Based on the master plan index execution strategy:
- Phase 0: Epic 16 (CRITICAL — do first)
- Phase 1: Epics 11, 01, 03, 12, 10 (parallel, no dependencies)
- Phase 2: Epics 12 (continued), 13, 14, 15, 02
- Phase 3: Epics 04, 05, 06, 07, 09, 12 (continued)
- Phase 4: Epics 08, 01 (continued), 10 (continued)

Show which phase is active and what's next.

## Data Sources
- `.claude/plans/micro/*.md` — Plan files (PRIMARY)
- Codebase file existence — Quick check for expected outputs
- `.claude/plans/micro/00-master-plan-index.md` — Execution strategy and phases

## Performance
- Target: 2-5 seconds
- No git analysis (that's `/gap-analysis`)
- No content inspection (just file existence)
- Cached results not needed at this speed

## Related Commands
- `/gap-analysis` — Deep hybrid scan with git history and acceptance criteria
- `/project-mvp-status` — Project-level MVP tracking (for client projects)
- `/project-status` — Post-MVP milestone tracking
- `/commands` — Find the right command for your current work
