# create-clara-app

Scaffolds a **Next.js 15** app (App Router, TypeScript, Tailwind), adds **Cloudflare Workers / OpenNext** (`wrangler.toml`, `open-next.config.ts`), **Clerk**, **`@claracode/sdk`**, and scripts for local dev and Cloudflare deploys.

**Note:** The monorepo has `packages/cli` published on npm as **`clara`** (voice TUI and voice-converse default). This package is `packages/create-clara-app` so the npm binary name stays `create-clara-app`.

## Usage

```bash
npx create-clara-app my-app
cd my-app && npm run dev
```

From this repo (after `npm run build` in `packages/create-clara-app`):

```bash
node packages/create-clara-app/dist/cli.js my-app
```

## What it does

1. Runs `create-next-app@15` with TypeScript, Tailwind, ESLint, `src/`, App Router, `@/*` alias.
2. Copies `templates/wrangler.toml` and `templates/open-next.config.ts`.
3. Installs `@clerk/nextjs`, `@opennextjs/cloudflare`, `wrangler`, and `@claracode/sdk` (from npm, or `file:../../packages/sdk` when run from the monorepo).
4. Writes `.env.example` with Clerk and Clara Hermes variables.
5. Patches `next.config.*` with `initOpenNextCloudflareForDev()`.
6. Adds scripts: `dev`, `build`, `pages:build`, `pages:deploy`.
7. Adds `.npmrc` with `legacy-peer-deps=true` (Clerk peer range vs Next’s React pin).

## Publish to npm

Package name is `create-clara-app` (unscoped). Publish from `packages/create-clara-app` with an account that owns the name, or publish under the `@claracode` org as `@claracode/create-clara-app` by changing `"name"` in `package.json` and using `npx @claracode/create-clara-app` instead.

## Build

```bash
npm run build
```

Output: `dist/cli.js` (executable bit set by the build script). The npm `bin` entry points at this file.
