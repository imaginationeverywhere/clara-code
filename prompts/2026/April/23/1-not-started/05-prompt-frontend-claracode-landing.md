# Prompt — `claracode.ai` landing: voice + download

**TARGET REPO:** `imaginationeverywhere/clara-code`

## Goal

- `frontend/`: landing with Clara **voice greeting on load** (autoplay-gated; play-button fallback if blocked).
- **Download** button to latest `.dmg`; install blurb: `npm install -g clara@latest` + `clara` once alias ships (see `03-prompt-npm-clara-latest-alias.md`).
- Deploy: **Cloudflare Workers** (per `decision-cloudflare-workers-standard` in memory).
- Reuse or mirror greeting audio via public API / static asset as appropriate; share types with `@imaginationeverywhere/clara-voice-client` where possible (browser: no Node cache).
