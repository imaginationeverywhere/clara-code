# Prompt — publish CLI as `clara@latest` on npm

**TARGET REPO:** `imaginationeverywhere/clara-code`

## Goal

Satisfy Mo’s install path: `npm install -g clara@latest` and `npx clara@latest` (today the binary lives under scoped `@clara/cli` with bin `clara`).

## Tasks

- Decide: unscoped `clara` package that depends on or re-exports `@clara/cli`, or npm publish alias workflow — document in `docs/distribution/cli-npm.md`.
- Add release/CI so tagging publishes `clara@latest` alongside `@clara/cli` if we keep two package names.
- Do not break existing `workspace:` consumers.

**Refs:** `prompts/.../2-in-progress/02-clara-code-team-directive-cli-ide-conversation.md` deliverable 2
