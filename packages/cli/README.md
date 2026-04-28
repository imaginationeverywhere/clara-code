# `clara` (packages/cli)

Published on npm as **`clara`**: voice greeting and **POST /voice/converse** loop by default. Full terminal IDE: **`clara tui`**.

**Env (voice default):** `CLARA_VOICE_URL` (quikvoice base), optional `CLARA_VOICE_API_KEY` (Bearer).

**Feature flags:** `CLARA_FEATURE_INTENT_DISPATCH=1` (or `true`) — when set, **`clara doctor`** also probes **`POST /api/v1/run`** (backend intent dispatch); until that ships, expect **`intent_gateway_pending`** (501).

**Gateway cognitive verbs** try **`POST /v1/run`** first (unified intent shape), then fall back to legacy **`POST /v1/<verb>`** if the gateway does not implement unified dispatch yet.

## Usage

```bash
npm install -g clara@latest
```

After installation, the `clara` binary is on your `PATH`.

## Auth (`clara login`)

1. Run **`clara login`**. The CLI starts an HTTP server on `127.0.0.1` (random port) and opens **`https://claracode.ai/cli-auth?cli_port=<port>`** in the browser.
2. After you complete sign-in on the site, the page must **`POST`** to `http://127.0.0.1:<port>/` with JSON:

```json
{
  "email": "you@example.com",
  "sessionToken": "<Clerk session JWT>",
  "apiKey": "cc_live_… or sk-clara-…"
}
```

(`session_token` / `api_key` are accepted as aliases.) Tokens are stored with **keytar** (macOS Keychain, Windows Credential Manager, Linux libsecret), service **`clara-code`**, account **`default`**, not in `~/.clara/credentials.json`. A legacy plaintext credentials file, if present, is migrated into the keyring and removed. **`clara auth login`** is a hidden alias of the same flow. **`clara doctor`** reports whether keytar loads, whether credentials exist, whether `GET /health` on the resolved backend succeeds, **`~/.clara/last-error.json`** when written by a failed command, and (when signed in) **`GET /api/v1/tier-status`** (tier and billing cycle end).

## Commands

| Command | Description |
|--------|-------------|
| `clara` (no args) | Plays the canonical greeting, then Space twice for push-to-turn audio over `/voice/converse` |
| `clara --version` | Print the CLI version |
| `clara login` | Browser sign-in; store session + API key in the OS keyring (see **Auth** above) |
| `clara doctor` | Check keyring, credentials, backend `/health`, and tier status (`/api/v1/tier-status`) when logged in; optional **`POST /api/v1/run`** probe when `CLARA_FEATURE_INTENT_DISPATCH=1` |
| `clara greet` | Request Clara's voice greeting from the API and play the audio |
| `clara config get <key>` | Print resolved `gatewayUrl`, `brainUrl`, `backendUrl`, `userId`, or `apiKey` (keyring) |
| `clara config set <key> <value>` | Set a allowed key: URLs / `userId` in `~/.clara/config.json`; `apiKey` in the **OS keyring** (never on disk) |
| `clara config list` | Show each key, resolved value, and source (env / config / default / keyring) |
| `clara config unset <key>` | Remove a file-stored override or clear `apiKey` in the keyring (session token kept) |
| `clara config-agent` | Interactive harness agent setup from Clara templates (`configure-agent` alias) |
| `clara init <name>` | Create a per-agent GitHub repo: tries unified **`POST /v1/run`** (`intent: new`) first when the gateway returns **`cloneUrl`** / **`repoUrl`**, else **`POST /api/agents/init`** + **`git clone`** into `./<name>/` (Business/Enterprise tier). Options: **`--backend`**, **`--gateway`**. Failures write **`~/.clara/last-error.json`** for **`clara doctor`**. |
| `clara deploy` | Trigger deploy: tries **`POST /v1/run`** (`intent: deploy`) first, else **`POST /api/agents/:name/deploy`** on the backend. Options: **`--backend`**, **`--gateway`** (gateway base for unified dispatch), **`--name`**. |
| `clara chat` | Same streaming Ink experience as **`clara tui`** (preferred alias) |
| `clara tui` | Full-screen Ink TUI: gateway chat, VRD Surface C copy, `Ctrl+Space` voice, `--voice` placeholder |

## Quickstart

```bash
clara --version
clara config set apiKey YOUR_API_KEY
clara greet
clara tui --gateway https://your-gateway.example.com
```

### TUI

Text-first by default; optional `--voice` for future audio when the gateway supports it.

- `Ctrl+Q` quit (saves session hint to `~/.clara/config.json`)
- `Ctrl+M` toggle mic UI (recording placeholder; use typed input for messages)
- `Enter` send

**Gateway default** matches `clara config get gatewayUrl` when nothing is set: `https://api.claracode.ai/hermes` (override with `CLARA_GATEWAY_URL` or `clara config set gatewayUrl <url>`). The directory `~/.clara/` is created when you first write config.

## Development

From the repository root:

```bash
cd packages/cli
npm install
npm run build
node dist/index.js tui
```

## CLI

```bash
clara tui
clara tui --user mo --gateway https://your-gateway.modal.run
clara --help
```

## Config

`~/.clara/config.json` (no `apiKey` or inference keys in the file — `model` / `system_prompt` / `temperature` are rejected; use **`clara login`** for session, **`clara config set apiKey`** for keyring-only keys).

```json
{
  "gatewayUrl": "https://your-gateway.example.com",
  "brainUrl": "https://brain-api.claracode.ai",
  "userId": "your-name",
  "lastSessionDate": "2026-04-10",
  "lastProject": "my-app",
  "sixSideProjectsAsked": true
}
```
