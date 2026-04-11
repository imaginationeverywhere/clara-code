---
project: clara-code
last_updated: 2026-04-10
session: 2
team: Clara Code Team (john-hope PO, carruthers TL)
---

# Session Checkpoint — Session 2 (Clara Code Team)

## SPRINT 1 STATUS AUDIT — ALL DONE ✅

### DONE ✅ (commit 60589f6c)
- **Item 1:** Fork `badlogic/pi-mono` → `imaginationeverywhere/clara-code` ✅
- **Item 2:** Hermes model router — DeepSeek V3.2 as default ✅
- **Item 3:** Vault sync as native tool (`vault_read`, `vault_write`, `vault_append`) ✅
- **Item 4:** Auto-write session JSONL to `~/auset-brain/agents/<name>/sessions/` ✅
  - Hook: `packages/coding-agent/src/core/agent-session-runtime.ts`
  - `writeSessionToVault()` + `getActiveAgentName()` in `teardownCurrent()` + `dispose()`
  - Reads pod name from `~/.pi/pods.json`, falls back to "default"
- **Item 5:** `packages/create-clara-app/` scaffolded ✅
  - Interactive CLI: project name + agent name prompts
  - Generates package.json, tsconfig, src/agent.ts, README, .gitignore
- **Item 6:** `packages/clara/` — `@ie/clara` npm SDK scaffolded ✅
  - `createClaraAgent()` factory, `CLARA_DEFAULT_MODEL`, `CLARA_DEFAULT_PROVIDER`
  - Re-exports from `@mariozechner/pi-coding-agent`
- **Item 7:** VoiceBar UX in `packages/web-ui/` ✅
  - File: `packages/web-ui/src/components/voice/VoiceBar.tsx`
  - Mic button (Web Speech API), Enter = mute, S = Clara Radio toggle
  - Wired into `page.tsx`; tsconfig updated to exclude upstream Lit files

## REPO STRUCTURE
- `packages/agent/` — `@mariozechner/pi-agent-core` v0.66.1
- `packages/ai/` — `@mariozechner/pi-ai` v0.66.1 (DeepSeek V3.2 in models.generated.ts ✅)
- `packages/coding-agent/` — `@mariozechner/pi-coding-agent` v0.66.1 (vault tools + JSONL ✅)
- `packages/mom/` — `@mariozechner/pi-mom` v0.66.1
- `packages/pods/` — `@mariozechner/pi` v0.66.1
- `packages/tui/` — `@mariozechner/pi-tui` v0.66.1
- `packages/web-ui/` — `@clara/web-ui` v0.1.0 (VoiceBar + tsconfig fix ✅)
- `packages/clara/` — `@ie/clara` v0.1.0 (NEW ✅)
- `packages/create-clara-app/` — `create-clara-app` v0.1.0 (NEW ✅)

## NEON DB
- Production: `/clara-code/production/DATABASE_URL` (SSM)
- Develop: `/clara-code/develop/DATABASE_URL` (SSM)
- Project ID: sparkling-water-50841025

## CLARA VOICE GATEWAY (from HQ)
- `POST https://info-24346--hermes-gateway.modal.run`
  - payload: `{"platform": "web", "user": "mo", "message": "Hello Clara"}`
- LLM: AWS Bedrock DeepSeek V3.2 | Voice: Voxtral (Modal)

## SPRINT 2 CANDIDATES
- Dispatch web-ui page prompts (04-14) to Cursor agents on QCS1
- Wire VoiceBar to Hermes gateway (actual voice I/O)
- Publish `@ie/clara` + `create-clara-app` to npm
- Implement `pi pod create <name>` support to feed the vault JSONL naming

## KEY PATTERNS (clara-code specific)
- DeepSeek V3.2 via `amazon-bedrock` provider, model ID `deepseek.v3.2`
- Vault path validation: must stay within `~/auset-brain/` or throws
- Session JSONL: auto-written to `~/auset-brain/agents/<pod>/sessions/YYYY-MM-DD.jsonl` on teardown
- Agent name → vault path: reads `~/.pi/pods.json`, falls back to "default"
