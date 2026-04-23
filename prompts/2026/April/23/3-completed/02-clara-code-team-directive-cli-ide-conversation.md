# Directive — Clara Code Team (clara-code team)

**Issued by:** HQ (Claude Code session, on Mo's direction)
**Date:** 2026-04-23
**Milestone:** Clara Code v1 — CLI + IDE shipping with live Clara conversation
**Target repo:** `clara-code`
**Team:** John Hope Franklin (PO), Carruthers (TL), Motley (FE), Miles (BE), Claudia (DevRel)

---

## End-state Mo wants

Three user paths work end-to-end:

1. **CLI:** `npm install -g clara@latest` → `clara` → Clara greets → voice conversation
   (Also supports `npx clara@latest` for ephemeral use)
2. **IDE:** visit `https://claracode.ai` → click Download → install `.dmg` → open app → Clara greets → voice conversation
3. **Website:** `https://claracode.ai` itself features Clara's voice greeting on load

## Deliverables (ship in order)

1. **`packages/clara-voice-client`** — shared TS package
   - Wraps `quikvoice` `/voice/converse` endpoint
   - Mic capture (cross-platform), streaming audio send, playback
   - Offline-safe: graceful silent fail if backend unreachable
   - Caches Clara's canonical greeting MP3 on first run
   - Publish as `@imaginationeverywhere/clara-voice-client`

2. **CLI — `packages/cli/`** — **SHIP FIRST**
   - Binary name `clara`, published to npm as `clara@latest`
   - Supports: `npm i -g clara@latest && clara` and `npx clara@latest`
   - On launch: Clara greeting plays → conversation mode → push-to-talk (spacebar) → response plays
   - macOS + Linux; Windows stretch

3. **Desktop IDE — `desktop/`** (Tauri)
   - Tauri app: editor panel + Clara conversation side panel
   - Build `.dmg` (macOS) for this milestone; `.exe` (Windows) follows
   - Same voice-conversation loop as CLI
   - Uploads to CF R2 (or equivalent) linked from claracode.ai download page

4. **`claracode.ai` website — `frontend/`**
   - Landing page. Clara greeting on page load (autoplay-gated: button fallback if browser blocks)
   - Download button → desktop IDE binary
   - Install instructions: `npm install -g clara@latest` and `clara`
   - Deploy to Cloudflare Workers (per memory `decision-cloudflare-workers-standard`)

5. **Distribution pipeline** — GitHub Actions
   - Tag push → CLI publishes to npm + desktop builds + website deploys + binaries uploaded
   - One command from `git tag v1.0.0` to three surfaces updated

## Acceptance (Mo-runnable demo)

- **Terminal:** `npm install -g clara@latest && clara` → Clara greets → Mo speaks → Clara replies in Villarosa's voice
- **Browser:** visit `claracode.ai` → Clara greets → click Download → install `.dmg` → open app → Clara greets → Mo speaks → Clara replies

## Dependencies

- **Blocker:** cp-team's `POST /voice/converse` endpoint + API key (see `quikvoice/prompts/2026/April/23/1-not-started/01-cp-team-directive-voice-conversation-backend.md`). Scaffold everything else in parallel; wire up when endpoint lands.
- Domain `claracode.ai` already live on Cloudflare Workers (per memory).

## References

- `quik-nation-ai-boilerplate/docs/architecture/unified-clara-ecosystem-map.md` §1 (product surfaces), §7 (repo topology)
- Memory: `decision-clara-code-is-one-product-cli-ide-desktop-modes`
- Memory: `decision-clara-code-core-setup-process` (8-step setup)
- Vault: `~/auset-brain/Projects/clara-code-full-vision.md`
- Prior prompts: `prompts/2026/April/07/*-create-clara-app-*.md` in boilerplate (14 architecture prompts)

## Write your own Cursor prompts from this directive

Save them in `clara-code/prompts/2026/April/23/1-not-started/` alongside this directive. Each prompt declares `**TARGET REPO:** imaginationeverywhere/clara-code`. Report to HQ via live feed as each surface ships.

---

**Scope rule:** Ship CLI first (lowest complexity, highest Mo-satisfaction). Then Desktop. Then Website. Then pipeline. Don't parallelize prematurely.

---

## Status (pickup-prompt, `develop` 2026-04-23)

**This file is a parent directive, not a single build task.** It was decomposed into smaller prompts on a feature branch. On **`develop` (this checkout)**, the end-state in Mo’s “Acceptance” is **not yet fully on `main`/`develop`** without merging the branch that contains `03`–`06` follow-ups (e.g. `clara` npm name, Tauri side voice bundle, `release-on-tag` / `desktop-macos-dmg` workflows, marketing `NEXT_PUBLIC_CLARA_DESKTOP_DMG_URL` + TTS autoplay, `docs/distribution-pipeline.md`).

| # | Area | `develop` snapshot | Follow-up |
|---|------|-------------------|-----------|
| 1 | `clara-voice-client` | Package exists (`postVoiceConverse`, cache). | Full publish + `converse-browser` source path: merge feature or release. |
| 2 | CLI | `packages/cli` is **`@clara/cli`**; binary `clara`. | Rename/publish as **`clara`** for `npm i -g clara@latest` (see clara-distribution work). |
| 3 | Desktop | Tauri shell + **voice overlay**; not the full “editor + **side** voice” webview in all branches. | Land side panel + `build:shell-voice` + optional dmg CI. |
| 4 | Website | Marketing **VoiceGreeting** (push-to-play), **InstallSection** exists; autoplay + dmg URL may be on another branch. | Merge marketing changes + set CF `NEXT_PUBLIC_*` for download URL. |
| 5 | Distribution | CF often via **Git integration** (`deploy-pages` no-op). | Add optional `release-on-tag` + doc’d secrets when ready. |

**E2E:** Requires cp-team **`/voice/converse` + API** for live loop; TTS on site uses `POST /api/voice/tts` when `CLARA_VOICE_URL` (or proxy) is set in the Workers env.

**Directive record:** `pickup-prompt` moved this file to `3-completed/` to clear `1-not-started/`. Ongoing work continues via PRs from feature branches, not the daily queue.
