# Apollo Router

The Apollo Router is the GraphQL Federation gateway for Clara Code.

## Running locally

1. Install: https://www.apollographql.com/docs/router/quickstart

   ```
   curl -sSL https://router.apollo.dev/download/nix/latest | sh
   ```

2. Keep `apollo-router/clara-core.graphql` in sync with `backend/src/graphql/clara-core/schema.ts` (subgraph SDL for Rover composition).

3. Compose the supergraph schema from the repo root (does not require a running backend):

   ```
   npm run router:compose
   ```

4. Start the router:

   ```
   CLARA_SERVICE_TOKEN=dev-token ./router --config router.yaml
   ```

   Run this from the `apollo-router/` directory, or use `npm run router:start` from the repo root (expects `./router` in `apollo-router/`).

The router listens on port 4000 by default. Set `APOLLO_ROUTER_PORT` in the root `.env` to change.

## Adding a new Talent subgraph

When the Talent Registry approves a new Talent, it:

1. Appends the subgraph to `supergraph.yaml`
2. Reruns `rover supergraph compose`
3. Sends SIGHUP to the router process for hot-reload (no downtime)

Never edit `supergraph.yaml` manually in production — it is managed by the Talent Registry service.
