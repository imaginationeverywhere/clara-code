# Installing @claracode/ Packages

## One-Time Setup

1. Log in to claracode.ai and go to Settings → API Keys
2. Request a registry token from the developer dashboard (calls `POST /api/registry/token`)
3. Configure npm to use the private registry and token:

```bash
npm config set @claracode:registry https://registry.claracode.ai
npm config set //registry.claracode.ai/:_authToken "<token from API>"
```

For local development against Docker Compose:

```bash
npm config set @claracode:registry http://localhost:4873
npm config set //localhost:4873/:_authToken "<token from API>"
```

## Install Packages

```bash
# SDK — requires active Pro or Business subscription
npm install @claracode/sdk --registry https://registry.claracode.ai

# Marketplace SDK — requires Clara Developer Program (enforced in upcoming phases)
npm install @claracode/marketplace-sdk --registry https://registry.claracode.ai

# All other packages proxy through public npm automatically when using Verdaccio
npm install react
```

## Publish @claracode/sdk Locally

```bash
docker compose up -d registry
cd packages/sdk
npm publish --registry http://localhost:4873
npm view @claracode/sdk --registry http://localhost:4873
```

Use credentials from `registry/htpasswd` (default dev user `clara` / `clara-dev`) when publishing.
