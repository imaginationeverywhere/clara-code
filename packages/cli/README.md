# `clara` (packages/cli)

Published on npm as **`clara`**: voice greeting and **POST /voice/converse** loop by default. Full terminal IDE: **`clara tui`**.

**Env (voice default):** `CLARA_VOICE_URL` (quikvoice base), optional `CLARA_VOICE_API_KEY` (Bearer).

## Usage

```bash
npm install -g clara@latest
```

After installation, the `clara` binary is on your `PATH`.

## Commands

| Command | Description |
|--------|-------------|
| `clara` (no args) | Plays the canonical greeting, then Space twice for push-to-turn audio over `/voice/converse` |
| `clara --version` | Print the CLI version |
| `clara hello` | Play Clara's voice greeting from the API (stub) |
| `clara ask "<question>"` | Send a question to the Clara API and print the response (stub) |
| `clara config set api-key <key>` | Store the API key in `~/.clara/config.json` |
| `clara config get api-key` | Print the stored API key (or empty line if unset) |
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
