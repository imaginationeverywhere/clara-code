# browser-debug

Browser-based debugging and UI comparison using Vercel Agent Browser (default) with Claude-in-Chrome MCP fallback. Compare across all 3 environments (local, develop, production), analyze performance, capture screenshots, and fix issues in real-time.

## Usage

```
browser-debug [action] [options]
```

## Aliases
- `ui-debug`
- `chrome-debug` (legacy)
- `compare-ui`

## Browser Automation Stack

### Default: Vercel Agent Browser (`agent-browser`)

A headless browser CLI designed for AI agents. Provides fast, reliable automation without requiring a Chrome extension.

**Installation:**
```bash
npm install -g agent-browser
agent-browser install
```

**Key advantages:**
- Headless - no Chrome extension required
- Semantic locators (ARIA roles, text content, accessibility refs)
- Persistent browser profiles for maintaining auth state
- Multiple isolated sessions for parallel environment comparison
- Built-in accessibility tree snapshots optimized for AI comprehension
- Trace recording for debugging

**Core commands used:**
| Command | Purpose |
|---------|---------|
| `agent-browser open <url>` | Navigate to URL |
| `agent-browser snapshot` | Get accessibility tree with element refs |
| `agent-browser screenshot <file>` | Capture screenshot |
| `agent-browser click <ref>` | Click element by ref |
| `agent-browser type <ref> <text>` | Type text into element |
| `agent-browser network` | Analyze network requests |
| `agent-browser console` | Read console messages |
| `agent-browser evaluate <js>` | Execute JavaScript |
| `agent-browser close` | Close session |

### Fallback: Claude-in-Chrome MCP

When Agent Browser is unavailable or Chrome extension is already connected, use Chrome MCP tools.

**When to use Chrome MCP fallback:**
- Agent Browser not installed (`agent-browser` command not found)
- User explicitly requests Chrome MCP
- Interactive debugging requiring live Chrome DevTools
- GIF recording of sessions (Chrome MCP exclusive feature)

**Chrome MCP tools used:**
| Tool | Purpose |
|------|---------|
| `tabs_context_mcp` | Get current browser tab context |
| `tabs_create_mcp` | Create new tabs for comparison |
| `navigate` | Navigate to URLs across environments |
| `computer` | Take screenshots, interact with page |
| `read_page` | Get accessibility tree and DOM structure |
| `read_network_requests` | Analyze network waterfall |
| `read_console_messages` | Monitor console output |
| `javascript_tool` | Execute performance measurements |
| `gif_creator` | Record debugging sessions |
| `find` | Locate elements on page |

## Environment Configuration

Every boilerplate project has 3 environments matching the standard `.env` files:

| Environment | Config File | Typical URL |
|-------------|-------------|-------------|
| **local** | `frontend/.env.local` | `http://localhost:3xxx` |
| **develop** | `frontend/.env.develop` | `https://develop.d*.amplifyapp.com` |
| **production** | `frontend/.env.production` | `https://site962.com` |

### Project Configuration

Create `.claude/config/browser-debug.json`:
```json
{
  "project": "site962",
  "defaultTool": "agent-browser",
  "fallbackTool": "chrome-mcp",
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
| `--tool <agent-browser\|chrome-mcp>` | Force specific browser tool |
| `--record` | Record GIF of the session (Chrome MCP only) |
| `--screenshot` | Capture screenshots during comparison |
| `--network` | Include network request analysis |
| `--console` | Include console log monitoring |
| `--fix` | Enter fix mode - make changes and verify |
| `--report` | Generate markdown report |
| `--side-by-side` | Open environments in side-by-side tabs |
| `--diff` | Highlight visual differences |
| `--trace` | Enable trace recording (Agent Browser only) |
| `--profile <name>` | Use persistent browser profile (Agent Browser only) |

## Tool Selection Logic

```
1. Check --tool flag → use specified tool
2. Check .claude/config/browser-debug.json → defaultTool setting
3. Check if agent-browser is installed → use if available
4. Check if Chrome MCP is connected → use as fallback
5. Error: No browser automation tool available
```

## Examples

### Compare All 3 Environments (Agent Browser)
```
browser-debug compare all /events/capricorn-season-90-s-and-00-s-birthday-bash-15
```

Agent Browser workflow:
```bash
# Session 1: Local
agent-browser open http://localhost:3962/events/capricorn-season-90-s-and-00-s-birthday-bash-15
agent-browser snapshot
agent-browser screenshot local-events.png
agent-browser evaluate "JSON.stringify(performance.timing)"

# Session 2: Develop
agent-browser open https://develop.d123.amplifyapp.com/events/capricorn-season-90-s-and-00-s-birthday-bash-15 --session develop
agent-browser screenshot develop-events.png --session develop

# Session 3: Production
agent-browser open https://site962.com/events/capricorn-season-90-s-and-00-s-birthday-bash-15 --session production
agent-browser screenshot production-events.png --session production
```

### Compare Local to Production
```
browser-debug compare local+prod /events/my-event --screenshot --network
```

### Compare Develop to Production (Pre-Deploy Check)
```
browser-debug compare dev+prod /events/my-event --report
```

### Performance Analysis on Production
```
browser-debug performance prod /events/capricorn-season-90-s-and-00-s-birthday-bash-15
```

### Full Regression Across All Environments
```
browser-debug regression all --screenshot --report
```

### Check Environment Sync Status
```
browser-debug sync-check
```

### Interactive Debug on Local
```
browser-debug interactive local /events/my-event --fix
```

### Force Chrome MCP (for GIF recording)
```
browser-debug compare all / --tool chrome-mcp --record
```

### Use Persistent Profile (maintains auth)
```
browser-debug interactive prod /dashboard --profile authenticated --tool agent-browser
```

## Workflow: Debug Slow Page Load

### Step 1: Identify the Problem
```
browser-debug compare all /events/capricorn-season-90-s-and-00-s-birthday-bash-15 --network
```

Output:
```
Environment Comparison: /events/capricorn-season-90-s-and-00-s-birthday-bash-15
Tool: agent-browser (headless)

| Metric          | Local    | Develop  | Production |
|-----------------|----------|----------|------------|
| TTFB            | 45ms     | 180ms    | 890ms      |
| FCP             | 320ms    | 1.2s     | 3.8s       |
| LCP             | 580ms    | 2.1s     | 5.2s       |
| Network Reqs    | 23       | 28       | 45         |
| Total Size      | 1.2MB    | 1.4MB    | 2.8MB      |
| Console Errors  | 0        | 0        | 3          |

Issues Detected:
1. Production TTFB is 20x slower than local
2. Large images not optimized on production
3. Console errors in production only
```

### Step 2: Analyze Network Waterfall
```
browser-debug network prod /events/capricorn-season-90-s-and-00-s-birthday-bash-15
```

### Step 3: Check Console Errors
```
browser-debug console prod /events/capricorn-season-90-s-and-00-s-birthday-bash-15
```

### Step 4: Fix Locally with Live Verification
```
browser-debug interactive local /events/capricorn-season-90-s-and-00-s-birthday-bash-15 --fix
```

### Step 5: Verify Fix Before Deploy
```
browser-debug compare local+prod /events/capricorn-season-90-s-and-00-s-birthday-bash-15 --report
```

### Step 6: Deploy and Verify on Develop
```
# After git push to develop branch
browser-debug compare dev+prod /events/capricorn-season-90-s-and-00-s-birthday-bash-15
```

### Step 7: Final Production Verification
```
# After merge to main
browser-debug performance prod /events/capricorn-season-90-s-and-00-s-birthday-bash-15
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
.browser-debug/
├── reports/
│   ├── [timestamp]-comparison-report.md
│   └── [timestamp]-performance-report.json
├── screenshots/
│   ├── local-[page]-[timestamp].png
│   ├── develop-[page]-[timestamp].png
│   └── production-[page]-[timestamp].png
├── traces/
│   └── [timestamp]-[env].zip          # Agent Browser traces
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
browser-debug compare local+dev / --screenshot
```

### Pre-Merge Check (develop -> main)
```
browser-debug regression dev+prod --report
```

### Post-Deploy Verification
```
browser-debug sync-check --screenshot
```

## Agent Integration

Invokes: `browser-debugger` (primary), `chrome-ui-debugger` (legacy fallback)
Skill: `chrome-ui-testing-standard`

## Prerequisites

### For Agent Browser (Default)
1. **Node.js** >= 18
2. **agent-browser** installed globally (`npm install -g agent-browser && agent-browser install`)

### For Chrome MCP (Fallback)
1. **Claude-in-Chrome Extension** installed and connected
2. **Chrome browser** running with extension active

### For Both
3. **Local development server** running (for local environment)
4. **Network access** to develop and production URLs

## Environment Auto-Detection

The command automatically reads environment URLs from:
1. `.claude/config/browser-debug.json` (if exists)
2. `.claude/config/chrome-debug.json` (legacy, if exists)
3. `frontend/.env.local`, `frontend/.env.develop`, `frontend/.env.production`
4. Project's `docs/PRD.md` for deployment URLs

## Related Commands

- `test-automation` - Full E2E testing with Playwright
- `debug-fix` - Code debugging without browser
- `frontend-dev` - Frontend development workflow
- `deploy-ops` - Deployment operations

## Migration from chrome-debug

The `chrome-debug` command name still works as a legacy alias. All features are preserved. The main changes:

1. **Default tool changed** from Chrome MCP to Agent Browser
2. **Config file** renamed from `chrome-debug.json` to `browser-debug.json` (old file still read as fallback)
3. **Report directory** changed from `.chrome-debug/` to `.browser-debug/`
4. **New options**: `--tool`, `--trace`, `--profile`
5. **GIF recording** now requires `--tool chrome-mcp` flag
