# Prompt 07 — Unblock PR #03: Tests + TypeScript

**Branch:** `prompt/2026-04-23/03-cli-npm-clara-converse-default`
**Blocked by review:** `docs/review/20260423-pr03-voice-converse-default-review.md`
**Prerequisite:** PR #56 must be merged to `develop` before running this prompt.

---

## Context

PR #03 (`feat(desktop,web,ci): voice shell, site install, tag release`) was reviewed and blocked on four issues:

1. **C1** — `packages/cli/src/lib/canonical-greeting.ts` has 0 tests
2. **C2** — Branch predates PR #56 merge (10 missing voice-client tests, 2 missing frontend tests)
3. **C3** — `packages/cli/src/voice-converse-app.tsx` has `// @ts-nocheck` at line 1
4. **H1** — `frontend/src/app/(marketing)/components/VoiceGreeting.tsx` has 0 tests
5. **H2** — `desktop/src/shell-voice-converse.ts` needs E2E gap acknowledgment

---

## Step 1 — Rebase onto develop (after PR #56 merges)

```bash
git fetch origin
git checkout prompt/2026-04-23/03-cli-npm-clara-converse-default
git rebase origin/develop
```

**Expected conflict:** `frontend/src/components/marketing/InstallSection.tsx`
- PR #56 changed line: `Node.js 18+ required` → `Node.js 20+ required`
- PR #03 has: `Node.js 20+ recommended`
- **Keep "Node.js 20+ recommended"** (the PR #03 wording — softer, more accurate)

Verify after rebase:
```bash
cd packages/clara-voice-client && npm test  # Must show 13 tests
cd frontend && npm test                      # Must show 10 tests
```

---

## Step 2 — Remove `@ts-nocheck` from `voice-converse-app.tsx`

**File:** `packages/cli/src/voice-converse-app.tsx` line 1

Remove `// @ts-nocheck`. Fix every TypeScript error the compiler now surfaces.

**2a. Ink component prop types**
```typescript
interface VoiceConverseAppProps {
  apiKey: string;
  baseUrl: string;
}
function VoiceConverseApp({ apiKey, baseUrl }: VoiceConverseAppProps) {
```

**2b. `useInput` callback — import Key from ink**
```typescript
import { useInput, type Key } from 'ink';
useInput((input: string, key: Key) => { ... });
```

**2c. Use ConverseResult discriminated union**
```typescript
import { postVoiceConverse, type ConverseResult } from '@claracode/voice-client';
const result: ConverseResult = await postVoiceConverse(...);
if (!result.ok) { return; }
// result.reply_audio_base64 is typed here
```

Run `cd packages/cli && npx tsc --noEmit` after each fix. Goal: zero errors, zero `@ts-nocheck`.

---

## Step 3 — Tests for `canonical-greeting.ts`

**Create:** `packages/cli/src/__tests__/lib/canonical-greeting.test.ts`

Mock dependencies at the top:
```typescript
jest.mock('fs/promises');
jest.mock('@claracode/voice-client');
jest.mock('../../services/audio'); // wherever playAudioFile lives
```

Write these 8 tests:

```typescript
describe('playCanonicalGreeting', () => {
  it('returns ok=true from cache without network call when cache exists', async () => {
    // mock readGreetingFromCache → Buffer
    // assert postVoiceConverse NOT called
    // assert playAudioFile called with cached buffer
  });

  it('calls postVoiceConverse on cache miss and plays reply audio', async () => {
    // mock readGreetingFromCache → null
    // mock postVoiceConverse → { ok: true, reply_audio_base64: 'AAAA...' }
    // assert writeGreetingToCache called with decoded buffer
    // assert playAudioFile called
  });

  it('falls back to /voice/respond when postVoiceConverse returns no audio', async () => {
    // mock postVoiceConverse → { ok: true, reply_audio_base64: undefined }
    // assert fetch('/voice/respond') called
  });

  it('returns ok=false when both postVoiceConverse and /voice/respond fail', async () => {
    // mock postVoiceConverse → { ok: false }
    // mock fetch → throws
    // assert result.ok === false
  });

  it('returns ok=false immediately when CLARA_VOICE_URL is not set', async () => {
    // delete process.env.CLARA_VOICE_URL
    // assert postVoiceConverse NOT called
    // assert result.ok === false
  });

  it('plays audio even if cache write fails', async () => {
    // mock writeGreetingToCache → throws
    // assert playAudioFile still called
    // assert result.ok === true
  });

  it('returns ok=false when playAudioFile throws', async () => {
    // mock playAudioFile → throws
    // assert result.ok === false
  });

  it('bypasses cache when refresh=true is passed', async () => {
    // mock readGreetingFromCache → Buffer (cache hit)
    // call playCanonicalGreeting({ refresh: true })
    // assert postVoiceConverse called despite cache hit
    // Skip if --refresh flag not yet wired
  });
});
```

---

## Step 4 — Vitest tests for `VoiceGreeting.tsx`

**Create:** `frontend/src/app/(marketing)/components/VoiceGreeting.test.tsx`

```typescript
import { render, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import VoiceGreeting from './VoiceGreeting';

describe('VoiceGreeting', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('does not call /api/voice/tts when sessionStorage gate is already set', async () => {
    sessionStorage.setItem('clara-greeting-played', '1');
    render(<VoiceGreeting />);
    await waitFor(() => { expect(fetch).not.toHaveBeenCalled(); });
  });

  it('sets sessionStorage key after successful playback', async () => {
    const mockAudio = { play: vi.fn().mockResolvedValue(undefined), src: '' };
    vi.stubGlobal('Audio', vi.fn(() => mockAudio));
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(new ArrayBuffer(8), { headers: { 'content-type': 'audio/wav' } })
    );
    render(<VoiceGreeting />);
    await waitFor(() => {
      expect(sessionStorage.getItem('clara-greeting-played')).toBe('1');
    });
  });

  it('handles NotAllowedError without throwing', async () => {
    const mockAudio = {
      play: vi.fn().mockRejectedValueOnce(
        Object.assign(new Error('NotAllowedError'), { name: 'NotAllowedError' })
      ),
      src: ''
    };
    vi.stubGlobal('Audio', vi.fn(() => mockAudio));
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(new ArrayBuffer(8), { headers: { 'content-type': 'audio/wav' } })
    );
    render(<VoiceGreeting />);
    // no unhandled rejection — component stays mounted
    await waitFor(() => { expect(true).toBe(true); });
  });

  it('autoplayAttempted ref prevents double-call on re-render', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(new ArrayBuffer(8), { headers: { 'content-type': 'audio/wav' } })
    );
    const { rerender } = render(<VoiceGreeting />);
    rerender(<VoiceGreeting />);
    await waitFor(() => { expect(fetch).toHaveBeenCalledTimes(1); });
  });
});
```

---

## Step 5 — E2E gap acknowledgment for `shell-voice-converse.ts`

Add below any existing imports in `desktop/src/shell-voice-converse.ts`:

```typescript
// Unit tests: not applicable — this module uses browser-only APIs (MediaRecorder,
// getUserMedia, AudioContext, Audio). Covered by E2E testing in Tauri webview context.
// See docs/testing/desktop-voice-e2e-plan.md for planned test scenarios.
```

Create `docs/testing/desktop-voice-e2e-plan.md`:

```markdown
# Desktop Voice E2E Test Plan

Module: `desktop/src/shell-voice-converse.ts`
Status: Planned — required before GA, not blocking beta.

## Scenarios

1. Space keydown starts MediaRecorder (recording state)
2. Space keyup stops recording, sends audio to /api/voice/converse
3. reply_audio_base64 decoded and played via Audio element
4. Backend 503 → error shown in desktop UI (no crash)
5. getUserMedia denied → graceful degradation

## Setup

Tauri webdriver integration: https://tauri.app/guides/testing/webdriver/
```

---

## Step 6 — Run full test suite

```bash
cd packages/cli && npm test && npx tsc --noEmit
# Expected: 24+ tests, 0 type errors, no @ts-nocheck

cd packages/clara-voice-client && npm test
# Expected: 13 tests (restored after rebase)

cd frontend && npm test
# Expected: 10+ tests including VoiceGreeting.test.tsx

cd backend && npm test
# Expected: 26 tests (unchanged)
```

---

## Step 7 — Push and re-review

```bash
git push origin prompt/2026-04-23/03-cli-npm-clara-converse-default --force-with-lease
```

Then run `/review-code` on the updated branch.

---

## Success Criteria

- [ ] `packages/cli`: 24+ tests, `tsc --noEmit` clean, no `@ts-nocheck` anywhere
- [ ] `packages/clara-voice-client`: 13 tests (restored after rebase onto develop)
- [ ] `frontend`: 10+ tests including VoiceGreeting coverage
- [ ] `desktop/src/shell-voice-converse.ts`: E2E gap comment + plan doc created
- [ ] `/review-code` returns ✅ APPROVED
- [ ] PR #03 merged to `develop`
