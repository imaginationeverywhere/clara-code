# /pickup-prompt — Find and Execute the Next Not-Started Prompt

**Named after the pattern:** Cursor agents on QCS1 pick up prompts from `prompts/<yyyy>/<Month>/<dd>/1-not-started/` and execute them.

## What This Command Does

Resolves today's date, finds the `1-not-started/` directory for that date, lists available prompts, and instructs the agent to execute the first one (or a specific one if named).

## Usage

```
/pickup-prompt                    # Find and execute the next not-started prompt for today
/pickup-prompt 2026/April/12      # Specific date
/pickup-prompt --list             # List all not-started prompts without executing
/pickup-prompt 01-cc-web-full.md  # Execute a specific prompt by filename
```

## Execution

### Step 1 — Resolve the prompt directory

```bash
YEAR=$(date +%Y)
MONTH=$(date +%B)   # Full month name: January, February, ... (matches directory convention)
DAY=$(date +%-d)    # Day without leading zero
PROMPT_DIR="prompts/${YEAR}/${MONTH}/${DAY}/1-not-started"

echo "Looking in: ${PROMPT_DIR}"
ls "${PROMPT_DIR}" 2>/dev/null || echo "No prompts directory found at ${PROMPT_DIR}"
```

### Step 2 — List available prompts

```bash
PROMPTS=$(ls "${PROMPT_DIR}"/*.md 2>/dev/null | sort)
if [ -z "$PROMPTS" ]; then
  echo "✅ No prompts waiting in ${PROMPT_DIR}"
  exit 0
fi

echo "Prompts waiting:"
for f in $PROMPTS; do
  echo "  - $(basename $f)"
done
```

### Step 3 — Pick up the first prompt (or the one named in ARGUMENTS)

If `$ARGUMENTS` is empty, take the first file alphabetically (lowest number = highest priority).
If `$ARGUMENTS` names a file, use that one.

```bash
if [ -n "$ARGUMENTS" ] && [ "$ARGUMENTS" != "--list" ]; then
  # Specific file requested
  TARGET="${PROMPT_DIR}/${ARGUMENTS}"
  if [[ "$ARGUMENTS" != *.md ]]; then
    TARGET="${TARGET}.md"
  fi
else
  # Take the first prompt
  TARGET=$(ls "${PROMPT_DIR}"/*.md 2>/dev/null | sort | head -1)
fi

if [ ! -f "$TARGET" ]; then
  echo "ERROR: Prompt not found: ${TARGET}"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "EXECUTING PROMPT: $(basename $TARGET)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$TARGET"
```

### Step 4 — Mark as in-progress (move to 2-in-progress/)

```bash
IN_PROGRESS_DIR="prompts/${YEAR}/${MONTH}/${DAY}/2-in-progress"
mkdir -p "$IN_PROGRESS_DIR"
mv "$TARGET" "$IN_PROGRESS_DIR/"
echo ""
echo "Moved to: ${IN_PROGRESS_DIR}/$(basename $TARGET)"
```

### Step 5 — Execute the prompt

Read the full prompt content and follow all instructions in it. The prompt contains the complete specification for what to build. Execute it now.

After completion:

```bash
DONE_DIR="prompts/${YEAR}/${MONTH}/${DAY}/3-done"
mkdir -p "$DONE_DIR"
mv "${IN_PROGRESS_DIR}/$(basename $TARGET)" "$DONE_DIR/"
echo ""
echo "✅ Prompt complete. Moved to: ${DONE_DIR}/$(basename $TARGET)"
```

Then check for the next prompt:
```bash
NEXT=$(ls "${PROMPT_DIR}"/*.md 2>/dev/null | sort | head -1)
if [ -n "$NEXT" ]; then
  echo "Next prompt waiting: $(basename $NEXT)"
  echo "Run /pickup-prompt to continue."
fi
```

## Directory Convention

```
prompts/
└── 2026/
    └── April/
        └── 12/
            ├── 1-not-started/     ← Cursor agents pick from here
            │   ├── 01-web-navbar.md
            │   ├── 02-ecs-deploy.md
            │   └── 03-test-fix.md
            ├── 2-in-progress/     ← Moved here when agent starts
            └── 3-done/            ← Moved here when complete
```

## Notes

- Prompts are numbered (01-, 02-) — lower number = higher priority
- Each prompt is a complete Cursor agent task spec — self-contained instructions
- Agents run one prompt at a time; pick up the next when done
- If `1-not-started/` is empty, the agent's queue is clear — post to live feed:
  ```bash
  echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | QUEUE EMPTY | All prompts complete for $(date +%Y/%B/%-d)" >> ~/auset-brain/Swarms/live-feed.md
  ```
