# /queue-prompt — Save a Cursor Agent Prompt to Today's Not-Started Queue

**Counterpart to:** `/pickup-prompt` (which executes prompts; this one saves them)

The standard location for all Cursor agent prompts waiting to be executed is:

```
prompts/<YYYY>/<Month>/<D>/1-not-started/
```

Use this command whenever you — or a team — write a Cursor implementation prompt and need to file it for a QCS1 Cursor agent to pick up later.

---

## Usage

```
/queue-prompt                              # Show today's queue path and list contents
/queue-prompt "01-ecs-backend-deploy.md"  # Move this file into today's 1-not-started/
/queue-prompt --date 2026/April/12        # Show queue path for a specific date
/queue-prompt --create "02-web-navbar"    # Create a new numbered placeholder in today's queue
```

---

## Execution

### Step 1 — Resolve today's queue directory

```bash
YEAR=$(date +%Y)
MONTH=$(date +%B)        # Full month name: April, May, June, etc.
DAY=$(date +%-d)         # Day without leading zero: 1, 12, 30
QUEUE_DIR="prompts/${YEAR}/${MONTH}/${DAY}/1-not-started"

echo "Today's prompt queue: ${QUEUE_DIR}/"
```

### Step 2 — Create the directory if it doesn't exist

```bash
mkdir -p "${QUEUE_DIR}"
```

### Step 3 — Act on ARGUMENTS

**No arguments** — just show the queue:
```bash
echo ""
echo "Contents of ${QUEUE_DIR}/:"
ls "${QUEUE_DIR}"/*.md 2>/dev/null | sort | while read f; do
  echo "  $(basename $f)"
done
[ -z "$(ls ${QUEUE_DIR}/*.md 2>/dev/null)" ] && echo "  (empty — no prompts queued)"
```

**A filename argument** — move or copy the file into the queue:
```bash
# If ARGUMENTS is a path to an existing file, move it
if [ -f "$ARGUMENTS" ]; then
  DEST="${QUEUE_DIR}/$(basename $ARGUMENTS)"
  mv "$ARGUMENTS" "$DEST"
  echo "✅ Moved to queue: ${DEST}"
elif [ -f "${ARGUMENTS}" ]; then
  mv "${ARGUMENTS}" "${QUEUE_DIR}/"
  echo "✅ Queued: ${QUEUE_DIR}/$(basename $ARGUMENTS)"
else
  echo "ERROR: File not found: ${ARGUMENTS}"
  echo "Provide a full path or run from the repo root."
fi
```

**`--create <name>` argument** — create a numbered placeholder:
```bash
# Auto-number: find the next available prefix
NEXT_NUM=$(ls "${QUEUE_DIR}"/*.md 2>/dev/null | wc -l)
NEXT_NUM=$(printf "%02d" $((NEXT_NUM + 1)))
FILENAME="${QUEUE_DIR}/${NEXT_NUM}-${SLUG}.md"
echo "# Prompt: ${SLUG}" > "$FILENAME"
echo "Created placeholder: ${FILENAME}"
echo "Edit it, then run /pickup-prompt to execute."
```

---

## Directory Convention (Full Structure)

```
prompts/
└── 2026/
    └── April/
        └── 12/
            ├── 1-not-started/     ← Queue prompts HERE
            │   ├── 01-ecs-deploy.md
            │   ├── 02-web-navbar.md
            │   └── 03-test-fix.md
            ├── 2-in-progress/     ← /pickup-prompt moves here on start
            └── 3-done/            ← /pickup-prompt moves here on completion
```

**Rules:**
- Prompts are numbered with a two-digit prefix: `01-`, `02-`, `03-`
- Lower number = higher priority — agents pick up the lowest number first
- Each prompt is a complete, self-contained Cursor agent task spec
- Full month name in the directory path (April, not 04)
- Day without leading zero (12, not 012)

---

## Tell a Team Where to Save Their Prompts

When directing a team to queue their prompts, say:

> "Save your prompts to `prompts/$(date +%Y)/$(date +%B)/$(date +%-d)/1-not-started/` — number them `01-`, `02-`, etc. Run `/queue-prompt` to confirm the path and see what's already there. A QCS1 Cursor agent will pick them up with `/pickup-prompt`."

Or just run `/queue-prompt` — it will print the exact path for today.

---

## After Queuing

Post to the live feed so QCS1 Cursor agents know work is waiting:

```bash
COUNT=$(ls "prompts/$(date +%Y)/$(date +%B)/$(date +%-d)/1-not-started/"*.md 2>/dev/null | wc -l | tr -d ' ')
echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | QUEUE UPDATED | ${COUNT} prompt(s) waiting in today's 1-not-started/" >> ~/auset-brain/Swarms/live-feed.md
```

**Push to GitHub** so all sessions and QCS1 can see the prompts:

```bash
BRANCH=$(git branch --show-current)
git add "prompts/"
git commit -m "feat(prompts): queue ${COUNT} prompt(s) for Cursor agent execution [$(date +%Y-%m-%d)]"
git push origin "$BRANCH"
echo "✓ Prompts pushed to GitHub: $BRANCH"
```
