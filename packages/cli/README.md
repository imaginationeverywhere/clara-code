# @clara/cli

Terminal TUI for Clara Code (Ink). Text-first; `--voice` is reserved for future audio hooks.

## Usage

```bash
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
  "gatewayUrl": "https://info-24346--hermes-gateway.modal.run",
  "userId": "your-name",
  "lastSessionDate": "2026-04-10",
  "lastProject": "my-app",
  "sixSideProjectsAsked": true
}
```
