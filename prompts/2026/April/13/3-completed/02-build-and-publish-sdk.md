# Build & Publish @claracode/sdk

**Depends on:** `01-fix-voice-session-and-health-handler.md` — run that first.
**Package:** `packages/sdk/`
**Goal:** Build the SDK dist and publish to npm.

## Context

`@claracode/sdk` is the TypeScript client for Hermes-compatible APIs. The code is written (v0.1.0)
but `packages/sdk/dist/` is completely empty — the package has never been built. Prompt 01 applies
the H1 (VoiceSession rejection path) and M2 (Accept header on agent stream) fixes. This prompt
builds and publishes after those fixes are in.

## Steps

### Step 1 — Verify prompt 01 fixes are applied

Check `packages/sdk/src/client.ts` for:

1. `rejectReady` field on `VoiceSessionImpl` — must exist
2. `catch (err)` block in `VoiceSessionImpl.create()` that calls `this.rejectReady(...)` — must exist
3. `Accept: "text/event-stream"` header in `streamAgentChunks` — must exist

If any of these are missing, **STOP** — go run prompt 01 first.

### Step 2 — Run typecheck

```bash
cd packages/sdk
npm run check
```

Must pass with zero errors. If TypeScript errors exist, fix them before proceeding.

### Step 3 — Run tests

```bash
cd packages/sdk
npm test
```

The existing integration test (`test/ask.test.ts`) must pass. If it fails, investigate — do not
skip.

### Step 4 — Build

```bash
cd packages/sdk
npm run build
```

Expected output: `packages/sdk/dist/` should now contain:
- `index.js` (ESM)
- `index.cjs` (CJS)
- `index.d.ts` (types)

Verify the dist is populated:
```bash
ls packages/sdk/dist/
```

If `dist/` is empty after build, check the tsup config at `packages/sdk/tsup.config.mjs` and fix it.

### Step 5 — Smoke test the built output

```bash
cd packages/sdk
node -e "import('./dist/index.js').then(m => console.log('exports:', Object.keys(m)))"
```

Must print the expected exports: `createClient`, `startVoice`, etc.

### Step 6 — Publish to npm

```bash
cd packages/sdk
npm publish --access public
```

If you get a 403 (not logged in), run `npm login` first and use the credentials from AWS SSM:
```bash
# Credentials are in SSM if needed — ask the session owner
```

If the package already exists at this version on npm, bump the patch version in `package.json`
(0.1.0 → 0.1.1) before publishing.

### Step 7 — Verify publish

```bash
npm view @claracode/sdk version
```

Should return `0.1.0` (or `0.1.1` if you bumped).

## Acceptance Criteria

- [ ] `npm run check` passes in `packages/sdk/` (zero TypeScript errors)
- [ ] `npm test` passes in `packages/sdk/`
- [ ] `packages/sdk/dist/` is populated after build
- [ ] `node -e "import('./dist/index.js')..."` exits clean
- [ ] `@claracode/sdk` is live on npm registry
- [ ] `npm view @claracode/sdk version` returns the published version

## Do NOT

- Do not modify any SDK source files — prompt 01 owns those changes
- Do not change the public API
- Do not publish if tests fail
