# chrome-debug

Browser-based debugging and UI comparison using Claude-in-Chrome MCP tools. Compare across all 3 environments (local, develop, production), analyze performance, capture screenshots, and fix issues in real-time.

## Usage

```
chrome-debug [action] [options]
```

## Aliases
- `ui-debug`
- `browser-debug`
- `compare-ui`

## Environment Configuration

Every boilerplate project has 3 environments matching the standard `.env` files:

| Environment | Config File | Typical URL |
|-------------|-------------|-------------|
| **local** | `frontend/.env.local` | `http://localhost:3xxx` |
| **develop** | `frontend/.env.develop` | `https://develop.d*.amplifyapp.com` |
| **production** | `frontend/.env.production` | `https://site962.com` |

### Project Configuration

Create `.claude/config/chrome-debug.json`:
```json
{
  "project": "site962",
  "environments": {
    "local": {
      "baseUrl": "http://localhost:3962",
      "envFile": "frontend/.env.local",
      "description": "Local development server"
    },
    "develop": {
      "baseUrl": "https://develop.d1234567890.amplifyapp.com",
      "envFile": "frontend/.env.develop",
      "description": "AWS Amplify develop branch"
    },
    "production": {
      "baseUrl": "https://site962.com",
      "envFile": "frontend/.env.production",
      "description": "AWS Amplify production (main branch)"
    }
  },
  "testPages": [
    "/",
    "/events",
    "/events/[slug]",
    "/dashboard",
    "/admin",
    "/pos"
  ],
  "thresholds": {
    "ttfb": 200,
    "fcp": 1800,
    "lcp": 2500,
    "cls": 0.1,
    "networkRequests": 50,
    "bundleSize": 500000
  }
}
```

## Actions

| Action | Description |
|--------|-------------|
| `compare [envs] <path>` | Compare page across environments |
| `compare-all [envs]` | Compare all test pages across environments |
| `performance <env> <path>` | Analyze page performance |
| `screenshot <env> <path>` | Capture screenshot |
| `console <env> <path>` | Monitor console errors |
| `network <env> <path>` | Analyze network requests |
| `interactive <env> <path>` | Open interactive session |
| `regression [envs]` | Full regression across environments |
| `sync-check` | Verify all environments are in sync |

## Environment Selectors

Use shorthand or full names:
- `local` or `l` - Local development
- `develop` or `dev` or `d` - Develop branch
- `production` or `prod` or `p` - Production

Combine with `+` for multi-environment:
- `local+prod` - Compare local to production
- `dev+prod` - Compare develop to production
- `all` or `local+dev+prod` - All three environments

## Options

| Option | Description |
|--------|-------------|
| `--env <environments>` | Specify environments (local, dev, prod, all) |
| `--record` | Record GIF of the session |
| `--screenshot` | Capture screenshots during comparison |
| `--network` | Include network request analysis |
| `--console` | Include console log monitoring |
| `--fix` | Enter fix mode - make changes and verify |
| `--report` | Generate markdown report |
| `--side-by-side` | Open environments in side-by-side tabs |
| `--diff` | Highlight visual differences |

## Examples

### Compare All 3 Environments
```
chrome-debug compare all /events/capricorn-season-90-s-and-00-s-birthday-bash-15
```

### Compare Local to Production
```
chrome-debug compare local+prod /events/my-event --screenshot --network
```

### Compare Develop to Production (Pre-Deploy Check)
```
chrome-debug compare dev+prod /events/my-event --report
```

### Performance Analysis on Production
```
chrome-debug performance prod /events/capricorn-season-90-s-and-00-s-birthday-bash-15
```

### Full Regression Across All Environments
```
chrome-debug regression all --screenshot --report
```

### Check Environment Sync Status
```
chrome-debug sync-check
```

### Interactive Debug on Local
```
chrome-debug interactive local /events/my-event --fix
```

## Workflow: Debug Slow Page Load

### Step 1: Identify the Problem
```
chrome-debug compare all /events/capricorn-season-90-s-and-00-s-birthday-bash-15 --network
```

Output:
```
Environment Comparison: /events/capricorn-season-90-s-and-00-s-birthday-bash-15

| Metric          | Local    | Develop  | Production |
|-----------------|----------|----------|------------|
| TTFB            | 45ms     | 180ms    | 890ms ❌   |
| FCP             | 320ms    | 1.2s     | 3.8s ❌    |
| LCP             | 580ms    | 2.1s     | 5.2s ❌    |
| Network Reqs    | 23       | 28       | 45 ⚠️      |
| Total Size      | 1.2MB    | 1.4MB    | 2.8MB ❌   |
| Console Errors  | 0        | 0        | 3 ❌       |

Issues Detected:
1. Production TTFB is 20x slower than local
2. Large images not optimized on production
3. Console errors in production only
```

### Step 2: Analyze Network Waterfall
```
chrome-debug network prod /events/capricorn-season-90-s-and-00-s-birthday-bash-15
```

### Step 3: Check Console Errors
```
chrome-debug console prod /events/capricorn-season-90-s-and-00-s-birthday-bash-15
```

### Step 4: Fix Locally with Live Verification
```
chrome-debug interactive local /events/capricorn-season-90-s-and-00-s-birthday-bash-15 --fix
```

### Step 5: Verify Fix Before Deploy
```
chrome-debug compare local+prod /events/capricorn-season-90-s-and-00-s-birthday-bash-15 --report
```

### Step 6: Deploy and Verify on Develop
```
# After git push to develop branch
chrome-debug compare dev+prod /events/capricorn-season-90-s-and-00-s-birthday-bash-15
```

### Step 7: Final Production Verification
```
# After merge to main
chrome-debug performance prod /events/capricorn-season-90-s-and-00-s-birthday-bash-15
```

## Performance Metrics Captured

| Metric | Description | Target |
|--------|-------------|--------|
| **TTFB** | Time to First Byte | < 200ms |
| **FCP** | First Contentful Paint | < 1.8s |
| **LCP** | Largest Contentful Paint | < 2.5s |
| **CLS** | Cumulative Layout Shift | < 0.1 |
| **TTI** | Time to Interactive | < 3.8s |
| **TBT** | Total Blocking Time | < 200ms |
| **Network Requests** | Total request count | < 50 |
| **Bundle Size** | Total JS/CSS size | < 500KB |
| **Image Size** | Total image payload | < 1MB |
| **API Latency** | GraphQL/REST response | < 200ms |

## Report Output

When using `--report`, generates:
```
.chrome-debug/
├── reports/
│   ├── [timestamp]-comparison-report.md
│   └── [timestamp]-performance-report.json
├── screenshots/
│   ├── local-[page]-[timestamp].png
│   ├── develop-[page]-[timestamp].png
│   └── production-[page]-[timestamp].png
├── network/
│   ├── local-[timestamp].har
│   ├── develop-[timestamp].har
│   └── production-[timestamp].har
└── diffs/
    └── [env1]-vs-[env2]-[timestamp].png
```

## Common Issues Detected

| Issue | Detection | Suggested Fix |
|-------|-----------|---------------|
| Slow API responses | Network timing > 500ms | DataLoader, caching, query optimization |
| Large images | Image size > 100KB | Next.js Image, WebP, lazy loading |
| Render-blocking resources | CSS/JS in critical path | Code splitting, async loading |
| Console errors | Any console.error | Link to source, fix handler |
| Hydration mismatch | React hydration warning | SSR/CSR alignment |
| Missing error boundary | Uncaught Promise | Add ErrorBoundary component |
| N+1 queries | Multiple similar API calls | DataLoader batching |
| Bundle bloat | Large chunk sizes | Dynamic imports, tree shaking |

## Integration with Git Workflow

### Pre-Push Check
```
chrome-debug compare local+dev / --screenshot
```

### Pre-Merge Check (develop → main)
```
chrome-debug regression dev+prod --report
```

### Post-Deploy Verification
```
chrome-debug sync-check --screenshot
```

## Agent Integration

Invokes: `chrome-ui-debugger`
Skill: `chrome-ui-testing-standard`

## Prerequisites

1. **Claude-in-Chrome Extension** installed and connected
2. **Chrome browser** running with extension active
3. **Local development server** running (for local environment)
4. **Network access** to develop and production URLs

## Environment Auto-Detection

The command automatically reads environment URLs from:
1. `.claude/config/chrome-debug.json` (if exists)
2. `frontend/.env.local`, `frontend/.env.develop`, `frontend/.env.production`
3. Project's `docs/PRD.md` for deployment URLs

## Related Commands

- `test-automation` - Full E2E testing with Playwright
- `debug-fix` - Code debugging without browser
- `frontend-dev` - Frontend development workflow
- `deploy-ops` - Deployment operations
