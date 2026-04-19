# Cursor Agent Prompt — Onboarding: Voice Clone + Team Builder + $39 Activation

**Implementation:** Backend `POST /api/voice/clone`, `POST /api/onboarding/team`, `POST /api/onboarding/activate`; Stripe `basic` tier + `onboarding=1` success URL; frontend `/onboarding/*` wizard and API proxies.

**TARGET REPO:** `imaginationeverywhere/clara-code`
_(Auto-classified 2026-04-19. If wrong, edit this line before dispatch.)_

**BRANCH:** `prompt/01-onboarding-team-builder`
**BASE:** `develop`
**AGENT:** `cursor-anonymous`
**MACHINE:** `QCS1`
**MODEL:** `claude-sonnet-4-6`

---

## Context

This prompt builds the single most important UX in Clara Code: the moment a new user signs up and meets their team for the first time.

The flow has three steps, executed in sequence:

1. **Voice Clone** — user records ~5 seconds of their voice. Voxtral/XTTS v2 clones it. They hear it played back. That's the "WHOA moment" — the activation event for this product.
2. **Team Builder** — user picks 3 agent slots (Frontend, Backend, DevOps). Each slot gets a name, a voice (cloned or library), and a model tier (fast/deep/high-effort).
3. **Activate** — user sees the $39/mo Basic tier Stripe Hosted Checkout. On successful subscription, the team goes live and the user lands on `/dashboard` with their agents ready to greet them.

**Critical constraint:** Clara orchestrates this UX as a concierge. She does not build. She introduces the team. The user's 3 agents are the builders. See `decision-clara-doesnt-build-team-builds.md` in HQ vault.

**Voice behavior:** Every screen in the onboarding wizard has Clara speaking first. She is proactive. There is no "tap to hear." She speaks on mount. See `decision-clara-platform-agents-proactive.md`.

**Voice scripts:** Do NOT invent new copy. All wizard voice lines reference `~/auset-brain/Projects/reference-vrd-001-clara-code-greeting.md`. If you can't read that file, use the fallback script lines provided in this prompt.

---

## Existing Codebase Context (READ BEFORE WRITING)

Before touching any file, read:
- `backend/src/models/Agent.ts` — current schema (id, userId, name, soul only — missing role/voice/model)
- `backend/src/models/User.ts` — no voice clone fields
- `backend/src/models/Subscription.ts` — tier field supports "free", needs "basic" added
- `backend/src/routes/checkout.ts` — only accepts `tier: "pro" | "business"` — must add "basic"
- `backend/src/routes/voice.ts` — existing voice routes (TTS, greet, chat) — add clone endpoint here
- `frontend/src/app/checkout/success/page.tsx` — existing success page (wire it to redirect to `/dashboard`)
- `frontend/src/app/api/voice/tts/route.ts` — existing TTS proxy pattern to follow

---

## What to Build

### PHASE 1 — Backend: New Models + Migration

#### 1A. Extend `backend/src/models/Agent.ts`

Add these columns to the `agents` table. Do NOT remove existing columns (`id`, `userId`, `name`, `soul`).

```typescript
// New columns to add:

@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
declare slotIndex: number; // 0=Frontend, 1=Backend, 2=DevOps

@Column({
  type: DataType.ENUM('frontend', 'backend', 'devops'),
  allowNull: false,
  defaultValue: 'frontend',
})
declare role: 'frontend' | 'backend' | 'devops';

@Column({ type: DataType.STRING, allowNull: true })
declare voiceId: string | null; // Modal voice clone ID or library voice name

@Column({
  type: DataType.ENUM('fast', 'deep', 'high-effort'),
  allowNull: false,
  defaultValue: 'fast',
})
declare modelTier: 'fast' | 'deep' | 'high-effort';

@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
declare isActive: boolean;
```

#### 1B. New model: `backend/src/models/UserVoiceClone.ts`

```typescript
import { Column, CreatedAt, DataType, Default, Model, PrimaryKey, Table, UpdatedAt } from 'sequelize-typescript';

@Table({
  tableName: 'user_voice_clones',
  timestamps: true,
  indexes: [{ fields: ['user_id'], unique: true }],
})
export class UserVoiceClone extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare userId: string; // Clerk userId

  @Column({ type: DataType.STRING, allowNull: false })
  declare voiceId: string; // Identifier returned by Modal /voice/clone

  @Column({ type: DataType.STRING, allowNull: true })
  declare sampleUrl: string | null; // S3 or Modal URL for the ~5s source clip

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isDefault: boolean; // always true for now (one clone per user)

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  static async findByUserId(userId: string): Promise<UserVoiceClone | null> {
    return UserVoiceClone.findOne({ where: { userId } });
  }
}
```

#### 1C. Migration file

Create `backend/migrations/YYYYMMDD-onboarding-voice-team.js` (use today's date `20260419`):

```javascript
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // user_voice_clones table
    await queryInterface.createTable('user_voice_clones', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      user_id: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      voice_id: { type: Sequelize.STRING(255), allowNull: false },
      sample_url: { type: Sequelize.STRING(512), allowNull: true },
      is_default: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex('user_voice_clones', ['user_id'], { unique: true });

    // agents table — new columns
    await queryInterface.addColumn('agents', 'slot_index', {
      type: Sequelize.INTEGER, allowNull: false, defaultValue: 0,
    });
    await queryInterface.addColumn('agents', 'role', {
      type: Sequelize.ENUM('frontend', 'backend', 'devops'),
      allowNull: false, defaultValue: 'frontend',
    });
    await queryInterface.addColumn('agents', 'voice_id', {
      type: Sequelize.STRING(255), allowNull: true,
    });
    await queryInterface.addColumn('agents', 'model_tier', {
      type: Sequelize.ENUM('fast', 'deep', 'high-effort'),
      allowNull: false, defaultValue: 'fast',
    });
    await queryInterface.addColumn('agents', 'is_active', {
      type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_voice_clones');
    await queryInterface.removeColumn('agents', 'slot_index');
    await queryInterface.removeColumn('agents', 'role');
    await queryInterface.removeColumn('agents', 'voice_id');
    await queryInterface.removeColumn('agents', 'model_tier');
    await queryInterface.removeColumn('agents', 'is_active');
  },
};
```

Register `UserVoiceClone` in `backend/src/server.ts` (wherever other models are imported/registered with Sequelize).

---

### PHASE 2 — Backend: Voice Clone Route + Basic Tier Checkout

#### 2A. Add clone endpoint to `backend/src/routes/voice.ts`

```
POST /api/voice/clone
Auth: requireAuth()
Body: { audioBase64: string } // ~5s WAV, base64-encoded
Response: { voiceId: string, playbackUrl: string }
```

Implementation:
1. Validate `audioBase64` is present and non-empty.
2. Proxy to Modal voice server:
   ```
   POST https://info-24346--clara-voice-server-voiceserver-fastapi-app.modal.run/voice/clone
   Body: { voice_id: "<clerk_userId>-custom", audio_base64: audioBase64, sample_rate: 16000 }
   ```
   Use `process.env.CLARA_VOICE_URL` as the base URL with the same fallback pattern already used in TTS routes.
3. On success, upsert a `UserVoiceClone` row with `userId = auth.userId`, `voiceId = "<clerk_userId>-custom"`.
4. Return `{ voiceId, playbackUrl }` where `playbackUrl` is a URL that plays back the cloned voice saying a short confirmation phrase. To generate the playback, call the TTS endpoint with the cloned voice immediately after cloning:
   ```
   POST /voice/tts  { text: "...", voice: "<clerk_userId>-custom" }
   ```
   Return the resulting audio as a base64 data URL in `playbackUrl`, or stream it — whichever matches the existing TTS route pattern.

Do NOT add a new route file. Add this endpoint inside the existing `backend/src/routes/voice.ts`.

#### 2B. Add "basic" tier to `backend/src/routes/checkout.ts`

Change line:
```typescript
if (tier !== "pro" && tier !== "business") {
```
To:
```typescript
if (tier !== "basic" && tier !== "pro" && tier !== "business") {
```

Update `getPriceForTier` signature to accept `"basic" | "pro" | "business"`.

The Stripe price for "basic" must have `metadata.clara_tier = "basic"` — same pattern as pro/business. The agent does NOT hardcode a price ID. It looks it up dynamically at runtime via `stripe.prices.list`.

Also update success_url to pass through a `?onboarding=1` query param when the tier is "basic":
```typescript
success_url: tier === 'basic'
  ? `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&onboarding=1`
  : `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
```

#### 2C. New backend route: `POST /api/onboarding/team`

Add this to `backend/src/routes/index.ts` (or create `backend/src/routes/onboarding.ts` and register it):

```
POST /api/onboarding/team
Auth: requireAuth()
Body: {
  agents: Array<{
    slotIndex: 0 | 1 | 2,
    role: 'frontend' | 'backend' | 'devops',
    name: string,
    voiceId: string | null,
    modelTier: 'fast' | 'deep' | 'high-effort'
  }>
}
```

Implementation:
1. Validate: exactly 3 agents, slotIndexes must be [0, 1, 2], names non-empty (max 40 chars).
2. Delete existing agents for `auth.userId` (idempotent — wizard can be re-submitted).
3. Bulk-insert 3 `Agent` rows with `isActive: false` (they go live after Stripe webhook confirms subscription).
4. Return `{ success: true }`.

---

### PHASE 3 — Frontend: Onboarding Wizard Pages

#### File structure to create:

```
frontend/src/app/onboarding/
├── layout.tsx          ← minimal layout (no nav, no footer — wizard chrome only)
├── page.tsx            ← redirect to /onboarding/voice-clone
├── voice-clone/
│   └── page.tsx        ← Step 1
├── team-builder/
│   └── page.tsx        ← Step 2
└── activate/
    └── page.tsx        ← Step 3
```

All pages: `"use client"`. No server components needed for onboarding.

---

#### 3A. `frontend/src/app/onboarding/layout.tsx`

Minimal wizard chrome — dark background, no site nav, progress indicator at top.

```tsx
"use client"
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      color: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Progress strip — 3 dots */}
      <div style={{ height: 4, background: '#151515', position: 'relative' }}>
        {/* filled by each page via data attribute or context — leave as static strip for now */}
      </div>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </main>
    </div>
  )
}
```

---

#### 3B. `frontend/src/app/onboarding/voice-clone/page.tsx` — Step 1

**Clara speaks on mount** (before any user interaction). Use the existing TTS proxy at `POST /api/voice/tts` with `voice: "clara"`.

**Clara's onboarding greeting script (fallback — use VRD-001 if available):**
> "Welcome. I'm Clara. Before I introduce you to your team, I want to hear your voice. Tap the mic and say something — anything. I'll do the rest."

**Layout:**

```
┌──────────────────────────────────────────────┐
│  Step 1 of 3 — Your Voice                   │
│                                              │
│  "Before you meet your team,                 │
│   we need your voice."                       │
│                                              │
│         [ ● mic button — 96px ]             │
│                                              │
│   idle:    "Tap to record (5 seconds)"       │
│   recording: "Recording... 4... 3... 2... 1" │
│   done:    "That sounded just like you."     │
│   error:   "Couldn't clone — try again"      │
│                                              │
│  [ playback waveform — shows after clone ]   │
│                                              │
│        [ Next: Meet Your Team → ]            │
└──────────────────────────────────────────────┘
```

**State machine:**

```typescript
type CloneStatus =
  | 'clara-speaking'  // Clara greeting plays on mount
  | 'idle'            // ready to record
  | 'recording'       // MediaRecorder running, countdown
  | 'processing'      // POSTing to /api/voice/clone
  | 'done'            // clone succeeded, playback available
  | 'error'           // clone failed
```

**Recording flow:**
1. On mount: play Clara's greeting via TTS. When audio ends, set status `'idle'`.
2. On mic click: request `getUserMedia({ audio: true })`. Start `MediaRecorder` (prefer `audio/webm;codecs=opus`). Record for exactly 5 seconds. On stop, collect chunks into a `Blob`.
3. Convert blob to base64: `reader.readAsDataURL(blob)` → strip the data URL prefix to get raw base64.
4. POST to `/api/voice/clone` with `{ audioBase64: base64string }`.
5. On success: store `voiceId` in `sessionStorage['onboarding-voice-id']` and `playbackUrl` in `sessionStorage['onboarding-playback-url']`. Set status `'done'`. Auto-play the `playbackUrl` audio — this is the "WHOA moment." Do not add any text or celebration UI. Let the audio land on its own.
6. "Next" button is disabled until status is `'done'`.
7. On "Next": `router.push('/onboarding/team-builder')`.

**Countdown timer:** Display seconds remaining during recording (5, 4, 3, 2, 1). Use `setInterval` and clear on stop.

**No TypeScript `any`.** Type the `MediaRecorder` events properly.

---

#### 3C. `frontend/src/app/onboarding/team-builder/page.tsx` — Step 2

**Clara speaks on mount:**
> "Here's your team. Three agents, three roles. Name them. Give them a voice. Pick how they think. They're yours."

**Fallback script if VRD-001 not available — use exactly this text.**

**Layout — 3 agent cards, side by side on desktop, stacked on mobile:**

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Frontend    │ │  Backend     │ │  DevOps      │
│              │ │              │ │              │
│  Name: _____ │ │  Name: _____ │ │  Name: _____ │
│              │ │              │ │              │
│  Voice:      │ │  Voice:      │ │  Voice:      │
│  ● Your voice│ │  ○ Library   │ │  ○ Library   │
│  ○ Library   │ │              │ │              │
│              │ │  Thinks:     │ │  Thinks:     │
│  Thinks:     │ │  ○ Fast      │ │  ○ Fast      │
│  ○ Fast      │ │  ● Deep      │ │  ○ Deep      │
│  ○ Deep      │ │  ○ Careful   │ │  ● Careful   │
│  ○ Careful   │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘

              [ Continue → ]
```

**Default values for each slot:**

| Slot | Role | Default Name | Default Voice | Default Model |
|------|------|-------------|--------------|---------------|
| 0 | Frontend | Nannie | Your voice (cloned) | fast |
| 1 | Backend | Daniel | Library | deep |
| 2 | DevOps | Robert | Library | high-effort |

These are canonical names. The user can change them. Do not suggest Malcolm X, MLK, or any living person.

**Voice selection options (per card):**
- "Your voice" — only available if `sessionStorage['onboarding-voice-id']` exists
- "Library" — uses `granville` as the voice name (the fallback voice in the voice server)

**Model tier labels (display names — internal enum values in parentheses):**
- "Fast" → `modelTier: 'fast'` (Maya — DeepSeek fast)
- "Deep" → `modelTier: 'deep'` (Mary — DeepSeek thinking)
- "Careful" → `modelTier: 'high-effort'` (Nikki — Qwen3)

Do NOT display internal model names (Maya, Mary, Nikki) in the UI. Show only "Fast", "Deep", "Careful".

**Validation before "Continue":**
- All 3 names must be non-empty, max 40 chars, no special characters except `-` and spaces.
- At least 1 agent must have "Your voice" selected (if clone exists). If no clone, all can be Library.

**On "Continue":**
1. POST to `POST /api/onboarding/team` with the 3 agent slots.
2. On success: store agent config in `sessionStorage['onboarding-agents']` (JSON string).
3. `router.push('/onboarding/activate')`.

**State management:** Local `useState` only. No Redux for this wizard.

---

#### 3D. `frontend/src/app/onboarding/activate/page.tsx` — Step 3

**Clara speaks on mount:**
> "Your team is ready. One last step — activate your plan and they'll be waiting for you inside."

**Layout:**

```
┌─────────────────────────────────────────────┐
│                                             │
│   Your Team                                 │
│   ┌────────────────────────────────────┐    │
│   │  Nannie    Frontend  Fast   ✓ Voice│    │
│   │  Daniel    Backend   Deep   Library│    │
│   │  Robert    DevOps    Careful Library│   │
│   └────────────────────────────────────┘    │
│                                             │
│   Basic Plan — $39/month                   │
│   ✓ 3 agent slots                           │
│   ✓ Voice coding                            │
│   ✓ Your cloned voice                       │
│   ✓ All 3 surfaces (IDE + CLI + browser)    │
│                                             │
│   [ Activate My Team — $39/mo ]            │
│                                             │
│   Powered by Stripe · Cancel anytime        │
└─────────────────────────────────────────────┘
```

**Activate button:**
```typescript
const handleActivate = async () => {
  setLoading(true);
  const res = await fetch('/api/checkout/create-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: 'basic' }),
  });
  const data = await res.json() as { url?: string; error?: string };
  if (data.url) {
    window.location.href = data.url; // Stripe Hosted Checkout redirect
  } else {
    setError(data.error ?? 'Failed to start checkout');
    setLoading(false);
  }
};
```

**Do NOT mount Stripe Elements.** This is Stripe Hosted Checkout — the backend creates a session and returns a URL. We redirect. Simple.

**Loading state:** Button shows "Redirecting to Stripe..." while loading. Disable button.

**Team summary:** Read from `sessionStorage['onboarding-agents']` and render the agent list.

---

#### 3E. Wire `frontend/src/app/checkout/success/page.tsx`

Read existing file first. Add logic:

If `?onboarding=1` is in the URL query params:
- Show a brief "Your team is live" message with Clara speaking: `"I told you. Whether you've done it before or not."` (exact phrase — locked per CLARA-CODE-VOICE-PLAYBOOK.md).
- After 3 seconds (or after audio finishes), `router.push('/dashboard')`.
- On the backend, activate the 3 agent slots: fire `POST /api/onboarding/activate` which sets `isActive = true` on all agents for `auth.userId`. Create this endpoint on the backend.

If `?onboarding=1` is NOT present: existing behavior unchanged.

**New backend endpoint** `POST /api/onboarding/activate`:
```
Auth: requireAuth()
Body: none
Action: UPDATE agents SET is_active = true WHERE user_id = auth.userId
Response: { success: true, agentCount: number }
```

---

### PHASE 4 — Frontend: New API Route

#### 4A. `frontend/src/app/api/voice/clone/route.ts`

This is the Next.js route handler that proxies the clone request from browser to backend:

```typescript
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { audioBase64?: string };
  if (!body.audioBase64) {
    return NextResponse.json({ error: 'audioBase64 required' }, { status: 400 });
  }

  const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3001';
  // Forward with the Clerk session token so backend can auth
  const authHeader = req.headers.get('authorization') ?? '';

  const upstream = await fetch(`${backendUrl}/api/voice/clone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({ audioBase64: body.audioBase64 }),
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
```

The existing `/api/voice/tts/route.ts` uses the same proxy pattern — match it exactly.

---

### Design Tokens

Use only the design system variables already established in the codebase:

```css
--bg: #0A0A0A
--card: #151515
--border: #1A2A2E
--clara-blue: #7BC8D8 (or #7BCDD8 — match what's in globals.css)
--text: #FFFFFF
--muted: #888888
```

Card border-radius: `12px`. Button border-radius: `12px`. Font: Inter (already loaded).

Active/selected state for radio buttons in the team builder: `border: 2px solid var(--clara-blue)`.

---

## File Summary (create or modify)

### New files:
- `backend/src/models/UserVoiceClone.ts`
- `backend/migrations/20260419-onboarding-voice-team.js`
- `frontend/src/app/onboarding/layout.tsx`
- `frontend/src/app/onboarding/page.tsx`
- `frontend/src/app/onboarding/voice-clone/page.tsx`
- `frontend/src/app/onboarding/team-builder/page.tsx`
- `frontend/src/app/onboarding/activate/page.tsx`
- `frontend/src/app/api/voice/clone/route.ts`

### Modified files:
- `backend/src/models/Agent.ts` — add 5 new columns
- `backend/src/routes/checkout.ts` — add "basic" tier + onboarding success_url param
- `backend/src/routes/voice.ts` — add `POST /api/voice/clone` endpoint
- `backend/src/routes/index.ts` (or new `onboarding.ts`) — add team + activate endpoints
- `backend/src/server.ts` — register UserVoiceClone model
- `frontend/src/app/checkout/success/page.tsx` — handle `?onboarding=1`

---

## Constraints

1. **No Stripe Elements.** Hosted Checkout only. The checkout route returns a URL; we redirect.
2. **No fabricated voice scripts.** The lines in this prompt are the only approved copy. Use them verbatim.
3. **No internal model names in UI.** "Fast", "Deep", "Careful" only — never "Maya", "Mary", "Nikki".
4. **No internal infra names in UI.** "Modal", "Hermes", "Voxtral" never appear in JSX or error messages.
5. **No `any` in TypeScript.** Type everything properly.
6. **Clara speaks first on every screen.** TTS auto-plays on mount. The user does not initiate audio.
7. **Agent default names are canonical:** Nannie, Daniel, Robert. Do not change them.
8. **Single PR.** Do not add unrelated fixes or refactors to this branch.
9. **Run `npm run type-check` in both `frontend/` and `backend/` before committing.** Fix all errors.
10. **Run existing tests.** Do not break passing tests. If a test needs updating due to the Agent model change, update it.

---

## Acceptance Criteria

### Voice Clone (Step 1)
- [ ] Clara's greeting TTS plays automatically on page mount — no tap required
- [ ] Mic button triggers `getUserMedia` and records exactly 5 seconds
- [ ] Countdown (5, 4, 3, 2, 1) visible during recording
- [ ] Recording sends `audioBase64` to `POST /api/voice/clone`
- [ ] On success: cloned voice plays back automatically (the "WHOA moment")
- [ ] `voiceId` stored in `sessionStorage['onboarding-voice-id']`
- [ ] "Next" button disabled until clone succeeds
- [ ] Error state shown on clone failure — user can retry
- [ ] Works in Chrome and Firefox (MediaRecorder API)

### Team Builder (Step 2)
- [ ] Clara's intro TTS plays on mount
- [ ] 3 agent cards rendered with default values (Nannie/Frontend, Daniel/Backend, Robert/DevOps)
- [ ] Name field: editable, max 40 chars, validated
- [ ] Voice selector: "Your voice" / "Library" — "Your voice" disabled if no clone
- [ ] Model selector: "Fast" / "Deep" / "Careful" — radio buttons
- [ ] "Continue" validates all 3 cards and POSTs to `/api/onboarding/team`
- [ ] On success: redirects to `/onboarding/activate`

### Activation (Step 3)
- [ ] Clara's activation TTS plays on mount
- [ ] Agent summary table populated from `sessionStorage['onboarding-agents']`
- [ ] "Activate My Team" button calls `POST /api/checkout/create-session` with `tier: "basic"`
- [ ] On success: redirects to Stripe Hosted Checkout URL
- [ ] Button shows loading state and is disabled during redirect

### Post-Checkout
- [ ] `checkout/success?onboarding=1` triggers Clara's "I told you" line via TTS
- [ ] After audio + 3s delay: redirects to `/dashboard`
- [ ] Backend activates all 3 agents (`isActive = true`) on this call

### Backend
- [ ] Migration runs clean: `npm run db:migrate` in backend — no errors
- [ ] `POST /api/voice/clone` returns `{ voiceId, playbackUrl }` or `{ error }` with correct status
- [ ] `POST /api/checkout/create-session` with `tier: "basic"` creates a Stripe session
- [ ] `POST /api/onboarding/team` upserts 3 agent rows — idempotent
- [ ] `POST /api/onboarding/activate` sets `isActive = true` for caller's agents
- [ ] `npm run type-check` passes in `backend/`

### Frontend
- [ ] `npm run type-check` passes in `frontend/`
- [ ] No `console.error` unhandled rejections in browser DevTools during happy path
- [ ] All 5 onboarding pages render without crash
- [ ] Dark background, Clara Blue accents, Inter font — matches existing design system
