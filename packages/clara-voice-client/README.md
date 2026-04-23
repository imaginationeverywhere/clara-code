# `@imaginationeverywhere/clara-voice-client`

Shared TypeScript client for Clara voice: wraps the quikvoice **`POST /voice/converse`** surface, Node filesystem **canonical greeting cache** (XDG or `~/.cache/clara-code`), and **offline-safe** `fetch` (network errors return `offline: true`).

**TARGET REPO:** [imaginationeverywhere/clara-code](https://github.com/imaginationeverywhere/clara-code)

## API

- `resolveConverseUrl(base)`, `postVoiceConverse(base, body, { apiKey?, signal? })`
- `readGreetingFromCache`, `writeGreetingToCache`, `defaultCacheDirectory` (Node, `fs`)

`POST /voice/converse` is defined by the quikvoice / cp-team backend; the client is defensive about response shape.

## Build

```bash
npm run build
npm run check
```

## License

MIT
