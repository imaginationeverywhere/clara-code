# /pickup-prompt — Find and Execute All Not-Started Prompts

**Named after the pattern:** Cursor agents on QCS1 pick up prompts from `prompts/<yyyy>/<Month>/<dd>/1-not-started/` and execute them in isolated git worktrees.

## What This Command Does

Resolves today's date, finds ALL prompts in `1-not-started/`, and processes them in a loop — one by one — until the queue is empty. For each prompt: creates a detached worktree, executes the prompt, creates a branch FROM the worktree when done, pushes the branch, opens a PR, moves the prompt to `3-completed/`, and removes the worktree. **You do not need to re-run this command.** It loops automatically until all prompts are done.

## Usage

```
/pickup-prompt                          # Process ALL not-started prompts for today (loops automatically)
/pickup-prompt 2026/April/12            # Specific date
/pickup-prompt --list                   # List all not-started prompts without executing
/pickup-prompt 01-cc-web-full.md        # Execute a specific prompt by filename only
/pickup-prompt --status                 # Show standards dashboard: what's implemented vs missing in this Heru
/pickup-prompt --requirements           # Discovery intake: collect Heru info, generate PRD/BRD/VRD
/pickup-prompt --all                    # List ALL Auset module prompts needed + queue missing ones

# Standards flags (can be stacked)
/pickup-prompt --clerk                  # Inject Clerk auth standard
/pickup-prompt --stripe                 # Inject Stripe standard (dynamic pricing, webhooks)
/pickup-prompt --graphql                # Inject GraphQL standard (DataLoader, auth guards, naming)
/pickup-prompt --migrations             # Inject DB migrations standard (up/down, all 3 envs)
/pickup-prompt --multi-tenant           # Inject multi-tenancy standard (tenant_id, PLATFORM/SITE_OWNER)
/pickup-prompt --testing                # Inject testing standard (80% coverage, error paths, no DB mocks)
/pickup-prompt --security               # Inject security standard (auth guards, rate limiting, CORS)
/pickup-prompt --desktop                # Inject desktop app standard (VS Code ext, Electron, SecretStorage)
/pickup-prompt --design                 # Inject design standard (Magic Patterns → web/desktop/CLI/mobile)
/pickup-prompt --design web             # Web surface only (Next.js App Router)
/pickup-prompt --design desktop         # Desktop surface only (VS Code webview / Electron)
/pickup-prompt --design cli             # CLI/TUI surface only (Ink + chalk)
/pickup-prompt --design mobile          # Mobile surface only (React Native + NativeWind)

# Stack flags for complex prompts
/pickup-prompt --graphql --migrations --multi-tenant --security   # Full backend feature
/pickup-prompt --stripe --migrations --testing                    # Subscription with DB changes
/pickup-prompt --clerk --security --testing                       # Auth feature
/pickup-prompt --design web --testing --security                  # Full frontend feature with design
```

## Flags

### `--clerk`

When this flag is present, the agent MUST read `.claude/standards/clerk-auth.md` before executing any prompt. The standard's rules become mandatory constraints for the entire execution — overriding any conflicting instruction in the prompt itself.

Use this flag for any prompt that involves:
- Sign-in pages
- Sign-up pages
- Auth layouts
- SSO/OAuth flows
- Clerk-protected routes

```bash
# Detect --clerk flag
CLERK_STANDARD=""
if echo "$*" | grep -q "\-\-clerk"; then
  CLERK_STANDARD=$(cat .claude/standards/clerk-auth.md)
  echo "📋 Clerk Auth Standard loaded — applying mandatory constraints:"
  echo "   ❌ No <SignIn> or <SignUp> embedded components"
  echo "   ✅ useSignIn() / useSignUp() hooks required"
  echo "   ✅ SSO callback route required"
  echo ""
fi
```

The loaded standard is prepended to the prompt context before execution. If the prompt says `<SignIn appearance={{...}} />` anywhere, the agent overrides it with the hook pattern from the standard.

---

### `--stripe`

When this flag is present, the agent MUST read `.claude/standards/stripe.md` before executing any prompt. The standard's rules become mandatory constraints for the entire execution — overriding any conflicting instruction in the prompt itself.

Use this flag for any prompt that involves:
- Checkout flows or subscription creation
- Webhook handlers (`/api/webhooks/stripe`)
- Subscription tier resolution or upgrades/downgrades
- Price/plan lookup
- API key issuance tied to subscription status
- Any `stripe.` call anywhere in the codebase

```bash
# Detect --stripe flag
STRIPE_STANDARD=""
if echo "$*" | grep -q "\-\-stripe"; then
  STRIPE_STANDARD=$(cat .claude/standards/stripe.md)
  echo "💳 Stripe Standard loaded — applying mandatory constraints:"
  echo "   ❌ No STRIPE_PRICE_* env vars — dynamic pricing only"
  echo "   ✅ express.raw() required for webhook body parsing"
  echo "   ✅ STRIPE_WEBHOOK_SECRET from SSM — never hardcoded"
  echo "   ✅ Local ngrok webhook endpoint required: https://[project]-backend-dev.ngrok.quiknation.com/api/webhooks/stripe"
  echo "   ✅ Hosted Checkout (not Elements) for subscription flows"
  echo "   ✅ Price lookup via Stripe metadata tags (clara_tier, clara_type)"
  echo ""
fi
```

The loaded standard is prepended to the prompt context before execution. Key overrides:
- If the prompt uses `process.env.STRIPE_PRICE_*` anywhere, the agent replaces it with `stripe.prices.list()` + metadata lookup
- If the webhook body is parsed with `express.json()`, the agent fixes it to `express.raw()`
- If no `/api/webhooks/stripe` endpoint exists, the agent creates one

---

### `--graphql`

Loads `.claude/standards/graphql.md`. Use for any prompt touching resolvers, schema, or federation.

```bash
GRAPHQL_STANDARD=""
if echo "$*" | grep -q "\-\-graphql"; then
  GRAPHQL_STANDARD=$(cat .claude/standards/graphql.md)
  echo "📊 GraphQL Standard loaded — applying mandatory constraints:"
  echo "   ❌ No resolver without DataLoader for relationships"
  echo "   ✅ Auth guard required: if (!ctx.auth?.userId) throw AuthenticationError"
  echo "   ✅ Naming: PascalCase types, camelCase fields/queries, SCREAMING_SNAKE enums"
  echo "   ✅ docs/standards/graphql.md must be created/updated"
  echo ""
fi
```

---

### `--migrations`

Loads `.claude/standards/migrations.md`. Use for any prompt creating or modifying DB schema.

```bash
MIGRATIONS_STANDARD=""
if echo "$*" | grep -q "\-\-migrations"; then
  MIGRATIONS_STANDARD=$(cat .claude/standards/migrations.md)
  echo "🗄️  Migrations Standard loaded — applying mandatory constraints:"
  echo "   ✅ Every migration needs up() AND down()"
  echo "   ❌ No DROP column — deprecate first, drop in next deploy"
  echo "   ✅ Run on .env.local → .env.develop → .env.production"
  echo "   ✅ Add index on every foreign key"
  echo "   ✅ docs/standards/migrations.md must be created/updated"
  echo ""
fi
```

---

### `--multi-tenant`

Loads `.claude/standards/multi-tenant.md`. Use for any prompt touching DB queries or data access.

```bash
MULTITENANT_STANDARD=""
if echo "$*" | grep -q "\-\-multi-tenant"; then
  MULTITENANT_STANDARD=$(cat .claude/standards/multi-tenant.md)
  echo "🏢 Multi-Tenancy Standard loaded — applying mandatory constraints:"
  echo "   ✅ Every DB query scoped to tenantId"
  echo "   ❌ No mixing PLATFORM_OWNER and SITE_OWNER concerns"
  echo "   ✅ All business tables have tenant_id column + index"
  echo "   ✅ docs/standards/multi-tenant.md must be created/updated"
  echo ""
fi
```

---

### `--testing`

Loads `.claude/standards/testing.md`. Use for any prompt that adds features (tests are required with the feature).

```bash
TESTING_STANDARD=""
if echo "$*" | grep -q "\-\-testing"; then
  TESTING_STANDARD=$(cat .claude/standards/testing.md)
  echo "🧪 Testing Standard loaded — applying mandatory constraints:"
  echo "   ✅ 80% line/statement coverage minimum on changed files"
  echo "   ✅ Error paths required: 401, 403, 404, 400, 500"
  echo "   ❌ No mocking internal services — test through HTTP layer"
  echo "   ✅ docs/standards/testing.md must be created/updated"
  echo ""
fi
```

---

### `--security`

Loads `.claude/standards/security.md`. Use for any prompt adding routes, file uploads, or auth logic.

```bash
SECURITY_STANDARD=""
if echo "$*" | grep -q "\-\-security"; then
  SECURITY_STANDARD=$(cat .claude/standards/security.md)
  echo "🔒 Security Standard loaded — applying mandatory constraints:"
  echo "   ✅ Auth check on every protected route"
  echo "   ✅ Parameterized queries (no string interpolation in SQL)"
  echo "   ✅ Rate limiting on all public endpoints"
  echo "   ✅ Helmet headers applied"
  echo "   ✅ docs/standards/security.md must be created/updated"
  echo ""
fi
```

---

### `--desktop`

Loads `.claude/standards/desktop.md`. Use for any prompt touching the VS Code extension, Electron app, or Tauri desktop.

```bash
DESKTOP_STANDARD=""
if echo "$*" | grep -q "\-\-desktop"; then
  DESKTOP_STANDARD=$(cat .claude/standards/desktop.md)
  echo "🖥️  Desktop Standard loaded — applying mandatory constraints:"
  echo "   ✅ Auth via PKCE + loopback — no web redirect flows"
  echo "   ✅ Secrets in SecretStorage — not settings.json or localStorage"
  echo "   ✅ IPC via contextBridge — never expose Node modules directly"
  echo "   ✅ Signed builds only (notarized macOS, Authenticode Windows)"
  echo "   ✅ docs/standards/desktop.md must be created/updated"
  echo ""
fi
```

---

### `--design`

Loads `.claude/standards/design.md`. Use for any prompt that converts Magic Patterns exports to production components, builds new UI surfaces, or establishes the design system. Accepts an optional surface variant: `web` (default), `desktop`, `cli`, or `mobile`.

```bash
DESIGN_STANDARD=""
DESIGN_SURFACE="web"  # default
if echo "$*" | grep -q "\-\-design"; then
  DESIGN_STANDARD=$(cat .claude/standards/design.md)
  # Detect optional surface variant
  if echo "$*" | grep -q "\-\-design desktop"; then DESIGN_SURFACE="desktop"
  elif echo "$*" | grep -q "\-\-design cli"; then DESIGN_SURFACE="cli"
  elif echo "$*" | grep -q "\-\-design mobile"; then DESIGN_SURFACE="mobile"
  fi
  echo "🎨 Design Standard loaded (surface: ${DESIGN_SURFACE}) — applying mandatory constraints:"
  echo "   ✅ Read docs/design-system.md before writing any component"
  echo "   ✅ Read mockups/${DESIGN_SURFACE}/ Magic Patterns export as the spec"
  echo "   ✅ Extract design tokens into tailwind.config.ts — no hardcoded hex"
  if [ "$DESIGN_SURFACE" = "web" ]; then
    echo "   ✅ Next.js App Router: remove React imports, convert router, convert <img>"
    echo "   ✅ Add 'use client' only for components using hooks/events"
    echo "   ✅ 4 interactive states required: default, hover, active, disabled"
    echo "   ✅ Mobile-first responsive (grid-cols-1 md:grid-cols-2)"
  elif [ "$DESIGN_SURFACE" = "desktop" ]; then
    echo "   ✅ VS Code CSS tokens: var(--vscode-editor-background) — never hex"
    echo "   ✅ Webview CSP required: no unsafe-inline in production scripts"
    echo "   ✅ JetBrains Mono for all code/terminal/path content"
  elif [ "$DESIGN_SURFACE" = "cli" ]; then
    echo "   ✅ Ink components only — not browser React"
    echo "   ✅ Box-drawing layout: waveform top / chat middle / input bar bottom"
    echo "   ✅ 16-color fallback: design must work with FORCE_COLOR=0"
  elif [ "$DESIGN_SURFACE" = "mobile" ]; then
    echo "   ✅ React Native: View/Text/Image/TouchableOpacity — no HTML elements"
    echo "   ✅ SafeAreaView on every screen root"
    echo "   ✅ 44pt minimum touch targets (iOS HIG)"
    echo "   ✅ Platform.OS tokens for iOS/Android differences"
  fi
  echo "   ✅ docs/design-system.md must be created/updated"
  echo ""
fi
```

The loaded standard is prepended to the prompt context before execution. Key overrides:
- If the prompt uses hardcoded hex colors (`#09090F`), the agent extracts them as Tailwind tokens first
- If converting from Magic Patterns (Vite/React), the agent applies surface-specific conversion rules
- If no `docs/design-system.md` exists, the agent creates it using the template in the standard
- All 4 interactive states (default/hover/active/disabled) are required for every interactive component

---

### `--status`

Shows a dashboard of which standards are implemented in this Heru and which tech docs are missing.

```bash
if echo "$*" | grep -q "\-\-status"; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  STANDARDS STATUS — $(basename $(pwd))"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  printf "  %-18s %-14s %-12s %s\n" "Standard" "Implemented" "Tech Doc" "Run with"
  echo "  ──────────────────────────────────────────────────────────────"

  check_standard() {
    local name=$1; local pattern=$2; local flag=$3
    local impl="❌ Missing"; local doc="❌ Missing"
    if eval "$pattern" 2>/dev/null | grep -q .; then impl="✅ Found"; fi
    if [ -f "docs/standards/${name}.md" ]; then doc="✅ Found"; fi
    printf "  %-18s %-14s %-12s %s\n" "$name" "$impl" "$doc" "$flag"
  }

  check_standard "clerk"       "grep -rl 'clerkMiddleware\|requireApiKey' src/ 2>/dev/null"     "--clerk"
  check_standard "stripe"      "grep -rl 'webhooks/stripe\|constructEvent' backend/src/ 2>/dev/null" "--stripe"
  check_standard "graphql"     "grep -rl 'typeDefs\|ApolloServer\|resolvers' src/ 2>/dev/null" "--graphql"
  check_standard "migrations"  "ls migrations/*.js 2>/dev/null || ls backend/src/migrations/*.ts 2>/dev/null" "--migrations"
  check_standard "multi-tenant" "grep -rl 'tenantId\|tenant_id' src/ 2>/dev/null"              "--multi-tenant"
  check_standard "testing"     "ls src/__tests__/**/*.test.ts 2>/dev/null || ls __tests__/**/*.test.ts 2>/dev/null" "--testing"
  check_standard "security"    "grep -rl 'helmet\|rateLimit' src/ backend/src/ 2>/dev/null"     "--security"
  check_standard "desktop"     "grep -rl 'SecretStorage\|contextBridge\|ipcMain' src/ 2>/dev/null" "--desktop"
  check_standard "design"      "ls mockups/ 2>/dev/null && ls docs/design-system.md 2>/dev/null" "--design"

  echo "  ──────────────────────────────────────────────────────────────"
  echo ""
  echo "  Missing tech docs can be created with: /pickup-prompt --<name> on any prompt"
  echo "  Tech docs live in: docs/standards/<name>.md (Heru-specific config)"
  echo ""
  exit 0
fi
```

---

### `--requirements`

Discovery intake for NEW Herus or MIGRATIONS from existing projects. Collects business requirements and generates PRD/BRD/VRD documents. Use BEFORE running `--all` or `/bootstrap-project`.

```bash
if echo "$*" | grep -q "\-\-requirements"; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  REQUIREMENTS INTAKE — $(basename $(pwd))"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  # Claude: ask the user for the following, then generate docs
  echo "  Collecting business requirements. Answer each prompt:"
  echo ""
  echo "  1. Heru name (e.g., 'DreamiHairCare', 'QuikCarRental')"
  echo "  2. Business type (e.g., 'salon booking', 'car rental marketplace')"
  echo "  3. Existing website URL (or 'none')"
  echo "  4. Target users (e.g., 'salon owners + their customers')"
  echo "  5. Key features needed (bullet list)"
  echo "  6. Is this a new project or migrating an existing one?"
  echo "  7. Any existing tech stack to preserve?"
  echo "  8. Notes / constraints / business goals"
  echo ""
  # Claude: gather answers, then:
  # 1. Fetch and analyze existing website if URL provided
  # 2. Run /analyze, /critically-think, /facts on the requirements
  # 3. Generate docs/PRD.md (product requirements)
  # 4. Generate docs/BRD.md (business requirements, if enough business context)
  # 5. Generate docs/VRD.md (visual requirements, if enough design context or existing site)
  # 6. Commit: feat(docs): generate PRD/BRD/VRD from requirements intake
  # 7. Tell user: "Run /pickup-prompt --all to generate implementation prompts"
  exit 0
fi
```

---

### `--all`

Lists every Auset platform module and shows which are implemented vs missing. Queues missing modules as prompts. Use after `--requirements` on new/migrated projects.

```bash
if echo "$*" | grep -q "\-\-all"; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  AUSET PLATFORM — FULL MODULE CHECKLIST"
  echo "  $(basename $(pwd))"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  # Claude: check for each Auset Standard Module and output status:
  # ✅ = implemented  ❌ = missing  ⚠️  = partial
  #
  # Core Platform
  # [ ] Clerk auth (sign-in, sign-up, middleware, webhook sync)
  # [ ] Stripe subscriptions (checkout, webhook, tier management)
  # [ ] User profile widget
  # [ ] Admin dashboard
  # [ ] CMS (content management)
  # [ ] CRM (customer management)
  #
  # Commerce
  # [ ] Shopping cart
  # [ ] Checkout flow
  # [ ] Order management
  # [ ] Product catalog
  #
  # Communications
  # [ ] Email notifications (SendGrid)
  # [ ] SMS notifications (Twilio)
  # [ ] Push notifications
  #
  # Infrastructure
  # [ ] Onboarding flow
  # [ ] GA4 analytics
  # [ ] Heru Feedback SDK
  # [ ] S3 file storage
  # [ ] Search
  # [ ] i18n (internationalization)
  # [ ] n8n automation workflows
  # [ ] CI/CD pipeline
  #
  # After listing, ask: "Queue all missing modules as prompts? (y/n)"
  # If y: generate prompt files in prompts/<date>/1-not-started/ for each missing module
  exit 0
fi

## Execution

### Step 0 — Pull latest + clean up merged prompt branches

Before looking for prompts, pull the latest and delete any prompt branches whose PRs have been merged (cleanup from the last run):

```bash
echo "Pulling latest from remote..."
git pull origin $(git branch --show-current) 2>&1
echo ""

echo "Cleaning up merged prompt branches from last run..."
gh pr list --state merged --json headRefName --jq '.[].headRefName' 2>/dev/null \
  | grep '^prompt/' \
  | while read BRANCH; do
      git branch -d "$BRANCH" 2>/dev/null || git branch -D "$BRANCH" 2>/dev/null
      git push origin --delete "$BRANCH" 2>/dev/null || true
      echo "  🗑️  Deleted merged branch: $BRANCH"
    done
echo ""
```

If the pull fails (merge conflict, dirty worktree), stop and report before proceeding.

### Step 1 — Resolve the prompt directory

```bash
YEAR=$(date +%Y)
MONTH=$(date +%B)    # Full month name: January, February, ...
DAY=$(date +%-d)     # Day without leading zero
PROMPT_DIR="prompts/${YEAR}/${MONTH}/${DAY}/1-not-started"

echo "Looking in: ${PROMPT_DIR}"
ls "${PROMPT_DIR}" 2>/dev/null || echo "No prompts directory found at ${PROMPT_DIR}"
```

### Step 2 — Loop: process every prompt until the queue is empty

**This is the main loop. Do NOT stop after one prompt. Do NOT ask the user to run the command again.**

```bash
while true; do
  # ── Find next prompt ──────────────────────────────────────────────────────
  if [ -n "$SPECIFIC_PROMPT" ]; then
    # Specific file requested (from ARGUMENTS)
    TARGET="${PROMPT_DIR}/${SPECIFIC_PROMPT}"
    [[ "$SPECIFIC_PROMPT" != *.md ]] && TARGET="${TARGET}.md"
    SPECIFIC_PROMPT=""  # only run specific once
  else
    TARGET=$(ls "${PROMPT_DIR}"/*.md 2>/dev/null | sort | head -1)
  fi

  if [ -z "$TARGET" ] || [ ! -f "$TARGET" ]; then
    echo ""
    echo "✅ Queue empty — all prompts processed for ${YEAR}/${MONTH}/${DAY}"
    echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | QUEUE EMPTY | All prompts complete for ${YEAR}/${MONTH}/${DAY}" >> ~/auset-brain/Swarms/live-feed.md
    break
  fi

  PROMPT_NAME=$(basename "$TARGET" .md)

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "PICKING UP PROMPT: $(basename $TARGET)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # ── Move to in-progress ───────────────────────────────────────────────────
  IN_PROGRESS_DIR="prompts/${YEAR}/${MONTH}/${DAY}/2-in-progress"
  mkdir -p "$IN_PROGRESS_DIR"
  mv "$TARGET" "$IN_PROGRESS_DIR/"
  INPROGRESS_FILE="${IN_PROGRESS_DIR}/$(basename $TARGET)"
  echo "📋 Moved to: ${INPROGRESS_FILE}"

  # ── Read the prompt ───────────────────────────────────────────────────────
  cat "$INPROGRESS_FILE"
  echo ""

  # ── Create a DETACHED worktree (no branch yet) ────────────────────────────
  WORKTREE_PATH="/tmp/worktrees/${PROMPT_NAME}"
  mkdir -p "/tmp/worktrees"

  # Remove stale worktree if it exists from a prior interrupted run
  git worktree remove "$WORKTREE_PATH" --force 2>/dev/null || true
  rm -rf "$WORKTREE_PATH" 2>/dev/null || true

  # Create worktree detached from current HEAD (develop)
  git worktree add --detach "$WORKTREE_PATH" 2>/dev/null || {
    echo "ERROR: Could not create worktree at $WORKTREE_PATH"
    # Move prompt back to not-started on failure
    mv "$INPROGRESS_FILE" "$TARGET"
    break
  }

  echo "🌿 Detached worktree created: $WORKTREE_PATH"
  echo "All changes happen inside the worktree — not in the main checkout."
  echo ""

  # ── EXECUTE THE PROMPT ────────────────────────────────────────────────────
  # Read the prompt from 2-in-progress/ and follow ALL instructions in it.
  # All file edits happen inside $WORKTREE_PATH.
  # [Cursor agent: execute the prompt content shown above inside $WORKTREE_PATH]

  # ── Create branch FROM the worktree (after work is done) ─────────────────
  BRANCH_NAME="prompt/${YEAR}-$(date +%m)-$(date +%d)/${PROMPT_NAME}"
  BRANCH_NAME=$(echo "$BRANCH_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9\/\-]/-/g' | sed 's/-\+/-/g')

  cd "$WORKTREE_PATH"

  # Create the branch here (from the worktree's current state)
  git checkout -b "$BRANCH_NAME" 2>/dev/null || {
    echo "ERROR: Could not create branch $BRANCH_NAME in worktree"
    cd - > /dev/null
    git worktree remove "$WORKTREE_PATH" --force 2>/dev/null
    mv "$INPROGRESS_FILE" "$TARGET"
    break
  }

  echo "🌿 Branch created from worktree: $BRANCH_NAME"

  # ── Commit the work ───────────────────────────────────────────────────────
  git add -A

  COMMIT_MSG="feat: execute prompt ${PROMPT_NAME}

Prompt source: prompts/${YEAR}/${MONTH}/${DAY}/2-in-progress/$(basename $INPROGRESS_FILE)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

  git commit -m "$COMMIT_MSG" 2>/dev/null || echo "(nothing to commit — prompt may have been docs-only)"

  # ── Push the branch to GitHub ─────────────────────────────────────────────
  REMOTE=$(git remote | head -1)
  if [ -z "$REMOTE" ]; then
    echo "⚠️  No git remote found — skipping push and PR"
  else
    git push "$REMOTE" "$BRANCH_NAME" 2>&1
    echo ""
    echo "🚀 Pushed branch: $BRANCH_NAME → $REMOTE"

    # ── Create a PR on that branch ────────────────────────────────────────
    PR_TITLE="feat: ${PROMPT_NAME}"
    PR_BODY="## Prompt Execution

**Prompt:** \`${PROMPT_NAME}\`
**Date:** ${YEAR}/${MONTH}/${DAY}
**Source:** \`prompts/${YEAR}/${MONTH}/${DAY}/3-completed/$(basename $INPROGRESS_FILE)\`

## Summary
Executed by Cursor agent via \`/pickup-prompt\`. See prompt file for full task description.

## Review
Run \`/review-code\` to auto-detect this PR, review it, merge into develop, and delete the branch.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

    gh pr create \
      --title "$PR_TITLE" \
      --body "$PR_BODY" \
      --base develop \
      --head "$BRANCH_NAME" 2>&1

    PR_URL=$(gh pr list --head "$BRANCH_NAME" --json url --jq '.[0].url' 2>/dev/null)
    echo ""
    echo "📬 PR created: $PR_URL"
  fi

  # ── Return to main repo ───────────────────────────────────────────────────
  cd - > /dev/null

  # ── Move prompt to 3-completed ────────────────────────────────────────────
  COMPLETED_DIR="prompts/${YEAR}/${MONTH}/${DAY}/3-completed"
  mkdir -p "$COMPLETED_DIR"
  mv "$INPROGRESS_FILE" "$COMPLETED_DIR/"
  echo ""
  echo "✅ Prompt complete. Moved to: ${COMPLETED_DIR}/$(basename $INPROGRESS_FILE)"

  # ── Remove the worktree (branch stays in git history) ─────────────────────
  git worktree remove "$WORKTREE_PATH" --force 2>/dev/null
  echo "🧹 Worktree cleaned up: $WORKTREE_PATH"

  # ── Post progress to live feed ────────────────────────────────────────────
  echo "$(date '+%H:%M:%S') | $(basename $(pwd)) | PROMPT COMPLETE | ${PROMPT_NAME} | Branch: ${BRANCH_NAME} | PR: ${PR_URL:-N/A}" >> ~/auset-brain/Swarms/live-feed.md

  # ── Count remaining ───────────────────────────────────────────────────────
  REMAINING=$(ls "${PROMPT_DIR}"/*.md 2>/dev/null | wc -l | tr -d ' ')
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if [ "$REMAINING" -gt 0 ]; then
    echo "📋 ${REMAINING} prompt(s) remaining — picking up next..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
  else
    echo "📋 0 prompts remaining — queue clear."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  fi

  # Loop continues automatically to the next prompt

done
```

## Directory Convention

```
prompts/
└── 2026/
    └── April/
        └── 12/
            ├── 1-not-started/     ← All prompts queue here
            │   ├── 01-web-navbar.md
            │   ├── 02-ecs-deploy.md
            │   └── 03-test-fix.md
            ├── 2-in-progress/     ← Moved here when agent starts (one at a time)
            └── 3-completed/       ← Moved here when work is done + PR opened
```

## Worktree Convention

```
/tmp/worktrees/
└── 01-web-navbar/       ← Detached worktree, cleaned up after PR is created

Branch created INSIDE the worktree (after work is done):
  prompt/2026-04-12/01-web-navbar

PR base:  develop
PR head:  prompt/2026-04-12/01-web-navbar
```

## Full Lifecycle Summary

```
Step 0: git pull + delete merged prompt branches from last run
    ↓
1-not-started/ → [pick up] → 2-in-progress/
    ↓
[create DETACHED worktree at /tmp/worktrees/<name>]
    ↓
[execute prompt — all edits inside worktree]
    ↓
[git checkout -b <branch> inside worktree]
[git commit]
[git push origin <branch>]
[gh pr create --base develop --head <branch>]
    ↓
3-completed/
[worktree removed]
    ↓
[LOOP — pick up next prompt automatically]
    ↓
[when 1-not-started/ is empty → post to live feed → done]
```

## Key Rules

- **Never stop after one prompt.** Loop until `1-not-started/` is empty.
- **Worktree is created DETACHED** — no branch at creation time.
- **Branch is created FROM the worktree AFTER work is done** — `git checkout -b` inside the worktree.
- **Worktree is deleted after the PR is opened** — the branch lives in GitHub.
- **On next run, Step 0 cleans up merged PR branches** — `git pull` + delete merged `prompt/*` branches.
- **All edits happen inside `$WORKTREE_PATH`** — never in the main checkout.
- Prompts are numbered (01-, 02-) — lower number = higher priority.
- If a worktree creation fails, the prompt is moved back to `1-not-started/` and the loop stops.

## Notes

- The worktree branch stays in GitHub as a record of what was done
- PR base is always `develop`
- Run `/review-code` after prompts complete — it auto-detects open prompt PRs, reviews, merges, and deletes the branches
- If `1-not-started/` is empty at start, posts "QUEUE EMPTY" to live feed and exits

## Command Metadata

```yaml
name: pickup-prompt
version: 3.2.0
changelog:
  - v3.2.0: Added --graphql, --migrations, --multi-tenant, --testing, --security, --desktop flags; added --status dashboard; added --requirements intake; added --all Auset module checklist
  - v3.1.0: Added --stripe flag; Stripe standard enforces dynamic pricing, webhook pattern, ngrok URL convention, SSM secrets
  - v3.0.0: Auto-loop all prompts; worktree detached then branch; gh pr create; cleanup merged branches on Step 0
  - v2.1.0: Added Step 0 git pull
  - v2.0.0: Worktree lifecycle (create → execute → push → cleanup)
  - v1.0.0: Initial release
```
