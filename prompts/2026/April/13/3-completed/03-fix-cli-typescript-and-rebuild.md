# Fix CLI TypeScript error + rebuild @clara/cli

**Package:** `packages/cli/`
**Independent — can run in parallel with prompts 01 and 02.**
**Goal:** Fix the TypeScript error blocking a clean build, rebuild dist, verify `clara` command works.

## Context

`@clara/cli` is the `clara` terminal command. The package is scaffolded and has a working `dist/`
from a prior build, but `tsc --noEmit` fails with one error that will break future builds:

```
src/commands/tui.tsx(30,5): error TS2345:
  Argument of type 'FunctionComponentElement<AppProps>' is not assignable to parameter of type 'ReactNode'.
  Property 'children' is missing in type 'FunctionComponentElement<AppProps>' but required in type 'ReactPortal'.
```

The `render()` call from `ink` passes a `React.createElement(App, {...})` element. TypeScript can't
confirm it extends `ReactNode` because `AppProps` doesn't declare `children`. The fix is one line.

## Required Fix

### File: `packages/cli/src/tui.tsx` — `AppProps` interface (line 14)

**Current:**
```typescript
export interface AppProps {
  userId: string;
  gatewayUrl: string;
  version: string;
  voiceAudioEnabled: boolean;
}
```

**Fixed:**
```typescript
export interface AppProps {
  userId: string;
  gatewayUrl: string;
  version: string;
  voiceAudioEnabled: boolean;
  children?: React.ReactNode;
}
```

Add `import React from "react";` at the top of `tui.tsx` if it's not already there.

That's the only code change required.

## Steps After the Fix

### Step 1 — Typecheck

```bash
cd packages/cli
npm run check
```

Must pass with zero TypeScript errors.

### Step 2 — Rebuild

```bash
cd packages/cli
npm run build
```

Expected output: `packages/cli/dist/index.js` (ESM + shebang injected by tsup banner).

### Step 3 — Smoke test the binary

```bash
node packages/cli/dist/index.js --help
```

Should print the Clara CLI help with available commands: `hello`, `ask`, `config`, `auth`, `greet`,
`tui`.

```bash
node packages/cli/dist/index.js hello
```

Should run without crash.

### Step 4 — Test the `clara` bin resolution

```bash
cd packages/cli
npm link
clara --help
```

Should invoke the binary via the `bin.clara` entry in `package.json`.

Unlink after testing:
```bash
npm unlink -g @clara/cli
```

### Step 5 — (Optional) Publish to npm

If the package is intended to be public (`claracode` on npm), update the package name from
`@clara/cli` to `claracode` (or `@claracode/cli`) before publishing:

```json
{
  "name": "claracode",
  "bin": { "clara": "./dist/index.js" }
}
```

Then:
```bash
npm publish --access public
```

**Only do the rename/publish step if explicitly requested — the core task is the TypeScript fix.**

## Acceptance Criteria

- [ ] `npm run check` passes in `packages/cli/` (zero TypeScript errors)
- [ ] `npm run build` completes without error
- [ ] `node packages/cli/dist/index.js --help` prints help output
- [ ] No crashes on `node packages/cli/dist/index.js hello`
- [ ] `clara --help` works via `npm link` test

## Do NOT

- Do not change the CLI commands or application logic
- Do not rename the npm package unless explicitly asked
- Fix only the `AppProps` TypeScript error
