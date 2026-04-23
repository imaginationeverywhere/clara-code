# `@imaginationeverywhere/clara-voice-client`

Shared TypeScript client for Clara voice: wraps the quikvoice **`POST /voice/converse`** surface (per cp-team), Node filesystem **canonical greeting cache** (XDG or `~/.cache/clara-code`, offline-friendly), and **offline-safe** `fetch` behavior (no throw on network failure; consumers stay silent in UI if desired).

**TARGET REPO:** [imaginationeverywhere/clara-code](https://github.com/imaginationeverywhere/clara-code)

## API

- `resolveConverseUrl(base)`, `postVoiceConverse(base, body, { apiKey?, signal? })` — JSON or parsed reply fields; network errors return `{ ok: false, offline: true }`.
- `readGreetingFromCache`, `writeGreetingToCache`, `defaultCacheDirectory` — **Node only** (uses `fs`).

`POST /voice/converse` is owned by `quikvoice` until the backend is live; the client is defensive about response shapes.

## Build

```bash
npm run build
npm run check
```

## License

MIT
