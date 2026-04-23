# Demo Checklist — Clara Code MVP

> **Updated**: 2026-04-23
> **Demo Readiness**: 🟡 Partial — CLI voice not yet in npm, web voice bar not started

---

## User Flow 1: CLI Voice (`npm install -g clara@latest && clara`)

| Step | Status | Notes |
|------|--------|-------|
| `npm install -g clara@latest` | ❌ Not published | Blocked on PR #59 merge + tag |
| `npx github:imaginationeverywhere/clara-code` (beta) | 🟡 Partial | Works if CLARA_VOICE_URL set |
| `clara` starts, plays greeting | 🟡 Partial | greet.ts wired but canonical-greeting.ts untested |
| Push Space → record voice | ❌ Blocked | VoiceConverseApp on blocked PR #59 |
| Clara replies with audio | ❌ Blocked | Requires /converse + VoiceConverseApp |
| **Overall** | ❌ Not demo-ready | PR #59 must merge |

## User Flow 2: Website (`claracode.ai` → install)

| Step | Status | Notes |
|------|--------|-------|
| Marketing site loads | ✅ | deploy-pages.yml working |
| Voice greeting plays on landing | 🟡 Partial | VoiceGreeting.tsx written, no tests, PR #59 |
| Install section shows npm + beta commands | ✅ | InstallSection.tsx live |
| Download .dmg button | ❌ | DMG_HREF env not set; "Download soon" badge |
| **Overall** | 🟡 Partial demo | Site loads; voice + dmg not ready |

## User Flow 3: Desktop IDE (Tauri)

| Step | Status | Notes |
|------|--------|-------|
| Download .dmg | ❌ | CI build failing on PR #59 |
| Install, open app | ❌ | Blocked |
| Clara voice greeting on launch | ❌ | shell-voice-converse.ts written, untested |
| Ctrl+Space → talk to Clara | ❌ | Blocked |
| **Overall** | ❌ Not demo-ready | Full dependency on PR #59 + Tauri build fix |

---

## What CAN Be Demoed Today

- **Backend API**: `POST /api/voice/converse` working with Hermes credentials
- **claracode.ai**: Marketing site live, install instructions, pricing
- **`npx github:imaginationeverywhere/clara-code`**: Runs with `CLARA_VOICE_URL` set
- **Voice greeting**: If `CLARA_VOICE_URL` set and user runs beta command manually

## Known Issues for Demo

1. `npm install -g clara@latest` not yet published (use `npx github:...` for demo)
2. Voice greeting plays on `clara` command but full converse not wired yet
3. .dmg download button hidden (shows "Download soon")
4. Voice converse requires CLARA_VOICE_URL + HERMES_API_KEY environment variables set

## Pre-Demo Steps (Once PR #59 Merges + Tag Cut)

- [ ] Verify `npm install -g clara@latest` succeeds
- [ ] Run `clara` — confirm greeting plays automatically
- [ ] Press Space, speak "write a hello world function" — confirm Clara responds
- [ ] Open claracode.ai — confirm VoiceGreeting plays (browser autoplay may block)
- [ ] Download .dmg — confirm Tauri app opens with voice
- [ ] Have fallback terminal tab ready with `npx github:...` version
- [ ] Pre-warm Modal container 2 minutes before demo
