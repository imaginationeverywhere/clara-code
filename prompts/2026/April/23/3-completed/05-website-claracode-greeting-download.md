# Website — `claracode.ai` greeting on load + Download + install copy

**TARGET REPO:** `imaginationeverywhere/clara-code`  
**Issued from:** `prompts/2026/April/23/3-completed/02-clara-code-team-directive-cli-ide-conversation.md`  
**Priority:** 3 (after desktop is in flight or done)

## Goal

- `frontend/`: landing on Cloudflare Workers (per platform decision).
- **Clara voice greeting** on first load: autoplay where allowed; **button** fallback if the browser blocks autoplay.
- **Download** points to the desktop **`.dmg`** (R2 or CF asset URL).
- Install instructions: `npm install -g clara@latest` and `clara` (match final npm name from prompt `03`).

## Acceptance

- No PII in client logs; `npm run check` for `frontend` if files change.

## References

- `prompts/2026/April/21/1-not-started/03-website-clara-greeting-on-load.md` (may duplicate — merge or supersede)
- `frontend/README.md`
