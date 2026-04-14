# Private npm Registry — Verdaccio for Clara Talent Agency

**Source:** `docs/internal/CLARA_TALENT_AGENCY.md` — read this document before writing any code.
**Branch:** `prompt/2026-04-14/04-private-npm-registry-verdaccio`
**Scope:** Root `docker-compose.yml`, new `registry/` directory, `backend/src/routes/registry-auth.ts`

---

## Context

The Clara Talent Agency distributes gated `@claracode/` scoped packages through a private npm registry at `registry.claracode.ai`. Public npm packages are proxied transparently. See `docs/internal/CLARA_TALENT_AGENCY.md` for the full distribution model.

Packages gated by this registry:
- `@claracode/sdk` — requires active subscription (Pro or Business)
- `@claracode/marketplace-sdk` — requires $99/yr Clara Developer Program membership

## Required Work

### 1. Verdaccio Configuration

Create `registry/config.yaml`:

```yaml
storage: /verdaccio/storage
auth:
  htpasswd:
    file: /verdaccio/htpasswd
    # Auth is handled by the Clara backend token endpoint — see Step 3
    max_users: -1  # disable htpasswd signup — use token auth only

uplinks:
  npmjs:
    url: https://registry.npmjs.org/

packages:
  "@claracode/*":
    # Scoped packages — served from local storage only
    access: $authenticated
    publish: $authenticated
    unpublish: $authenticated

  "**":
    # All other packages — proxy to public npm
    access: $all
    proxy: npmjs

server:
  keepAliveTimeout: 60

middlewares:
  audit:
    enabled: true

logs:
  - { type: stdout, format: pretty, level: http }

web:
  enable: false  # No web UI — API only
```

### 2. Docker Compose Service

Add to `docker-compose.yml`:

```yaml
registry:
  image: verdaccio/verdaccio:6
  container_name: clara-registry
  ports:
    - "4873:4873"
  volumes:
    - ./registry/config.yaml:/verdaccio/conf/config.yaml:ro
    - verdaccio_storage:/verdaccio/storage
  environment:
    - VERDACCIO_PORT=4873
  restart: unless-stopped

volumes:
  verdaccio_storage:
```

### 3. Registry Auth Token Endpoint

Add `backend/src/routes/registry-auth.ts`:

`POST /api/registry/token`
- Requires Clerk JWT auth
- Body: `{ package: "@claracode/sdk" | "@claracode/marketplace-sdk" }`
- Validates the user has the required tier for the requested package:
  - `@claracode/sdk` → requires `tier` in `['pro', 'business']` (active subscription)
  - `@claracode/marketplace-sdk` → requires `developer_program: true` in user metadata (TBD — for now gate same as pro)
- If authorized: generates a short-lived Verdaccio npm token and returns it
- If not authorized:
```json
HTTP 403
{
  "error": "package_access_denied",
  "message": "@claracode/sdk requires an active Pro or Business subscription.",
  "package": "@claracode/sdk",
  "upgrade_url": "https://claracode.ai/pricing"
}
```

Use Verdaccio's `npm token create` CLI or its REST API (`PUT /-/npm/v1/tokens`) to generate tokens programmatically. The backend calls Verdaccio's internal API with admin credentials.

### 4. Environment Variables

Add to `backend/.env.example`:
```
VERDACCIO_URL=http://registry:4873       # internal Docker network
VERDACCIO_ADMIN_PASSWORD=               # set a strong secret
REGISTRY_PUBLIC_URL=https://registry.claracode.ai
```

Add to `.env.local` and `.env.develop` with local values:
```
VERDACCIO_URL=http://localhost:4873
VERDACCIO_ADMIN_PASSWORD=local-dev-only
REGISTRY_PUBLIC_URL=http://localhost:4873
```

### 5. Developer Setup Documentation

Create `docs/developer-setup/PRIVATE_REGISTRY.md`:

```markdown
# Installing @claracode/ Packages

## One-Time Setup

1. Log in to claracode.ai and go to Settings → API Keys
2. Click "Get Registry Token" next to the package you need
3. Copy the npm login command shown and run it:

\`\`\`bash
npm login --registry https://registry.claracode.ai
# Username: your-email@example.com
# Password: <token from dashboard>
\`\`\`

## Install Packages

\`\`\`bash
# SDK — requires active Pro or Business subscription
npm install @claracode/sdk --registry https://registry.claracode.ai

# Marketplace SDK — requires $99/yr Clara Developer Program
npm install @claracode/marketplace-sdk --registry https://registry.claracode.ai

# All other packages proxy through public npm automatically
npm install react  # goes to npmjs.org transparently
\`\`\`
```

### 6. Publish @claracode/sdk to Registry

After Verdaccio is running locally:

```bash
cd packages/sdk
npm publish --registry http://localhost:4873
```

Verify the package is available:
```bash
npm view @claracode/sdk --registry http://localhost:4873
```

## Tests Required

Add `backend/src/__tests__/registry-auth.test.ts`:
- `POST /api/registry/token` with Pro user + `@claracode/sdk` → returns token
- `POST /api/registry/token` with free user + `@claracode/sdk` → HTTP 403
- `POST /api/registry/token` with no auth → HTTP 401

All tests must pass. Backend coverage must remain ≥ 80%.

## Acceptance Criteria

- [ ] `docker compose up registry` starts Verdaccio on port 4873
- [ ] `@claracode/*` packages require authentication to install
- [ ] All other npm packages proxy through to public npm transparently
- [ ] `POST /api/registry/token` returns valid token for authorized users
- [ ] `POST /api/registry/token` returns 403 for unauthorized users
- [ ] `@claracode/sdk` published to local registry and installable with token
- [ ] Developer setup doc created at `docs/developer-setup/PRIVATE_REGISTRY.md`
- [ ] `npm test` passes — zero failures
- [ ] Coverage remains ≥ 80%

## Do NOT

- Do not enable the Verdaccio web UI
- Do not commit `VERDACCIO_ADMIN_PASSWORD` to git
- Do not publish `@claracode/sdk` to public npm — private registry only
- Do not change any existing routes or middleware
