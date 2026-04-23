# Prompt — publish CLI as `clara@latest` on npm

**TARGET REPO:** `imaginationeverywhere/clara-code`

## Goal

Enable `npm install -g clara@latest` and `npx clara@latest` (current bin is `clara` on `@clara/cli`).

## Tasks

- Document approach in `docs/distribution/cli-npm.md` (unscoped `clara` metapackage vs renames; CI implications).
- Wire release to publish the public name if using a metapackage.

**Refs:** directive 2026-04-23 deliverable 2.
