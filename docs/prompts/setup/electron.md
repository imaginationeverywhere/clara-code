# Electron desktop (Step 7)

## What it does

Desktop shell with **PKCE / loopback auth**, **contextBridge** IPC, **SecretStorage** for tokens.

## Default behavior

No Node in renderer; signed builds for distribution channels.

## Customization options

Pair with `--desktop` standard flag for full VS Code / Electron rules.

## Example queue command

`/queue-prompt --electron "Minimal shell loading web app in webview with deep link"`

## Example pickup command

`/pickup-prompt --electron`

## Output location

`desktop/` or `electron/` package per repo.

## Agent ownership

**Desktop / Frontend** + **Security**.

## Related

- [react-native.md](react-native.md)
