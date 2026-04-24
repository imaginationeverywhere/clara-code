# /queue-prompt — Save a Cursor Agent Prompt to Today's Not-Started Queue

**Counterpart to:** `/pickup-prompt` (which executes prompts; this one saves them + enforces the authoring standard)

The standard location for all Cursor agent prompts waiting to be executed is:

```
prompts/<YYYY>/<Month>/<D>/1-not-started/
```

Use this command whenever you — or a team — write a Cursor implementation prompt and need to file it for a QCS1 Cursor agent to pick up later.

---

## Usage

```
/queue-prompt                              # Show today's queue path and list contents
/queue-prompt --spec                       # Print the Prompt Authoring Standard (send to teams)
/queue-prompt --stacks                     # Print all 46 stack-standards-injection flags
/queue-prompt --template <slug>            # Scaffold a canonical prompt file with all required fields
/queue-prompt --template <slug> --stacks frontend,clerk,stripe   # Pre-fill STACKS header
/queue-prompt --validate <file>            # Check a prompt file meets the authoring standard
/queue-prompt "01-ecs-backend-deploy.md"   # Move this file into today's 1-not-started/
/queue-prompt --date 2026/April/12         # Show queue path for a specific date
/queue-prompt --create "02-web-navbar"     # (legacy) bare placeholder — prefer --template
```

### Symmetric flags (same param universe as `/pickup-prompt`)

`/queue-prompt` accepts **every** flag `/pickup-prompt` accepts. Instead of executing work, the agent **writes** a new markdown file under `prompts/<date>/1-not-started/` whose body is:

1. **Prepended sections** — For each flag, the same content `/pickup-prompt` would load (standards from `.claude/standards/*.md`, setup templates from `.claude/commands/prompts/setup/*.md`, page/component templates from `.claude/commands/prompts/*.md`).
2. **Task section** — Optional user text from the command line (the quoted `"..."` after flags), or a default line: `Execute the scoped work per prepended templates; open a PR against develop.`

**Symmetry rule**

```
/queue-prompt --clerk "Document Clerk redirect URLs for staging"   → writes queued prompt
/pickup-prompt --clerk                                              → executes next matching / any queued prompt when combined with filename
```

Stacking is identical to pickup: `/queue-prompt --frontend --clerk --security "Implement auth layout"`.

**8-step setup flags (queue the same names as pickup)**

`--source-control` · `--github` · `--gitlab` · `--bitbucket` · `--azure-devops` · `--frontend` · `--nextjs` · `--vite` · `--angular` · `--backend` · `--clerk` · `--feedback-widget` · `--react-native` · `--expo` · `--electron` · `--aws-deploy` · `--gcp` · `--azure` · `--cloudflare` · `--migrate-amplify-to-cf` · `--bedrock`

**Standards / integration / stack flags** — same list as `/pickup-prompt` Usage block (`--stripe`, `--graphql`, `--design`, `--mobile`, `--cf`, etc.).

**Clara prompt-type flags** — `--privacy-policy`, `--tos`, `--about-us`, `--contact-us`, `--nav-bar`, `--hero-section`, `--footer`, `--feedback-widget`, `--user-journey`, `--rbac`.

**Meta flags** — `/queue-prompt` does **not** implement `--parallel`, `--status`, `--retry-failed`, or `--list` from pickup; those remain execute-only on `/pickup-prompt`.

### Queue file naming

When creating from flags, use: `NN-<short-slug>.md` where `NN` is the next two-digit sequence in the folder and `short-slug` derives from the first flag + topic (e.g. `07-clerk-staging-urls.md`).

Discoverability: see `docs/prompts/README.md`.

---

## 🎯 Prompt Authoring Standard (NON-NEGOTIABLE)

Every prompt in `1-not-started/` MUST follow this contract so `pickup-prompt` can execute it blind — no follow-up questions, no missing context, no landing in the wrong repo.

### Required Header (top of file, before the H1 title)

```
**TARGET REPO:** <owner/repo or bare repo name>
**BRANCH:** <feat/foo | fix/bar — what the agent should create>
**BASE:** <develop | main | feat/other-branch-for-stacking>
**AGENT:** <named agent — e.g. Ahmad Baba, Jerry Lawson, Skip Ellis>
**MACHINE ETA:** <N hrs — machine-speed only, never human-days>
```

**Optional header fields** (include when relevant):

```
**MODEL:** <claude-4.6-sonnet-medium | claude-opus-4-7-high | auto>
**DEPENDS ON:** <Prompt NN (what must be merged first)>
**REVIEW SOURCE:** <docs/review/YYYYMMDD-HHMMSS-code-review-<pr>.md>
**STACKS:** <comma-separated list of standards to inject — see /queue-prompt --stacks>
```

### `STACKS:` header — how pickup-prompt auto-injects standards

`pickup-prompt` auto-detects which stacks live in the target repo (via grep) and injects the matching standards docs into the Cursor agent's context before it starts work. Most of the time auto-detection is enough — you don't need to declare anything.

**Declare `STACKS:` explicitly when:**
- Your prompt touches a stack that isn't yet detectable in the repo (e.g. introducing Stripe for the first time — no `webhooks/stripe` yet to grep for)
- You want to FORCE a specific standard even if the detector doesn't fire
- You want to skip auto-detection and keep the prompt narrow

**Format:**
```
**STACKS:** frontend, clerk, stripe, neon
```

Teams pick from the 28 available flags (see `/queue-prompt --stacks` for the full table).

### Available stack flags (47 standards)

| Flag | Stack | What gets injected |
|------|-------|--------------------|
| `--frontend` | Next.js 16 | Apollo + Clerk + Redux-Persist + Tailwind + TypeScript patterns |
| `--backend` | Express + Apollo | Sequelize + TypeScript + requireAuth + resolver patterns |
| `--mobile` | Expo SDK 52 | Expo Router + NativeWind + Apollo + Clerk + all providers |
| `--clerk` | Auth | Auth pages, middleware, webhook, ProfileWidget |
| `--stripe` | Payments | Subscriptions, checkout, all 6 webhook events |
| `--graphql` | Apollo Server | Schema, resolvers, DataLoader, auth guards |
| `--migrations` | DB | up/down migrations, indexes, all 3 envs |
| `--multi-tenant` | Multi-tenancy | tenant_id on all tables, scoped queries |
| `--testing` | Test coverage | 80% coverage, error paths, no DB mocks |
| `--security` | Hardening | Helmet, rate limiting, CORS, auth guards |
| `--neon` | Neon Postgres | Branches, pooler, SSL, connection strings |
| `--cf` | Cloudflare | wrangler.toml, OpenNext, CF env vars, Clerk |
| `--admin` | Admin panel | Double-gate, RBAC, AuditLog, DataTable |
| `--profile` | Profile widget | Clerk sync, wallet, avatar S3, history |
| `--analytics` | GA4 | 4-stage funnel, Measurement Protocol |
| `--design` | Design system | Magic Patterns conversion, design tokens, states |
| `--twilio` | SMS/Voice | Webhook sig, singleton pattern |
| `--slack` | Slack bot | Bot, slash commands, Block Kit, rate limits |
| `--push` | Push notif | APNs + FCM, device tokens, receipt processing |
| `--eas` | EAS Build | Build config, xcrun altool, EXPO_TOKEN, ASC issuer |
| `--shipping` | Shippo | Rates, label, tracking webhook |
| `--digital-pass` | Wallet passes | Apple Wallet + Google Wallet bridge |
| `--apple-maps` | iOS maps | PROVIDER_DEFAULT, MapKit, Platform.OS gate |
| `--mapbox` | Android maps | GL rendering, Platform.OS gate |
| `--desktop` | Electron | PKCE auth, SecretStorage, contextBridge, signing |
| `--apple` | App Store | Metadata, screenshots, xcrun altool upload |
| `--google` | Play Store | AAB, Data Safety form, staged rollout |
| **`--feedback`** | **Heru Feedback SDK** | **FAB widget, onboarding tour, contact mode, GraphQL endpoint, classification (P0-P3), Slack #maat-agents notifs, vault task gen, admin dashboard** |
| **`--vrd`** | **Voice Requirements Doc (pre-implementation)** | **VRD authoring format — Amen Ra's invention, canonical VRD-001, question inventory. Write this BEFORE any voice cloning or TTS.** |
| **`--voice`** | **Voxtral implementation** | **Modal serverless GPU (A10G), /tts /stt /clone endpoints, <3s latency budget, consent flow, free-clone-on-signup gate, Clara Voice Server** |
| **`--rbac`** | **Role-Based Access Control** | **Role definitions, permission matrices, tenant-scoped roles, UI conditional rendering (RoleGate), backend guards (requirePermission), audit trail on permission changes. Distinct from `--clerk` (which is auth).** |
| **`--user-journey`** | **User Journey Map (pre-mockup)** | **Personas, entry/exit points, emotional states, decision gates, success metrics. Author BEFORE mockups/design — validates the flow before any visual design work starts.** |
| **`--cms`** | **Content Management** | **Page builder, content types, media library (S3), scheduled publishing, SEO per page, preview mode, versioning + rollback, multi-author workflows.** |
| **`--crm`** | **Customer Relationship** | **Contacts + leads + deals tables, pipelines with stages, activity timeline, segments + tags, email sync (Gmail/Outlook), automation rules (webhook on stage change).** |
| **`--booking`** | **Appointment Scheduling** | **Calendar grid, available slots with buffers, cancellation + rescheduling, reminders (email/SMS/push), no-show handling, waitlist, recurring bookings. DreamiHairCare, FMO, KLS pattern.** |
| **`--marketplace`** | **Multi-Vendor Commerce** | **Vendor onboarding + KYC, commission splits, payout cycles via Stripe Connect, vendor dashboards, dispute resolution, vendor-facing analytics. Extends `--stripe`.** |
| **`--reviews`** | **Ratings + Reviews** | **1–5 star + text, moderation queue, verified-purchase badges, helpful/not-helpful votes, vendor response, abuse reporting.** |
| **`--notifications-inbox`** | **In-app Notification Center** | **Bell + unread badge, grouped list, mark-all-read, filter by type, delete/archive, deep-link to source. Distinct from `--push` (delivery) + `--slack` (outbound).** |
| **`--i18n`** | **Internationalization** | **Locale detection, next-intl message catalogs, date/currency/number formatting per locale, RTL support, translation workflow, fallback chains.** |
| **`--webhooks`** | **Generic Webhook Infra** | **Inbound: signature verify + idempotency + replay protection. Outbound: retry + dead-letter queue + observability. Beyond `--stripe`-specific.** |
| **`--audit-log`** | **Audit Trail** | **Immutable event log (actor, action, target, diff, timestamp), admin UI with filter/export, retention policy, compliance export (CSV/JSON), signed log chain for tamper evidence.** |
| **`--onboarding`** | **First-Run Flow** | **Splash + value prop, permission requests (camera/mic/push), account setup wizard, team-builder (Clara), skip + resume, success state with next-action prompt.** |
| **`--search`** | **Full-Text + Faceted Search** | **tsvector/GIN on PG or Algolia/Meilisearch, filter facets, sort options, pagination, highlighted matches, empty + no-results states, synonym handling.** |
| **`--job-queue`** | **Background Jobs** | **BullMQ on Redis (or SQS), retry with exponential backoff, dead-letter queue, job scheduling (cron + delayed), progress reporting, observability per job type.** |
| **`--video`** | **Video Playback + Streaming** | **HLS/DASH adaptive bitrate, CDN hosting (Cloudflare Stream / Mux / Bunny), S3 upload + transcoding (MediaConvert or FFmpeg), thumbnail generation, captions/subtitles (WebVTT), chapters, player UX (PiP, keyboard shortcuts, autoplay-muted), completion analytics. Distinct from Remotion (which CREATES videos).** |
| **`--animation`** | **UI Animation Patterns** | **Framer Motion for React, Lottie for designer-authored vector, GSAP for timeline-heavy sequences, scroll-triggered reveals, page transitions, gesture-driven motion, `prefers-reduced-motion` accessibility gate, 60fps GPU-accelerated transforms, avoid layout thrashing.** |

Run `/queue-prompt --stacks` to see this table with auto-detect patterns (what pickup-prompt greps for to infer the stack).

**Why `TARGET REPO` is strike-worthy** (per `memory/feedback-target-repo-required-on-every-prompt.md`): Cursor agents dispatched without a TARGET REPO land output in random repos. Every prompt MUST declare it. No exceptions.

### Required Body Sections (in this order)

```markdown
# Prompt NN — <concise title>

## Context

<2–6 sentences: what this prompt is for, what problem it solves, why it
matters. Link to the architecture/spec doc if one exists. NEVER assume the
agent has prior conversation context.>

Read these first — they are the agent's full context:

1. `path/to/relevant/doc-1.md` — one-line description
2. `path/to/relevant/doc-2.md` — one-line description

## Deliverables

<Concrete list of files to create/modify, with paths. Include skeleton
code, SQL, config examples where useful. The agent should not have to
guess file structure or naming.>

### 1. <Item title>

<What to build, how it fits, any code skeleton.>

### 2. <Item title>

...

## Acceptance criteria

- [ ] <Testable outcome 1>
- [ ] <Testable outcome 2>
- [ ] <grep/command that must return a specific result>
- [ ] <file/command must exist / exit 0 / match pattern>

## Constraints

- **<Non-negotiable rule 1>**
- **<Non-negotiable rule 2>**

## Out of scope

- <What this prompt does NOT do — handled by Prompt XX or later phase>

## PR instructions

- Branch: `<branch-name>`
- PR title: `<type>(<scope>): <short description>`
- PR body must include: <any required content — review link, issue refs, screenshot/gif, test output>
- Request review from: `@gary` (default) or named agent
- Move this prompt file to `prompts/<YYYY>/<Month>/<D>/3-completed/` on PR open; push that move commit
- Live-feed entry: `PROMPT COMPLETE | NN-slug — PR #<number>`
```

### What makes a prompt **fail the standard**

| Failure | Why |
|---------|-----|
| Missing `TARGET REPO:` header | Strike-worthy. Cursor agent lands work in the wrong repo. |
| No `BRANCH:` or `BASE:` | Agent invents a branch name → PR naming chaos, merge conflicts. |
| Human-time estimates ("3 days") | Violates memory rule. Machine-speed only (hours/minutes). |
| No acceptance criteria | Agent doesn't know when it's done → ships half work OR over-builds. |
| "Based on your findings, fix the bug" | Delegates understanding. Pipe in file paths, line numbers, what to change. |
| Open-ended scope ("improve the frontend") | Agent makes 40 unrelated commits. Scope must be surgical. |
| No `PR instructions` | Agent opens PR with auto-generated title, no reviewer tag, prompt file not moved. |
| Prompt body references "see the conversation" | Agent has zero prior conversation. Prompts must be self-contained. |

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

**No arguments** — show the queue:
```bash
echo ""
echo "Contents of ${QUEUE_DIR}/:"
ls "${QUEUE_DIR}"/*.md 2>/dev/null | sort | while read f; do
  echo "  $(basename $f)"
done
[ -z "$(ls ${QUEUE_DIR}/*.md 2>/dev/null)" ] && echo "  (empty — no prompts queued)"
echo ""
echo "Run '/queue-prompt --spec' to see the Prompt Authoring Standard."
echo "Run '/queue-prompt --template <slug>' to scaffold a new prompt with all required fields."
```

**`--spec`** — print the authoring standard so you can paste it into Slack / hand to a team:
```bash
sed -n '/^## 🎯 Prompt Authoring Standard/,/^## Execution/p' "$0" | sed '$d'
```

**`--stacks`** — print the full stack-standards table with auto-detect patterns (what pickup-prompt greps for):

```bash
cat <<'STACKS_TABLE'
Stack | Flag | Auto-detect pattern | Token budget | What gets injected
------|------|---------------------|--------------|--------------------
frontend   | --frontend    | grep 'redux-persist|@apollo/client|@clerk/nextjs' frontend/src/    | 90 | Next.js 16 + Apollo + Clerk + Redux-Persist
backend    | --backend     | grep '@apollo/server|sequelize|requireAuth' backend/src/           | 90 | Express + Apollo + Sequelize + TypeScript
clerk      | --clerk       | grep 'clerkMiddleware|requireApiKey|useSignIn' src/               | 45 | Auth pages, middleware, webhook, ProfileWidget
stripe     | --stripe      | grep 'webhooks/stripe|constructEvent' backend/src/                | 60 | Subscriptions, checkout, 6 webhook events
graphql    | --graphql     | grep 'typeDefs|ApolloServer|resolvers' src/ backend/src/          | 90 | Schema, resolvers, DataLoader, auth guards
migrations | --migrations  | ls migrations/*.js OR backend/src/migrations/*.ts                  | 45 | up/down migrations, indexes, 3 envs
multi-tenant | --multi-tenant | grep 'tenantId|tenant_id' src/ backend/src/                  | 30 | tenant_id on all tables, scoped queries
testing    | --testing     | ls src/__tests__/**/*.test.ts                                      | 90 | 80% coverage, error paths, no DB mocks
security   | --security    | grep 'helmet|rateLimit' src/ backend/src/                         | 30 | Helmet, rate limiting, CORS, auth guards
neon       | --neon        | grep 'neon|@neondatabase|neon.tech' backend/src/                  | 45 | Branches, pooler, SSL, connection strings
cf         | --cf          | ls frontend/wrangler.toml                                          | 60 | wrangler.toml, OpenNext, CF env vars
admin      | --admin       | grep 'requireAdmin|/api/admin' src/ backend/src/                  | 45 | Double-gate, RBAC, AuditLog, DataTable
profile    | --profile     | grep 'walletBalance|WalletTransaction|/api/profile'                | 45 | Clerk sync, wallet, avatar S3, history
analytics  | --analytics   | grep 'GA4|gtag|MEASUREMENT_ID' src/ frontend/src/                 | 30 | GA4, 4-stage funnel, Measurement Protocol
design     | --design      | ls mockups/ && ls docs/design-system.md                            | 60 | Magic Patterns conversion, tokens, states
twilio     | --twilio      | grep 'twilio|getTwilioClient' src/ backend/src/                   | 45 | SMS/Voice/Video, webhook sig, singleton
slack      | --slack       | grep 'WebClient|getSlackClient|slack' src/ backend/src/           | 30 | Bot, slash commands, Block Kit, rate limits
push       | --push        | grep 'expo-notifications|Notifications\.' src/                    | 45 | APNs + FCM, device tokens, receipts
mobile     | --mobile      | ls mobile/app/_layout.tsx OR app/_layout.tsx                       | 90 | Expo SDK 52, Expo Router, NativeWind
eas        | --eas         | ls eas.json                                                        | 30 | Build config, xcrun altool, EXPO_TOKEN
shipping   | --shipping    | grep 'shippo|getShippo|SHIPPO' src/ backend/src/                  | 45 | Shippo rates, label, tracking webhook
digital-pass | --digital-pass | grep 'pkpass|passkit|PKPass|GoogleWallet' src/ backend/src/    | 45 | Apple Wallet + Google Wallet bridge
apple-maps | --apple-maps  | grep 'PROVIDER_DEFAULT|MapKit|apple-maps' src/                    | 30 | iOS maps, Platform.OS gate, markers
mapbox     | --mapbox      | grep '@rnmapbox|Mapbox\.' src/                                    | 30 | Android maps, GL rendering, Platform.OS
desktop    | --desktop     | grep 'SecretStorage|contextBridge|ipcMain' src/                   | 60 | PKCE auth, SecretStorage, contextBridge
apple      | --apple       | ls docs/standards/apple-store.md                                   | 30 | Metadata, screenshots, xcrun altool upload
google     | --google      | ls docs/standards/google-play.md                                   | 30 | AAB, Data Safety form, staged rollout
feedback   | --feedback    | grep 'FeedbackWidget|heru-feedback|integrate-heru-feedback' src/ frontend/src/ backend/src/ | 45 | Heru Feedback SDK — FAB widget, onboarding tour, contact mode, GraphQL endpoint, P0-P3 classification, Slack #maat-agents notif, vault task gen, admin dashboard
vrd        | --vrd         | ls docs/vrd/*.md OR ls docs/VRD-*.md                               | 30 | Voice Requirements Document — Amen Ra's invention (attribution required), canonical VRD-001 format, question inventory. Author BEFORE voice cloning or TTS.
voice      | --voice       | grep 'voxtral|Voxtral|clara-voice|modal.run/tts|/stt|/clone' src/ backend/src/ infrastructure/voice/ | 60 | Voxtral implementation — Modal serverless GPU (A10G), /tts /stt /clone endpoints, <3s latency, consent flow, free-clone-on-signup gate, Clara Voice Server
rbac       | --rbac        | grep 'hasRole|requirePermission|Permission.|permissions.|RoleGate' src/ backend/src/ frontend/src/ | 45 | RBAC — role definitions, permission matrices, tenant-scoped roles, UI conditional rendering, backend guards, audit trail. Distinct from --clerk (auth).
user-journey | --user-journey | ls docs/user-journeys/*.md OR ls docs/journeys/*.md OR ls docs/journey-*.md | 30 | User journey map — personas, entry/exit points, emotional states, decision gates, success metrics. Author BEFORE mockups/design.
cms        | --cms         | grep 'contentful|strapi|payload|sanity|CMS|PageBuilder|ContentType' src/ backend/src/ frontend/src/ | 60 | CMS — page builder, content types, media library (S3), scheduled publishing, SEO per page, preview mode, versioning + rollback.
crm        | --crm         | grep 'Contact|Lead|Deal|Pipeline|Segment|ActivityLog' backend/src/ src/ | 60 | CRM — contacts + leads + deals, pipelines with stages, activity timeline, segments + tags, email sync, automation rules.
booking    | --booking     | grep 'Appointment|Booking|scheduleSlot|availableSlots|calendarSlot' src/ backend/src/ | 60 | Appointment scheduling — calendar grid, slots with buffers, cancellation + rescheduling, reminders, no-show, waitlist, recurring bookings.
marketplace | --marketplace | grep 'Vendor|Seller|commission|payoutCycle|Marketplace' backend/src/ src/ | 60 | Marketplace — vendor onboarding + KYC, commission splits, payout cycles (Stripe Connect), vendor dashboards, dispute resolution.
reviews    | --reviews     | grep 'Review|Rating|helpfulVotes|verifiedPurchase' src/ backend/src/ | 45 | Reviews + ratings — 1-5 star + text, moderation queue, verified-purchase, helpful votes, vendor response, abuse reporting.
notifications-inbox | --notifications-inbox | grep 'NotificationCenter|NotificationInbox|markAllRead|unreadCount' src/ frontend/src/ | 45 | In-app notification center — bell + unread badge, grouped list, mark-all-read, filter, delete/archive, deep-link.
i18n       | --i18n        | grep 'useTranslations|next-intl|i18next|formatMessage' src/ frontend/src/ | 45 | i18n — locale detection, next-intl catalogs, date/currency/number formatting per locale, RTL support, translation workflow.
webhooks   | --webhooks    | grep 'webhookSecret|verifySignature|webhook_event|idempotencyKey' backend/src/ | 60 | Generic webhook infra — inbound verify + idempotency + replay; outbound retry + DLQ + observability. Beyond stripe-specific.
audit-log  | --audit-log   | grep 'AuditLog|audit_event|auditTrail|recordAudit' backend/src/ src/ | 30 | Audit trail — immutable event log (actor, action, target, diff, ts), admin UI, compliance export, signed chain.
onboarding | --onboarding  | grep 'OnboardingFlow|WelcomeStep|firstRun|hasCompletedOnboarding' src/ frontend/src/ | 45 | First-run onboarding — splash, permission requests, account setup, team-builder (Clara), skip + resume, success state.
search     | --search      | grep 'search_query|useSearch|Algolia|meilisearch|tsvector|to_tsquery' src/ backend/src/ | 45 | Full-text + faceted search — tsvector/GIN or Algolia/Meilisearch, facets, sort, pagination, highlights, empty states.
job-queue  | --job-queue   | grep 'BullMQ|@bull|SQS|worker.ts|jobQueue|processJob' backend/src/ | 45 | Background jobs — BullMQ/SQS, retry + exponential backoff, DLQ, cron + delayed, progress reporting, observability.
video      | --video       | grep 'hls.js|@mux/|cloudflare-stream|video.js|shaka-player|VideoPlayer|bunny' src/ frontend/src/ backend/src/ | 60 | Video playback + streaming — HLS/DASH adaptive bitrate, CDN hosting (Cloudflare Stream / Mux / Bunny), S3 upload + transcoding (MediaConvert or FFmpeg), thumbnail gen, captions (WebVTT), chapters, PiP, completion analytics. Distinct from Remotion (creation).
animation  | --animation   | grep 'framer-motion|lottie|gsap|@react-spring|useSpring|motion\.' src/ frontend/src/ | 45 | UI animation patterns — Framer Motion for React, Lottie for designer-authored vector, GSAP for timeline-heavy sequences, scroll-triggered reveals, page transitions, gesture-driven motion, prefers-reduced-motion gate, 60fps GPU-accelerated transforms.

Usage in a prompt header:
  **STACKS:** frontend, clerk, stripe, neon

Or leave the header off and let pickup-prompt auto-detect via the grep
patterns above. Declare explicitly only when: (a) the stack isn't in
the repo yet (e.g. introducing Stripe for the first time), (b) you want
to force a standard past the detector, or (c) you want to constrain the
agent's context to only these standards.
STACKS_TABLE
```

**`--template <slug>`** — scaffold a numbered, canonical prompt file:
```bash
SLUG="$ARGUMENTS"
NEXT_NUM=$(ls "${QUEUE_DIR}"/*.md 2>/dev/null | wc -l)
NEXT_NUM=$(printf "%02d" $((NEXT_NUM + 1)))
FILENAME="${QUEUE_DIR}/${NEXT_NUM}-${SLUG}.md"

cat > "$FILENAME" <<'EOF'
**TARGET REPO:** <owner/repo — FILL THIS IN, strike-worthy if missing>
**BRANCH:** feat/<slug>
**BASE:** develop
**AGENT:** <named agent — e.g. Ahmad Baba, Jerry Lawson, Skip Ellis>
**MACHINE ETA:** <N hrs — machine speed only>
**STACKS:** <optional: comma-list from /queue-prompt --stacks — e.g. frontend, clerk, stripe>

# Prompt NN — <concise title>

## Context

<2–6 sentences: what problem, why now, what spec to follow.>

Read these first — they are the agent's full context:

1. `<path to architecture or spec doc>` — why this matters
2. `<path to related prompt or review>` — what came before

## Deliverables

### 1. <Item title>

<Concrete file paths + skeleton code where useful.>

## Acceptance criteria

- [ ] <testable outcome>
- [ ] <grep returns zero / exit code 0 / file exists>

## Constraints

- **<non-negotiable rule>**

## Out of scope

- <what this prompt does NOT handle>

## PR instructions

- Branch: `feat/<slug>`
- PR title: `<type>(<scope>): <short description>`
- Request review from: `@gary`
- Move this prompt file to `prompts/YYYY/Month/D/3-completed/` on PR open
- Live-feed entry: `PROMPT COMPLETE | NN-<slug> — PR #<number>`
EOF

echo "✅ Scaffolded canonical prompt: ${FILENAME}"
echo ""
echo "Next steps:"
echo "  1. Fill in every <placeholder> — especially TARGET REPO"
echo "  2. Validate: /queue-prompt --validate ${FILENAME}"
echo "  3. Commit + push so QCS1 can pick it up"
```

**`--validate <file>`** — check a prompt meets the standard:
```bash
FILE="$ARGUMENTS"
[ ! -f "$FILE" ] && { echo "✖ File not found: $FILE" >&2; exit 1; }

FAILS=0
check() {
  local pattern="$1"
  local desc="$2"
  if ! grep -q "$pattern" "$FILE"; then
    echo "  ❌ MISSING: $desc"
    FAILS=$((FAILS + 1))
  else
    echo "  ✅ $desc"
  fi
}

echo "Validating $FILE against Prompt Authoring Standard..."
echo ""
echo "── Required header ──"
check "^\*\*TARGET REPO:\*\*"   "TARGET REPO declared (STRIKE-WORTHY)"
check "^\*\*BRANCH:\*\*"        "BRANCH specified"
check "^\*\*BASE:\*\*"          "BASE branch specified"
check "^\*\*AGENT:\*\*"         "AGENT assigned"
check "^\*\*MACHINE ETA:\*\*"   "MACHINE ETA (not human-time)"

echo ""
echo "── Required body sections ──"
check "^## Context"             "## Context section"
check "^## Deliverables"        "## Deliverables section"
check "^## Acceptance criteria" "## Acceptance criteria section"
check "^## Constraints"         "## Constraints section"
check "^## Out of scope"        "## Out of scope section"
check "^## PR instructions"     "## PR instructions section"

echo ""
if [ "$FAILS" -eq 0 ]; then
  echo "✅ PASS — prompt meets the authoring standard."
  exit 0
else
  echo "❌ FAIL — $FAILS missing field(s). Fix before /pickup-prompt executes this."
  exit 1
fi
```

**A bare filename argument** — move file into the queue (after validation):
```bash
if [ -f "$ARGUMENTS" ]; then
  # Validate first
  /queue-prompt --validate "$ARGUMENTS" || {
    echo ""
    echo "✖ Refusing to queue — prompt does not meet the authoring standard."
    echo "  Fix the flagged fields, then retry."
    exit 1
  }
  DEST="${QUEUE_DIR}/$(basename $ARGUMENTS)"
  mv "$ARGUMENTS" "$DEST"
  echo "✅ Validated + queued: ${DEST}"
else
  echo "ERROR: File not found: ${ARGUMENTS}"
fi
```

### Step 3b — When ARGUMENTS include `/pickup-prompt` flags (symmetric queue)

The executing agent MUST:

1. Resolve `QUEUE_DIR` (same as Step 1).
2. Compute the next `NN-` prefix (two digits, lowest unused).
3. For **each** flag that `/pickup-prompt` would honor, load the **same** file(s): `.claude/standards/*.md` for standards flags, `.claude/commands/prompts/setup/*.md` for 8-step flags, `.claude/commands/prompts/*.md` for page/component flags — see `.claude/commands/pickup-prompt.md` and `.claude/commands/prompts/README.md`.
4. Prepend those sections into a single markdown document (clear horizontal rules between sections).
5. Append a `## Task` section containing the user's quoted text, or a one-line default task if none provided.
6. Write `QUEUE_DIR/NN-<slug>.md` and print the absolute path.

**`--clerk`:** prepend both `setup/clerk.md` and `.claude/standards/clerk-auth.md` (same effective constraints as pickup).

**`--migrate-amplify-to-cf`:** prepend `setup/migrate-amplify-to-cf.md`, `.claude/commands/migrate-amplify-to-cf.md`, and ensure **`docs/cloudflare/AMPLIFY-TO-CLOUDFLARE-MIGRATION.md`** is in context (same as pickup).

**`--bedrock`:** prepend `setup/bedrock.md` and `.claude/commands/setup-bedrock.md` (same as pickup); include **`docs/standards/AI-MODEL-ROUTING.md`** when editing routing.

---

## Directory Convention (Full Structure)

```
prompts/
└── 2026/
    └── April/
        └── 12/
            ├── 1-not-started/     ← Queue prompts HERE (validated)
            │   ├── 01-ecs-deploy.md
            │   ├── 02-web-navbar.md
            │   └── 03-test-fix.md
            ├── 2-in-progress/     ← /pickup-prompt atomically moves here on dispatch
            ├── 3-completed/       ← /pickup-prompt moves here on PR open
            └── 4-failed/          ← /pickup-prompt moves here on agent failure
```

**Rules:**
- Prompts numbered with two-digit prefix: `01-`, `02-`, `03-`
- Lower number = higher priority — agents pick the lowest number first
- Each prompt is complete, self-contained — agent has no prior context
- Full month name in the path (`April`, not `04`)
- Day without leading zero (`12`, not `012`)

---

## Tell a Team Where (and HOW) to Save Their Prompts

When directing a team to queue their prompts, send them **this one-liner**:

> "Write your prompt following the standard at `.claude/commands/queue-prompt.md`. Scaffold with `/queue-prompt --template <slug>` — it fills in every required field. Validate with `/queue-prompt --validate <file>`. Queue with `/queue-prompt <file>` — it validates before moving. A QCS1 Cursor agent will pick it up with `/pickup-prompt`."

Or even shorter — just give them the spec inline:

```
/queue-prompt --spec
```

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

---

## Related

- **`/pickup-prompt`** — the executor. Reads prompts from `1-not-started/`, spawns Cursor agents, opens PRs, moves files to `3-completed/` or `4-failed/`.
- **`memory/feedback-target-repo-required-on-every-prompt.md`** — the strike rule for missing `TARGET REPO:`.
- **`memory/feedback-prompts-must-be-saved-before-dispatch.md`** — the rule that every prompt must be persisted to `1-not-started/` BEFORE dispatch, never dispatched from scratch.
