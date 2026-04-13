# Cloudflare Deployment Documentation

> Comprehensive guides for deploying Next.js applications to Cloudflare Workers using OpenNext.

## Documentation Index

| Document | Description |
|----------|-------------|
| [Step-by-Step Deployment Guide](./STEP-BY-STEP-DEPLOYMENT-GUIDE.md) | **START HERE** - Complete procedural checklist for deploying any Next.js 16 app |
| [Next.js 16 Cloudflare Workers Deployment](./NEXTJS-16-CLOUDFLARE-WORKERS-DEPLOYMENT.md) | Reference guide with detailed explanations and troubleshooting |
| [Next.js 15 to 16 Upgrade Guide](./NEXTJS-15-TO-16-UPGRADE-GUIDE.md) | Upgrading from Next.js 15.x to 16.x for Cloudflare deployment |

## Quick Start

### Deploy a New Next.js 16 App

```bash
# Install dependencies
npm install -D @opennextjs/cloudflare wrangler

# Create wrangler.toml (see deployment guide)

# Build and deploy
npm run pages:build
npx wrangler deploy --env production
```

### Upgrade from Next.js 15

```bash
# Update dependencies
npm install next@16.2.3 react@19.2.5 react-dom@19.2.5
npm install -D @opennextjs/cloudflare@latest

# Follow the upgrade guide for code changes
```

## Current Deployments (Clara Code)

| Environment | Domain | Worker |
|-------------|--------|--------|
| Production | [claracode.ai](https://claracode.ai) | `clara-code` |
| Preview | [develop.claracode.ai](https://develop.claracode.ai) | `clara-code-preview` |

## Key Files

```
frontend/
├── wrangler.toml          # Cloudflare Workers config
├── open-next.config.ts    # OpenNext config
├── package.json           # Build scripts
└── .open-next/            # Generated build output (gitignored)
```

## Commands Reference

```bash
# Build
npm run pages:build

# Deploy to production
npx wrangler deploy --env production

# Deploy to preview
npx wrangler deploy --env preview

# Set secrets
npx wrangler secret put SECRET_NAME --env production

# View logs
npx wrangler tail --env production
```

## Support

- [OpenNext Documentation](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)

---

*Maintained by the Clara Code team - April 2026*
