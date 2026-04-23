# npm distribution — `clara` and `@clara/cli`

**TARGET REPO:** `imaginationeverywhere/clara-code`

## Packages

| npm name   | Source path          | Notes |
|------------|----------------------|-------|
| `clara`    | `packages/clara`     | Unscoped name; thin shim, `bin.clara` → runs `@clara/cli/dist/index.js`. Mo’s install path: `npm install -g clara@latest`. |
| `@clara/cli` | `packages/cli`     | Real implementation, also exposed as the `clara` binary when you install the scoped package only. |

## Workspace (monorepo)

- `clara` depends on `@clara/cli` with `workspace:*` so local `npm install` at repo root works before publish.

## Publishing

1. **Lockstep:** bump versions together (`clara` should match the `@clara/cli` line you are publishing so users do not get skew).
2. **Order:** `npm run build` for `@imaginationeverywhere/clara-voice-client` (CLI prebuild) and `@clara/cli`, then publish `clara` and `@clara/cli` from the same version tag (see [tag-pipeline.md](./tag-pipeline.md)).
3. **Name conflicts:** the unscoped name `clara` is generic. If the name is already taken, options: (a) acquire the name via npm support, (b) publish the shim as `@imaginationeverywhere/clara` with `bin: { "clara": "..." }` and document a global alias, (c) document `npm i -g @clara/cli` as the only install path.

## Environment

Same as `@clara/cli` — e.g. `CLARA_BACKEND_URL`, `CLARA_VOICE_URL` for `clara greet`, and credentials under `~/.clara/`.
