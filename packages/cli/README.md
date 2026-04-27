# `clara` (packages/cli)

Published on npm as **`clara`**: voice greeting and **POST /voice/converse** loop by default. Full terminal IDE: **`clara tui`**.

**Env (voice default):** `CLARA_VOICE_URL` (quikvoice base), optional `CLARA_VOICE_API_KEY` (Bearer).

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

(`session_token` / `api_key` are accepted as aliases.) Tokens are stored with **keytar** (macOS Keychain, Windows Credential Manager, Linux libsecret), service **`clara-code`**, account **`default`**, not in `~/.clara/credentials.json`. A legacy plaintext credentials file, if present, is migrated into the keyring and removed. **`clara auth login`** is a hidden alias of the same flow. **`clara doctor`** reports whether keytar loads, whether credentials exist, and whether `GET /health` on the resolved backend succeeds.

## Commands

| Command | Description |
|--------|-------------|
| `clara` (no args) | Plays the canonical greeting, then Space twice for push-to-turn audio over `/voice/converse` |
| `clara --version` | Print the CLI version |
| `clara login` | Browser sign-in; store session + API key in the OS keyring (see **Auth** above) |
| `clara doctor` | Check keyring, credentials, and backend `/health` |
| `clara hello` | Play Clara's voice greeting from the API (stub) |
| `clara ask "<question>"` | Send a question to the Clara API and print the response (stub) |
| `clara config set api-key <key>` | Store the API key in `~/.clara/config.json` |
| `clara config get api-key` | Print the stored API key (or empty line if unset) |
| `clara init <name>` | Provisions a per-agent GitHub repo via `POST /api/agents/init`, then `git clone` into `./<name>/` (Business/Enterprise tier; requires API token) |
| `clara tui` | Full-screen Ink TUI: gateway chat, VRD Surface C copy, `Ctrl+Space` voice, `--voice` placeholder |

## Quickstart

```bash
clara --version
clara config set api-key YOUR_API_KEY
clara ask "What is Clara Code?"
clara hello
clara tui --gateway https://info-24346--hermes-gateway.modal.run
```

### TUI

Text-first by default; optional `--voice` for future audio when the gateway supports it.

- `Ctrl+Q` quit (saves session hint to `~/.clara/config.json`)
- `Ctrl+M` toggle mic UI (recording placeholder; use typed input for messages)
- `Enter` send

Configuration is stored at `~/.clara/config.json`. The directory is created automatically when you run `clara config set`.

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

`~/.clara/config.json`:

```json
{
  "gatewayUrl": "https://your-gateway.example.com",
  "userId": "your-name",
  "lastSessionDate": "2026-04-10",
  "lastProject": "my-app",
  "sixSideProjectsAsked": true
}
```
