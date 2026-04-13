# create-clara-app

`npx create-clara-app` entrypoint for scaffolding Clara projects. The CLI is implemented in `src/cli.ts`; published packages include `dist/` (from `npm run build`) and `templates/` (`open-next.config.ts`, `wrangler.toml`, `env.example` for Clerk + Hermes). The generator remains minimal; templates ship for upcoming scaffold steps.
