# `clara`

Public npm name for the Clara Code CLI. This package has **no** implementation; it sets the `clara` binary to the same code as [`@clara/cli`](../cli/).

- **Global install (once published to npm):** `npm install -g clara@latest`
- **One-off:** `npx clara@latest`
- **From monorepo:** the workspace links `@clara/cli`; this shim resolves `dist/index.js` at install time for consumers.

If the unscoped `clara` name is not available on npm, publish under an org (see [docs/distribution/cli-npm.md](../../docs/distribution/cli-npm.md)) or use `@clara/cli` only.
